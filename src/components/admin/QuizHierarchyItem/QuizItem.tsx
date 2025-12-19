import { useState, useEffect } from "react";
import {
  Play,
  Edit2,
  Trash2,
  QrCode,
  Eye,
  EyeOff,
  Loader2,
  X,
  Check,
} from "lucide-react";
import type { Quiz } from "../../../types/quizTypes";

interface QuizItemProps {
  quiz: Quiz;
  onEdit(): void;
  onDelete(): void;
  onCopyLink?: () => void;
  onToggleHidden?: (hidden: boolean) => Promise<void> | void;
  onRename?: (newTitle: string) => void;
}

export function QuizItem({
  quiz,
  onEdit,
  onDelete,
  onCopyLink,
  onToggleHidden,
  onRename,
}: QuizItemProps) {
  const [isTogglingHidden, setIsTogglingHidden] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(quiz.shortTitle || quiz.title);

  useEffect(() => {
    setTitle(quiz.shortTitle || quiz.title);
  }, [quiz.shortTitle, quiz.title]);

  const handleToggleHidden = async () => {
    if (!onToggleHidden) return;
    setIsTogglingHidden(true);
    try {
      await onToggleHidden(!quiz.hidden);
    } finally {
      setIsTogglingHidden(false);
    }
  };

  const handleRename = () => {
    if (onRename && title.trim() && title !== quiz.title) {
      onRename(title.trim());
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setTitle(quiz.shortTitle || quiz.title);
    setEditMode(false);
  };

  return (
    <div
      className={`ml-3 backdrop-blur-xl bg-gradient-to-r from-white/30 to-white/20 hover:from-white/40 hover:to-white/30 rounded-lg border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 group`}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1 rounded-md shadow-sm ${
              quiz.hidden
                ? "bg-gradient-to-br from-gray-500 to-gray-500"
                : "bg-gradient-to-br from-blue-500 to-cyan-500"
            }`}
          >
            <Play className="w-3 h-3 text-white" />
          </div>
          <div>
            {editMode ? (
              <div className="flex items-center gap-2">
                <input
                  className="text-sm font-medium text-gray-900 force-break bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={title}
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") handleCancel();
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  title="Speichern"
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  title="Abbrechen"
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h5
                  className={`text-sm font-medium text-gray-900 force-break ${
                    quiz.hidden ? "opacity-50" : ""
                  }`}
                  lang="de"
                >
                  {title}
                </h5>
                {/* Edit-Button für Umbenennen entfernt */}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {quiz.questions?.length ?? 0} Fragen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-1 backdrop-blur-xl bg-blue-400/20 hover:bg-blue-400/30 rounded-md border border-blue-400/30 transition-all duration-200"
            title="Quiz bearbeiten"
            aria-label="Quiz bearbeiten"
          >
            <Edit2 className="w-3 h-3 text-blue-700" />
          </button>
          {onToggleHidden && (
            <button
              onClick={handleToggleHidden}
              className={`p-1 rounded-md border backdrop-blur-xl transition-all duration-200 flex items-center justify-center ${
                quiz.hidden
                  ? "bg-gray-400/20 hover:bg-gray-400/30 border-gray-400/30 text-gray-700"
                  : "bg-green-400/20 hover:bg-green-400/30 border-green-400/30 text-green-700"
              }`}
              title={quiz.hidden ? "Quiz einblenden" : "Quiz ausblenden"}
              disabled={isTogglingHidden}
            >
              {isTogglingHidden ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : quiz.hidden ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </button>
          )}
          {onCopyLink && (
            <button
              onClick={onCopyLink}
              className="p-1 backdrop-blur-xl bg-indigo-400/20 hover:bg-indigo-400/30 rounded-md border border-indigo-400/30 transition-all duration-200"
              title="Link kopieren"
            >
              <QrCode className="w-3 h-3 text-indigo-700" />
            </button>
          )}

          <button
            onClick={onDelete}
            className="p-1 backdrop-blur-xl bg-red-400/20 hover:bg-red-400/30 rounded-md border border-red-400/30 transition-all duration-200"
            title="Quiz löschen"
            aria-label="Quiz löschen"
          >
            <Trash2 className="w-3 h-3 text-red-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
