/**
 * Utility functions for the new quizzes collection.
 * This module provides functions for CRUD operations on the standalone quizzes collection.
 */

import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, onSnapshot, runTransaction } from "firebase/firestore";
import type { QuizDocument, Quiz, EditLock } from "../types/quizTypes";
import { createDeterministicId } from "./slugify";

const QUIZZES_COLLECTION = "quizzes";

// Lock timeout: 5 minutes
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

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
  // Generate UUID if not present to ensure unique IDs in the new collection
  const quizId = quiz.uuid || crypto.randomUUID();
  
  // Use deterministic IDs for subjects, classes, and topics
  // This ensures same names always get the same ID, preventing duplicates
  const normalizedSubjectId = createDeterministicId(subjectName, 'subject');
  const normalizedClassId = createDeterministicId(className, 'class');
  const normalizedTopicId = createDeterministicId(topicName, 'topic');
  
  return {
    ...quiz,
    id: quizId,
    uuid: quizId, // Ensure UUID is set
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
    
    // Remove undefined fields before saving
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
 * Loads all quiz documents from the new quizzes collection.
 */
export async function loadAllQuizDocuments(): Promise<QuizDocument[]> {
  try {
    console.log(`Loading all quizzes from collection "${QUIZZES_COLLECTION}"...`);
    const db = getFirestore();
    const col = collection(db, QUIZZES_COLLECTION);
    const snap = await getDocs(col);
    
    console.log(`Found ${snap.docs.length} documents in quizzes collection`);
    
    const quizzes = snap.docs.map(docSnap => {
      const data = docSnap.data();
      console.log(`Quiz document: id=${docSnap.id}, title=${data.title}, subjectId=${data.subjectId}`);
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
 * Converts a QuizDocument back to a Quiz for compatibility with existing components.
 */
export function quizDocumentToQuiz(doc: QuizDocument): Quiz {
  return {
    id: doc.id,
    uuid: doc.id, // Use the document ID as UUID
    title: doc.title,
    shortTitle: doc.shortTitle,
    questions: doc.questions,
    hidden: doc.hidden,
  };
}

/**
 * Helper function to remove undefined values from an object.
 */
function removeUndefinedFields<T extends object>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // Clean arrays recursively
        cleaned[key] = value.map(item => 
          item !== null && typeof item === 'object' 
            ? removeUndefinedFields(item as object)
            : item
        );
      } else if (value !== null && typeof value === 'object') {
        cleaned[key] = removeUndefinedFields(value as object);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as Partial<T>;
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

/**
 * Reassigns a quiz to different subject, class, or topic.
 */
export async function reassignQuiz(
  quizId: string,
  newSubject?: { name: string },
  newClass?: { name: string },
  newTopic?: { name: string }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const quiz = await loadQuizDocument(quizId);
    if (!quiz) {
      return { success: false, error: "Quiz nicht gefunden" };
    }

    const updates: Partial<QuizDocument> = {};

    if (newSubject) {
      updates.subjectName = newSubject.name;
      updates.subjectId = createDeterministicId(newSubject.name, 'subject');
    }

    if (newClass) {
      updates.className = newClass.name;
      updates.classId = createDeterministicId(newClass.name, 'class');
    }

    if (newTopic) {
      updates.topicName = newTopic.name;
      updates.topicId = createDeterministicId(newTopic.name, 'topic');
    }

    if (Object.keys(updates).length === 0) {
      return { success: true, error: null };
    }

    return await updateQuizDocument(quizId, updates);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

/**
 * Renames a category (subject, class, or topic) for all quizzes.
 * This updates both the name and the normalized ID for all affected quizzes.
 */
export async function renameCategory(
  type: 'subject' | 'class' | 'topic',
  oldId: string,
  newName: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  const result = { success: 0, failed: 0, errors: [] as string[] };

  try {
    const allQuizzes = await loadAllQuizDocuments();
    
    // Find quizzes with the old ID
    const affectedQuizzes = allQuizzes.filter(quiz => {
      if (type === 'subject') return quiz.subjectId === oldId;
      if (type === 'class') return quiz.classId === oldId;
      if (type === 'topic') return quiz.topicId === oldId;
      return false;
    });

    if (affectedQuizzes.length === 0) {
      return { success: 0, failed: 0, errors: ["Keine Quizze gefunden"] };
    }

    const total = affectedQuizzes.length;
    onProgress?.(0, total, `Beginne Umbenennung von ${affectedQuizzes.length} Quizze(n)...`);

    // Calculate new normalized ID
    const newId = createDeterministicId(newName, type);

    for (let i = 0; i < affectedQuizzes.length; i++) {
      const quiz = affectedQuizzes[i];
      
      try {
        const updates: Partial<QuizDocument> = {};

        if (type === 'subject') {
          updates.subjectName = newName;
          updates.subjectId = newId;
        } else if (type === 'class') {
          updates.className = newName;
          updates.classId = newId;
        } else if (type === 'topic') {
          updates.topicName = newName;
          updates.topicId = newId;
        }

        const updateResult = await updateQuizDocument(quiz.id, updates);

        if (updateResult.success) {
          result.success++;
          onProgress?.(i + 1, total, `✓ Quiz "${quiz.title}" aktualisiert`);
        } else {
          result.failed++;
          result.errors.push(`${quiz.title}: ${updateResult.error}`);
          onProgress?.(i + 1, total, `✗ Fehler bei "${quiz.title}"`);
        }
      } catch (err: unknown) {
        result.failed++;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        result.errors.push(`${quiz.title}: ${errorMessage}`);
        onProgress?.(i + 1, total, `✗ Fehler bei "${quiz.title}"`);
      }
    }

    onProgress?.(total, total, `Umbenennung abgeschlossen! ${result.success} erfolgreich, ${result.failed} fehlgeschlagen.`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    result.errors.push(`Gesamtfehler: ${errorMessage}`);
  }

  return result;
}

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

/**
 * Checks if a quiz is currently locked by another user.
 * Returns the lock info if locked, null if unlocked or expired.
 */
export async function isQuizLocked(quizId: string, currentUserId: string): Promise<EditLock | null> {
  try {
    const quiz = await loadQuizDocument(quizId);
    if (!quiz?.editLock) {
      return null;
    }

    const lock = quiz.editLock;
    const now = Date.now();

    // Check if lock is expired
    if (lock.expiresAt < now) {
      // Lock expired, auto-release it
      await releaseEditLock(quizId);
      return null;
    }

    // Check if locked by another user
    if (lock.userId !== currentUserId) {
      return lock;
    }

    // Locked by current user
    return null;
  } catch (err) {
    console.error("Error checking quiz lock:", err);
    return null;
  }
}

/**
 * Attempts to acquire an edit lock on a quiz.
 * Returns true if lock was acquired, false if already locked by another user.
 */
export async function acquireEditLock(
  quizId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string; lockedBy?: EditLock }> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizId);

    const result = await runTransaction(db, async (transaction) => {
      const quizDoc = await transaction.get(ref);
      
      if (!quizDoc.exists()) {
        throw new Error("Quiz nicht gefunden");
      }

      const quiz = { id: quizDoc.id, ...quizDoc.data() } as QuizDocument;
      const now = Date.now();

      // Check if already locked
      if (quiz.editLock) {
        const lock = quiz.editLock;
        
        // Check if lock is expired
        if (lock.expiresAt < now) {
          // Lock expired, we can take it
        } else if (lock.userId === userId) {
          // Already locked by current user, refresh it
          const newLock: EditLock = {
            userId,
            userName,
            lockedAt: now,
            expiresAt: now + LOCK_TIMEOUT_MS,
          };
          transaction.update(ref, { editLock: newLock, updatedAt: now });
          return { success: true };
        } else {
          // Locked by another user
          return { success: false, lockedBy: lock };
        }
      }

      // Acquire lock
      const newLock: EditLock = {
        userId,
        userName,
        lockedAt: now,
        expiresAt: now + LOCK_TIMEOUT_MS,
      };
      
      transaction.update(ref, { editLock: newLock, updatedAt: now });
      return { success: true };
    });

    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error acquiring edit lock:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Releases the edit lock on a quiz.
 * Only releases if the current user owns the lock.
 */
export async function releaseEditLock(
  quizId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizId);

    if (!userId) {
      // Force release (e.g., for expired locks)
      await setDoc(ref, { editLock: null, updatedAt: Date.now() }, { merge: true });
      return { success: true };
    }

    const result = await runTransaction(db, async (transaction) => {
      const quizDoc = await transaction.get(ref);
      
      if (!quizDoc.exists()) {
        return { success: false, error: "Quiz nicht gefunden" };
      }

      const quiz = { id: quizDoc.id, ...quizDoc.data() } as QuizDocument;

      // Only release if current user owns the lock
      if (quiz.editLock && quiz.editLock.userId === userId) {
        transaction.update(ref, { editLock: null, updatedAt: Date.now() });
      }

      return { success: true };
    });

    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error releasing edit lock:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Refreshes the edit lock expiration time.
 * Only works if the current user owns the lock.
 */
export async function refreshEditLock(
  quizId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore();
    const ref = doc(db, QUIZZES_COLLECTION, quizId);

    const result = await runTransaction(db, async (transaction) => {
      const quizDoc = await transaction.get(ref);
      
      if (!quizDoc.exists()) {
        return { success: false, error: "Quiz nicht gefunden" };
      }

      const quiz = { id: quizDoc.id, ...quizDoc.data() } as QuizDocument;

      // Only refresh if current user owns the lock
      if (quiz.editLock && quiz.editLock.userId === userId) {
        const now = Date.now();
        const refreshedLock: EditLock = {
          ...quiz.editLock,
          expiresAt: now + LOCK_TIMEOUT_MS,
        };
        transaction.update(ref, { editLock: refreshedLock, updatedAt: now });
        return { success: true };
      }

      return { success: false, error: "Lock nicht vorhanden oder gehört anderem User" };
    });

    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error refreshing edit lock:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

