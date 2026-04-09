import { Plus, TriangleAlert } from 'lucide-react';
import type { Question } from 'quizTypes';
import QuestionCard from './QuestionCard';

interface QuestionsListProps {
  questions: Question[];
  modeUnsaved?: boolean;
  // ✅ FIX: quizId entfernt
  onAddQuestion: () => void;
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onMoveQuestion: (index: number) => void;
}

export default function QuestionsList({
  questions,
  modeUnsaved = false,
  // ✅ FIX: quizId entfernt
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onMoveQuestion,
}: QuestionsListProps) {
  const hasImageQuestions = questions.some(
    (q) => (q.questionType || "text") === "image" && q.questionImage
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fragen{" "}
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">
            ({questions.length})
          </span>
        </h2>
        <button
          onClick={onAddQuestion}
          disabled={modeUnsaved}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Frage hinzufügen
        </button>
      </div>

      {modeUnsaved && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-300">
          <TriangleAlert className="w-4 h-4 flex-shrink-0" />
          Quiz-Modus wurde geändert – bitte zuerst speichern, bevor du Fragen bearbeitest.
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="mb-2">Noch keine Fragen vorhanden.</p>
          <p className="text-sm">
            Klicke auf "Frage hinzufügen" um zu starten.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              index={index}
              hasImageQuestions={hasImageQuestions}
              onEdit={onEditQuestion}
              onDelete={onDeleteQuestion}
              onMove={onMoveQuestion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
