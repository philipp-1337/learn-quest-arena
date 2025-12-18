import { useState } from 'react';
import { FolderOpen, Plus, Trash2, ChevronRight, Edit2, X, Check } from 'lucide-react';
import type { Topic } from '../../../types/quizTypes';

interface TopicItemProps {
  topic: Topic;
  expanded: boolean;
  onToggle(): void;
  onAddQuiz(): void;
  onDelete(): void;
  onRename?: (newName: string) => void;
}

export function TopicItem({
  topic,
  expanded,
  onToggle,
  onAddQuiz,
  onDelete,
  onRename,
}: TopicItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(topic.name);

  const handleRename = () => {
    if (onRename && name.trim() && name !== topic.name) {
      onRename(name.trim());
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setName(topic.name);
    setEditMode(false);
  };

  return (
    <div
      className="group backdrop-blur-xl bg-white/40 hover:bg-white/50 rounded-lg border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm">
            <FolderOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            {editMode ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-gray-300 rounded px-1 py-1 max-w-[128px] sm:max-w-[265px] w-full">
                  <input
                    className="text-sm font-medium text-gray-900 force-break bg-transparent outline-none flex-1 min-w-0"
                    style={{ minWidth: 0 }}
                    value={name}
                    autoFocus
                    onChange={e => setName(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                  <button onClick={e => { e.stopPropagation(); handleRename(); }} title="Speichern" className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={16} /></button>
                  <button onClick={e => { e.stopPropagation(); handleCancel(); }} title="Abbrechen" className="p-1 text-red-600 hover:bg-red-100 rounded"><X size={16} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900 force-break" lang="de">{topic.name}</h4>
              </div>
            )}
            <p className="text-xs text-gray-500">{topic.quizzes.length} Quizze</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRename && !editMode && (
            <button
              onClick={e => { e.stopPropagation(); setEditMode(true); }}
              className="p-1 backdrop-blur-xl bg-blue-400/20 hover:bg-blue-400/30 rounded-md border border-blue-400/30 transition-all duration-200"
              title="Thema umbenennen"
              aria-label="Thema umbenennen"
            >
              <Edit2 className="w-3 h-3 text-blue-700" />
            </button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onAddQuiz();
            }}
            className="p-1 backdrop-blur-xl bg-green-400/20 hover:bg-green-400/30 rounded-md border border-green-400/30 transition-all duration-200"
            title="Quiz hinzufügen"
            aria-label="Quiz hinzufügen"
          >
            <Plus className="w-3 h-3 text-green-700" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 backdrop-blur-xl bg-red-400/20 hover:bg-red-400/30 rounded-md border border-red-400/30 transition-all duration-200"
            title="Thema löschen"
            aria-label="Thema löschen"
          >
            <Trash2 className="w-3 h-3 text-red-700" />
          </button>
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}
