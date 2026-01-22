/**
 * Real-time subscriptions for quiz documents.
 */

import { getFirestore, collection, doc, onSnapshot } from 'firebase/firestore';
import type { QuizDocument } from 'quizTypes';

const QUIZZES_COLLECTION = "quizzes";

/**
 * Real-time listener for quiz collection changes.
 * Returns an unsubscribe function.
 */
export function subscribeToQuizzes(
  callback: (quizzes: QuizDocument[]) => void,
  onError?: (error: Error) => void
): () => void {
  const db = getFirestore();
  const col = collection(db, QUIZZES_COLLECTION);

  return onSnapshot(
    col,
    (snapshot) => {
      const quizzes = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as QuizDocument));
      callback(quizzes);
    },
    (error) => {
      console.error("Error in quiz subscription:", error);
      onError?.(error);
    }
  );
}

/**
 * Real-time listener for a single quiz document.
 * Returns an unsubscribe function.
 */
export function subscribeToQuiz(
  quizId: string,
  callback: (quiz: QuizDocument | null) => void,
  onError?: (error: Error) => void
): () => void {
  const db = getFirestore();
  const ref = doc(db, QUIZZES_COLLECTION, quizId);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as QuizDocument);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error in quiz subscription:", error);
      onError?.(error);
    }
  );
}
