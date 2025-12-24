// Interfaces for quiz app
export interface Subject {
  id: string;
  name: string;
  order: number;
  classes: Class[];
}

export interface Class {
  id: string;
  name: string;
  level: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  quizzes: Quiz[];
}

export interface Quiz {
  id: string;
  uuid?: string;
  title: string;
  shortTitle: string;
  questions: Question[];
  hidden?: boolean; // Wenn true, ist das Quiz ausgeblendet
}

export interface Question {
  question: string;
  answerType: string;
  answers: Answer[];
  correctAnswerIndex: number;
}

export interface Answer {
  type: string;
  content: string;
  alt?: string;
}

// Quiz Challenge Mode (similar to "Who Wants to Be a Millionaire")
export interface QuizChallengeLevel {
  level: number;
  prize: number;
  isSafetyLevel: boolean;
  questions: Question[];
}

export interface QuizChallenge {
  id: string;
  title: string;
  levels: QuizChallengeLevel[];
  hidden?: boolean;
}
