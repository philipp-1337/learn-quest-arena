import { useState, useEffect } from "react";
import type { Question, Answer, QuizDocument } from "quizTypes";
import { toast } from "sonner";
import { CustomToast } from "@shared/CustomToast";
import { loadQuizDocument, isQuizLocked } from "@utils/quiz-collection";

interface UseQuestionEditorOptions {
  quizId: string;
  questionIndex: number;
  isEditing: boolean;
}

export function useQuestionEditor({
  quizId,
  questionIndex,
  isEditing,
}: UseQuestionEditorOptions) {
  const [loading, setLoading] = useState(true);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [lockWarning, setLockWarning] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question>({
    question: "",
    questionType: "text",
    answerType: "text",
    answers: [
      { type: "text", content: "" },
      { type: "text", content: "" },
      { type: "text", content: "" },
    ],
    correctAnswerIndex: 0,
    correctAnswerIndices: [0],
  });

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;

      try {
        const auth = await import("firebase/auth");
        const currentUser = auth.getAuth().currentUser;

        if (!currentUser) {
          toast.custom(() => (
            <CustomToast message="Nicht angemeldet" type="error" />
          ));
          return;
        }

        const quiz = await loadQuizDocument(quizId);
        if (!quiz) {
          toast.custom(() => (
            <CustomToast message="Quiz nicht gefunden" type="error" />
          ));
          return;
        }

        // Check if quiz is locked by someone else
        const lock = await isQuizLocked(quizId, currentUser.uid);
        if (lock) {
          setLockWarning(
            `Achtung: Dieses Quiz wird gerade von ${lock.userName} bearbeitet. Änderungen sollten nur mit Vorsicht gemacht werden.`
          );
        }

        setQuizDocument(quiz);

        // Load existing question if editing
        if (isEditing && quiz.questions && quiz.questions[questionIndex]) {
          const existingQuestion = quiz.questions[questionIndex];
          const correctIndices =
            existingQuestion.correctAnswerIndices || [
              existingQuestion.correctAnswerIndex,
            ];
          setQuestion({
            ...existingQuestion,
            correctAnswerIndices: correctIndices,
          });
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Laden des Quiz" type="error" />
        ));
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, questionIndex, isEditing]);

  const handleAddAnswer = () => {
    if (question.answers.length >= 5) return;
    const newAnswers = [
      ...question.answers,
      {
        type: question.answerType,
        content: "",
        alt: question.answerType === "image" ? "" : undefined,
      },
    ];
    setQuestion({
      ...question,
      answers: newAnswers,
    });
  };

  const handleRemoveAnswer = (index: number) => {
    if (question.answers.length <= 2) return;
    const newAnswers = question.answers.filter((_, i) => i !== index);

    const newCorrectIndices = (
      question.correctAnswerIndices || [question.correctAnswerIndex]
    )
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));

    if (newCorrectIndices.length === 0) {
      newCorrectIndices.push(0);
    }

    setQuestion({
      ...question,
      answers: newAnswers,
      correctAnswerIndex: newCorrectIndices[0],
      correctAnswerIndices: newCorrectIndices,
    });
  };

  const handleToggleCorrectAnswer = (index: number) => {
    const currentIndices =
      question.correctAnswerIndices || [question.correctAnswerIndex];
    let newIndices: number[];

    if (currentIndices.includes(index)) {
      newIndices = currentIndices.filter((i) => i !== index);
      if (newIndices.length === 0) {
        toast.custom(() => (
          <CustomToast
            message="Mindestens eine Antwort muss richtig sein"
            type="error"
          />
        ));
        return;
      }
    } else {
      newIndices = [...currentIndices, index].sort((a, b) => a - b);
    }

    setQuestion({
      ...question,
      correctAnswerIndex: newIndices[0],
      correctAnswerIndices: newIndices,
    });
  };

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], ...updates };
    setQuestion({
      ...question,
      answers: newAnswers,
      correctAnswerIndices:
        question.correctAnswerIndices || [question.correctAnswerIndex],
    });
  };

  return {
    loading,
    quizDocument,
    lockWarning,
    question,
    setQuestion,
    handleAddAnswer,
    handleRemoveAnswer,
    handleToggleCorrectAnswer,
    updateAnswer,
  };
}
