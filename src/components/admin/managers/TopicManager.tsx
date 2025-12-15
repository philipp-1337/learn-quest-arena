import { useState } from 'react';
import { FolderOpen, Plus, Trash2 } from 'lucide-react';
import type { Subject, Class, Topic, Quiz } from '../../../types/quizTypes';
import useFirestore from '../../../hooks/useFirestore';
import AddModal from '../../modals/AddModal';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import QuizManager from './QuizManager';

interface TopicManagerProps {
  topic: Topic;
  onDelete: () => void;
  onUpdate: (updatedTopic: Topic) => void;
  subject: Subject;
  classItem: Class;
}

export default function TopicManager({
  topic,
  onDelete,
  onUpdate,
  subject,
  classItem,
}: TopicManagerProps) {
  const { saveDocument } = useFirestore();
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddQuiz = async (title: string) => {
    const newQuiz: Quiz = {
      id: `${topic.id}-${Date.now()}`,
      title,
      questions: [],
    };
    const updatedTopic = {
      ...topic,
      quizzes: [...topic.quizzes, newQuiz],
    };
    const updatedClass = {
      ...classItem,
      topics: classItem.topics.map((t) =>
        t.id === topic.id ? updatedTopic : t
      ),
    };
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === classItem.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedTopic);
    setShowAddModal(false);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const updatedTopic = {
      ...topic,
      quizzes: topic.quizzes.filter((q) => q.id !== quizId),
    };
    const updatedClass = {
      ...classItem,
      topics: classItem.topics.map((t) =>
        t.id === topic.id ? updatedTopic : t
      ),
    };
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === classItem.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedTopic);
  };

  const handleUpdateQuiz = async (updatedQuiz: Quiz) => {
    const updatedTopic = {
      ...topic,
      quizzes: topic.quizzes.map((q) =>
        q.id === updatedQuiz.id ? updatedQuiz : q
      ),
    };
    const updatedClass = {
      ...classItem,
      topics: classItem.topics.map((t) =>
        t.id === topic.id ? updatedTopic : t
      ),
    };
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === classItem.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedTopic);
  };

  return (
    <>
      <div className="border border-gray-200 rounded bg-gray-50">
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? '▼' : '▶'}
            </button>
            <FolderOpen className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              {topic.name}
            </span>
            <span className="text-xs text-gray-500">
              ({topic.quizzes.length} Quizze)
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
          <div className="p-2 space-y-1">
            {topic.quizzes.length === 0 ? (
              <p className="text-gray-500 text-xs">Keine Quizze vorhanden</p>
            ) : (
              topic.quizzes.map((quiz: Quiz) => (
                <QuizManager
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={() => handleDeleteQuiz(quiz.id)}
                  onUpdate={handleUpdateQuiz}
                  subject={subject}
                  classItem={classItem}
                  topic={topic}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          type="quiz"
          onSave={handleAddQuiz}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={topic.name}
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
