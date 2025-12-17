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
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 force-break" lang="de">
          Wirklich löschen?
        </h3>

        <p className="text-gray-700 mb-6">
          Möchtest du "{itemName}" wirklich löschen? Diese Aktion kann nicht
          rückgängig gemacht werden.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Ja, löschen
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
