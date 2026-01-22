import { useState } from 'react';

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  itemName,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmValid = confirmText === "LÖSCHEN";

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 force-break" lang="de">
          Wirklich löschen?
        </h3>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Möchtest du "{itemName}" wirklich löschen? Diese Aktion kann nicht
          rückgängig gemacht werden.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gib <span className="font-bold">LÖSCHEN</span> ein, um zu bestätigen:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="LÖSCHEN"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={!isConfirmValid}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              isConfirmValid
                ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
            }`}
            title={isConfirmValid ? "Löschen bestätigen" : "Gib LÖSCHEN ein, um fortzufahren"}
            aria-label="Löschen bestätigen"
          >
            Ja, löschen
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Abbrechen"
            aria-label="Abbrechen"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
