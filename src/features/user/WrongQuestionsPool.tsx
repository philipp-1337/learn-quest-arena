import React, { useEffect, useState, useMemo } from "react";
import type { UserQuizProgress, QuestionSRSData } from "userProgress";
import { loadAllUserProgress } from "@utils/loadAllUserProgress";
import { AlertTriangle, RefreshCcw, HelpCircle } from "lucide-react";

interface WrongQuestionsPoolProps {
  username: string;
  allQuizzes: any[];
}

interface WrongQuestion {
  quizId: string;
  questionId: string;
  data: QuestionSRSData;
}

export const WrongQuestionsPool: React.FC<WrongQuestionsPoolProps> = ({ username, allQuizzes }) => {
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
  if (wrongQuestions.length === 0)
    return (
      <div className="mb-4 flex items-center gap-2 text-green-700 dark:text-green-200">
        <HelpCircle className="w-5 h-5" />
        Keine falsch beantworteten Fragen gefunden!
      </div>
    );

  return (
    <div className="mb-8 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-yellow-900/30 dark:via-gray-900 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-700">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-700 dark:text-yellow-200" />
        <h2 className="text-2xl font-extrabold text-yellow-800 dark:text-yellow-200 tracking-tight">Falsch beantwortete Fragen</h2>
      </div>
      <ul className="grid gap-3">
        {wrongQuestions
          .filter((q) => allQuizzes.some((quiz) => quiz.id === q.quizId))
          .map((q) => {
            // Quiz-Fragetext holen
            const quizObj = allQuizzes.find((quiz) => quiz.id === q.quizId);
            let questionText = "Fragetext nicht gefunden";
            if (quizObj && quizObj.questions) {
              let questionsArr: Array<{ question?: string }> = [];
              if (Array.isArray(quizObj.questions)) {
                questionsArr = quizObj.questions;
              } else if (typeof quizObj.questions === "object" && quizObj.questions !== null) {
                questionsArr = Object.values(quizObj.questions);
              }
              // Versuche, die Frage per id zu finden
              let question = null;
              // Extrahiere Index aus questionId, z.B. quizId_q78 -> 78
              const match = q.questionId.match(/_(q)?(\d+)$/);
              if (match) {
                const idx = parseInt(match[2], 10);
                if (!isNaN(idx) && questionsArr[idx]) {
                  question = questionsArr[idx];
                }
              }
              if (question && question.question) {
                questionText = question.question;
              } else {
                // Fallback: gekürzte ID anzeigen
                questionText = q.questionId.length > 12 ? q.questionId.slice(0, 12) + "..." : q.questionId;
              }
            }
            return (
              <li
                key={q.quizId + q.questionId}
                className="rounded-xl border border-yellow-200 dark:border-yellow-700 bg-white dark:bg-yellow-900/30 p-4 flex flex-col md:flex-row md:items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                    <span className="font-semibold text-yellow-700 dark:text-yellow-200">Quiz:</span> <span className="font-mono">{quizObj?.title || q.quizId}</span><br />
                    <span className="font-semibold text-yellow-700 dark:text-yellow-200">Frage:</span> <span className="font-mono">{questionText}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Versuche:</span> {q.data.attempts}
                    {q.data.correctStreak > 0 && (
                      <span className="ml-2 text-green-600 dark:text-green-300">Streak: {q.data.correctStreak}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs font-bold">
                    Noch nicht richtig!
                  </span>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
