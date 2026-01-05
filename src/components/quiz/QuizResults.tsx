import { useState } from "react";
import {
  Trophy,
  PartyPopper,
  ThumbsUp,
  Award,
  Clock,
  Target,
  RefreshCw,
  AlertCircle,
  Home,
  ArrowLeft,
  ChevronDown,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { Question } from "../../types/quizTypes";
import { showCompletedQuizWarning } from "../../utils/showCompletedQuizWarning";
import { formatTime } from "../../utils/formatTime";
import { calculateGrade } from "../../utils/gradeCalculation";
import { useCountUpAnimation } from "../../hooks/useCountUpAnimation";
import { useStaggeredAnimation } from "../../hooks/useStaggeredAnimation";

interface QuizResultsProps {
  statistics: {
    correctCount: number;
    totalAnswered: number;
    percentage: number;
    totalQuestions: number;
    solvedCount: number;
    allSolved: boolean;
    totalTries: number;
    elapsedTime: number;
  };
  wrongQuestions: Array<Question & { index: number; wasCorrect: boolean }>;
  onRestart: () => void;
  onRepeatWrong: () => void;
  onBack: () => void;
  onHome: () => void;
  xpEarned?: number;
  xpDelta?: number;
}

export default function QuizResults({
  statistics,
  wrongQuestions,
  onRestart,
  onRepeatWrong,
  onBack,
  onHome,
  xpEarned = 0,
  xpDelta = 0,
}: QuizResultsProps) {
  const {
    correctCount,
    totalAnswered,
    percentage,
    totalQuestions,
    allSolved,
    totalTries,
    elapsedTime,
  } = statistics;
  const [wrongQuestionsExpanded, setWrongQuestionsExpanded] = useState(false);

  const isPerfect = allSolved && wrongQuestions.length === 0;
  const isGood = percentage >= 80;
  const isOkay = percentage >= 60;
  const gradeInfo = calculateGrade(percentage);

  // Animations
  const animatedXP = useCountUpAnimation(xpEarned, 1500, 0, xpDelta > 0);
  const animatedPercentage = useCountUpAnimation(percentage, 1200);
  const headerVisible = useStaggeredAnimation(0, 150);
  const card1Visible = useStaggeredAnimation(1, 150);
  const card2Visible = useStaggeredAnimation(2, 150);
  const card3Visible = useStaggeredAnimation(3, 150);
  const progressVisible = useStaggeredAnimation(4, 150);
  const wrongQuestionsVisible = useStaggeredAnimation(33, 150); // ~5s delay
  const buttonsVisible = useStaggeredAnimation(34, 150);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-3xl w-full border border-gray-100 dark:border-gray-700">
        {/* Header mit Icon */}
        <div
          className={`text-center mb-6 transition-all duration-700 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="mb-4 relative">
            {isPerfect ? (
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto drop-shadow-lg animate-bounce" />
            ) : isGood ? (
              <PartyPopper className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
            ) : isOkay ? (
              <ThumbsUp className="w-16 h-16 text-blue-500 mx-auto" />
            ) : (
              <Award className="w-16 h-16 text-orange-500 mx-auto" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {isPerfect
              ? "Perfekt!"
              : isGood
              ? "Sehr gut!"
              : isOkay
              ? "Gut gemacht!"
              : "Weiter so!"}
          </h2>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${gradeInfo.bgColor} ${gradeInfo.color} border ${gradeInfo.borderColor}`}
          >
            {animatedPercentage}% • Note {gradeInfo.grade}
          </div>
        </div>

        {/* Three-Box Duolingo-Style Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Box 1: Score & Grade */}
          <div
            className={`rounded-xl p-5 border ${gradeInfo.bgColor} ${
              gradeInfo.borderColor
            } transition-all duration-700 ${
              card1Visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className={`w-5 h-5 ${gradeInfo.color}`} />
              <p
                className={`text-xs uppercase tracking-wide font-semibold ${gradeInfo.color}`}
              >
                Ergebnis
              </p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-1 ${gradeInfo.color}`}>
                {correctCount}/{totalAnswered}
              </div>
              <p className={`text-xs mt-2 ${gradeInfo.color}`}>
                {gradeInfo.label}
              </p>
            </div>
          </div>

          {/* Box 2: Time */}
          <div
            className={`bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 rounded-xl p-5 transition-all duration-700 ${
              card2Visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <p className="text-xs text-indigo-700 dark:text-indigo-300 uppercase tracking-wide font-semibold">
                Benötigte Zeit
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-200">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2">
                Durchlauf {totalTries}
              </p>
            </div>
          </div>

          {/* Box 3: XP */}
          <div
            className={`bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-xl p-5 transition-all duration-700 ${
              card3Visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wide font-semibold">
                Erfahrung
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-900 dark:text-purple-200">
                {animatedXP} XP
              </p>
              {xpDelta !== 0 && (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                    xpDelta > 0
                      ? "bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300"
                  }`}
                >
                  {xpDelta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {xpDelta > 0 ? "+" : ""}
                  {xpDelta} XP
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`mb-6 transition-all duration-700 ${
            progressVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Fortschritt</span>
            <span className="font-semibold">
              {correctCount}/{totalQuestions} gelöst
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                isPerfect
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : isGood
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                  : "bg-gradient-to-r from-orange-500 to-yellow-500"
              }`}
              style={{
                width: progressVisible
                  ? `${(correctCount / totalQuestions) * 100}%`
                  : "0%",
                transition: "width 1000ms ease-out",
              }}
            />
          </div>
        </div>

        {/* Wrong Questions Accordion */}
        {wrongQuestions.length > 0 && (
          <div
            className={`mb-3 transition-all duration-700 ${
              wrongQuestionsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => setWrongQuestionsExpanded(!wrongQuestionsExpanded)}
              className="w-full flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Falsche Fragen
                  {/* ({wrongQuestions.length}) */}
                </h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-red-600 dark:text-red-400 transition-transform ${
                  wrongQuestionsExpanded ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {wrongQuestionsExpanded && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {wrongQuestions.map((q, idx) => (
                  <div
                    key={q.index}
                    className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg p-3"
                  >
                    <div className="flex gap-3 items-center justify-center">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-200 dark:bg-red-800/60 text-red-800 dark:text-red-200 font-bold flex items-center justify-center text-sm">
                        {idx + 1}
                      </span>
                      <p
                        className="text-gray-800 dark:text-gray-200 text-sm flex-1 force-break text-center"
                        lang="de"
                      >
                        {q.question}
                      </p>
                    </div>
                  </div>
                ))}
                {wrongQuestions.length > 0 && (
                  <button
                    onClick={onRepeatWrong}
                    className="w-full bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[0.98] active:scale-[1]"
                    title="Falsche Fragen wiederholen"
                    aria-label="Falsche Fragen wiederholen"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Wiederholen
                    {/* ({wrongQuestions.length}) */}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={`space-y-3 transition-all duration-700 ${
            buttonsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (isPerfect) {
                  showCompletedQuizWarning(onRestart);
                } else {
                  onRestart();
                }
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-[1]"
              title="Neu starten"
              aria-label="Neu starten"
            >
              <RefreshCw className="w-5 h-5" />
              Neu starten
            </button>

            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-[1]"
              title="Zurück"
              aria-label="Zurück"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück
            </button>
          </div>

          <button
            onClick={onHome}
            className="w-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white py-2 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-[1]"
            title="Zum Start"
            aria-label="Zum Start"
          >
            <Home className="w-4 h-4" />
            Zum Start
          </button>
        </div>
      </div>
    </div>
  );
}
