import { useState } from "react";
import { generateUniqueUsernames } from "../utils/usernameGenerator";

interface UsernamePickerProps {
  onUsernameSelected: (username: string) => void;
}

export default function UsernamePicker({ onUsernameSelected }: UsernamePickerProps) {
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

  return (
    <div className="mb-3 flex flex-col items-center gap-2">
      <button
        onClick={handleGenerate}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Generiere..." : "Nutzernamen generieren"}
      </button>
      <button
        onClick={() => onUsernameSelected("skip")}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 mt-2"
      >
        Überspringen
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {usernames.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap sm:flex-nowrap sm:justify-center w-full">
          {usernames.map((name) => (
            <button
              key={name}
              onClick={() => onUsernameSelected(name)}
              className="px-3 py-1 bg-gray-100 rounded border hover:bg-indigo-100 w-full sm:w-auto mb-2 sm:mb-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
