import { Play, Edit2, Trash2, QrCode, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Quiz } from '../../../types/quizTypes';

interface QuizItemProps {
  quiz: Quiz;
  onEdit(): void;
  onDelete(): void;
  onCopyLink?: () => void;
  onToggleHidden?: (hidden: boolean) => Promise<void> | void;
}

import React from 'react';

export function QuizItem({
  quiz,
  onEdit,
  onDelete,
  onCopyLink,
  onToggleHidden,
}: QuizItemProps) {
  const [isTogglingHidden, setIsTogglingHidden] = React.useState(false);

  const handleToggleHidden = async () => {
    if (!onToggleHidden) return;
    setIsTogglingHidden(true);
    try {
      await onToggleHidden(!quiz.hidden);
    } finally {
      setIsTogglingHidden(false);
    }
  };

  return (
    <div className={`ml-6 backdrop-blur-xl bg-gradient-to-r from-white/30 to-white/20 hover:from-white/40 hover:to-white/30 rounded-lg border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 group`}>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md shadow-sm ${quiz.hidden ? 'bg-gradient-to-br from-gray-500 to-gray-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
            <Play className="w-3 h-3 text-white" />
          </div>
          <div>
            <h5 className={`text-sm font-medium text-gray-900 force-break ${quiz.hidden ? 'opacity-50' : ''}`} lang="de">
              {quiz.title}
              {quiz.hidden 
              // && <span className="ml-2 text-xs text-red-500">(ausgeblendet)</span>
              }
            </h5>
            <p className="text-xs text-gray-500">
              {quiz.questions?.length ?? 0} Fragen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 transition-opacity duration-200">
          {onToggleHidden && (
            <button
              onClick={handleToggleHidden}
              className={`p-1 rounded-md border transition-all duration-200 flex items-center justify-center ${quiz.hidden ? 'bg-green-300 border-green-400 text-green-700' : 'bg-gray-200 border-gray-400 text-gray-700'}`}
              title={quiz.hidden ? 'Quiz einblenden' : 'Quiz ausblenden'}
              disabled={isTogglingHidden}
            >
              {isTogglingHidden ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : quiz.hidden ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
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
            onClick={onEdit}
            className="p-1 backdrop-blur-xl bg-blue-400/20 hover:bg-blue-400/30 rounded-md border border-blue-400/30 transition-all duration-200"
          >
            <Edit2 className="w-3 h-3 text-blue-700" />
          </button>

          <button
            onClick={onDelete}
            className="p-1 backdrop-blur-xl bg-red-400/20 hover:bg-red-400/30 rounded-md border border-red-400/30 transition-all duration-200"
          >
            <Trash2 className="w-3 h-3 text-red-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
