import React, { useEffect, useState, useMemo } from 'react';
import { 
  Pencil, 
  ArrowLeft, 
  CheckCircle2,
  ChevronDown,
  Zap,
  // Timer 
} from 'lucide-react';
import { toast } from 'sonner';
import { loadAllUserProgress } from '../../utils/loadAllUserProgress';
import type { UserQuizProgress } from '../../types/userProgress';
import type { Subject, Quiz } from '../../types/quizTypes';

import { CustomToast } from '../misc/CustomToast';


interface UserViewProps {
  username: string;
  onClose: () => void;
  onChooseName: () => void;
  subjects: Subject[];
}

interface UserDashboardProps {
  username: string;
  subjects: Subject[];
}

interface ProgressItemWithQuiz extends UserQuizProgress {
  quiz?: Quiz;
}

const ProgressAccordionItem: React.FC<{
  progress: ProgressItemWithQuiz;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ progress, isOpen, onToggle }) => {
  const quiz = progress.quiz;
  const displayTitle = quiz?.shortTitle || quiz?.title || progress.quizId;
  const isCompleted = progress.completed;
  const totalQuestions = Object.keys(progress.questions).length;
  const correctAnswers = Object.values(progress.questions).filter(q => q.answered).length;
  const completionPercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // SRS Statistiken berechnen - useMemo um Reinheit zu gewährleisten
  const srsStats = useMemo(() => {
    const now = Date.now();
    const questionValues = Object.values(progress.questions);
    return {
      dueForReview: questionValues.filter(q => 
        q.nextReviewDate && q.nextReviewDate <= now && q.answered
      ).length,
      masteredQuestions: questionValues.filter(q => q.difficultyLevel >= 5).length,
      learningQuestions: questionValues.filter(q => q.difficultyLevel >= 1 && q.difficultyLevel < 5).length,
      newQuestions: questionValues.filter(q => q.difficultyLevel === 0).length,
    };
  }, [progress.questions]);
  const { dueForReview, masteredQuestions, learningQuestions, newQuestions } = srsStats;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <button
        onClick={onToggle}
        className={`w-full px-4 py-4 flex items-center justify-between transition-colors ${
          isCompleted 
            ? 'bg-green-50 hover:bg-green-100' 
            : completionPercentage > 0
            ? 'bg-yellow-50 hover:bg-yellow-100'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 text-left min-w-0">
          {/* Status Icon */}
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          )}
          
          {/* Title */}
          <div className="flex-1 min-w-0 max-w-xs">
            <h3 className="font-semibold text-gray-900 truncate block">{displayTitle}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {correctAnswers}/{totalQuestions} korrekt ({completionPercentage}%)
            </p>
          </div>
        </div>

        {/* Status Badge & Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-200 text-green-800 text-xs font-medium">
              100%
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 py-4 bg-white border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Versuche</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{progress.totalTries}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Fortschritt</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{correctAnswers}/{totalQuestions}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Letzte Aktivität</p>
            <p className="text-sm text-gray-700">
              {new Date(progress.lastUpdated).toLocaleString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {isCompleted && progress.completedTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 uppercase tracking-wide font-semibold">Zeit zum 100% Lösen</p>
              <p className="text-sm font-semibold text-green-900 mt-1">{formatTime(progress.completedTime)}</p>
            </div>
          )}

          {/* SRS Status Anzeige */}
          {(() => {
            // Bei abgeschlossenen Quizzen: nur "zur Wiederholung" und "gemeistert" anzeigen
            if (isCompleted) {
              const hasRelevantStats = dueForReview > 0 || masteredQuestions > 0;
              if (!hasRelevantStats) return null;
              
              return (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-xs text-indigo-700 uppercase tracking-wide font-semibold mb-2">Lernfortschritt (SRS)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {dueForReview > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="text-orange-700">{dueForReview} zur Wiederholung</span>
                      </div>
                    )}
                    {masteredQuestions > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-green-700">{masteredQuestions} gemeistert</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Bei unvollständigen Quizzen: alle 4 Kategorien anzeigen, wenn mindestens eine > 0
            const hasAnyStats = masteredQuestions > 0 || learningQuestions > 0 || dueForReview > 0 || newQuestions > 0;
            if (!hasAnyStats) return null;
            
            return (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-xs text-indigo-700 uppercase tracking-wide font-semibold mb-2">Lernfortschritt (SRS)</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {dueForReview > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="text-orange-700">{dueForReview} zur Wiederholung</span>
                    </div>
                  )}
                  {masteredQuestions > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-700">{masteredQuestions} gemeistert</span>
                    </div>
                  )}
                  {learningQuestions > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-blue-700">{learningQuestions} am Lernen</span>
                    </div>
                  )}
                  {newQuestions > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="text-gray-600">{newQuestions} neu</span>
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
                  isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">{completionPercentage}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

const UserDashboard: React.FC<UserDashboardProps> = ({ username, subjects }) => {
  const [progressList, setProgressList] = useState<ProgressItemWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const findQuizById = (quizId: string): Quiz | undefined => {
    for (const subject of subjects) {
      for (const cls of subject.classes) {
        for (const topic of cls.topics) {
          const quiz = topic.quizzes.find(q => q.id === quizId);
          if (quiz) return quiz;
        }
      }
    }
    return undefined;
  };

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        const progressObj: Record<string, UserQuizProgress> = await loadAllUserProgress(username);
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
        const enrichedProgress: ProgressItemWithQuiz[] = allProgress.map(progress => ({
          ...progress,
          quiz: findQuizById(progress.quizId),
        }));

        setProgressList(enrichedProgress);
      } catch (e) {
        setProgressList([]);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dein Fortschritt</h1>
      {loading ? (
        <div className="text-gray-600">Lade Fortschritt...</div>
      ) : progressList.length === 0 ? (
        <div className="text-gray-600">
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
            />
          ))}
        </div>
      )}
    </div>
  );
};


const UserView: React.FC<UserViewProps> = ({ username, onClose, onChooseName, subjects }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 force-break" lang="de">Nutzername</h1>
          <p className="text-gray-600 force-break" lang="de">Dein zufällig generierter Nutzername</p>
        </div>


        {/* Username Display mit Icon-Button */}
        <div className="mb-6 flex items-center justify-between text-2xl text-gray-800 font-mono break-all select-all border border-gray-200 rounded-lg py-4 px-4 bg-gray-50">
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
              if (username !== 'Gast' || hasProgress) {
                toast.custom(
                  (t) => (
                    <CustomToast
                      message={
                        <>
                          <div className="mb-2">Wenn du deinen Namen änderst, geht dein Fortschritt verloren. Bist du sicher?</div>
                          <div className="flex gap-2 justify-end">
                            <button
                              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                              onClick={() => {
                                toast.dismiss(t);
                                onChooseName();
                              }}
                            >Weiter</button>
                            <button
                              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                              onClick={() => toast.dismiss(t)}
                            >Abbrechen</button>
                          </div>
                        </>
                      }
                    />
                  ),
                  { duration: 10000 }
                );
              } else {
                onChooseName();
              }
            }}
            className="ml-2 p-2 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-900 transition-colors"
            title="Anderen Namen wählen"
            aria-label="Anderen Namen wählen"
            type="button"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <UserDashboard username={username} subjects={subjects} />
        </div>

        {/* Action Buttons entfernt, da Icon-Button jetzt im Username-Display ist */}
      </div>
    </div>
  );
};

export default UserView;
