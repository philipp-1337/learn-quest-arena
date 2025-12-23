import { toast } from 'sonner';
import { CustomToast } from '../components/misc/CustomToast';

export function showCompletedQuizWarning(onContinue: () => void): void {
  toast.custom(
    (t) => (
      <CustomToast
        message={
          <>
            <div className="mb-2">Dieses Quiz ist bereits abgeschlossen. Wenn du es nochmal machst, wird dein Fortschritt überschrieben. Bist du sicher?</div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  toast.dismiss(t);
                  onContinue();
                }}
                type="button"
              >Fortsetzen</button>
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                onClick={() => toast.dismiss(t)}
                type="button"
              >Abbrechen</button>
            </div>
          </>
        }
      />
    ),
    { duration: 10000 }
  );
}
