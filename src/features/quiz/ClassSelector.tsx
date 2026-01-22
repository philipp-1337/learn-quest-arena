import { Users } from 'lucide-react';
import type { Class } from 'quizTypes';

interface ClassSelectorProps {
  classes: Class[];
  onSelect: (cls: Class) => void;
}

export default function ClassSelector({ classes, onSelect }: ClassSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...classes].sort((a, b) => a.name.localeCompare(b.name)).map((cls: Class) => (
        <button
          key={cls.id}
          onClick={() => onSelect(cls)}
          className="cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          title={cls.name}
          aria-label={cls.name}
        >
          <Users className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-3 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white force-break" lang="de">{cls.name}</h3>
        </button>
      ))}
    </div>
  );
}
