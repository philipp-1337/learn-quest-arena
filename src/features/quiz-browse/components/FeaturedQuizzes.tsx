import { Play, Shapes, School, Book, Flame } from 'lucide-react';
import { useFeaturedQuizzes } from '../hooks/useFeaturedQuizzes';
import type { Subject, QuizDocument } from "quizTypes";
import type { QuizStartMode } from '@hooks/useQuizPlayer';

interface FeaturedQuizzesProps {
  subjects: Subject[];
  onQuizSelect: (quiz: QuizDocument, mode?: QuizStartMode) => void;
}

export default function FeaturedQuizzes({ subjects, onQuizSelect }: FeaturedQuizzesProps) {
  const { quizzes, loading } = useFeaturedQuizzes(3);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Neue Quizze
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <FeaturedQuizSkeleton key={i} />
            ))
          : quizzes.map((quiz: import("quizTypes").QuizDocument) => (
              <FeaturedQuizCard
                key={quiz.id}
                quiz={quiz}
                subjects={subjects}
                onSelect={onQuizSelect}
              />
            ))}
      </div>
    </div>
  );
}

function FeaturedQuizSkeleton() {
  return (
    <div className="relative flex flex-col h-full animate-pulse">
      <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left flex-1">
              <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeaturedQuizCardProps {
  quiz: QuizDocument;
  subjects: Subject[];
  onSelect: (quiz: QuizDocument, mode?: QuizStartMode) => void;
}

function FeaturedQuizCard({ quiz, subjects, onSelect }: FeaturedQuizCardProps) {
  const subject = subjects.find((s) => s.id === quiz.subjectId);
  const classItem = subject?.classes.find((c) => c.id === quiz.classId);
  const topic = classItem?.topics.find((t) => t.id === quiz.topicId);

  const handleClick = () => {
    onSelect(quiz);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(quiz);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="relative flex flex-col h-full cursor-pointer group"
      aria-label={`Quiz starten: ${quiz.title}`}
    >
      <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-100 p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 flex flex-col h-full justify-between transition-all group-hover:shadow-md dark:group-hover:shadow-slate-900/20 group-hover:scale-[1.01] group-focus:ring-2 group-focus:ring-slate-400 dark:group-focus:ring-slate-500 group-focus:outline-none">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold mb-2 force-break text-slate-900 dark:text-white" lang="de">
                {quiz.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                <Play className="w-4 h-4 opacity-60" />
                {quiz.questions.length} Fragen
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
  );
}
