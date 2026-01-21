import { Trash2 } from "lucide-react";
import { uploadWithToast } from "../../../../utils/cloudinaryUpload";
import { toast } from "sonner";
import { CustomToast } from "../../../misc/CustomToast";
import type { Answer } from "../../../../types/quizTypes";

interface AudioAnswerItemProps {
  answer: Answer;
  index: number;
  isCorrect: boolean;
  canRemove: boolean;
  onToggleCorrect: (index: number) => void;
  onUpdate: (index: number, updates: Partial<Answer>) => void;
  onRemove: (index: number) => void;
}

export default function AudioAnswerItem({
  answer,
  index,
  isCorrect,
  canRemove,
  onToggleCorrect,
  onUpdate,
  onRemove,
}: AudioAnswerItemProps) {
  const handleAudioUpload = async (file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: "auto",
        folder: "quiz-audio",
        tags: ["quiz", "answer-audio"],
      });

      if (!result) return;

      onUpdate(index, { content: result.url });
    } catch (error) {
      console.error("Fehler beim Hochladen der Audio-Datei:", error);
      toast.custom(() => (
        <CustomToast
          message="Fehler beim Verarbeiten der Audio-Datei. Versuche es erneut."
          type="error"
        />
      ));
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Audio {index + 1}
        </label>

        {answer.content && (
          <audio controls className="w-full max-w-md">
            <source src={answer.content} />
            Dein Browser unterstützt das Audio-Element nicht.
          </audio>
        )}

        <label
          htmlFor={`audio-upload-${index}`}
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <span>{answer.content ? "Audio ändern" : "Audio auswählen"}</span>
          <input
            id={`audio-upload-${index}`}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleAudioUpload(e.target.files[0]);
              }
            }}
            className="sr-only"
          />
        </label>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isCorrect}
              onChange={() => onToggleCorrect(index)}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              title="Als richtige Antwort markieren"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Richtig
            </label>
          </div>
          <button
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className="ml-auto px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Entfernen
          </button>
        </div>
      </div>
    </div>
  );
}
