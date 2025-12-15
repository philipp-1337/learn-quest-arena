import { useState } from 'react';
import { Play, Edit2, Trash2, QrCode } from 'lucide-react';
import type { Subject, Class, Topic, Quiz } from '../../../types/quizTypes';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import QuizEditorModal from '../../modals/QuizEditorModal';
import { copyQuizUrlToClipboard } from '../../../utils/quizUrlHelper';

interface QuizManagerProps {
  quiz: Quiz;
  onDelete: () => void;
  onUpdate: (updatedQuiz: Quiz) => void;
  subject: Subject;
  classItem: Class;
  topic: Topic;
}

export default function QuizManager({
  quiz,
  onDelete,
  onUpdate,
  subject,
  classItem,
  topic,
}: QuizManagerProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyQuizUrlToClipboard(subject, classItem, topic, quiz);
    if (success) {
      alert('Link kopiert! 📋');
    } else {
      alert('Fehler beim Kopieren des Links');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="w-3 h-3 text-blue-600" />
          <span className="text-xs text-gray-900">{quiz.title}</span>
          <span className="text-xs text-gray-500">
            ({quiz.questions?.length || 0} Fragen)
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleCopyLink}
            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
            title="Link kopieren"
          >
            <QrCode className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showEditModal && (
        <QuizEditorModal
          quiz={quiz}
          onSave={(updatedQuiz) => {
            onUpdate(updatedQuiz);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={quiz.title}
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
