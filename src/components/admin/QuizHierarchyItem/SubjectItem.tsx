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
    <div onClick={onToggle} className="rounded-2xl bg-white/60 p-5">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <BookOpen />
          <div>
            <h2>{subject.name}</h2>
            <p>{subject.classes.length} Klassen</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={e => { e.stopPropagation(); onAddClass(); }}>
            <Plus />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}>
            <Trash2 />
          </button>
          <ChevronRight className={expanded ? 'rotate-90' : ''} />
        </div>
      </div>
    </div>
  );
}
