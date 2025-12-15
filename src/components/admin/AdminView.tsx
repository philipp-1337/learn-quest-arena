import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { Plus, Upload } from 'lucide-react';
import type { Subject } from '../../types/quizTypes';
import useFirestore from '../../hooks/useFirestore';
import { useStatsCalculation } from '../../hooks/useStatsCalculation';
import { useSubjectOperations } from '../../hooks/useSubjectOperations';
import AdminHeader from './AdminHeader';
import AdminStats from './AdminStats';
import QRCodeInfo from './QRCodeInfo';
import SubjectManager from './managers/SubjectManager';
import AddModal from '../modals/AddModal';
import ImportModal from '../modals/importModal';

interface AdminViewProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onLogout: () => void;
}

export default function AdminView({
  subjects: initialSubjects,
  onSubjectsChange,
  onLogout,
}: AdminViewProps) {
  const { saveDocument, fetchCollection } = useFirestore();
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const auth = getAuth();

  // Custom Hooks
  const stats = useStatsCalculation(subjects);
  const { handleAddSubject, handleDeleteSubject, handleUpdateSubject } =
    useSubjectOperations(subjects, setSubjects);

  // Sync changes back to parent
  useEffect(() => {
    onSubjectsChange(subjects);
  }, [subjects, onSubjectsChange]);

  // Load subjects from Firestore on mount
  const handleLoadSubjects = async () => {
    const loadedSubjects = await fetchCollection('subjects');
    const formattedSubjects: Subject[] = loadedSubjects.map((subject: any) => ({
      id: subject.id,
      name: subject.name || '',
      order: subject.order || 0,
      classes: subject.classes || [],
    }));
    onSubjectsChange(formattedSubjects);
  };

  useEffect(() => {
    handleLoadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        onLogout();
      })
      .catch((error) => {
        console.error('Logout Fehler:', error);
      });
  };

  const handleSaveSubject = async (name: string) => {
    await handleAddSubject(name);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <AdminStats
          totalSubjects={stats.totalSubjects}
          totalTopics={stats.totalTopics}
          totalQuizzes={stats.totalQuizzes}
        />

        {/* Content Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Quiz verwalten
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-md text-green-600 hover:text-green-700 hover:bg-green-200"
              >
                <Upload className="w-4 h-4" />
                <span className="max-[640px]:hidden">Quiz importieren</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-200"
              >
                <Plus className="w-4 h-4" />
                <span className="max-[640px]:hidden">Fach hinzufügen</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {subjects.map((subject: Subject) => (
              <SubjectManager
                key={subject.id}
                subject={subject}
                onDelete={() => handleDeleteSubject(subject.id)}
                onUpdate={handleUpdateSubject}
              />
            ))}
          </div>
        </div>

        {/* QR Code Info */}
        <QRCodeInfo />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          type="subject"
          onSave={handleSaveSubject}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          subjects={subjects}
          onImport={async (updatedSubjects) => {
            // Speichere alle aktualisierten Subjects in Firestore
            for (const subject of updatedSubjects) {
              await saveDocument(`subjects/${subject.id}`, subject);
            }
            setSubjects(updatedSubjects);
            setShowImportModal(false);
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
