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
  shortTitle?: string; // Optional für Anzeige auf kleinen Bildschirmen
  url: string; // Einmalig festgelegte URL für Deeplink
  questions: Question[];
  hidden?: boolean; // Wenn true, ist das Quiz ausgeblendet
}

/**
 * Edit lock information for multi-admin concurrency control.
 * Prevents multiple admins from editing the same quiz simultaneously.
 */
export interface EditLock {
  userId: string;           // Firebase Auth UID of the user holding the lock
  userName: string;         // Display name of the user (e.g., "Admin A" or email)
  lockedAt: number;         // Timestamp when the lock was acquired
  expiresAt: number;        // Timestamp when the lock expires (auto-release)
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
  
  // Edit lock for concurrent editing prevention
  editLock?: EditLock;      // Present when quiz is being edited by an admin
  
  // References to categories (can be associated with multiple)
  // These use normalized/deterministic IDs based on names
  subjectId?: string;       // Normalized subject ID (e.g., "subject-sachkunde")
  subjectName?: string;     // Denormalized subject name for display
  classId?: string;         // Normalized class ID (e.g., "class-klasse-1")
  className?: string;       // Denormalized class name for display
  topicId?: string;         // Normalized topic ID (e.g., "topic-das-universum")
  topicName?: string;       // Denormalized topic name for display
  
}

export interface Question {
  id?: string;  // Unique identifier for the question
  // Optional origin metadata for pooled/custom quizzes
  originQuizId?: string;
  originQuestionIndex?: number;
  question: string;
  questionType?: 'text' | 'image' | 'audio'; // Type of question (text, image, or audio)
  questionImage?: string; // URL of question image if questionType is 'image'
  questionImageAlt?: string; // Alt text for question image
  questionAudio?: string; // URL of question audio if questionType is 'audio'
  explanation?: string; // Optional explanation shown after answering
  answerType: string;
  answers: Answer[];
  correctAnswerIndex: number; // Deprecated: Use correctAnswerIndices for multi-select support
  correctAnswerIndices?: number[]; // Array of correct answer indices (supports multiple correct answers)
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
