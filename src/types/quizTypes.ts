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
  title: string;
  questions: Question[];
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
