import { useState } from "react";
import { toast } from "sonner";
import { CustomToast } from "../../misc/CustomToast";
import { showConfirmationToast } from "../../../utils/confirmationToast";
import { UserPlus, Briefcase } from "lucide-react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { generateUniqueUsernames } from "../../../utils/usernameGenerator";

interface UsernamePickerProps {
  onUsernameSelected: (username: string) => void;
  onManualEntryRequested?: () => void;
}

export default function UsernamePicker({
  onUsernameSelected,
  onManualEntryRequested,
}: UsernamePickerProps) {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateClicks, setGenerateClicks] = useState(0);
  // Remove confirmName state, use toast for confirmation

  const handleGenerate = async () => {
    if (generateClicks >= 3) {
      toast.custom(() => (
        <CustomToast 
          message="Du kannst nur 3x einen Namen generieren." 
          type="error" 
        />
      ));
      return;
    }
    if (generateClicks === 1) {
      toast.custom(() => (
        <CustomToast 
          message="Achtung: Du kannst nur noch ein weiteres Mal einen Namen generieren!" 
          type="error" 
        />
      ));
    }
    setGenerateClicks((prev) => prev + 1);
    setLoading(true);
    setError(null);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let didTimeout = false;

    // Set a timeout for 5 seconds
    timeoutId = setTimeout(() => {
      didTimeout = true;
      toast.custom(
        (t) => (
          <CustomToast
            message={
              <div>
                <div className="mb-2">Fehler beim Generieren der Usernamen. Bitte versuche es erneut.</div>
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => {
                      toast.dismiss(t);
                      window.location.reload();
                    }}
                  >
                    Neu laden
                  </button>
                </div>
              </div>
            }
            type="error"
          />
        ),
        { duration: 10000 }
      );
      setLoading(false);
    }, 5000);

    try {
      const names = await generateUniqueUsernames();
      if (!didTimeout) {
        if (timeoutId) clearTimeout(timeoutId);
        setUsernames(names);
      }
    } catch {
      if (!didTimeout) {
        if (timeoutId) clearTimeout(timeoutId);
        setError("Fehler beim Generieren der Usernamen.");
        setLoading(false);
      }
    } finally {
      if (!didTimeout) {
        setLoading(false);
      }
    }
  };

  // Hilfsfunktion: User-Dokument anlegen, falls nicht vorhanden
  const handleSelectName = (name: string) => {
    showConfirmationToast({
      message: (
        <>
          Möchtest du den Namen <span className="font-bold">{name}</span> wirklich wählen?
        </>
      ),
      onConfirm: async () => {
        try {
          const db = getFirestore();
          await setDoc(
            doc(db, "users", name),
            { createdAt: new Date() },
            { merge: true }
          );
          onUsernameSelected(name);
        } catch (err) {
          setError(
            "Fehler beim Anlegen des Nutzers: " +
              (err instanceof Error ? err.message : String(err))
          );
        }
      },
      confirmText: 'Ja',
      cancelText: 'Nein',
    });
  };

  // handleConfirmName removed, logic moved to toast button

  return (
    <div className="mb-3 flex flex-col items-center gap-2">
      <p className="mb-2 text-gray-600 dark:text-gray-400">
        Erstelle deinen eigenen Namen und speichere deinen Fortschritt.
      </p>
      <div className="mb-3 text-xs text-red-600 dark:text-red-300">
        Merke dir deinen Namen gut!
        <br />
        Du brauchst ihn beim nächsten Besuch.
      </div>
      <div className="flex flex-row gap-2 w-full justify-center">
        <button
          type="button"
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
          onClick={() => onUsernameSelected("skip")}
          title="Als Gast fortfahren"
          aria-label="Als Gast fortfahren"
        >
          <Briefcase className="w-4 h-4" />
          Gast bleiben
        </button>
        <button
          onClick={handleGenerate}
          className={`flex items-center gap-1 px-4 py-2 rounded transition-colors duration-200
            ${loading || generateClicks >= 3
              ? "bg-gray-300 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"}
          `}
          disabled={loading || generateClicks >= 3}
          title="Nutzernamen generieren"
          aria-label="Nutzernamen generieren"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Generiere..." : generateClicks >= 3 ? "Limit erreicht" : "Name"}
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {usernames.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap sm:flex-nowrap sm:justify-center w-full">
          {usernames.map((name) => (
            <button
              key={name}
              onClick={() => handleSelectName(name)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded border hover:bg-indigo-100 w-full sm:w-auto mb-2 sm:mb-0 dark:hover:bg-indigo-900/30 text-gray-900 dark:text-gray-200 hover:text-indigo-900"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Confirmation toast handled by Sonner, no modal here */}
      <button
        onClick={onManualEntryRequested}
        title="Vorhandenen Namen eingeben"
        aria-label="Vorhandenen Namen eingeben"
        className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 hover:underline mt-1"
      >
        Vorhandenen Namen eingeben
      </button>
    </div>
  );
}
