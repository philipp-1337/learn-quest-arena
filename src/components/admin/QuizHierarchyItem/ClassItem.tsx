import { Users, Plus, Trash2, ChevronRight } from 'lucide-react';
import type { Class } from '../../../types/quizTypes';

interface ClassItemProps {
  classItem: Class;
  expanded: boolean;
  onToggle(): void;
  onAddTopic(): void;
  onDelete(): void;
}

export function ClassItem({
  classItem,
  expanded,
  onToggle,
  onAddTopic,
  onDelete,
}: ClassItemProps) {
  return (
    <div
      className="group backdrop-blur-xl bg-white/50 hover:bg-white/60 rounded-xl border border-white/40 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 force-break" lang="de">
              {classItem.name}
            </h3>
            <p className="text-xs text-gray-500">
              {classItem.topics.length} Themen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onAddTopic();
            }}
            className="p-1.5 backdrop-blur-xl bg-green-400/20 hover:bg-green-400/30 rounded-lg border border-green-400/30 transition-all duration-200"
            title="Thema hinzufügen"
            aria-label="Thema hinzufügen"
          >
            <Plus className="w-3.5 h-3.5 text-green-700" />
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 backdrop-blur-xl bg-red-400/20 hover:bg-red-400/30 rounded-lg border border-red-400/30 transition-all duration-200"
            title="Klasse löschen"
            aria-label="Klasse löschen"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-700" />
          </button>

          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
}
