import { memo } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import type { Answer } from 'quizTypes';
import OptimizedImage from '../shared/OptimizedImage';

interface AnswerButtonProps {
  answer: Answer & { originalIndex: number };
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  onSelect: (answer: Answer & { originalIndex: number }) => void;
  disabled: boolean;
  isMultiSelect?: boolean;
}

const AnswerButton = memo(function AnswerButton({
  answer,
  isSelected,
  isCorrect,
  showFeedback,
  onSelect,
  disabled,
  isMultiSelect = false,
}: AnswerButtonProps) {
  let buttonClass = "w-full p-6 rounded-xl transition-all ";
  
  if (!showFeedback) {
    // Zeige Auswahl mit blauem Border, bevor Antwort geprüft wird
    if (isSelected) {
      buttonClass += "bg-blue-50 dark:bg-blue-900 border-2 border-blue-500 text-gray-900 dark:text-white";
    } else {
      buttonClass += "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white";
    }
  } else if (isCorrect && isSelected) {
    // Richtig und ausgewählt - Grün
    buttonClass += "bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-200 border-2 border-green-500";
  } else if (isCorrect && !isSelected && isMultiSelect) {
    // Richtig aber NICHT ausgewählt (verpasst) - Gelb/Orange NUR bei Multi-Select
    buttonClass += "bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-200 border-2 border-yellow-500";
  } else if (isCorrect && !isSelected && !isMultiSelect) {
    // Richtig aber nicht ausgewählt bei Single-Select - Grün (zeige richtige Antwort)
    buttonClass += "bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-200 border-2 border-green-500";
  } else if (!isCorrect && isSelected) {
    // Falsch und ausgewählt - Rot
    buttonClass += "bg-red-100 dark:bg-red-700 text-red-900 dark:text-red-200 border-2 border-red-500";
  } else {
    // Falsch und nicht ausgewählt - Grau (normal)
    buttonClass += "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white";
  }

  return (
    <button
      onClick={() => onSelect(answer)}
      disabled={disabled}
      className={buttonClass}
      title={typeof answer.content === 'string' ? answer.content : 'Antwort auswählen'}
      aria-label={typeof answer.content === 'string' ? answer.content : 'Antwort auswählen'}
    >
      {answer.type === 'text' ? (
        <div className="flex items-center justify-between text-left">
          <span className="font-semibold text-lg">{answer.content}</span>
          {showFeedback && isCorrect && <Check className="w-6 h-6 flex-shrink-0" />}
          {showFeedback && isCorrect && !isSelected && isMultiSelect && <AlertCircle className="w-6 h-6 flex-shrink-0" />}
          {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 flex-shrink-0" />}
        </div>
      ) : answer.type === 'image' ? (
        <div className="flex flex-col items-center gap-2">
          <OptimizedImage
            src={answer.content}
            alt={answer.alt || 'Antwort'}
            className="w-full max-h-72 rounded-lg"
            width={800}
            height={600}
            priority={false}
          />
          {answer.alt && (
            <span className="font-medium text-sm">{answer.alt}</span>
          )}
          <div className="mt-2">
            {showFeedback && isCorrect && <Check className="w-6 h-6 mx-auto" />}
            {showFeedback && isCorrect && !isSelected && isMultiSelect && <AlertCircle className="w-6 h-6 mx-auto" />}
            {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 mx-auto" />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <audio controls className="w-full" onClick={(e) => e.stopPropagation()}>
            <source src={answer.content} />
            Dein Browser unterstützt das Audio-Element nicht.
          </audio>
          <div className="mt-2">
            {showFeedback && isCorrect && <Check className="w-6 h-6 mx-auto" />}
            {showFeedback && isCorrect && !isSelected && isMultiSelect && <AlertCircle className="w-6 h-6 mx-auto" />}
            {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 mx-auto" />}
          </div>
        </div>
      )}
    </button>
  );
});

export default AnswerButton;
