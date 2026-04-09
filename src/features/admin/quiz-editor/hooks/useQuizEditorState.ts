import { useEffect, useMemo, useState } from 'react';
import type { Quiz, QuizDocument } from 'quizTypes';
import { loadQuizDocument } from '@utils/quiz-collection';

interface UseQuizEditorStateOptions {
  quizId: string;
}

interface UseQuizEditorStateReturn {
  editedQuiz: Quiz | null;
  setEditedQuiz: React.Dispatch<React.SetStateAction<Quiz | null>>;
  quizDocument: QuizDocument | null;
  allChangesSaved: boolean;
  isLoading: boolean;
}

export function useQuizEditorState({
  quizId,
}: UseQuizEditorStateOptions): UseQuizEditorStateReturn {
  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load quiz document
  useEffect(() => {
    if (!quizId) return;

    const loadQuiz = async () => {
      try {
        const quiz = await loadQuizDocument(quizId);
        if (!quiz) {
          setIsLoading(false);
          return;
        }

        setQuizDocument(quiz);
        setEditedQuiz({
          id: quiz.id,
          uuid: quiz.id,
          title: quiz.title,
          shortTitle: quiz.shortTitle || quiz.title,
          url: quiz.url,
          questions: quiz.questions || [],
          hidden: quiz.hidden === undefined ? true : quiz.hidden,
          isFlashCardQuiz: quiz.isFlashCardQuiz === true,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading quiz:", error);
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const allChangesSaved = useMemo(() => {
    if (!editedQuiz || !quizDocument) {
      return true;
    }

    const changed =
      editedQuiz.title !== quizDocument.title ||
      editedQuiz.shortTitle !== (quizDocument.shortTitle || quizDocument.title) ||
      editedQuiz.url !== quizDocument.url ||
      editedQuiz.hidden !== (quizDocument.hidden === undefined ? true : quizDocument.hidden) ||
      editedQuiz.isFlashCardQuiz !== (quizDocument.isFlashCardQuiz === true);

    return !changed;
  }, [editedQuiz, quizDocument]);

  return {
    editedQuiz,
    setEditedQuiz,
    quizDocument,
    allChangesSaved,
    isLoading,
  };
}
