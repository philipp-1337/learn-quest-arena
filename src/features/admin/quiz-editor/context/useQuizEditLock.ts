import { useContext } from 'react';
import { QuizEditLockContext } from './editLockContextValue';

export function useQuizEditLock() {
  const context = useContext(QuizEditLockContext);
  if (!context) {
    throw new Error("useQuizEditLock must be used within QuizEditLockProvider");
  }
  return context;
}
