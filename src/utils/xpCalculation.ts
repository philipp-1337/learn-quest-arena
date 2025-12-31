// XP (Experience Points) calculation for quiz completion
// Factors: percentage, time, number of attempts

export interface XPCalculation {
  totalXP: number;
  baseXP: number;
  percentageBonus: number;
  speedBonus: number;
  attemptPenalty: number;
  breakdown: {
    base: number;
    percentageMultiplier: number;
    speedMultiplier: number;
    attemptMultiplier: number;
  };
}

/**
 * Calculates XP earned for completing a quiz
 * @param percentage - Percentage of correct answers (0-100)
 * @param elapsedTimeMs - Time taken in milliseconds
 * @param totalQuestions - Total number of questions in the quiz
 * @param attempts - Number of attempts/tries for this quiz
 * @returns XP calculation details
 */
export function calculateXP(
  percentage: number,
  elapsedTimeMs: number,
  totalQuestions: number,
  attempts: number
): XPCalculation {
  // Base XP: 10 XP per question
  const baseXP = totalQuestions * 10;

  // Percentage multiplier: 0.3 to 1.5
  // 100% = 1.5x, 90% = 1.35x, 80% = 1.2x, 70% = 1.05x, 60% = 0.9x, etc.
  const percentageMultiplier = 0.3 + (percentage / 100) * 1.2;

  // Speed bonus based on average time per question
  // Target: ~30 seconds per question (ideal), up to 60s (acceptable), >60s (slow)
  const avgTimePerQuestionSec = elapsedTimeMs / 1000 / totalQuestions;
  let speedMultiplier = 1.0;
  
  if (avgTimePerQuestionSec <= 20) {
    speedMultiplier = 1.3; // Very fast
  } else if (avgTimePerQuestionSec <= 30) {
    speedMultiplier = 1.2; // Fast
  } else if (avgTimePerQuestionSec <= 45) {
    speedMultiplier = 1.1; // Good
  } else if (avgTimePerQuestionSec <= 60) {
    speedMultiplier = 1.0; // Acceptable
  } else if (avgTimePerQuestionSec <= 90) {
    speedMultiplier = 0.9; // Slow
  } else {
    speedMultiplier = 0.8; // Very slow
  }

  // Attempt multiplier: First attempt = 1.0x, second = 0.9x, third = 0.8x, etc.
  const attemptMultiplier = Math.max(0.5, 1.1 - (attempts * 0.1));

  // Calculate total XP
  const totalXP = Math.round(
    baseXP * percentageMultiplier * speedMultiplier * attemptMultiplier
  );

  // Calculate individual bonuses for display
  const percentageBonus = Math.round(baseXP * (percentageMultiplier - 1));
  const speedBonus = Math.round(baseXP * percentageMultiplier * (speedMultiplier - 1));
  const attemptPenalty = Math.round(baseXP * percentageMultiplier * speedMultiplier * (1 - attemptMultiplier));

  return {
    totalXP,
    baseXP,
    percentageBonus,
    speedBonus,
    attemptPenalty,
    breakdown: {
      base: baseXP,
      percentageMultiplier,
      speedMultiplier,
      attemptMultiplier,
    },
  };
}
