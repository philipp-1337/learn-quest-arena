import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { CustomToast } from "../components/misc/CustomToast";
import { useEditLock } from "../hooks/useEditLock";
import { releaseEditLock } from "../utils/quizzesCollection";

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

  // Cleanup nur beim tatsächlichen Unmount der gesamten Quiz-Edit-Section
  useEffect(() => {
    return () => {
      if (id && currentUser?.uid && lockState.hasLock) {
        console.log("Releasing lock on unmount of Quiz Edit Section");
        releaseEditLock(id, currentUser.uid);
      }
    };
    // ⚠️ Wichtig: lockState.hasLock NICHT in deps, sonst wird cleanup bei jedem Lock-Change getriggert
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
