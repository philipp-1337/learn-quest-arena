import { Play, Shapes, School, Book, Flame } from 'lucide-react';
import { useFeaturedQuizzes } from '../hooks/useFeaturedQuizzes';
import type { Subject, QuizDocument } from '../../../types/quizTypes';
import type { QuizStartMode } from '../../../hooks/useQuizPlayer';

interface FeaturedQuizzesProps {
  subjects: Subject[];
  onQuizSelect: (quiz: QuizDocument, mode?: QuizStartMode) => void;
}

export default function FeaturedQuizzes({ subjects, onQuizSelect }: FeaturedQuizzesProps) {
  const { quizzes, loading } = useFeaturedQuizzes(3);

  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-8 h-8 text-indigo-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Neue Quizze
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <FeaturedQuizSkeleton key={i} />
            ))
          : quizzes.map((quiz) => (
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
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left flex-1">
              <div className="h-7 bg-white/30 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/20 rounded w-1/2 mb-1" />
              <div className="h-3 bg-white/10 rounded w-1/3 mt-1" />
            </div>
          </div>
        </div>
        <div className="w-full h-10 bg-white/20 rounded-xl mt-4" />
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

  return (
    <div className="relative flex flex-col h-full">
      <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold mb-2 force-break" lang="de">
                {quiz.title}
              </h3>
              <p className="text-indigo-100 mb-1">
                {quiz.questions.length} Fragen
              </p>
              {(topic?.name || classItem?.name || subject?.name) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-1">
                  {topic?.name && (
                    <span className="flex items-center gap-1 text-purple-200 whitespace-nowrap">
                      <Shapes className="w-3.5 h-3.5" />
                      {topic.name}
                    </span>
                  )}
                  {classItem?.name && (
                    <span className="flex items-center gap-1 text-blue-200 whitespace-nowrap">
                      <School className="w-3.5 h-3.5" />
                      {classItem.name}
                    </span>
                  )}
                  {subject?.name && (
                    <span className="flex items-center gap-1 text-green-200 whitespace-nowrap">
                      <Book className="w-3.5 h-3.5" />
                      {subject.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelect(quiz)}
          className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
          title={quiz.title}
          aria-label={quiz.title}
        >
          <Play className="w-6 h-6" />
          <span>Quiz starten</span>
        </button>
      </div>
    </div>
  );
}
