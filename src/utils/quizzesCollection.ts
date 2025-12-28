/**
 * Utility functions for the new quizzes collection.
 * This module provides functions for CRUD operations on the standalone quizzes collection.
 */

import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy } from "firebase/firestore";
import type { QuizDocument, Quiz, Subject, MigrationStatus, QuizWithContext } from "../types/quizTypes";
import { getAuth } from "firebase/auth";
import { createDeterministicId } from "./slugify";

const QUIZZES_COLLECTION = "quizzes";
const MIGRATION_STATUS_COLLECTION = "migrationStatus";

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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error updating quiz document:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Extracts all quizzes from the subjects hierarchy with their context.
 */
export function extractAllQuizzesFromSubjects(subjects: Subject[]): QuizWithContext[] {
  const quizzes: QuizWithContext[] = [];
  
  for (const subject of subjects) {
    for (const classItem of subject.classes) {
      for (const topic of classItem.topics) {
        for (const quiz of topic.quizzes) {
          quizzes.push({
            quiz,
            subjectId: subject.id,
            subjectName: subject.name,
            classId: classItem.id,
            className: classItem.name,
            topicId: topic.id,
            topicName: topic.name,
          });
        }
      }
    }
  }
  
  return quizzes;
}

/**
 * Migrates all quizzes from the embedded structure to the new quizzes collection.
 */
export async function migrateQuizzesToCollection(
  subjects: Subject[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<MigrationStatus> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return {
      totalQuizzes: 0,
      migratedQuizzes: 0,
      failedQuizzes: 0,
      errors: ["Nicht authentifiziert"],
      startedAt: Date.now(),
      completedAt: Date.now(),
      status: "failed",
    };
  }
  
  const allQuizzes = extractAllQuizzesFromSubjects(subjects);
  const status: MigrationStatus = {
    totalQuizzes: allQuizzes.length,
    migratedQuizzes: 0,
    failedQuizzes: 0,
    errors: [],
    startedAt: Date.now(),
    status: "in-progress",
  };
  
  onProgress?.(0, allQuizzes.length, "Migration gestartet...");
  
  for (let i = 0; i < allQuizzes.length; i++) {
    const { quiz, subjectId, subjectName, classId, className, topicId, topicName } = allQuizzes[i];
    
    try {
      // Check if already migrated - try UUID first, then legacy ID
      const checkId = quiz.uuid || quiz.id;
      const existingDoc = await loadQuizDocument(checkId);
      if (existingDoc) {
        status.migratedQuizzes++;
        onProgress?.(i + 1, allQuizzes.length, `Quiz "${quiz.title}" bereits migriert, übersprungen.`);
        continue;
      }
      
      // Create the quiz document (will generate UUID if not present)
      const quizDoc = createQuizDocument(
        quiz,
        subjectId,
        subjectName,
        classId,
        className,
        topicId,
        topicName,
        user.uid,
        user.email || undefined
      );
      
      const result = await saveQuizDocument(quizDoc);
      
      if (result.success) {
        status.migratedQuizzes++;
        onProgress?.(i + 1, allQuizzes.length, `Quiz "${quiz.title}" erfolgreich migriert.`);
      } else {
        status.failedQuizzes++;
        status.errors.push(`${quiz.title}: ${result.error}`);
        onProgress?.(i + 1, allQuizzes.length, `Fehler bei Quiz "${quiz.title}": ${result.error}`);
      }
    } catch (err: unknown) {
      status.failedQuizzes++;
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      status.errors.push(`${quiz.title}: ${errorMessage}`);
      onProgress?.(i + 1, allQuizzes.length, `Fehler bei Quiz "${quiz.title}": ${errorMessage}`);
    }
  }
  
  status.completedAt = Date.now();
  
  // Determine final status based on results
  if (status.failedQuizzes === 0 && status.migratedQuizzes > 0) {
    status.status = "completed";
  } else if (status.failedQuizzes > 0 && status.migratedQuizzes > 0) {
    // Partial success - some quizzes migrated, some failed
    status.status = "completed"; // Consider it completed but with errors logged
  } else if (status.migratedQuizzes === 0 && status.failedQuizzes > 0) {
    status.status = "failed";
  } else {
    // No quizzes to migrate or all were already migrated
    status.status = "completed";
  }
  
  // Save migration status to Firestore
  await saveMigrationStatus(status);
  
  return status;
}

/**
 * Saves migration status to Firestore.
 */
export async function saveMigrationStatus(status: MigrationStatus): Promise<void> {
  try {
    const db = getFirestore();
    const ref = doc(db, MIGRATION_STATUS_COLLECTION, `migration-${status.startedAt}`);
    await setDoc(ref, status);
  } catch (err) {
    console.error("Error saving migration status:", err);
  }
}

/**
 * Loads the latest migration status.
 */
export async function loadLatestMigrationStatus(): Promise<MigrationStatus | null> {
  try {
    const db = getFirestore();
    const col = collection(db, MIGRATION_STATUS_COLLECTION);
    const q = query(col, orderBy("startedAt", "desc"));
    const snap = await getDocs(q);
    
    if (snap.docs.length > 0) {
      return snap.docs[0].data() as MigrationStatus;
    }
    return null;
  } catch (err) {
    console.error("Error loading migration status:", err);
    return null;
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
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
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
 * Re-normalizes all existing quiz documents to use deterministic IDs.
 * This is useful when you have existing quizzes with old IDs and want to 
 * standardize them to prevent duplicates in filters.
 */
export async function renormalizeQuizIds(
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  const result = { success: 0, failed: 0, errors: [] as string[] };
  
  try {
    const allQuizzes = await loadAllQuizDocuments();
    const total = allQuizzes.length;
    
    onProgress?.(0, total, "Beginne Re-Normalisierung...");
    
    for (let i = 0; i < allQuizzes.length; i++) {
      const quiz = allQuizzes[i];
      
      try {
        // Calculate normalized IDs
        const normalizedSubjectId = quiz.subjectName ? createDeterministicId(quiz.subjectName, 'subject') : quiz.subjectId;
        const normalizedClassId = quiz.className ? createDeterministicId(quiz.className, 'class') : quiz.classId;
        const normalizedTopicId = quiz.topicName ? createDeterministicId(quiz.topicName, 'topic') : quiz.topicId;
        
        // Check if normalization is needed
        const needsUpdate = 
          (normalizedSubjectId && normalizedSubjectId !== quiz.subjectId) ||
          (normalizedClassId && normalizedClassId !== quiz.classId) ||
          (normalizedTopicId && normalizedTopicId !== quiz.topicId);
        
        if (needsUpdate) {
          // Store original IDs as legacy IDs if not already set
          const updates: Partial<QuizDocument> = {
            subjectId: normalizedSubjectId,
            classId: normalizedClassId,
            topicId: normalizedTopicId,
          };
          
          // Preserve legacy IDs for tracking
          if (!quiz.legacySubjectId && quiz.subjectId) {
            updates.legacySubjectId = quiz.subjectId;
          }
          if (!quiz.legacyClassId && quiz.classId) {
            updates.legacyClassId = quiz.classId;
          }
          if (!quiz.legacyTopicId && quiz.topicId) {
            updates.legacyTopicId = quiz.topicId;
          }
          
          const updateResult = await updateQuizDocument(quiz.id, updates);
          
          if (updateResult.success) {
            result.success++;
            onProgress?.(i + 1, total, `✓ Quiz "${quiz.title}" normalisiert`);
          } else {
            result.failed++;
            result.errors.push(`${quiz.title}: ${updateResult.error}`);
            onProgress?.(i + 1, total, `✗ Fehler bei "${quiz.title}"`);
          }
        } else {
          result.success++;
          onProgress?.(i + 1, total, `→ Quiz "${quiz.title}" bereits normalisiert`);
        }
      } catch (err: unknown) {
        result.failed++;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        result.errors.push(`${quiz.title}: ${errorMessage}`);
        onProgress?.(i + 1, total, `✗ Fehler bei "${quiz.title}"`);
      }
    }
    
    onProgress?.(total, total, "Re-Normalisierung abgeschlossen!");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    result.errors.push(`Gesamtfehler: ${errorMessage}`);
  }
  
  return result;
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
