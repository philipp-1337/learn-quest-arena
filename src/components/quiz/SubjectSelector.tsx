import { BookOpen } from 'lucide-react';
import type { Subject } from '@types/quizTypes';

interface SubjectSelectorProps {
  subjects: Subject[];
  onSelect: (subject: Subject) => void;
}

export default function SubjectSelector({ subjects, onSelect }: SubjectSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...subjects].sort((a, b) => a.name.localeCompare(b.name)).map((subject: Subject) => (
        <button
          key={subject.id}
          onClick={() => onSelect(subject)}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          title={subject.name}
          aria-label={subject.name}
        >
          <BookOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white force-break" lang="de">{subject.name}</h3>
        </button>
      ))}
    </div>
  );
}
