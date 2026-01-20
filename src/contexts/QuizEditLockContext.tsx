import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { CustomToast } from "../components/misc/CustomToast";
import { useEditLock } from "../hooks/useEditLock";
import { releaseEditLock, refreshEditLock } from "../utils/quizzesCollection"; 

interface QuizEditLockContextType {
  hasLock: boolean;
  lockConflict: string | null;
  isLoading: boolean;
}

const QuizEditLockContext = createContext<QuizEditLockContextType | null>(null);

export function QuizEditLockProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const lockState = useEditLock({
    quizId: id || "",
    userId: currentUser?.uid || "",
    userName: currentUser?.email || "Unbekannt",
    onLockLost: () => {
      toast.custom(() => (
        <CustomToast
          message="Edit-Lock verloren. Bitte Änderungen speichern."
          type="error"
        />
      ));
    },
  });

  // beforeunload Handler für Browser-Close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (id && currentUser?.uid && lockState.hasLock) {
        // Versuche Lock zu releasen (nicht garantiert bei Tab-Close)
        releaseEditLock(id, currentUser.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, currentUser?.uid, lockState.hasLock]);

  // visibilitychange Handler für Tab-Wechsel
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id && currentUser?.uid && lockState.hasLock) {
        // Refresh Lock beim Zurückkommen zum Tab
        refreshEditLock(id, currentUser.uid);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id, currentUser?.uid, lockState.hasLock]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (id && currentUser?.uid && lockState.hasLock) {
        console.log("Releasing lock on unmount of Quiz Edit Section");
        // Fire-and-forget mit Fehlerbehandlung
        releaseEditLock(id, currentUser.uid).catch((error) => {
          console.error("Failed to release lock on unmount:", error);
          // Lock läuft durch Timeout (30min) trotzdem ab
        });
      }
    };
  }, [id, currentUser?.uid]);

  return (
    <QuizEditLockContext.Provider value={lockState}>
      {children}
    </QuizEditLockContext.Provider>
  );
}

export function useQuizEditLock() {
  const context = useContext(QuizEditLockContext);
  if (!context) {
    throw new Error("useQuizEditLock must be used within QuizEditLockProvider");
  }
  return context;
}
