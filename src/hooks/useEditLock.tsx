import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CustomToast } from "../components/misc/CustomToast";
import {
  acquireEditLock,
  releaseEditLock,
  refreshEditLock,
  subscribeToQuiz,
} from "../utils/quizzesCollection";

interface UseEditLockOptions {
  quizId: string;
  userId: string;
  userName: string;
  onLockLost?: () => void;
}

interface UseEditLockReturn {
  hasLock: boolean;
  lockConflict: string | null;
  isLoading: boolean;
}

// ✅ FIX: export hinzugefügt
export function useEditLock({
  quizId,
  userId,
  userName,
  onLockLost,
}: UseEditLockOptions): UseEditLockReturn {
  const [hasLock, setHasLock] = useState(false);
  const [lockConflict, setLockConflict] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lockRefreshInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!quizId || !userId) {
      setIsLoading(false);
      return;
    }

    const initializeLock = async () => {
      try {
        const lockResult = await acquireEditLock(quizId, userId, userName);

        if (!lockResult.success) {
          if (lockResult.lockedBy) {
            setLockConflict(
              `Dieses Quiz wird bereits von ${lockResult.lockedBy.userName} bearbeitet.`
            );

            // Subscribe to detect when lock is released
            const unsubscribe = subscribeToQuiz(quizId, (quiz) => {
              if (quiz && !quiz.editLock) {
                toast.custom(() => (
                  <CustomToast
                    message="Quiz ist jetzt verfügbar. Seite neu laden."
                    type="info"
                  />
                ));
              }
            });

            setIsLoading(false);
            return () => unsubscribe();
          } else {
            toast.custom(() => (
              <CustomToast
                message={lockResult.error || "Lock konnte nicht erworben werden"}
                type="error"
              />
            ));
            setIsLoading(false);
            return;
          }
        }

        setHasLock(true);

        // Set up lock refresh interval (every 15 minutes)
        lockRefreshInterval.current = setInterval(
          async () => {
            const refreshResult = await refreshEditLock(quizId, userId);
            if (!refreshResult.success) {
              console.warn("Failed to refresh lock:", refreshResult.error);
              setHasLock(false);
              onLockLost?.();
              toast.custom(() => (
                <CustomToast
                  message="Edit-Lock verloren. Bitte Änderungen speichern."
                  type="error"
                />
              ));
            }
          },
          15 * 60 * 1000
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error acquiring lock:", error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Erwerben des Locks" type="error" />
        ));
        setIsLoading(false);
      }
    };

    initializeLock();

    // Cleanup
    return () => {
      if (lockRefreshInterval.current) {
        clearInterval(lockRefreshInterval.current);
      }
      releaseEditLock(quizId, userId).catch(console.error);
    };
  }, [quizId, userId, userName, onLockLost]);

  return { hasLock, lockConflict, isLoading };
}
