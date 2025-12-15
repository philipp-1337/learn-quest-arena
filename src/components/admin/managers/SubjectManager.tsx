import { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import type { Subject, Class } from '../../../types/quizTypes';
import useFirestore from '../../../hooks/useFirestore';
import AddModal from '../../modals/AddModal';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import ClassManager from './ClassManager';

interface SubjectManagerProps {
  subject: Subject;
  onDelete: () => void;
  onUpdate: (updatedSubject: Subject) => void;
}

export default function SubjectManager({
  subject,
  onDelete,
  onUpdate,
}: SubjectManagerProps) {
  const { saveDocument } = useFirestore();
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddClass = async (name: string) => {
    const newClass: Class = {
      id: `${subject.id}-${Date.now()}`,
      name,
      level: subject.classes.length + 1,
      topics: [],
    };
    const updatedSubject = {
      ...subject,
      classes: [...subject.classes, newClass],
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedSubject);
    setShowAddModal(false);
  };

  const handleDeleteClass = async (classId: string) => {
    const updatedSubject = {
      ...subject,
      classes: subject.classes.filter((c) => c.id !== classId),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedSubject);
  };

  const handleUpdateClass = async (updatedClass: Class) => {
    const updatedSubject = {
      ...subject,
      classes: subject.classes.map((c) =>
        c.id === updatedClass.id ? updatedClass : c
      ),
    };

    await saveDocument(`subjects/${subject.id}`, updatedSubject);
    onUpdate(updatedSubject);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? '▼' : '▶'}
            </button>
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-gray-900">{subject.name}</span>
            <span className="text-sm text-gray-500">
              ({subject.classes.length} Klassen)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-4 space-y-3">
            {subject.classes.length === 0 ? (
              <p className="text-gray-500 text-sm">Keine Klassen vorhanden</p>
            ) : (
              subject.classes.map((cls: Class) => (
                <ClassManager
                  key={cls.id}
                  classItem={cls}
                  onDelete={() => handleDeleteClass(cls.id)}
                  onUpdate={handleUpdateClass}
                  subject={subject}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          type="class"
          onSave={handleAddClass}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={subject.name}
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
