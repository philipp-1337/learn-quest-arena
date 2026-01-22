import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Zap,
  Sparkles,
  Play,
  Clock,
  // Timer
} from 'lucide-react';
import { loadAllUserProgress } from '@utils/loadAllUserProgress';
import type { UserQuizProgress } from 'userProgress';
import type { Subject, Quiz } from 'quizTypes';
import { showConfirmationToast } from '@utils/confirmationToast';
import { formatTime } from '@utils/formatTime';
import { findQuizOnly, findQuizById } from '@utils/quizHierarchySearch';
import { useQuizNavigation } from '@features/quiz-browse'

interface UserViewProps {
  subjects: Subject[];
}

interface UserDashboardProps {
  username: string;
  subjects: Subject[];
  onNavigateToQuiz: (
    quizId: string,
    mode: "fresh" | "continue" | "review"
  ) => void;
}

interface ProgressItemWithQuiz extends UserQuizProgress {
  quiz?: Quiz;
}

const ProgressAccordionItem: React.FC<{
  progress: ProgressItemWithQuiz;
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToQuiz: (mode: "fresh" | "continue" | "review") => void;
}> = ({ progress, isOpen, onToggle, onNavigateToQuiz }) => {
  const quiz = progress.quiz;
  const isDeletedQuiz = !quiz;
  const displayTitle = isDeletedQuiz
    ? "Gelöschtes Quiz"
    : quiz?.shortTitle || quiz?.title || progress.quizId;
  const isCompleted = progress.completed;
  const totalQuestions = Object.keys(progress.questions).length;
  const correctAnswers = Object.values(progress.questions).filter(
    (q) => q.answered
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
        (q) => q.nextReviewDate && q.nextReviewDate <= now && q.answered
      ).length,
      masteredQuestions: questionValues.filter((q) => q.difficultyLevel >= 5)
        .length,
      learningQuestions: questionValues.filter(
        (q) => q.difficultyLevel >= 1 && q.difficultyLevel < 5
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
                <span className="ml-2 text-xs text-red-500 dark:text-red-400 font-normal">(Quiz gelöscht)</span>
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
          {/* Review Badge wenn Fragen fällig */}
          {dueForReview > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-amber-700/60 text-yellow-700 dark:text-amber-400 border border-orange-300 dark:border-orange-700">
              <Sparkles className="w-3 h-3" />
              {dueForReview}
            </span>
          )}
          {/* <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isCompleted
                ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                : "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
            }`}
          >
            {completionPercentage}%
          </span> */}
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
                Dieses Quiz wurde gelöscht. Dein Fortschritt bleibt erhalten, aber du kannst das Quiz nicht mehr starten.
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

          {/* SRS Status Anzeige */}
          {(() => {
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
                    Lernfortschritt
                  </p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
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

          {/* Button zum Quiz starten */}
          <button
            onClick={() => {
              // Bestimme den Modus basierend auf SRS-Daten
              const mode =
                dueForReview > 0
                  ? "review"
                  : isCompleted
                  ? "fresh"
                  : "continue";
              onNavigateToQuiz(mode);
            }}
            className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            {dueForReview > 0
              ? `${dueForReview} ${
                  dueForReview === 1 ? "Frage" : "Fragen"
                } wiederholen`
              : isCompleted
              ? "Quiz wiederholen"
              : "Quiz fortsetzen"}
          </button>
        </div>
      )}
    </div>
  );
};

const UserDashboard: React.FC<UserDashboardProps> = ({
  username,
  subjects,
  onNavigateToQuiz,
}) => {
  const [progressList, setProgressList] = useState<ProgressItemWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        const progressObj: Record<string, UserQuizProgress> =
          await loadAllUserProgress(username);
        const allProgress: UserQuizProgress[] = Object.values(progressObj);
        allProgress.sort((a, b) => {
          // Zuerst incomplete nach oben (false > true = -1)
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Dann nach lastUpdated absteigend
          return b.lastUpdated - a.lastUpdated;
        });

        // Quiz-Daten enrichen
        const enrichedProgress: ProgressItemWithQuiz[] = allProgress.map(
          (progress) => ({
            ...progress,
            quiz: findQuizOnly(subjects, progress.quizId),
          })
        );

        setProgressList(enrichedProgress);

        // Berechne Gesamt-XP: Summiere XP von allen Quizzes
        const calculatedTotalXP = allProgress.reduce(
          (sum, progress) => sum + (progress.xp || 0),
          0
        );
        setTotalXP(calculatedTotalXP);
      } catch {
        setProgressList([]);
        setTotalXP(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [username, subjects]);

  const toggleItem = (quizId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(quizId)) {
      newOpenItems.delete(quizId);
    } else {
      newOpenItems.add(quizId);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dein Fortschritt
      </h1>

      {/* Total XP Display */}
      {totalXP > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/60 p-3 rounded-full">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wide">
                  Gesamt-Erfahrung
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                  {totalXP} XP
                </p>
              </div>
            </div>
            {/* <Sparkles className="w-8 h-8 text-purple-400 dark:text-purple-600" /> */}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 dark:text-gray-400">
          Lade Fortschritt...
        </div>
      ) : progressList.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">
          {username === "Gast"
            ? "Wähle deinen Namen, wenn du Fortschritt speichern willst."
            : "Kein Fortschritt vorhanden."}
        </div>
      ) : (
        <div className="space-y-2">
          {progressList.map((progress) => (
            <ProgressAccordionItem
              key={progress.quizId}
              progress={progress}
              isOpen={openItems.has(progress.quizId)}
              onToggle={() => toggleItem(progress.quizId)}
              onNavigateToQuiz={(mode) =>
                onNavigateToQuiz(progress.quizId, mode)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UserView: React.FC<UserViewProps> = ({
  subjects,
}) => {
  const navigate = useNavigate();
  const { navigateToQuiz } = useQuizNavigation();
  const [username] = useState<string>(() => {
    const stored = localStorage.getItem("lqa_username");
    return stored && stored !== "" ? stored : "Gast";
  });

  const handleClose = () => {
    navigate('/');
  };

  const handleChooseName = () => {
    navigate('/?chooseName=true');
  };

  const handleNavigateToQuiz = (
    quizId: string,
    mode: "fresh" | "continue" | "review"
  ) => {
    const result = findQuizById(subjects, quizId);
    if (result) {
      const { quiz, subject, classItem, topic } = result;
      navigateToQuiz(subject, classItem, topic, quiz, mode);
      // Navigation zum Quiz verlässt automatisch die UserView-Route
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleClose}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2 force-break"
            lang="de"
          >
            Nutzername
          </h1>
          <p className="text-gray-600 dark:text-gray-400 force-break" lang="de">
            {username === "Gast"
              ? "Du hast noch keinen Namen. Klicke auf das Stift-Icon, um einen auszuwählen."
              : "Dein zufällig generierter Nutzername"}
          </p>
        </div>

        {/* Username Display mit Icon-Button */}
        <div className="mb-6 flex items-center justify-between text-2xl text-gray-800 dark:text-gray-200 font-mono break-all select-all border border-gray-200 dark:border-gray-700 rounded-lg py-4 px-4 bg-gray-50 dark:bg-gray-900">
          <span className="truncate">{username}</span>
          <button
            onClick={async () => {
              // Fortschritt laden
              let hasProgress = false;
              try {
                const progressObj = await loadAllUserProgress(username);
                hasProgress = Object.keys(progressObj).length > 0;
              } catch (e) {
                hasProgress = false;
              }
              if (username !== "Gast" || hasProgress) {
                showConfirmationToast({
                  message:
                    "Wenn du deinen Namen änderst, geht dein Fortschritt verloren. Bist du sicher?",
                  onConfirm: handleChooseName,
                  confirmText: "Weiter",
                  cancelText: "Abbrechen",
                });
              } else {
                handleChooseName();
              }
            }}
            className="ml-2 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors relative"
            title="Anderen Namen wählen"
            aria-label="Anderen Namen wählen"
            type="button"
          >
            <Pencil
              className={`w-5 h-5 ${
                username === "Gast" ? "animate-pulse" : ""
              }`}
            />
          </button>
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <UserDashboard
            username={username}
            subjects={subjects}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        </div>

        {/* Action Buttons entfernt, da Icon-Button jetzt im Username-Display ist */}
      </div>
    </div>
  );
};

export default UserView;
