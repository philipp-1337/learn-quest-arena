import { Users } from 'lucide-react';
import type { Class } from '../../types/quizTypes';

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
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <Users className="w-10 h-10 text-purple-600 mb-3 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
        </button>
      ))}
    </div>
  );
}
