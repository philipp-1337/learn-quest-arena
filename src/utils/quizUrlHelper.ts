import { slugify } from './slugify';
import type { Subject, Class, Topic, Quiz } from '../types/quizTypes';

/**
 * Generiert einen direkten Quiz-Link im Format:
 * #/quiz/[subject]/[class]/[topic]/[quiz]
 */
export function generateQuizUrl(
  subject: Subject,
  classItem: Class,
  topic: Topic,
  quiz: Quiz
): string {
  const subjectSlug = slugify(subject.name);
  const classSlug = slugify(classItem.name);
  const topicSlug = slugify(topic.name);
  const quizSlug = slugify(quiz.title);

  return `/quiz/${subjectSlug}/${classSlug}/${topicSlug}/${quizSlug}`;
}

/**
 * Kopiert den Quiz-Link in die Zwischenablage
 */
export async function copyQuizUrlToClipboard(
  subject: Subject,
  classItem: Class,
  topic: Topic,
  quiz: Quiz
): Promise<boolean> {
  try {
    const url = window.location.origin + generateQuizUrl(subject, classItem, topic, quiz);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Fehler beim Kopieren:', error);
    return false;
  }
}
