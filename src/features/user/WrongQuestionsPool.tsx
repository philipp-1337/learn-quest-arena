import React, { useEffect, useState, useMemo } from "react";
import type { UserQuizProgress, QuestionSRSData } from "userProgress";
import { loadAllUserProgress } from "@utils/loadAllUserProgress";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import type { Quiz, Question } from "quizTypes";
import type { QuizPlayerInitialState } from "@hooks/useQuizPlayer";
import { ensureSRSFields } from "@utils/srsHelpers";
import { WRONG_QUESTIONS_POOL_QUIZ_ID } from "@utils/wrongQuestionsPool";

interface WrongQuestionsPoolProps {
  username: string;
  allQuizzes: any[];
  onStartWrongPool?: (
    quiz: Quiz,
    initialState: QuizPlayerInitialState,
    originProgressByQuizId: Record<string, UserQuizProgress>,
  ) => void;
}

interface WrongQuestion {
  quizId: string;
  questionId: string;
  data: QuestionSRSData;
}

interface WrongQuestionResolved {
  quizId: string;
  questionId: string;
  question: Question;
  questionIndex: number;
}

export const WrongQuestionsPool: React.FC<WrongQuestionsPoolProps> = ({
  username,
  allQuizzes,
  onStartWrongPool,
}) => {
  const [userProgress, setUserProgress] = useState<Record<string, UserQuizProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    loadAllUserProgress(username)
      .then((progress) => {
        setUserProgress(progress);
        setLoading(false);
      })
      .catch((_) => {
        setError("Fehler beim Laden des Fortschritts.");
        setLoading(false);
      });
  }, [username]);

  const wrongQuestions = useMemo(() => {
    const pool: WrongQuestion[] = [];
    Object.values(userProgress).forEach((quizProgress) => {
      Object.entries(quizProgress.questions).forEach(([questionId, data]) => {
        // Frage wurde schon versucht, aber letzte Antwort war falsch
        if (data.attempts > 0 && !data.lastAnswerCorrect) {
          pool.push({ quizId: quizProgress.quizId, questionId, data });
        }
      });
    });
    return pool;
  }, [userProgress]);

  const wrongQuestionsResolved = useMemo(() => {
    const resolved: WrongQuestionResolved[] = [];
    const seen = new Set<string>();

    const getQuestionById = (quizObj: any, questionId: string) => {
      const questionsArr: Question[] = Array.isArray(quizObj?.questions)
        ? quizObj.questions
        : typeof quizObj?.questions === "object" && quizObj?.questions !== null
          ? Object.values(quizObj.questions)
          : [];

      const match = questionId.match(/_(q)?(\d+)$/);
      if (!match) return null;
      const idx = parseInt(match[2], 10);
      if (Number.isNaN(idx) || !questionsArr[idx]) return null;
      return { question: questionsArr[idx], index: idx };
    };

    wrongQuestions.forEach((q) => {
      if (seen.has(q.questionId)) return;
      const quizObj = allQuizzes.find((quiz) => quiz.id === q.quizId);
      if (!quizObj) return;
      const resolvedQuestion = getQuestionById(quizObj, q.questionId);
      if (!resolvedQuestion) return;
      resolved.push({
        quizId: q.quizId,
        questionId: q.questionId,
        question: resolvedQuestion.question,
        questionIndex: resolvedQuestion.index,
      });
      seen.add(q.questionId);
    });

    return resolved;
  }, [wrongQuestions, allQuizzes]);

  if (loading)
    return (
      <div className="mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-200 animate-pulse">
        <RefreshCcw className="w-5 h-5" />
        Lade falsch beantwortete Fragen ...
      </div>
    );
  if (error)
    return (
      <div className="mb-4 flex items-center gap-2 text-red-500">
        <AlertTriangle className="w-5 h-5" />
        {error}
      </div>
    );
  if (wrongQuestions.length === 0 || wrongQuestionsResolved.length === 0) return null;

  const handleStartReview = () => {
    if (!onStartWrongPool) return;

    const questions: Question[] = wrongQuestionsResolved.map((item) => ({
      ...item.question,
      id: item.questionId,
      originQuizId: item.quizId,
      originQuestionIndex: item.questionIndex,
    }));

    if (questions.length === 0) return;

    const initialQuestions: Record<string, QuestionSRSData> = {};
    wrongQuestionsResolved.forEach((item) => {
      const originProgress = userProgress[item.quizId];
      const existing = originProgress?.questions?.[item.questionId];
      initialQuestions[item.questionId] = ensureSRSFields(existing || {});
    });

    const reviewQuiz: Quiz = {
      id: WRONG_QUESTIONS_POOL_QUIZ_ID,
      title: "Fehler-Pool",
      shortTitle: "Fehler-Pool",
      url: WRONG_QUESTIONS_POOL_QUIZ_ID,
      questions,
    };

    const initialState: QuizPlayerInitialState = {
      questions: initialQuestions,
    };

    onStartWrongPool(reviewQuiz, initialState, userProgress);
  };

  return (
    <div className="mb-6 p-5 rounded-2xl shadow-lg bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-yellow-900/30 dark:via-gray-900 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-700">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-6 h-6 text-yellow-700 dark:text-yellow-200" />
        <h2 className="text-xl font-extrabold text-yellow-800 dark:text-yellow-200 tracking-tight">Fehler-Pool</h2>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-200">
        Du hast <span className="font-semibold">{wrongQuestionsResolved.length}</span>{" "}
        {wrongQuestionsResolved.length === 1 ? "offenen Fehler" : "offene Fehler"}.
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Starte ein Review-Quiz mit allen zuletzt falsch beantworteten Fragen.
        </p>
        <button
          type="button"
          onClick={handleStartReview}
          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold shadow-sm transition-colors"
          aria-label="Review-Quiz starten"
          title="Review-Quiz starten"
        >
          Review starten
        </button>
      </div>
    </div>
  );
};
