import { useState } from "react";
import { isValidGeneratedUsername, usernameExists } from "../utils/usernameValidation";

interface UsernamePickerProps {
  onUsernameSelected: (username: string) => void;
  onBack?: () => void;
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
          className="px-3 py-1 bg-gray-200 rounded hover:bg-indigo-100"
        >
          Weiter mit diesem Namen
        </button>
        {onBack && (
          <button
            type="button"
            className="px-3 py-1 bg-gray-100 rounded hover:bg-red-100 text-gray-600"
            onClick={onBack}
          >
            Zurück
          </button>
        )}
      </div>
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </form>
  );
}
