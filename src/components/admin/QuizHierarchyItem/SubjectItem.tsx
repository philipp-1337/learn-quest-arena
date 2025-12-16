import { BookOpen, Plus, Trash2, ChevronRight } from 'lucide-react';
import type { Subject } from '../../../types/quizTypes';

interface Props {
  subject: Subject;
  expanded: boolean;
  onToggle(): void;
  onAddClass(): void;
  onDelete(): void;
}

export function SubjectItem({ subject, expanded, onToggle, onAddClass, onDelete }: Props) {
  return (
    <div
      className="group backdrop-blur-xl bg-white/50 hover:bg-white/60 rounded-xl border border-white/40 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-400 rounded-lg shadow-md">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{subject.name}</h2>
            <p className="text-xs text-gray-500">{subject.classes.length} Klassen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onAddClass();
            }}
            className="p-1.5 backdrop-blur-xl bg-green-400/20 hover:bg-green-400/30 rounded-lg border border-green-400/30 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 text-green-700" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 backdrop-blur-xl bg-red-400/20 hover:bg-red-400/30 rounded-lg border border-red-400/30 transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-700" />
          </button>
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>
    </div>
  );
}
