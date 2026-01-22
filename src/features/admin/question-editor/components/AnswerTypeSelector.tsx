interface AnswerTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
}

export default function AnswerTypeSelector({
  selectedType,
  onChange,
}: AnswerTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Antwort-Typ
      </label>
      <div className="flex gap-3">
        {["text", "image", "audio"].map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedType === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {type === "text" ? "Text" : type === "image" ? "Bilder" : "Audio"}
          </button>
        ))}
      </div>
    </div>
  );
}
