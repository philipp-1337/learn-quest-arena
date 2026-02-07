import { useMemo } from 'react';
import { Play, Shapes, School, Book, EyeOff } from 'lucide-react';
import type { Subject, Quiz } from 'quizTypes';
import type { QuizStartMode } from '@hooks/useQuizPlayer';

interface HiddenQuizzesProps {
  subjects: Subject[];
  onQuizSelect: (quiz: Quiz, mode?: QuizStartMode) => void;
}

export default function HiddenQuizzes({ subjects, onQuizSelect }: HiddenQuizzesProps) {
  const hiddenEntries = useMemo(() => {
    const entries = subjects.flatMap((subject) =>
      subject.classes.flatMap((classItem) =>
        classItem.topics.flatMap((topic) =>
          topic.quizzes.map((quiz) => ({
            quiz,
            subject,
            classItem,
            topic,
          }))
        )
      )
    );

    return entries
      .filter((entry) => entry.quiz.hidden)
      .sort((a, b) => a.quiz.title.localeCompare(b.quiz.title));
  }, [subjects]);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-4">
        <EyeOff className="w-8 h-8 text-rose-400 dark:text-rose-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Versteckte Quizze
        </h2>
      </div>
      {hiddenEntries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Keine versteckten Quizze gefunden.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {hiddenEntries.map(({ quiz, subject, classItem, topic }) => (
            <div
              key={quiz.id}
              role="button"
              tabIndex={0}
              onClick={() => onQuizSelect(quiz)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onQuizSelect(quiz);
                }
              }}
              className="relative flex flex-col h-full cursor-pointer group"
              aria-label={`Quiz starten: ${quiz.title}`}
            >
              <div className="w-full bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-100 p-6 rounded-2xl shadow-xl dark:shadow-none border border-rose-200 dark:border-slate-800 flex flex-col h-full justify-between transition-all group-hover:shadow-2xl dark:group-hover:shadow-slate-900/20 group-hover:scale-[1.03] group-focus:ring-2 group-focus:ring-rose-300 dark:group-focus:ring-slate-700 group-focus:outline-none">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-left flex-1">
                      <h3 className="text-2xl font-bold mb-2 force-break text-slate-900 dark:text-white" lang="de">
                        {quiz.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                        <Play className="w-4 h-4 opacity-60" />
                        {quiz.questions?.length ?? 0} Fragen
                      </p>
                      {(topic?.name || classItem?.name || subject?.name) && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-2">
                          {topic?.name && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 whitespace-nowrap">
                              <Shapes className="w-3.5 h-3.5" />
                              {topic.name}
                            </span>
                          )}
                          {classItem?.name && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              <School className="w-3.5 h-3.5" />
                              {classItem.name}
                            </span>
                          )}
                          {subject?.name && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              <Book className="w-3.5 h-3.5" />
                              {subject.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
