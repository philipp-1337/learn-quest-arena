import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { CustomToast } from '@features/shared/CustomToast';
import type { QuizDocument } from 'quizTypes';
import { subscribeToQuizzes } from '@utils/quiz-collection';

export function useQuizzes(): {
  quizzes: QuizDocument[];
  setQuizzes: React.Dispatch<React.SetStateAction<QuizDocument[]>>;
  loading: boolean;
  authorAbbreviations: Map<string, string>;
} {
  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorAbbreviations, setAuthorAbbreviations] = useState<Map<string, string>>(
    new Map()
  );

  const loadAuthorAbbreviations = async (authorIds: string[]) => {
    const db = getFirestore();
    const abbrevMap = new Map<string, string>();

    const uniqueAuthorIds = [...new Set(authorIds)].filter((id) => id);

    await Promise.all(
      uniqueAuthorIds.map(async (authorId) => {
        try {
          const authorDoc = await getDoc(doc(db, "author", authorId));
          if (authorDoc.exists()) {
            const data = authorDoc.data();
            if (data.authorAbbreviation) {
              abbrevMap.set(authorId, data.authorAbbreviation);
            }
          }
        } catch (error) {
          console.error(
            `Error loading abbreviation for author ${authorId}:`,
            error
          );
        }
      })
    );

    setAuthorAbbreviations(abbrevMap);
  };

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToQuizzes(
      async (docs) => {
        setQuizzes(docs);

        const authorIds = docs.map((q) => q.authorId).filter(Boolean);
        if (authorIds.length > 0) {
          await loadAuthorAbbreviations(authorIds);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error in quiz subscription:", error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Laden der Quizze" type="error" />
        ));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { quizzes, setQuizzes, loading, authorAbbreviations };
}
