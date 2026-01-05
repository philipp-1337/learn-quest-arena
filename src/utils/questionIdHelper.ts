import type { Question } from '@types/quizTypes';

/**
 * Generates a consistent ID for a question
 * @param question The question object
 * @param quizId The ID of the quiz containing the question
 * @param index The index of the question in the quiz
 * @returns A unique question ID in the format: quizId_qIndex or the existing ID
 */
export function getQuestionId(question: Question, quizId: string, index: number): string {
  return question.id || `${quizId}_q${index}`;
}

/**
 * Safely gets question ID with null check
 * @param question The question object that may not have an ID
 * @param quizId The ID of the quiz containing the question
 * @param index The index of the question in the quiz
 * @returns The question ID or undefined if question is null/undefined
 */
export function safeGetQuestionId(
  question: Question | null | undefined, 
  quizId: string, 
  index: number
): string | undefined {
  if (!question) return undefined;
  return getQuestionId(question, quizId, index);
}
