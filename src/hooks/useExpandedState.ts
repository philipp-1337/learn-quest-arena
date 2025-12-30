import { useState } from 'react';

export function useExpandedState() {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    set(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return {
    expandedSubjects,
    expandedClasses,
    expandedTopics,
    toggleSubject: (id: string) => toggle(setExpandedSubjects, id),
    toggleClass: (id: string) => toggle(setExpandedClasses, id),
    toggleTopic: (id: string) => toggle(setExpandedTopics, id),
  };
}
