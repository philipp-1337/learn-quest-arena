import { Play, Shapes, School, Book, Flame } from 'lucide-react';
import { useFeaturedQuizzes } from '@quiz-browse/hooks/useFeaturedQuizzes';
import type { Subject, QuizDocument } from 'quizTypes';
import type { QuizStartMode } from '@hooks/useQuizPlayer';

interface FeaturedQuizzesProps {
  subjects: Subject[];
  onQuizSelect: (quiz: QuizDocument, mode?: QuizStartMode) => void;
}

export default function FeaturedQuizzes({ subjects, onQuizSelect }: FeaturedQuizzesProps) {
  const { quizzes, loading, error, refetch } = useFeaturedQuizzes(3);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Neue Quizze
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <FeaturedQuizSkeleton key={i} />
          ))
        ) : error ? (
          <FeaturedQuizMessage
            title="Neue Quizze konnten nicht geladen werden"
            message="Bitte versuche es in ein paar Sekunden erneut."
            onRetry={refetch}
          />
        ) : quizzes.length === 0 ? (
          <FeaturedQuizMessage
            title="Aktuell keine neuen Quizze"
            message="Schau bald wieder vorbei."
          />
        ) : (
          quizzes.map((quiz: import("quizTypes").QuizDocument) => (
            <FeaturedQuizCard
              key={quiz.id}
              quiz={quiz}
              subjects={subjects}
              onSelect={onQuizSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FeaturedQuizMessage({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="relative flex flex-col h-full md:col-span-3">
      <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-slate-900 dark:text-white text-lg font-semibold mb-1">
          {title}
        </div>
        <div className="text-slate-600 dark:text-slate-400">{message}</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
          >
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  );
}

function FeaturedQuizSkeleton() {
  return (
    <div className="relative flex flex-col h-full animate-pulse">
      <div className="w-full bg-gradient-to-br from-indigo-200 via-indigo-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-none border border-indigo-200 dark:border-slate-800 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left flex-1">
              {/* Titel (mehrzeilig) */}
              <div className="h-7 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-2" />
              <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-2/3 mb-1" />
              {/* Untertitel (mehrzeilig) */}
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-1" />
              {/* Tags (mehrzeilig, flex-wrap) */}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/5" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              </div>
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
      <div className="w-full bg-gradient-to-br from-indigo-200 via-indigo-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-100 p-6 rounded-2xl shadow-xl dark:shadow-none border border-indigo-200 dark:border-slate-800 flex flex-col h-full justify-between transition-all group-hover:shadow-2xl dark:group-hover:shadow-slate-900/20 group-hover:scale-[1.03] group-focus:ring-2 group-focus:ring-indigo-300 dark:group-focus:ring-slate-700 group-focus:outline-none">
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
