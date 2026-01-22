import { useMemo } from 'react';
import type { Subject, Class, Topic } from 'quizTypes';

/**
 * Hook zur Berechnung von Statistiken über Subjects, Klassen, Topics und Quizze
 */
export function useStatsCalculation(subjects: Subject[]) {
  const stats = useMemo(() => {
    const totalTopics = subjects.reduce(
      (acc: number, s: Subject) =>
        acc + s.classes.reduce((a: number, c: Class) => a + c.topics.length, 0),
      0
    );

    const totalQuizzes = subjects.reduce(
      (acc: number, s: Subject) =>
        acc +
        s.classes.reduce(
          (a: number, c: Class) =>
            a + c.topics.reduce((b: number, t: Topic) => b + t.quizzes.length, 0),
          0
        ),
      0
    );

    const totalQuestions = subjects.reduce(
      (acc: number, s: Subject) =>
        acc +
        s.classes.reduce(
          (a: number, c: Class) =>
            a +
            c.topics.reduce(
              (b: number, t: Topic) =>
                b +
                t.quizzes.reduce(
                  (qAcc: number, q) => qAcc + (q.questions ? q.questions.length : 0),
                  0
                ),
              0
            ),
          0
        ),
      0
    );

    return {
      totalSubjects: subjects.length,
      totalTopics,
      totalQuizzes,
      totalQuestions,
    };
  }, [subjects]);

  return stats;
}
