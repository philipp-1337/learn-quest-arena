import { Edit2, Trash2, Check, X, Volume2, Image as ImageIcon } from "lucide-react";
import type { Question, Answer } from "../../../../types/quizTypes";
import OptimizedImage from "../../../shared/OptimizedImage";
import { getThumbnailUrl } from "../../../../utils/cloudinaryTransform";

interface QuestionCardProps {
  question: Question;
  index: number;
  hasImageQuestions: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function QuestionCard({
  question,
  index,
  hasImageQuestions,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const isImageQuestion = (question.questionType || "text") === "image" && question.questionImage;
  const isAudioQuestion = (question.questionType || "text") === "audio" && question.questionAudio;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-0 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors overflow-hidden flex flex-col">
      {/* Image Question Thumbnail */}
      {isImageQuestion ? (
        <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          <OptimizedImage
            src={question.questionImage || ""}
            alt={question.questionImageAlt || "Frage"}
            className="w-full h-full"
            objectFit="cover"
            width={400}
            height={256}
          />
        </div>
      ) : (
        hasImageQuestions && (
          <div className="hidden sm:flex w-full h-40 items-center justify-center bg-diagonal-stripes">
            <span className="text-gray-500 dark:text-gray-400 text-sm"></span>
          </div>
        )
      )}

      {/* Question Content */}
      <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-3 mb-2">
            {/* Audio Icon */}
            {isAudioQuestion && (
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {index + 1}.{" "}
                  {isImageQuestion
                    ? question.question || "[Bild-Frage]"
                    : isAudioQuestion
                      ? question.question || "[Audio-Frage]"
                      : question.question}
                </span>
                {isImageQuestion && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Bild-Frage
                  </span>
                )}
                {isAudioQuestion && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Audio-Frage
                  </span>
                )}
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                  {question.answerType === "text"
                    ? "Text"
                    : question.answerType === "image"
                      ? "Bilder"
                      : "Audio"}
                </span>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-2 text-sm">
            {question.answers.map((answer: Answer, i: number) => {
              const correctIndices = question.correctAnswerIndices || [
                question.correctAnswerIndex,
              ];
              const isCorrect = correctIndices.includes(i);

              return (
                <div key={i} className="flex items-center gap-2">
                  {isCorrect ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  {answer.type === "text" ? (
                    <span
                      className={
                        isCorrect
                          ? "text-green-700 dark:text-green-400 font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      }
                    >
                      {answer.content}
                    </span>
                  ) : answer.type === "image" ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={getThumbnailUrl(answer.content, 64)}
                        alt={answer.alt}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                      />
                      <span
                        className={
                          isCorrect
                            ? "text-green-700 dark:text-green-400 font-medium"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        {answer.alt || "Bild"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span
                        className={
                          isCorrect
                            ? "text-green-700 dark:text-green-400 font-medium"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        Audio
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <button
            onClick={() => onEdit(index)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Frage bearbeiten"
            aria-label="Frage bearbeiten"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Frage löschen"
            aria-label="Frage löschen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
