import { ChevronRight } from 'lucide-react';
import type { Subject, Class, Topic } from '@types/quizTypes';

interface BreadcrumbProps {
  selectedSubject: Subject | null;
  selectedClass: Class | null;
  selectedTopic: Topic | null;
  onNavigateHome: () => void;
  onNavigateToSubject: () => void;
  onNavigateToClass: () => void;
}

export default function Breadcrumb({
  selectedSubject,
  selectedClass,
  selectedTopic,
  onNavigateHome,
  onNavigateToSubject,
  onNavigateToClass,
}: BreadcrumbProps) {
  if (!selectedSubject && !selectedClass && !selectedTopic) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-4 text-sm flex-wrap">
      <button
        onClick={onNavigateHome}
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        title="Zur Startseite"
        aria-label="Zur Startseite"
      >
        Start
      </button>
      {selectedSubject && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <button
            onClick={onNavigateToSubject}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
            title={selectedSubject.name}
            aria-label={selectedSubject.name}
          >
            {selectedSubject.name}
          </button>
        </>
      )}
      {selectedClass && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <button
            onClick={onNavigateToClass}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
            title={selectedClass.name}
            aria-label={selectedClass.name}
          >
            {selectedClass.name}
          </button>
        </>
      )}
      {selectedTopic && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {selectedTopic.name}
          </span>
        </>
      )}
    </div>
  );
}
