import React, { useMemo } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Zap,
  Sparkles,
  Clock,
  XIcon,
  Swords,
  Eraser,
  StepForward,
  RefreshCcw,
} from "lucide-react";
import { QuizActionButton } from "./QuizActionButton";
import { showConfirmationToast } from "@utils/confirmationToast";
import { formatTime } from "@utils/formatTime";
import type { UserQuizProgress } from "userProgress";
import type { Quiz } from "quizTypes";

interface ProgressItemWithQuiz extends UserQuizProgress {
  quiz?: Quiz;
}

interface ProgressAccordionItemProps {
  progress: ProgressItemWithQuiz;
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToQuiz: (mode: "fresh" | "continue" | "review") => void;
  onRemoveProgress?: (quizId: string) => void;
}

export const ProgressAccordionItem: React.FC<ProgressAccordionItemProps> = ({
  progress,
  isOpen,
  onToggle,
  onNavigateToQuiz,
  onRemoveProgress,
}) => {
  const quiz = progress.quiz;
  const isDeletedQuiz = !quiz;
  const displayTitle = isDeletedQuiz
    ? "Quiz"
    : quiz?.shortTitle || quiz?.title || progress.quizId;
  const isCompleted = progress.completed;
  const totalQuestions = Object.keys(progress.questions).length;
  const correctAnswers = Object.values(progress.questions).filter(
    (q) => q.answered,
  ).length;
  const completionPercentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  // SRS Statistiken berechnen - useMemo um Reinheit zu gewährleisten
  const srsStats = useMemo(() => {
    const now = Date.now();
    const questionValues = Object.values(progress.questions);
    return {
      dueForReview: questionValues.filter(
        (q) => q.nextReviewDate && q.nextReviewDate <= now && q.answered,
      ).length,
      masteredQuestions: questionValues.filter((q) => q.difficultyLevel >= 5)
        .length,
      learningQuestions: questionValues.filter(
        (q) => q.difficultyLevel >= 1 && q.difficultyLevel < 5,
      ).length,
      newQuestions: questionValues.filter((q) => q.difficultyLevel === 0)
        .length,
    };
  }, [progress.questions]);
  const { dueForReview, masteredQuestions, learningQuestions, newQuestions } =
    srsStats;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <button
        onClick={onToggle}
        className={`
          w-full px-4 py-4 flex items-center justify-between rounded-lg
          transition-all duration-200
          bg-gray-50 hover:bg-gray-100
          dark:bg-slate-800 dark:hover:bg-slate-700
          ${
            isCompleted
              ? `border-l-4 border-green-400`
              : completionPercentage > 0
                ? `border-l-4 border-amber-400`
                : `border-l-4 border-transparent`
          }
        `}
      >
        <div className="flex items-center gap-3 flex-1 text-left min-w-0">
          {/* Status Icon */}
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          )}

          {/* Title */}
          <div className="flex-1 min-w-0 max-w-xs">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate block">
              {displayTitle}
              {isDeletedQuiz && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 align-middle">
                  <XIcon className="w-3 h-3 mr-1" /> Gelöscht
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {correctAnswers}/{totalQuestions} korrekt
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-amber-400"
                }`}
              >
                ({completionPercentage}%)
              </span>
            </p>
          </div>
        </div>

        {/* Status Badge & Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Review Badge nur für nicht gelöschte Quizzes */}
          {!isDeletedQuiz && dueForReview > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-amber-700/60 text-yellow-700 dark:text-amber-400 border border-orange-300 dark:border-orange-700">
              <Swords className="w-3 h-3" />
              {dueForReview}
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {isDeletedQuiz && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-2">
              <p className="text-sm text-red-700 dark:text-red-300">
                Dieses Quiz wurde gelöscht. Dein Fortschritt bleibt erhalten,
                aber du kannst das Quiz nicht mehr starten.
              </p>
            </div>
          )}
          <div
            className={`grid gap-4 ${
              isCompleted && progress.completedTime
                ? "grid-cols-[1fr_1.5fr_1fr]"
                : "grid-cols-2"
            }`}
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                Versuche
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {progress.totalTries}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                Fortschritt
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {correctAnswers}/{totalQuestions}
              </p>
            </div>
            {isCompleted && progress.completedTime && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                  Zeit
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {formatTime(progress.completedTime)}
                </p>
              </div>
            )}
          </div>

          {/* XP Display if available */}
          {progress.xp !== undefined && progress.xp > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wide font-semibold">
                  Erfahrungspunkte
                </p>
              </div>
              <p className="text-lg font-semibold text-purple-900 dark:text-purple-200 mt-1">
                {progress.xp} XP
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
              Letzte Aktivität
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(progress.lastUpdated).toLocaleString("de-DE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* SRS Status Anzeige nur für nicht gelöschte Quizzes */}
          {!isDeletedQuiz &&
            (() => {
              // Prüfen ob überhaupt Stats vorhanden sind
              const hasRelevantStats = isCompleted
                ? dueForReview > 0 || masteredQuestions > 0
                : masteredQuestions > 0 ||
                  learningQuestions > 0 ||
                  dueForReview > 0 ||
                  newQuestions > 0;

              if (!hasRelevantStats) return null;

              return (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 uppercase tracking-wide font-semibold truncate block">
                      <Swords className="w-4 h-4 inline mr-1" />
                      Lernfortschritt
                    </p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 truncate">
                      <Sparkles className="w-3 h-3" />
                      BETA
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {dueForReview > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-700"></span>
                        <span className="text-orange-700 dark:text-amber-400">
                          {dueForReview} zur Wiederholung
                        </span>
                      </div>
                    )}
                    {masteredQuestions > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-700"></span>
                        <span className="text-green-700 dark:text-green-300">
                          {masteredQuestions} gemeistert
                        </span>
                      </div>
                    )}
                    {/* Bei unvollständigen Quizzen auch Learning und New anzeigen */}
                    {!isCompleted && learningQuestions > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-700"></span>
                        <span className="text-blue-700 dark:text-blue-300">
                          {learningQuestions} am Lernen
                        </span>
                      </div>
                    )}
                    {!isCompleted && newQuestions > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {newQuestions} neu
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* Progress Bar */}
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isCompleted ? "bg-green-400" : "bg-amber-400"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
              {completionPercentage}%
            </p>
          </div>

          {/* Button zum Quiz starten & Löschen */}
          {!isDeletedQuiz && (
            <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 mt-4">
              {/* Für unvollständige Quizze: Auswahl aller Modi */}
              {!isCompleted && (
                <>
                  <QuizActionButton
                    onClick={() => onNavigateToQuiz("continue")}
                    icon={<StepForward className="w-4 h-4" />}
                    label="Quiz fortsetzen"
                    variant="primary"
                  />
                  <QuizActionButton
                    onClick={() => onNavigateToQuiz("fresh")}
                    icon={<RefreshCcw className="w-4 h-4" />}
                    label="Neu starten"
                    variant="secondary"
                  />
                  {dueForReview > 0 && (
                    <QuizActionButton
                      onClick={() => onNavigateToQuiz("review")}
                      icon={<Swords className="w-4 h-4" />}
                      label={`${dueForReview} ${dueForReview === 1 ? "Frage" : "Fragen"} wiederholen`}
                      variant="warning"
                    />
                  )}
                </>
              )}
              {/* Für abgeschlossene Quizze: SRS-Review und Wiederholen */}
              {isCompleted && (
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2 w-full">
                  {/* SRS-Review-Button, falls fällige Fragen vorhanden */}
                  {dueForReview > 0 && (
                    <QuizActionButton
                      onClick={() => onNavigateToQuiz("review")}
                      icon={<Swords className="w-4 h-4" />}
                      label={`${dueForReview} ${dueForReview === 1 ? "Frage" : "Fragen"} wiederholen`}
                      variant="warning"
                    />
                  )}
                  {/* Normaler Wiederholen-Button */}
                  <QuizActionButton
                    onClick={() => onNavigateToQuiz("fresh")}
                    icon={<Clock className="w-4 h-4" />}
                    label="Neu starten"
                    variant="secondary"
                  />
                </div>
              )}
              {/* Löschen-Button nur für nicht abgeschlossene und nicht gelöschte Quizzes */}
              {!isCompleted && onRemoveProgress && (
                <button
                  type="button"
                  title="Fortschritt für dieses Quiz entfernen"
                  className="px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    showConfirmationToast({
                      message:
                        "Willst du den Fortschritt für dieses Quiz wirklich löschen? Dein Fortschritt und alle XP für dieses Quiz gehen verloren.",
                      confirmText: "Fortschritt löschen",
                      cancelText: "Abbrechen",
                      onConfirm: () => onRemoveProgress(progress.quizId),
                    });
                  }}
                >
                  <Eraser className="w-4 h-4" />
                  <span className="sm:hidden inline">Fortschritt löschen</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};