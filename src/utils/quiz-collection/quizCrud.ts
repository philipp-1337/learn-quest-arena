/**
 * CRUD operations for quiz documents.
 */

import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import type { QuizDocument, Quiz } from "quizTypes";
import { createDeterministicId } from "../slugify";
import { removeUndefinedFields } from "./quizHelpers";

const QUIZZES_COLLECTION = "quizzes";

/**
 * Converts an embedded Quiz to a QuizDocument for the new collection.
 * Uses deterministic IDs for subjects, classes, and topics based on their names.
 */
export function createQuizDocument(
  quiz: Quiz,
  subjectId: string,
  subjectName: string,
  classId: string,
  className: string,
  topicId: string,
  topicName: string,
  authorId: string,
  authorEmail?: string
): QuizDocument {
  const now = Date.now();
  const quizId = quiz.uuid || crypto.randomUUID();

  const normalizedSubjectId = createDeterministicId(subjectName, 'subject');
  const normalizedClassId = createDeterministicId(className, 'class');
  const normalizedTopicId = createDeterministicId(topicName, 'topic');

  return {
    ...quiz,
    id: quizId,
    uuid: quizId,
    createdAt: now,
    updatedAt: now,
    authorId,
    authorEmail,
    subjectId: normalizedSubjectId,
    subjectName,
    classId: normalizedClassId,
    className,
    topicId: normalizedTopicId,
    topicName,
    legacyQuizId: quiz.id,
    legacySubjectId: subjectId,
    legacyClassId: classId,
    legacyTopicId: topicId,
    migratedFrom: `subjects/${subjectId}/classes/${classId}/topics/${topicId}/quizzes/${quiz.id}`,
  };
}

/**
 * Saves a quiz document to the new quizzes collection.
 */
export async function saveQuizDocument(quizDoc: QuizDocument): Promise<{ success: boolean; error: string | null }> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizDoc.id);

    const cleanedDoc = removeUndefinedFields(quizDoc);
    await setDoc(ref, cleanedDoc);

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error saving quiz document:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Loads a quiz document from the new quizzes collection.
 */
export async function loadQuizDocument(quizId: string): Promise<QuizDocument | null> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as QuizDocument;
    }
    return null;
  } catch (err) {
    console.error("Error loading quiz document:", err);
    return null;
  }
}

/**
 * Updates a quiz document in the new quizzes collection.
 */
export async function updateQuizDocument(
  quizId: string, 
  updates: Partial<QuizDocument>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizId);

    const cleanedUpdates = removeUndefinedFields({
      ...updates,
      updatedAt: Date.now(),
    });

    await setDoc(ref, cleanedUpdates, { merge: true });

    return { success: true, error: null };
  } catch (err: any) {
    let errorMessage = "Unknown error";
    if (err && typeof err === "object") {
      if (err.code) {
        errorMessage = err.code;
      } else if (err.message) {
        errorMessage = err.message;
      }
    }
    console.error("Error updating quiz document:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Deletes a quiz document from the new quizzes collection.
 */
export async function deleteQuizDocument(quizId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizId);
    await deleteDoc(ref);

    return { success: true, error: null };
  } catch (err: any) {
    let errorMessage = "Unknown error";
    if (err && typeof err === "object") {
      if (err.code) {
        errorMessage = err.code;
      } else if (err.message) {
        errorMessage = err.message;
      }
    }
    console.error("Error deleting quiz document:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Converts a QuizDocument back to a Quiz for compatibility with existing components.
 */
export function quizDocumentToQuiz(doc: QuizDocument): Quiz {
  return {
    id: doc.id,
    uuid: doc.id,
    title: doc.title,
    shortTitle: doc.shortTitle,
    questions: doc.questions,
    hidden: doc.hidden,
  };
}
