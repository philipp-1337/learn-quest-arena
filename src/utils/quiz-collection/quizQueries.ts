/**
 * Query operations for quiz documents.
 */

import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import type { QuizDocument } from "../../types/quizTypes";

const QUIZZES_COLLECTION = "quizzes";

/**
 * Loads all quiz documents from the new quizzes collection.
 */
export async function loadAllQuizDocuments(): Promise<QuizDocument[]> {
  try {
    console.log(`Loading all quizzes from collection "\${QUIZZES_COLLECTION}"...`);
    const db = getFirestore();
    const col = collection(db, QUIZZES_COLLECTION);
    const snap = await getDocs(col);

    console.log(`Found \${snap.docs.length} documents in quizzes collection`);

    const quizzes = snap.docs.map(docSnap => {
      const data = docSnap.data();
      console.log(`Quiz document: id=\${docSnap.id}, title=\${data.title}, subjectId=\${data.subjectId}`);
      return {
        id: docSnap.id,
        ...data
      } as QuizDocument;
    });

    return quizzes;
  } catch (err) {
    console.error("Error loading quiz documents:", err);
    return [];
  }
}

/**
 * Loads quiz documents filtered by subject.
 */
export async function loadQuizzesBySubject(subjectId: string): Promise<QuizDocument[]> {
  try {
    const db = getFirestore();
    const col = collection(db, QUIZZES_COLLECTION);
    const q = query(col, where("subjectId", "==", subjectId));
    const snap = await getDocs(q);

    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as QuizDocument));
  } catch (err) {
    console.error("Error loading quizzes by subject:", err);
    return [];
  }
}

/**
 * Loads quiz documents filtered by class.
 */
export async function loadQuizzesByClass(classId: string): Promise<QuizDocument[]> {
  try {
    const db = getFirestore();
    const col = collection(db, QUIZZES_COLLECTION);
    const q = query(col, where("classId", "==", classId));
    const snap = await getDocs(q);

    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as QuizDocument));
  } catch (err) {
    console.error("Error loading quizzes by class:", err);
    return [];
  }
}

/**
 * Loads quiz documents filtered by topic.
 */
export async function loadQuizzesByTopic(topicId: string): Promise<QuizDocument[]> {
  try {
    const db = getFirestore();
    const col = collection(db, QUIZZES_COLLECTION);
    const q = query(col, where("topicId", "==", topicId));
    const snap = await getDocs(q);

    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as QuizDocument));
  } catch (err) {
    console.error("Error loading quizzes by topic:", err);
    return [];
  }
}

/**
 * Loads quiz documents created by a specific author.
 */
export async function loadQuizzesByAuthor(authorId: string): Promise<QuizDocument[]> {
  try {
    const db = getFirestore();
    const col = collection(db, QUIZZES_COLLECTION);
    const q = query(col, where("authorId", "==", authorId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as QuizDocument));
  } catch (err) {
    console.error("Error loading quizzes by author:", err);
    return [];
  }
}

/**
 * Checks if the new quizzes collection has any data.
 */
export async function hasQuizzesCollection(): Promise<boolean> {
  try {
    const quizzes = await loadAllQuizDocuments();
    return quizzes.length > 0;
  } catch (err) {
    console.error("Error checking quizzes collection:", err);
    return false;
  }
}

/**
 * Gets the count of quizzes in the new collection.
 */
export async function getQuizzesCollectionCount(): Promise<number> {
  try {
    const quizzes = await loadAllQuizDocuments();
    return quizzes.length;
  } catch (err) {
    console.error("Error getting quizzes count:", err);
    return 0;
  }
}
