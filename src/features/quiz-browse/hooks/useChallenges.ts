import { useState, useEffect } from 'react';
import useFirestore from '@hooks/useFirestore';
import type { QuizChallenge, QuizChallengeLevel } from 'quizTypes';

export function useChallenges() {
  const { fetchCollection } = useFirestore();
  const [challenges, setChallenges] = useState<QuizChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true);
      try {
        const loadedChallenges = await fetchCollection('quizChallenges');
        const formatted: QuizChallenge[] = loadedChallenges.map(
          (challenge: {
            id: string;
            title?: string;
            levels?: QuizChallengeLevel[];
            hidden?: boolean;
          }) => ({
            id: challenge.id,
            title: challenge.title || '',
            levels: challenge.levels || [],
            hidden: challenge.hidden || false,
          })
        );
        setChallenges(formatted.filter((c) => !c.hidden));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error loading challenges:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [fetchCollection]);

  return { challenges, loading, error };
}
