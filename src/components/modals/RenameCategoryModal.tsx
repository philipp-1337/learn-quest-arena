import { useState } from "react";
import { Edit3, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { renameCategory } from "@utils/quizzesCollection";

interface RenameCategoryModalProps {
  type: 'subject' | 'class' | 'topic';
  currentId: string;
  currentName: string;
  affectedCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenameCategoryModal({
  type,
  currentId,
  currentName,
  affectedCount,
  onClose,
  onSuccess,
}: RenameCategoryModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const typeLabels = {
    subject: "Fach",
    class: "Klasse",
    topic: "Thema",
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === currentName) return;

    setIsRenaming(true);
    setResult(null);

    try {
      const renameResult = await renameCategory(
        type,
        currentId,
        newName.trim(),
        (current, total, message) => {
          setProgress({ current, total, message });
        }
      );

      setResult(renameResult);

      if (renameResult.failed === 0) {
        // Zeige "Lade neu..." Nachricht
        setIsReloading(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 100); // Kurze Verzögerung damit der User den Reload-Status sieht
      }
    } catch (error) {
      console.error("Rename error:", error);
    } finally {
      setIsRenaming(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {typeLabels[type]} umbenennen
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRenaming}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Achtung:</strong> Dies wird <strong>{affectedCount} Quiz(ze)</strong> aktualisieren.
              Die Änderung betrifft alle Quizze mit diesem {typeLabels[type]}.
            </p>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Neuer Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isRenaming}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              placeholder={`Neuer Name für "${currentName}"`}
              autoFocus
            />
          </div>

          {/* Progress */}
          {isRenaming && progress && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{progress.message}</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {result && !isReloading && (
            <div className={`rounded-lg p-4 ${
              result.failed === 0 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.failed === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-semibold ${
                  result.failed === 0 ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {result.failed === 0 ? "Erfolgreich umbenannt!" : "Teilweise erfolgreich"}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                Erfolgreich: {result.success} / {result.success + result.failed}
                {result.failed > 0 && ` • Fehler: ${result.failed}`}
              </p>
              {result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm text-red-700 cursor-pointer">
                    Fehler anzeigen ({result.errors.length})
                  </summary>
                  <ul className="mt-2 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Reloading Indicator */}
          {isReloading && (
            <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Aktualisiere Daten...</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Filter werden zurückgesetzt</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isRenaming || isReloading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleRename}
            disabled={isRenaming || isReloading || !newName.trim() || newName === currentName}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRenaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird umbenannt...
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Umbenennen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
