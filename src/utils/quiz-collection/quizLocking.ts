/**
 * Edit lock management for quiz documents.
 */

import { getFirestore, doc, setDoc, runTransaction } from 'firebase/firestore';
import type { QuizDocument, EditLock } from 'quizTypes';
import { loadQuizDocument } from './quizCrud';

const QUIZZES_COLLECTION = "quizzes";

// Lock timeout: 5 minutes
export const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

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
