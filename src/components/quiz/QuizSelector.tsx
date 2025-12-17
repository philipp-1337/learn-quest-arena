import { Play } from 'lucide-react';
import type { Quiz } from '../../types/quizTypes';

interface QuizSelectorProps {
  quizzes: Quiz[];
  onSelect: (quiz: Quiz) => void;
}

export default function QuizSelector({ quizzes, onSelect }: QuizSelectorProps) {
  return (
    <div className="space-y-4">
      {[...quizzes].sort((a, b) => a.title.localeCompare(b.title)).map((quiz: Quiz) => (
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
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2 force-break" lang="de">{quiz.title}</h3>
                <p className="text-indigo-100">
                  {quiz.questions.length} Fragen
                </p>
              </div>
              <Play className="w-12 h-12" />
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
