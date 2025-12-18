import { useState } from "react";
import { UserPlus, KeyRound } from "lucide-react";
import { generateUniqueUsernames } from "../utils/usernameGenerator";

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

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const names = await generateUniqueUsernames();
      setUsernames(names);
    } catch (e) {
      setError("Fehler beim Generieren der Usernamen.");
    } finally {
      setLoading(false);
    }
  };

  // Hilfsfunktion: User-Dokument anlegen, falls nicht vorhanden
  const handleSelectName = async (name: string) => {
    try {
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");
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
  };

  return (
    <div className="mb-3 flex flex-col items-center gap-2">
      <div className="flex flex-row gap-2 w-full justify-center">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          disabled={loading}
          title="Nutzernamen generieren"
          aria-label="Nutzernamen generieren"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Laden..." : "Neu"}
        </button>
        <button
          className="flex items-center gap-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
          onClick={onManualEntryRequested}
          type="button"
          title="Vorhandenen Namen eingeben"
          aria-label="Vorhandenen Namen eingeben"
        >
          <KeyRound className="w-4 h-4" />
          Name eingeben
        </button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {usernames.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap sm:flex-nowrap sm:justify-center w-full">
          {usernames.map((name) => (
            <button
              key={name}
              onClick={() => handleSelectName(name)}
              className="px-3 py-1 bg-gray-100 rounded border hover:bg-indigo-100 w-full sm:w-auto mb-2 sm:mb-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => onUsernameSelected("skip")}
        className="text-xs text-indigo-500 underline mt-1"
        title="Als Gast fortfahren"
        aria-label="Als Gast fortfahren"
      >
        Als Gast fortfahren
      </button>
    </div>
  );
}
