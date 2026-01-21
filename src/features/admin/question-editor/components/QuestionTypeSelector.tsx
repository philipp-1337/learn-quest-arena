interface QuestionTypeSelectorProps {
  selectedType: "text" | "image" | "audio";
  onChange: (type: "text" | "image" | "audio") => void;
}

export default function QuestionTypeSelector({
  selectedType,
  onChange,
}: QuestionTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fragen-Typ
      </label>
      <div className="flex gap-3">
        {(["text", "image", "audio"] as const).map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedType === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {type === "text" ? "Text" : type === "image" ? "Bild" : "Audio"}
          </button>
        ))}
      </div>
    </div>
  );
}
