import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Quiz } from '../../types/quizTypes';
import type { UserQuizProgress } from '../../types/userProgress';
import { loadAllUserProgress } from '../../utils/loadAllUserProgress';


interface QuizSelectorProps {
  quizzes: Quiz[];
  onSelect: (quiz: Quiz) => void;
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
  const visibleQuizzes = quizzes.filter((q: Quiz) => !q.hidden);

  return (
    <div className="space-y-4">
      {[...visibleQuizzes].sort((a, b) => a.title.localeCompare(b.title)).map((quiz: Quiz) => {
        const progress = progressMap[quiz.id];
        let progressText = '';
        let triesText = '';
        if (username && progress) {
          // Fortschritt aus neuem Modell berechnen
          const total = quiz.questions.length;
          let solved = 0;
          if (progress.questions) {
            solved = Object.values(progress.questions).filter(q => q.answered).length;
          }
          const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
          if (progress.completed) {
            progressText = `✅ Abgeschlossen (${solved}/${total})`;
          } else {
            progressText = `${solved}/${total} gelöst (${percent}%)`;
          }
          if (typeof progress.totalTries === 'number') {
            triesText = `Versuche: ${progress.totalTries}`;
          }
        }
        return (
          <div key={quiz.id} className="relative">
            <button
              onClick={() => {
                try {
                  onSelect(quiz);
                } catch (error) {
                  console.error('Error selecting quiz:', error);
                }
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              title={quiz.title}
              aria-label={quiz.title}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-2 force-break" lang="de">{quiz.title}</h3>
                  <p className="text-indigo-100">
                    {quiz.questions.length} Fragen
                  </p>
                  {username && username !== "Gast" ? (
                    loading ? (
                      <span className="text-xs text-indigo-200">Lade Fortschritt...</span>
                    ) : progressText ? (
                      <>
                        <span className="text-xs text-green-200">Fortschritt: {progressText}</span>
                        {triesText && (
                          <span className="text-xs text-indigo-100 ml-2">{triesText}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-indigo-200">Noch nicht gestartet</span>
                    )
                  ) : null}
                </div>
                <Play className="w-12 h-12" />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
