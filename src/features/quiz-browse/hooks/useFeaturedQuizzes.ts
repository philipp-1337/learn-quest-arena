import { useState, useEffect } from 'react';
import { loadAllQuizDocuments } from '../../../utils/quiz-collection';
import type { QuizDocument } from '../../../types/quizTypes';

export function useFeaturedQuizzes(count = 3) {
  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const allQuizzes = await loadAllQuizDocuments();
        const visibleQuizzes = allQuizzes
          .filter(
            (q) =>
              !q.hidden && 
              Array.isArray(q.questions) && 
              q.questions.length > 3
          )
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        
        setQuizzes(visibleQuizzes.slice(0, count));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error loading featured quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [count]);

  return { quizzes, loading, error };
}
