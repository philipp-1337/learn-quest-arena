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
  urlShared?: boolean; // Wenn true, wurde die Quiz-URL geteilt und shortTitle sollte nicht mehr geändert werden
}

/**
 * New Quiz structure for the standalone quizzes collection.
 * This extends the embedded Quiz with metadata fields for better organization.
 */
export interface QuizDocument extends Omit<Quiz, 'id'> {
  id: string;
  // Metadata
  createdAt: number;        // Timestamp of creation
  updatedAt?: number;       // Timestamp of last update
  authorId: string;         // Firebase Auth UID of the creator (Admin/Teacher)
  authorEmail?: string;     // Email of the author for display purposes
  
  // References to categories (can be associated with multiple)
  // These use normalized/deterministic IDs based on names
  subjectId?: string;       // Normalized subject ID (e.g., "subject-sachkunde")
  subjectName?: string;     // Denormalized subject name for display
  classId?: string;         // Normalized class ID (e.g., "class-klasse-1")
  className?: string;       // Denormalized class name for display
  topicId?: string;         // Normalized topic ID (e.g., "topic-das-universum")
  topicName?: string;       // Denormalized topic name for display
  
  // Migration tracking
  migratedFrom?: string;    // Original path if migrated from embedded structure
  legacyQuizId?: string;    // Original quiz ID from embedded structure
  legacySubjectId?: string; // Original subject ID before normalization
  legacyClassId?: string;   // Original class ID before normalization
  legacyTopicId?: string;   // Original topic ID before normalization
}

export interface Question {
  id?: string;  // Unique identifier for the question
  question: string;
  questionType?: 'text' | 'image'; // Type of question (text or image)
  questionImage?: string; // URL of question image if questionType is 'image'
  questionImageAlt?: string; // Alt text for question image
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
  questionIds: string[];  // References to questions by their IDs
}

export interface QuizChallenge {
  id: string;
  title: string;
  levels: QuizChallengeLevel[];
  hidden?: boolean;
}
