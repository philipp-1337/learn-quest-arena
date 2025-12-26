import type { QuestionSRSData } from '../types/userProgress';

/**
 * Stellt sicher, dass alle SRS-Felder vorhanden sind (für Abwärtskompatibilität)
 * @param questionData Partielle SRS-Daten
 * @returns Vollständige QuestionSRSData mit Standardwerten
 */
export function ensureSRSFields(questionData: Partial<QuestionSRSData> = {}): QuestionSRSData {
  return {
    answered: questionData.answered ?? false,
    attempts: questionData.attempts ?? 0,
    lastAnswerCorrect: questionData.lastAnswerCorrect ?? false,
    correctStreak: questionData.correctStreak ?? 0,
    lastAttemptDate: questionData.lastAttemptDate,
    nextReviewDate: questionData.nextReviewDate,
    difficultyLevel: questionData.difficultyLevel ?? 0,
  };
}
