import { ArrowLeft, Save, Check as CheckIcon, X as XIcon } from 'lucide-react';

interface QuizEditorHeaderProps {
  quizDocument: {
    subjectName?: string;
    className?: string;
    topicName?: string;
  } | null;
  allChangesSaved: boolean;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export default function QuizEditorHeader({
  quizDocument,
  allChangesSaved,
  saving,
  onBack,
  onSave,
}: QuizEditorHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              title="Zurück zur Admin-Übersicht"
              aria-label="Zurück zur Admin-Übersicht"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                Quiz bearbeiten
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {quizDocument?.subjectName} • {quizDocument?.className} •{" "}
                {quizDocument?.topicName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              aria-label="Abbrechen"
            >
              <XIcon className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Abbrechen</span>
            </button>
            {allChangesSaved ? (
              <button
                onClick={onBack}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                aria-label="Gespeichert"
              >
                <CheckIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Gespeichert</span>
              </button>
            ) : (
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                aria-label={saving ? "Speichert..." : "Speichern"}
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? "Speichert..." : "Speichern"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
