// Typ für gespeicherten Fortschritt eines Users
export interface UserProgress {
  username: string;
  quizId: string;
  answers: boolean[]; // true/false für jede Frage
  solvedQuestions: string[]; // Fragen, die gelöst wurden
  totalTries: number;
  lastUpdated: number; // Timestamp
}
