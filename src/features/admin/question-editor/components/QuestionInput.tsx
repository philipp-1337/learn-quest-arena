import OptimizedImage from "@shared/OptimizedImage";
import { uploadWithToast } from "@utils/cloudinaryUpload";
import { toast } from "sonner";
import { CustomToast } from "@shared/CustomToast";
import type { Question } from "quizTypes";

interface QuestionInputProps {
  question: Question;
  onChange: (updates: Partial<Question>) => void;
}

export default function QuestionInput({
  question,
  onChange,
}: QuestionInputProps) {
  const questionType = question.questionType || "text";

  const handleQuestionImageUpload = async (file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: "image",
        folder: "quiz-images",
        tags: ["quiz", "question-image"],
      });

      if (!result) return;

      onChange({
        questionImage: result.url,
        questionImageAlt: question.questionImageAlt || file.name,
      });
    } catch (error) {
      console.error("Fehler beim Hochladen des Bildes:", error);
      toast.custom(() => (
        <CustomToast
          message="Fehler beim Verarbeiten des Bildes. Versuche es erneut."
          type="error"
        />
      ));
    }
  };

  const handleQuestionAudioUpload = async (file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: "auto",
        folder: "quiz-audio",
        tags: ["quiz", "question-audio"],
      });

      if (!result) return;

      onChange({
        questionAudio: result.url,
      });
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

  if (questionType === "text") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frage
        </label>
        <input
          type="text"
          value={question.question}
          onChange={(e) => onChange({ question: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Was ist 2 + 2?"
        />
      </div>
    );
  }

  if (questionType === "image") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Fragen-Bild
        </label>
        <div className="space-y-4">
          {question.questionImage && (
            <OptimizedImage
              src={question.questionImage}
              alt={question.questionImageAlt || "Frage"}
              className="w-full max-w-2xl rounded-lg object-contain"
              width={800}
              height={600}
            />
          )}

          <label
            htmlFor="question-image-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <span>
              {question.questionImage ? "Bild ändern" : "Bild auswählen"}
            </span>
            <input
              id="question-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleQuestionImageUpload(e.target.files[0]);
                }
              }}
              className="sr-only"
            />
          </label>

          <div>
            <input
              type="text"
              value={question.questionImageAlt || ""}
              onChange={(e) => onChange({ questionImageAlt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm text-[16px]"
              placeholder="Alt-Text für Barrierefreiheit (z.B. 'Fragen-Bild')"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ⚠️ Neutral halten - nicht die Antwort verraten!
            </p>
          </div>

          <input
            type="text"
            value={question.question}
            onChange={(e) => onChange({ question: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm text-[16px]"
            placeholder="Optionaler Fragentext (z.B. 'Was siehst du auf diesem Bild?')"
          />
        </div>
      </div>
    );
  }

  // Audio type
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fragen-Audio
      </label>
      <div className="space-y-4">
        {question.questionAudio && (
          <audio controls className="w-full max-w-2xl">
            <source src={question.questionAudio} />
            Dein Browser unterstützt das Audio-Element nicht.
          </audio>
        )}

        <label
          htmlFor="question-audio-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <span>
            {question.questionAudio ? "Audio ändern" : "Audio auswählen"}
          </span>
          <input
            id="question-audio-upload"
            type="file"
            accept="audio/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleQuestionAudioUpload(e.target.files[0]);
              }
            }}
            className="sr-only"
          />
        </label>

        <input
          type="text"
          value={question.question}
          onChange={(e) => onChange({ question: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm"
          placeholder="Optionaler Fragentext (z.B. 'Was hörst du hier?')"
        />
      </div>
    </div>
  );
}
