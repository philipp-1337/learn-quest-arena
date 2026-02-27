import type { Quiz } from "quizTypes";

interface QuizDetailsFormProps {
  quiz: Quiz;
  userRole: string | null;
  onQuizChange: (updates: Partial<Quiz>) => void;
}

export default function QuizDetailsForm({
  quiz,
  userRole,
  onQuizChange,
}: QuizDetailsFormProps) {
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
            Kurztitel
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              (optional, für Anzeige in Listen)
            </span>
          </label>
          <input
            id="quiz-short-title"
            type="text"
            value={quiz.shortTitle || ""}
            onChange={(e) => onQuizChange({ shortTitle: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Kurztitel (optional)"
            lang="de"
          />
        </div>
        <div>
          <label
            htmlFor="quiz-url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
              Quiz-URL 
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              (fest, nicht änderbar)
            </span>
          </label>
          <input
            id="quiz-url"
            type="text"
            value={quiz.url}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 focus:outline-none"
            placeholder="Quiz-URL"
            lang="de"
          />
        </div>
        <div className="space-y-2">
          <div>
            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz-Modus
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <input
                  type="radio"
                  name="quiz-mode"
                  checked={!quiz.isFlashCardQuiz}
                  onChange={() => onQuizChange({ isFlashCardQuiz: false })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Klassisch (Multiple Choice)
                </span>
              </label>
              <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <input
                  type="radio"
                  name="quiz-mode"
                  checked={!!quiz.isFlashCardQuiz}
                  onChange={() => onQuizChange({ isFlashCardQuiz: true })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Flash-Card
                </span>
              </label>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}
