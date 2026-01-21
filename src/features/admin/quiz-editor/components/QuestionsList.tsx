import { Plus } from "lucide-react";
import type { Question } from "../../../../types/quizTypes";
import QuestionCard from "./QuestionCard";

interface QuestionsListProps {
  questions: Question[];
  // ✅ FIX: quizId entfernt
  onAddQuestion: () => void;
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
}

export default function QuestionsList({
  questions,
  // ✅ FIX: quizId entfernt
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: QuestionsListProps) {
  const hasImageQuestions = questions.some(
    (q) => (q.questionType || "text") === "image" && q.questionImage
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fragen{" "}
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">
            ({questions.length})
          </span>
        </h2>
        <button
          onClick={onAddQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Frage hinzufügen
        </button>
      </div>

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
