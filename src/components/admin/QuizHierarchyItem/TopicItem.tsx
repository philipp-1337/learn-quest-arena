import { FolderOpen, Plus, Trash2, ChevronRight } from 'lucide-react';
import type { Topic } from '../../../types/quizTypes';

interface TopicItemProps {
  topic: Topic;
  expanded: boolean;
  onToggle(): void;
  onAddQuiz(): void;
  onDelete(): void;
}

export function TopicItem({
  topic,
  expanded,
  onToggle,
  onAddQuiz,
  onDelete,
}: TopicItemProps) {
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
            <h4 className="text-sm font-medium text-gray-900">
              {topic.name}
            </h4>
            <p className="text-xs text-gray-500">
              {topic.quizzes.length} Quizze
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onAddQuiz();
            }}
            className="p-1 backdrop-blur-xl bg-green-400/20 hover:bg-green-400/30 rounded-md border border-green-400/30 transition-all duration-200"
          >
            <Plus className="w-3 h-3 text-green-700" />
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 backdrop-blur-xl bg-red-400/20 hover:bg-red-400/30 rounded-md border border-red-400/30 transition-all duration-200"
          >
            <Trash2 className="w-3 h-3 text-red-700" />
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
