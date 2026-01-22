import { Lightbulb, MessageCircleWarning } from 'lucide-react';
import type { Answer, Question } from 'quizTypes';
import TextAnswerItem from './TextAnswerItem';
import ImageAnswerItem from './ImageAnswerItem';
import AudioAnswerItem from './AudioAnswerItem';

interface AnswersListProps {
  question: Question;
  onAddAnswer: () => void;
  onRemoveAnswer: (index: number) => void;
  onToggleCorrect: (index: number) => void;
  onUpdateAnswer: (index: number, updates: Partial<Answer>) => void;
}

export default function AnswersList({
  question,
  onAddAnswer,
  onRemoveAnswer,
  onToggleCorrect,
  onUpdateAnswer,
}: AnswersListProps) {
  const canRemove = question.answers.length > 2;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Antworten ({question.answers.length}/5)
        </label>
        <button
          onClick={onAddAnswer}
          disabled={question.answers.length >= 5}
          className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          + Antwort hinzufügen
        </button>
      </div>

      {question.answerType === "text" ? (
        <div className="space-y-3">
          {question.answers.map((answer, i) => {
            const isCorrect = (
              question.correctAnswerIndices || [question.correctAnswerIndex]
            ).includes(i);
            return (
              <TextAnswerItem
                key={i}
                answer={answer}
                index={i}
                isCorrect={isCorrect}
                canRemove={canRemove}
                onToggleCorrect={onToggleCorrect}
                onUpdate={(index, content) =>
                  onUpdateAnswer(index, { content })
                }
                onRemove={onRemoveAnswer}
              />
            );
          })}
        </div>
      ) : question.answerType === "image" ? (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <MessageCircleWarning className="w-4 h-4" />
              <span>Bilder werden auf Cloudinary gehostet (max. 10 MB).</span>
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>Tipp: Für beste Performance unter 2 MB bleiben.</span>
            </p>
          </div>

          {question.answers.map((answer, i) => {
            const isCorrect = (
              question.correctAnswerIndices || [question.correctAnswerIndex]
            ).includes(i);
            return (
              <ImageAnswerItem
                key={i}
                answer={answer}
                index={i}
                isCorrect={isCorrect}
                canRemove={canRemove}
                onToggleCorrect={onToggleCorrect}
                onUpdate={onUpdateAnswer}
                onRemove={onRemoveAnswer}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <MessageCircleWarning className="w-4 h-4" />
              <span>
                Audio-Dateien werden auf Cloudinary gehostet (max. 10 MB).
              </span>
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>Tipp: Unterstützte Formate: MP3, WAV, OGG, WebM</span>
            </p>
          </div>

          {question.answers.map((answer, i) => {
            const isCorrect = (
              question.correctAnswerIndices || [question.correctAnswerIndex]
            ).includes(i);
            return (
              <AudioAnswerItem
                key={i}
                answer={answer}
                index={i}
                isCorrect={isCorrect}
                canRemove={canRemove}
                onToggleCorrect={onToggleCorrect}
                onUpdate={onUpdateAnswer}
                onRemove={onRemoveAnswer}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
