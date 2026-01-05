import { useState } from "react";
import {
  isValidGeneratedUsername,
  usernameExists,
} from "../../utils/usernameValidation";

interface UsernamePickerProps {
  onUsernameSelected: (username: string) => void;
  onBack: () => void;
}

export default function UsernameManualEntry({
  onUsernameSelected,
  onBack,
}: UsernamePickerProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Bitte gib einen Namen ein.");
        return;
      }
      if (!isValidGeneratedUsername(trimmed)) {
        setError("Nur gültige, generierte Namen sind erlaubt (Tiername-XXXXXX).");
        return;
      }
      // Prüfe Existenz, aber lege KEIN Dokument mehr an, wenn es nicht existiert
      const exists = await usernameExists(trimmed);
      if (!exists) {
        setError("Dieser Nutzername existiert nicht oder wurde noch nicht verwendet.");
        return;
      }
      setError(null);
      onUsernameSelected(trimmed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col items-center gap-2 mt-4"
      onSubmit={handleSubmit}
    >
      {/* Erklärung für manuelle Namenseingabe */}
      <p className="mb-2 text-gray-700 dark:text-gray-300">
        Gib einen Nutzernamen im Format{" "}
        <span className="font-mono font-semibold">Tiername-XXXXXX</span> ein
        (z.B. <span className="font-mono">Fuchs-AB1234</span>).
      </p>
      <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Es funktionieren nur Namen, die über diese Quiz-App erstellt wurden und
        mit denen bereits Quizze bearbeitet wurden.
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tiername-XXXXXX"
        className="border rounded px-3 py-1 mb-2 dark:bg-gray-900 dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <div className="flex gap-2 w-full justify-center">
        <button
          type="button"
          className="px-4 py-2 rounded bg-white border border-indigo-600 text-indigo-600 font-semibold shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition"
          onClick={onBack}
          title="Zurück zur vorherigen Ansicht"
          aria-label="Zurück zur vorherigen Ansicht"
        >
          Zurück
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition flex items-center justify-center min-w-[120px]"
          title="Mit diesem Namen fortfahren"
          aria-label="Mit diesem Namen fortfahren"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : null}
          {loading ? "Prüfe..." : "Namen verwenden"}
        </button>
      </div>
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </form>
  );
}
