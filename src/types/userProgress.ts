// Typ für gespeicherten Fortschritt eines Users

// Altes Modell bleibt vorerst erhalten
export interface UserProgress {
  username: string;
  quizId: string;
  answers: boolean[]; // true/false für jede Frage
  solvedQuestions: string[]; // Fragen, die gelöst wurden
  totalTries: number;
  lastUpdated: number; // Timestamp
}

// Neues, verbessertes Modell für Quiz-Fortschritt
export interface UserQuizProgress {
  username: string;
  quizId: string;
  questions: {
    [questionId: string]: {
      answered: boolean;         // Wurde die Frage schon richtig beantwortet?
      attempts: number;          // Wie viele Versuche wurden für diese Frage benötigt?
      lastAnswerCorrect: boolean;// War die letzte Antwort korrekt?
    };
  };
  totalTries: number;            // Wie oft wurde das Quiz insgesamt gestartet?
  completed: boolean;            // Wurden alle Fragen richtig beantwortet?
  lastUpdated: number;           // Timestamp
}
