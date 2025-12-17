import React from 'react';
import { Check, X } from 'lucide-react';
import type { Answer } from '../../types/quizTypes';

interface AnswerButtonProps {
  answer: Answer & { originalIndex: number };
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  onSelect: (answer: Answer & { originalIndex: number }) => void;
  disabled: boolean;
}

export default function AnswerButton({
  answer,
  isSelected,
  isCorrect,
  showFeedback,
  onSelect,
  disabled,
}: AnswerButtonProps) {
  let buttonClass = "w-full p-6 rounded-xl transition-all ";
  
  if (!showFeedback) {
    buttonClass += "bg-gray-100 hover:bg-gray-200 text-gray-900";
  } else if (isCorrect) {
    buttonClass += "bg-green-100 text-green-900 border-2 border-green-500";
  } else if (isSelected && !isCorrect) {
    buttonClass += "bg-red-100 text-red-900 border-2 border-red-500";
  } else {
    buttonClass += "bg-gray-100 text-gray-900";
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
          {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 flex-shrink-0" />}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center mb-2">
            <img 
              src={answer.content} 
              alt={answer.alt || 'Antwort'}
              className="max-h-72 max-w-full object-contain rounded-lg"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                if (img.nextSibling && img.nextSibling instanceof HTMLElement) {
                  (img.nextSibling as HTMLElement).style.display = 'block';
                }
              }}
            />
            <div style={{display: 'none'}} className="max-h-72 w-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              Bild nicht verfügbar
            </div>
          </div>
          {answer.alt && (
            <span className="font-medium text-sm">{answer.alt}</span>
          )}
          <div className="mt-2">
            {showFeedback && isCorrect && <Check className="w-6 h-6 mx-auto" />}
            {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 mx-auto" />}
          </div>
        </div>
      )}
    </button>
  );
}
