import { useState } from "react";
import { isValidGeneratedUsername, usernameExists } from "../utils/usernameValidation";


interface UsernamePickerProps {
  onUsernameSelected: (username: string) => void;
  onBack: () => void;
}

export default function UsernameManualEntry({ onUsernameSelected, onBack }: UsernamePickerProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Bitte gib einen Namen ein.");
      return;
    }
    if (!isValidGeneratedUsername(trimmed)) {
      setError("Nur gültige, generierte Namen sind erlaubt (Tiername_XXXXXX).");
      return;
    }
    const exists = await usernameExists(trimmed);
    if (!exists) {
      setError("Dieser Name existiert nicht. Bitte überprüfe die Schreibweise.");
      return;
    }
    setError(null);
    onUsernameSelected(trimmed);
  };

  return (
    <form className="flex flex-col items-center gap-2 mt-4" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Vorherigen Namen eingeben"
        className="border rounded px-3 py-1"
      />
      <div className="flex gap-2 w-full justify-center">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition"
          title="Mit diesem Namen fortfahren"
          aria-label="Mit diesem Namen fortfahren"
        >
          Weiter mit diesem Namen
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-white border border-indigo-600 text-indigo-600 font-semibold shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition"
          onClick={onBack}
          title="Zurück zur vorherigen Ansicht"
          aria-label="Zurück zur vorherigen Ansicht"
        >
          Zurück
        </button>
      </div>
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </form>
  );
}
