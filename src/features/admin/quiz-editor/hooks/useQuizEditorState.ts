import { useState, useEffect } from "react";
import type { Quiz, QuizDocument } from "quizTypes";
import { loadQuizDocument } from "@utils/quiz-collection";

interface UseQuizEditorStateOptions {
  quizId: string;
}

interface UseQuizEditorStateReturn {
  editedQuiz: Quiz | null;
  setEditedQuiz: React.Dispatch<React.SetStateAction<Quiz | null>>;
  quizDocument: QuizDocument | null;
  urlShared: boolean;
  setUrlShared: React.Dispatch<React.SetStateAction<boolean>>;
  allChangesSaved: boolean;
  isLoading: boolean;
}

export function useQuizEditorState({
  quizId,
}: UseQuizEditorStateOptions): UseQuizEditorStateReturn {
  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [urlShared, setUrlShared] = useState(false);
  const [allChangesSaved, setAllChangesSaved] = useState(true);
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
          questions: quiz.questions || [],
          hidden: quiz.hidden === undefined ? true : quiz.hidden,
        });
        setUrlShared(quiz.urlShared || false);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading quiz:", error);
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  // Track unsaved changes
  useEffect(() => {
    if (!editedQuiz || !quizDocument) return;

    const changed =
      editedQuiz.title !== quizDocument.title ||
      editedQuiz.shortTitle !== (quizDocument.shortTitle || quizDocument.title) ||
      editedQuiz.hidden !== (quizDocument.hidden === undefined ? true : quizDocument.hidden) ||
      urlShared !== (quizDocument.urlShared || false);

    setAllChangesSaved(!changed);
  }, [editedQuiz, quizDocument, urlShared]);

  return {
    editedQuiz,
    setEditedQuiz,
    quizDocument,
    urlShared,
    setUrlShared,
    allChangesSaved,
    isLoading,
  };
}
