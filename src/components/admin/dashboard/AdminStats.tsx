import { BookOpen, FolderOpen, Play } from 'lucide-react';

import { HelpCircle } from 'lucide-react';

interface AdminStatsProps {
  totalSubjects: number;
  totalTopics: number;
  totalQuizzes: number;
  totalQuestions: number;
}

export default function AdminStats({
  totalSubjects,
  totalTopics,
  totalQuizzes,
  totalQuestions,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl shadow-lg p-3 sm:p-4">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 opacity-80" />
        <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">
          {totalSubjects}
        </div>
        <div className="text-blue-100 text-xs sm:text-sm">Fächer</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-3 sm:p-4">
        <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 opacity-80" />
        <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">
          {totalTopics}
        </div>
        <div className="text-purple-100 text-xs sm:text-sm">Themen</div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-3 sm:p-4">
        <Play className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 opacity-80" />
        <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">
          {totalQuizzes}
        </div>
        <div className="text-green-100 text-xs sm:text-sm">Quizze</div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-3 sm:p-4">
        <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 opacity-80" />
        <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">
          {totalQuestions}
        </div>
        <div className="text-yellow-100 text-xs sm:text-sm">Fragen</div>
      </div>
    </div>
  );
}
