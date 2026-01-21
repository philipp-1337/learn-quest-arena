import { Trash2 } from "lucide-react";
import type { Answer } from "../../../../types/quizTypes";

interface TextAnswerItemProps {
  answer: Answer;
  index: number;
  isCorrect: boolean;
  canRemove: boolean;
  onToggleCorrect: (index: number) => void;
  onUpdate: (index: number, content: string) => void;
  onRemove: (index: number) => void;
}

export default function TextAnswerItem({
  answer,
  index,
  isCorrect,
  canRemove,
  onToggleCorrect,
  onUpdate,
  onRemove,
}: TextAnswerItemProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={isCorrect}
        onChange={() => onToggleCorrect(index)}
        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 flex-shrink-0"
        title="Als richtige Antwort markieren"
      />
      <input
        type="text"
        value={answer.content}
        onChange={(e) => onUpdate(index, e.target.value)}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder={`Antwort ${index + 1}`}
      />
      <button
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
