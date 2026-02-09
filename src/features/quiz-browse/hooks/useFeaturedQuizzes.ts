import { useState, useEffect, useCallback } from 'react';
import { loadAllQuizDocuments } from '@utils/quiz-collection';
import type { QuizDocument } from 'quizTypes';

export function useFeaturedQuizzes(count = 3) {
  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuizzes = useCallback(async (activeRef: { current: boolean }) => {
    const timeoutMs = 8000;
    setLoading(true);
    try {
      const allQuizzes = await Promise.race([
        loadAllQuizDocuments(),
        new Promise<QuizDocument[]>((_, reject) =>
          setTimeout(() => reject(new Error('Loading featured quizzes timed out.')), timeoutMs)
        ),
      ]);
      const visibleQuizzes = allQuizzes
        .filter(
          (q) =>
            !q.hidden && 
            Array.isArray(q.questions) && 
            q.questions.length > 3
        )
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

      if (activeRef.current) {
        setQuizzes(visibleQuizzes.slice(0, count));
        setError(null);
      }
    } catch (err) {
      if (activeRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setQuizzes([]);
      }
      console.error('Error loading featured quizzes:', err);
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  }, [count]);

  const refetch = useCallback(() => {
    const activeRef = { current: true };
    fetchQuizzes(activeRef);
  }, [fetchQuizzes]);

  useEffect(() => {
    const activeRef = { current: true };
    fetchQuizzes(activeRef);

    return () => {
      activeRef.current = false;
    };
  }, [fetchQuizzes]);

  return { quizzes, loading, error, refetch };
}
