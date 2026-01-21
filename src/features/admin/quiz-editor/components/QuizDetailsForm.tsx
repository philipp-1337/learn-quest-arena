import type { Quiz } from "quizTypes";
import { showConfirmationToast } from "@utils/confirmationToast";

interface QuizDetailsFormProps {
  quiz: Quiz;
  urlShared: boolean;
  userRole: string | null;
  onQuizChange: (updates: Partial<Quiz>) => void;
  onUrlSharedChange: (value: boolean) => void;
}

export default function QuizDetailsForm({
  quiz,
  urlShared,
  userRole,
  onQuizChange,
  onUrlSharedChange,
}: QuizDetailsFormProps) {
  const handleUrlSharedToggle = (checked: boolean) => {
    if (!checked) {
      showConfirmationToast({
        message:
          "Achtung: Eine Änderung am Kurztitel ändert auch die URL. Dies kann Auswirkungen auf bereits geteilte URLs haben.",
        confirmText: "Verstanden",
        cancelText: "Abbrechen",
        onConfirm: () => onUrlSharedChange(false),
        onCancel: () => {},
      });
    } else {
      onUrlSharedChange(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quiz-Details
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="quiz-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Quiz-Titel
          </label>
          <input
            id="quiz-title"
            type="text"
            value={quiz.title}
            onChange={(e) => onQuizChange({ title: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Quiz-Titel eingeben"
            lang="de"
          />
        </div>
        <div>
          <label
            htmlFor="quiz-short-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Kurztitel (für Admin-Anzeige & URL)
          </label>
          <input
            id="quiz-short-title"
            type="text"
            value={quiz.shortTitle}
            onChange={(e) => onQuizChange({ shortTitle: e.target.value })}
            disabled={urlShared}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Kurztitel"
            lang="de"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hidden-toggle"
              checked={!!quiz.hidden}
              onChange={(e) => onQuizChange({ hidden: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
              disabled={userRole === "supporter"}
            />
            <label
              htmlFor="hidden-toggle"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Quiz ist{" "}
              <span
                className={
                  quiz.hidden
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }
              >
                {quiz.hidden ? "ausgeblendet" : "sichtbar"}
              </span>
              {userRole === "supporter" && (
                <span className="ml-2 text-xs text-gray-400">
                  (Du kannst die Sichtbarkeit nicht ändern)
                </span>
              )}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="url-shared-toggle"
              checked={urlShared}
              onChange={(e) => handleUrlSharedToggle(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
            <label
              htmlFor="url-shared-toggle"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Kurztitel nicht änderbar (URL wurde geteilt)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
