/**
 * Category management operations (reassign and rename).
 */

import { createDeterministicId } from "../slugify";
import type { QuizDocument } from "quizTypes";
import { loadQuizDocument, updateQuizDocument } from "./quizCrud";
import { loadAllQuizDocuments } from "./quizQueries";

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
    onProgress?.(0, total, `Beginne Umbenennung von \${affectedQuizzes.length} Quizze(n)...`);

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
          onProgress?.(i + 1, total, `✓ Quiz "\${quiz.title}" aktualisiert`);
        } else {
          result.failed++;
          result.errors.push(`\${quiz.title}: \${updateResult.error}`);
          onProgress?.(i + 1, total, `✗ Fehler bei "\${quiz.title}"`);
        }
      } catch (err: unknown) {
        result.failed++;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        result.errors.push(`${quiz.title}: ${errorMessage}`);
        onProgress?.(i + 1, total, `✗ Fehler bei "\${quiz.title}"`);
      }
    }

    onProgress?.(total, total, `Umbenennung abgeschlossen! \${result.success} erfolgreich, \${result.failed} fehlgeschlagen.`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    result.errors.push(`Gesamtfehler: ${errorMessage}`);
  }

  return result;
}
