/**
 * Question management operations (move questions between quizzes).
 */
import { loadQuizDocument, updateQuizDocument } from './quizCrud';

export async function moveQuestionToQuiz(
  sourceQuizId: string,
  targetQuizId: string,
  questionIndex: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Lade beide Quizze
    const sourceQuiz = await loadQuizDocument(sourceQuizId);
    const targetQuiz = await loadQuizDocument(targetQuizId);

    if (!sourceQuiz || !targetQuiz) {
      return { success: false, error: "Quiz nicht gefunden" };
    }

    if (!sourceQuiz.questions || questionIndex >= sourceQuiz.questions.length) {
      return { success: false, error: "Frage nicht gefunden" };
    }

    // Frage extrahieren
    const questionToMove = sourceQuiz.questions[questionIndex];

    // Aus Source-Quiz entfernen
    const updatedSourceQuestions = sourceQuiz.questions.filter((_, i) => i !== questionIndex);

    // Zu Target-Quiz hinzufügen
    const updatedTargetQuestions = [...(targetQuiz.questions || []), questionToMove];

    // Beide Quizze aktualisieren
    const sourceUpdate = await updateQuizDocument(sourceQuizId, { questions: updatedSourceQuestions });
    const targetUpdate = await updateQuizDocument(targetQuizId, { questions: updatedTargetQuestions });

    if (!sourceUpdate.success || !targetUpdate.success) {
      return { success: false, error: "Fehler beim Aktualisieren der Quizze" };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unbekannter Fehler" };
  }
}