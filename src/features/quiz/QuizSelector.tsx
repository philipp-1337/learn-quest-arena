import { Play, RotateCcw, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Quiz } from 'quizTypes';
import type { UserQuizProgress } from 'userProgress';
import { loadAllUserProgress } from '@utils/loadAllUserProgress';
import { showCompletedQuizWarning } from '@utils/showCompletedQuizWarning';
import { filterVisibleQuizzes } from '@utils/quizVisibilityHelpers';
import type { QuizStartMode } from '@hooks/useQuizPlayer';

// Re-export the type for convenience
export type { QuizStartMode };

interface QuizSelectorProps {
  quizzes: Quiz[];
  onSelect: (quiz: Quiz, mode?: QuizStartMode) => void;
  username?: string;
}

export function QuizSelector({ quizzes, onSelect, username }: QuizSelectorProps) {
  const [progressMap, setProgressMap] = useState<Record<string, UserQuizProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setProgressMap({});
      setLoading(false);
      return;
    }
    let mounted = true;
    async function fetchProgress() {
      setLoading(true);
      try {
        if (!username) throw new Error('Username is required');
        const allProgress = await loadAllUserProgress(username);
        if (mounted) setProgressMap(allProgress);
      } catch (e) {
        if (mounted) setProgressMap({});
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProgress();
    return () => { mounted = false; };
  }, [username]);

  // Nur nicht-ausgeblendete Quizze anzeigen
  const visibleQuizzes = filterVisibleQuizzes(quizzes);

  return (
    <div className="space-y-4">
      {[...visibleQuizzes].sort((a, b) => a.title.localeCompare(b.title)).map((quiz: Quiz) => {
        const progress = progressMap[quiz.id];
        let progressElement: React.ReactNode = null;
        let triesText = '';
        let wrongCount = 0;
        let solved = 0;
        const total = quiz.questions.length;
        
        if (username && progress) {
          // Fortschritt aus neuem Modell berechnen
          if (progress.questions) {
            solved = Object.values(progress.questions).filter(q => q.answered).length;
            // Falsche Fragen = Fragen mit Versuchen aber nicht beantwortet
            wrongCount = Object.values(progress.questions).filter(q => !q.answered && q.attempts > 0).length;
          }
          const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
          if (progress.completed) {
            progressElement = (
              <span className="inline-flex items-center">
                Abgeschlossen ({solved}/{total})
              </span>
            );
          } else {
            progressElement = `${solved}/${total} gelöst (${percent}%)`;
          }
          if (typeof progress.totalTries === 'number') {
            triesText = `Versuche: ${progress.totalTries}`;
          }
        }
        
        // Check if user has incomplete progress (has wrong or unanswered questions)
        const hasIncompleteProgress = username && progress && !progress.completed && solved > 0;
        // const unansweredCount = total - solved;
        
        return (
          <div key={quiz.id} className="relative">
            <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left flex-1">
                  <h3 className="text-2xl font-bold mb-2 force-break" lang="de">{quiz.title}</h3>
                  <p className="text-indigo-100">
                    {quiz.questions.length} Fragen
                  </p>
                  {username && username !== "Gast" ? (
                    loading ? (
                      <span className="text-xs text-indigo-200">Lade Fortschritt...</span>
                    ) : progressElement ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-green-200 after:content-['–'] after:ml-1 after:text-indigo-100">Fortschritt: {progressElement}</span>
                        {wrongCount > 0 && (
                          <span className="text-xs text-orange-200 after:content-['–'] after:ml-1 after:text-indigo-100">{wrongCount} falsch beantwortet</span>
                        )}
                        {triesText && (
                          <span className="text-xs text-indigo-100">{triesText}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-indigo-200">Noch nicht gestartet</span>
                    )
                  ) : null}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {hasIncompleteProgress ? (
                  <>
                    {/* Continue with wrong/unanswered questions */}
                    <button
                      onClick={() => {
                        try {
                          onSelect(quiz, 'continue');
                        } catch (error) {
                          console.error('Error selecting quiz:', error);
                        }
                      }}
                      className="flex-1 min-w-[140px] bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      title="Mit falschen Fragen weitermachen"
                      aria-label="Mit falschen Fragen weitermachen"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Weiterlernen</span>
                    </button>
                    {/* Start fresh */}
                    <button
                      onClick={() => {
                        try {
                          onSelect(quiz, 'fresh');
                        } catch (error) {
                          console.error('Error selecting quiz:', error);
                        }
                      }}
                      className="flex-1 min-w-[140px] bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      title="Neu starten"
                      aria-label="Neu starten"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Neu starten</span>
                    </button>
                  </>
                ) : (
                  /* Default: single play button */
                  <button
                    onClick={() => {
                      try {
                        if (progress?.completed) {
                          showCompletedQuizWarning(() => onSelect(quiz, 'fresh'));
                        } else {
                          onSelect(quiz, 'fresh');
                        }
                      } catch (error) {
                        console.error('Error selecting quiz:', error);
                      }
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    title={quiz.title}
                    aria-label={quiz.title}
                  >
                    <Play className="w-6 h-6" />
                    <span>{progress?.completed ? 'Nochmal spielen' : 'Quiz starten'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
