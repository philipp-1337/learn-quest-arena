import type { Subject, Class, Topic, Quiz } from "quizTypes";

/**
 * Ergebnis einer Quiz-Suche in der Hierarchie.
 */
export interface QuizSearchResult {
  quiz: Quiz;
  subject: Subject;
  classItem: Class;
  topic: Topic;
}

/**
 * Sucht ein Quiz anhand seiner ID in der Subject-Hierarchie.
 * @param subjects Array von Subjects
 * @param quizId Die Quiz-ID
 * @returns QuizSearchResult oder undefined, wenn nicht gefunden
 */
export function findQuizById(
  subjects: Subject[],
  quizId: string
): QuizSearchResult | undefined {
  for (const subject of subjects) {
    for (const classItem of subject.classes) {
      for (const topic of classItem.topics) {
        const quiz = topic.quizzes.find(q => q.id === quizId);
        if (quiz) {
          return { quiz, subject, classItem, topic };
        }
      }
    }
  }
  return undefined;
}

/**
 * Sucht ein Quiz anhand des Quiz-Objekts (Referenzvergleich) in der Hierarchie.
 * @param subjects Array von Subjects
 * @param targetQuiz Das zu findende Quiz-Objekt
 * @returns QuizSearchResult oder undefined, wenn nicht gefunden
 */
export function findQuizByReference(
  subjects: Subject[],
  targetQuiz: Quiz
): QuizSearchResult | undefined {
  for (const subject of subjects) {
    for (const classItem of subject.classes) {
      for (const topic of classItem.topics) {
        if (topic.quizzes.includes(targetQuiz)) {
          return { quiz: targetQuiz, subject, classItem, topic };
        }
      }
    }
  }
  return undefined;
}

/**
 * Sucht nur das Quiz-Objekt anhand seiner ID (ohne Hierarchie-Informationen).
 * @param subjects Array von Subjects
 * @param quizId Die Quiz-ID
 * @returns Quiz oder undefined, wenn nicht gefunden
 */
export function findQuizOnly(
  subjects: Subject[],
  quizId: string
): Quiz | undefined {
  const result = findQuizById(subjects, quizId);
  return result?.quiz;
}
