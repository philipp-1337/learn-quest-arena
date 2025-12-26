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

// Spaced Repetition System (SRS) Daten für eine Frage
export interface QuestionSRSData {
  answered: boolean;             // Wurde die Frage schon richtig beantwortet?
  attempts: number;              // Wie viele Versuche wurden für diese Frage benötigt?
  lastAnswerCorrect: boolean;    // War die letzte Antwort korrekt?
  // SRS-spezifische Felder
  correctStreak: number;         // Anzahl aufeinanderfolgender richtiger Antworten
  lastAttemptDate?: number;      // Timestamp des letzten Versuchs
  nextReviewDate?: number;       // Timestamp für die nächste Wiederholung (SRS)
  difficultyLevel: number;       // Schwierigkeitsgrad 0-5 (0=neu, 5=gemeistert)
}

// Neues, verbessertes Modell für Quiz-Fortschritt
export interface UserQuizProgress {
  username: string;
  quizId: string;
  questions: {
    [questionId: string]: QuestionSRSData;
  };
  totalTries: number;            // Wie oft wurde das Quiz insgesamt gestartet?
  completed: boolean;            // Wurden alle Fragen richtig beantwortet?
  lastUpdated: number;           // Timestamp
  completedTime?: number;        // Zeit in Millisekunden, die benötigt wurde um das Quiz zu 100% zu lösen
}

// Quiz Challenge Progress
export interface UserQuizChallengeProgress {
  username: string;
  challengeId: string;
  currentLevel: number;           // Aktuelles Level (1-15)
  highestLevel: number;           // Höchstes erreichtes Level
  highestPrize: number;           // Höchster erreichter Gewinn
  safetyPrize: number;            // Gesicherter Gewinn (durch Sicherheitsstufe)
  completed: boolean;             // Wurde die Challenge komplett abgeschlossen?
  lastUpdated: number;            // Timestamp
}
