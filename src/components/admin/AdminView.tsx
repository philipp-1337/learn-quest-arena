import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { Plus, Upload, Sparkles, BadgeInfoIcon } from "lucide-react";
import type { Subject, QuizChallenge } from "../../types/quizTypes";
import useFirestore from "../../hooks/useFirestore";
import { useStatsCalculation } from "../../hooks/useStatsCalculation";
import { useSubjectOperations } from "../../hooks/useSubjectOperations";
import AdminHeader from "./AdminHeader";
import AdminStats from "./AdminStats";
import QRCodeInfo from "./QRCodeInfo";
// import SubjectManager from "./managers/SubjectManager";
import AddModal from "../modals/AddModal";
import ImportModal from "../modals/ImportModal";
import FlatQuizManager from "./FlatQuizManager";
import QuizChallengeManager from "./QuizChallengeManager";

// ============================================
// ADMIN VIEW COMPONENT
// ============================================

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
  const [challenges, setChallenges] = useState<QuizChallenge[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'challenge'>('quiz');
  const auth = getAuth();

  // Custom Hooks
  const stats = useStatsCalculation(subjects);
  const { handleAddSubject } =
    useSubjectOperations(subjects, setSubjects);

  // Sync changes back to parent
  useEffect(() => {
    onSubjectsChange(subjects);
  }, [subjects, onSubjectsChange]);

  // Load subjects from Firestore on mount
  const handleLoadSubjects = async () => {
    const loadedSubjects = await fetchCollection("subjects");
    const formattedSubjects: Subject[] = loadedSubjects.map((subject: any) => ({
      id: subject.id,
      name: subject.name || "",
      order: subject.order || 0,
      classes: subject.classes || [],
    }));
    onSubjectsChange(formattedSubjects);
  };

  useEffect(() => {
    handleLoadSubjects();
    handleLoadChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload challenges whenever they change to ensure consistency
  const handleChallengesChange = (updatedChallenges: QuizChallenge[]) => {
    setChallenges(updatedChallenges);
    // Trigger a reload after a short delay to ensure Firestore is updated
    setTimeout(() => {
      handleLoadChallenges();
    }, 500);
  };

  // Load quiz challenges from Firestore on mount
  const handleLoadChallenges = async () => {
    const loadedChallenges = await fetchCollection("quizChallenges");
    const formattedChallenges: QuizChallenge[] = loadedChallenges.map((challenge: any) => ({
      id: challenge.id,
      title: challenge.title || "",
      levels: challenge.levels || [],
      hidden: challenge.hidden || false,
    }));
    setChallenges(formattedChallenges);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        onLogout();
      })
      .catch((error) => {
        console.error("Logout Fehler:", error);
      });
  };

  const handleSaveSubject = async (name: string) => {
    await handleAddSubject(name);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <AdminHeader onLogout={handleLogout} />

        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <AdminStats
            totalSubjects={stats.totalSubjects}
            totalTopics={stats.totalTopics}
            totalQuizzes={stats.totalQuizzes}
            totalQuestions={stats.totalQuestions}
          />

          {/* Content Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'quiz'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Standard Quiz
              </button>
              <button
                onClick={() => setActiveTab('challenge')}
                className={`relative pb-3 px-4 font-semibold transition-colors ${
                  activeTab === 'challenge'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quiz-Challenge
                <span className="absolute -top-1 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </span>
              </button>
            </div>

            {activeTab === 'quiz' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 force-break" lang="de">Quiz verwalten</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-md text-green-600 hover:text-green-700 hover:bg-green-200"
                      title="Quiz importieren"
                      aria-label="Quiz importieren"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="max-[640px]:hidden">Quiz importieren</span>
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-200"
                      title="Fach hinzufügen"
                      aria-label="Fach hinzufügen"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="max-[640px]:hidden">Fach hinzufügen</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <FlatQuizManager
                    subjects={subjects}
                    onSubjectsChange={setSubjects}
                  />
                </div>
              </>
            )}

            {activeTab === 'challenge' && (
              <>
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <BadgeInfoIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                        BETA Feature
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          <Sparkles className="w-3 h-3" />
                          BETA
                        </span>
                      </h3>
                      <p className="text-sm text-purple-800">
                        Dieses Feature befindet sich in der Beta-Phase.
                      </p>
                    </div>
                  </div>
                </div>
                <QuizChallengeManager
                  challenges={challenges}
                  onChallengesChange={handleChallengesChange}
                />
              </>
            )}
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
    </div>
  );
}
