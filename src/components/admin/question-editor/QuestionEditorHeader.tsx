import { ArrowLeft, Save, Lock } from "lucide-react";

interface QuestionEditorHeaderProps {
  isEditing: boolean;
  saving: boolean;
  lockWarning: string | null;
  quizTitle: string;
  onBack: () => void;
  onSave: () => void;
}

export default function QuestionEditorHeader({
  isEditing,
  saving,
  lockWarning,
  quizTitle,
  onBack,
  onSave,
}: QuestionEditorHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Lock Warning Banner */}
        {lockWarning && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start gap-2">
            <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {lockWarning}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              title="Zurück zum Quiz"
              aria-label="Zurück zum Quiz"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {isEditing ? "Frage bearbeiten" : "Neue Frage"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {quizTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving ? "Speichert..." : isEditing ? "Aktualisieren" : "Hinzufügen"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
