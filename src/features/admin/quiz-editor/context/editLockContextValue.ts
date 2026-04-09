import { createContext } from 'react';

interface QuizEditLockContextType {
  hasLock: boolean;
  lockConflict: string | null;
  isLoading: boolean;
}

export const QuizEditLockContext = createContext<QuizEditLockContextType | null>(null);
