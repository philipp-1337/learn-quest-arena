import { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import type { Subject, Class, Topic } from '../../../types/quizTypes';
import useFirestore from '../../../hooks/useFirestore';
import AddModal from '../../modals/AddModal';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import TopicManager from './TopicManager';

interface ClassManagerProps {
  classItem: Class;
  onDelete: () => void;
  onUpdate: (updatedClass: Class) => void;
  subject: Subject;
}

export default function ClassManager({
  classItem,
  onDelete,
  onUpdate,
  subject,
}: ClassManagerProps) {
  const { saveDocument } = useFirestore();
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddTopic = async (name: string) => {
    const newTopic: Topic = {
      id: `${classItem.id}-${Date.now()}`,
      name,
      quizzes: [],
    };
    const updatedClass = {
      ...classItem,
      topics: [...classItem.topics, newTopic],
    };
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === classItem.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedClass);
    setShowAddModal(false);
  };

  const handleDeleteTopic = async (topicId: string) => {
    const updatedClass = {
      ...classItem,
      topics: classItem.topics.filter((t) => t.id !== topicId),
    };
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === classItem.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedClass);
  };

  const handleUpdateTopic = async (updatedTopic: Topic) => {
    const updatedClass = {
      ...classItem,
      topics: classItem.topics.map((t) =>
        t.id === updatedTopic.id ? updatedTopic : t
      ),
    };
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === classItem.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedClass);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? '▼' : '▶'}
            </button>
            <Users className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-900">{classItem.name}</span>
            <span className="text-xs text-gray-500">
              ({classItem.topics.length} Themen)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-3 space-y-2">
            {classItem.topics.length === 0 ? (
              <p className="text-gray-500 text-xs">Keine Themen vorhanden</p>
            ) : (
              classItem.topics.map((topic: Topic) => (
                <TopicManager
                  key={topic.id}
                  topic={topic}
                  onDelete={() => handleDeleteTopic(topic.id)}
                  onUpdate={handleUpdateTopic}
                  subject={subject}
                  classItem={classItem}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          type="topic"
          onSave={handleAddTopic}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={classItem.name}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
