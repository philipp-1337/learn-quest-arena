import type { QuestionSRSData } from '../types/userProgress';

/**
 * Berechnet das nächste Review-Datum basierend auf dem aktuellen Streak.
 * Einfaches SRS: Intervall verdoppelt sich bei richtigen Antworten.
 * Intervalle: 1 Tag, 2 Tage, 4 Tage, 8 Tage, 16 Tage, 32 Tage
 * @param correctStreak Anzahl der aufeinanderfolgenden korrekten Antworten
 * @param isCorrect Ob die aktuelle Antwort korrekt war
 * @returns Timestamp für das nächste Review-Datum
 */
export function calculateNextReviewDate(correctStreak: number, isCorrect: boolean): number {
  const baseInterval = 24 * 60 * 60 * 1000; // 1 Tag in Millisekunden
  const streak = isCorrect ? correctStreak + 1 : 0;
  const multiplier = Math.pow(2, Math.min(streak, 5));
  return Date.now() + (baseInterval * multiplier);
}

/**
 * Berechnet das Schwierigkeitslevel basierend auf Streak und Versuchen.
 * 0 = neu, 1-2 = lernend, 3-4 = bekannt, 5 = gemeistert
 * @param correctStreak Anzahl der aufeinanderfolgenden korrekten Antworten
 * @param attempts Gesamtzahl der Versuche
 * @returns Schwierigkeitslevel (0-5)
 */
export function calculateDifficultyLevel(correctStreak: number, attempts: number): number {
  if (correctStreak >= 5) return 5;
  if (correctStreak >= 3) return 4;
  if (correctStreak >= 2) return 3;
  if (correctStreak >= 1) return 2;
  if (attempts > 0) return 1;
  return 0;
}

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
