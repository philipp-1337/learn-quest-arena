// XP (Experience Points) calculation for quiz completion
// Factors: percentage, time, number of attempts

// Constants for XP calculation
const BASE_XP_PER_QUESTION = 10;

// Percentage multiplier range
const MIN_PERCENTAGE_MULTIPLIER = 0.3;
const PERCENTAGE_MULTIPLIER_RANGE = 1.2;

// Speed multiplier thresholds (in seconds)
const SPEED_VERY_FAST_THRESHOLD = 20;
const SPEED_FAST_THRESHOLD = 30;
const SPEED_GOOD_THRESHOLD = 45;
const SPEED_ACCEPTABLE_THRESHOLD = 60;
const SPEED_SLOW_THRESHOLD = 90;

// Speed multipliers
const SPEED_VERY_FAST_MULTIPLIER = 1.3;
const SPEED_FAST_MULTIPLIER = 1.2;
const SPEED_GOOD_MULTIPLIER = 1.1;
const SPEED_ACCEPTABLE_MULTIPLIER = 1.0;
const SPEED_SLOW_MULTIPLIER = 0.9;
const SPEED_VERY_SLOW_MULTIPLIER = 0.8;

// Attempt multiplier
const BASE_ATTEMPT_MULTIPLIER = 1.1;
const ATTEMPT_PENALTY_RATE = 0.1;
const MIN_ATTEMPT_MULTIPLIER = 0.5;

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
  // Base XP: configured XP per question
  const baseXP = totalQuestions * BASE_XP_PER_QUESTION;

  // Percentage multiplier: MIN to (MIN + RANGE)
  // 100% = 1.5x, 90% = 1.35x, 80% = 1.2x, 70% = 1.05x, 60% = 0.9x, etc.
  const percentageMultiplier = MIN_PERCENTAGE_MULTIPLIER + (percentage / 100) * PERCENTAGE_MULTIPLIER_RANGE;

  // Speed bonus based on average time per question
  // Target: ~30 seconds per question (ideal), up to 60s (acceptable), >60s (slow)
  const avgTimePerQuestionSec = elapsedTimeMs / 1000 / totalQuestions;
  let speedMultiplier: number;
  
  if (avgTimePerQuestionSec <= SPEED_VERY_FAST_THRESHOLD) {
    speedMultiplier = SPEED_VERY_FAST_MULTIPLIER; // Very fast
  } else if (avgTimePerQuestionSec <= SPEED_FAST_THRESHOLD) {
    speedMultiplier = SPEED_FAST_MULTIPLIER; // Fast
  } else if (avgTimePerQuestionSec <= SPEED_GOOD_THRESHOLD) {
    speedMultiplier = SPEED_GOOD_MULTIPLIER; // Good
  } else if (avgTimePerQuestionSec <= SPEED_ACCEPTABLE_THRESHOLD) {
    speedMultiplier = SPEED_ACCEPTABLE_MULTIPLIER; // Acceptable
  } else if (avgTimePerQuestionSec <= SPEED_SLOW_THRESHOLD) {
    speedMultiplier = SPEED_SLOW_MULTIPLIER; // Slow
  } else {
    speedMultiplier = SPEED_VERY_SLOW_MULTIPLIER; // Very slow
  }

  // Attempt multiplier: First attempt = 1.0x, second = 0.9x, third = 0.8x, etc.
  const attemptMultiplier = Math.max(MIN_ATTEMPT_MULTIPLIER, BASE_ATTEMPT_MULTIPLIER - (attempts * ATTEMPT_PENALTY_RATE));

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
