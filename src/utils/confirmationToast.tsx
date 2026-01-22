import { toast } from 'sonner';
import { CustomToast } from '@features/shared/CustomToast';

interface ConfirmationToastOptions {
  message: string | React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  duration?: number;
}

/**
 * Zeigt einen einheitlichen Bestätigungsdialog als Toast an.
 * 
 * @param options - Konfigurationsoptionen für den Toast
 * @param options.message - Die anzuzeigende Nachricht (Text oder React-Element)
 * @param options.onConfirm - Callback-Funktion, die bei Bestätigung ausgeführt wird
 * @param options.onCancel - Optionale Callback-Funktion, die bei Abbruch ausgeführt wird
 * @param options.confirmText - Text für den Bestätigungsbutton (Standard: "Ja")
 * @param options.cancelText - Text für den Abbruchbutton (Standard: "Abbrechen")
 * @param options.duration - Anzeigedauer des Toasts in ms (Standard: 10000)
 */
export function showConfirmationToast({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ja',
  cancelText = 'Abbrechen',
  duration = 10000,
}: ConfirmationToastOptions): void {
  toast.custom(
    (t) => (
      <CustomToast
        message={
          <>
            <div className="mb-2">{message}</div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  toast.dismiss(t);
                  onConfirm();
                }}
                type="button"
              >
                {confirmText}
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                onClick={() => {
                  toast.dismiss(t);
                  onCancel?.();
                }}
                type="button"
              >
                {cancelText}
              </button>
            </div>
          </>
        }
      />
    ),
    { duration }
  );
}
