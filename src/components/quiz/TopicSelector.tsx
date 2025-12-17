import { FolderOpen } from 'lucide-react';
import type { Topic } from '../../types/quizTypes';

interface TopicSelectorProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}

export default function TopicSelector({ topics, onSelect }: TopicSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...topics].sort((a, b) => a.name.localeCompare(b.name)).map((topic: Topic) => (
        <button
          key={topic.id}
          onClick={() => onSelect(topic)}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <FolderOpen className="w-10 h-10 text-green-600 mb-3 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">{topic.name}</h3>
        </button>
      ))}
    </div>
  );
}
