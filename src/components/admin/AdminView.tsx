import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { Upload, Download, Sparkles, BadgeInfoIcon } from "lucide-react";
import type { Subject, QuizChallenge } from "../../types/quizTypes";
import useFirestore from "../../hooks/useFirestore";
import { useStatsCalculation } from "../../hooks/useStatsCalculation";
import AdminHeader from "./AdminHeader";
import AdminStats from "./AdminStats";
import QRCodeInfo from "./QRCodeInfo";
import ImportModal from "../modals/ImportModal";
import ExportModal from "../modals/ExportModal";
import AdminProfileView from "./AdminProfileView";
import QuizListManager from "./QuizListManager";
import QuizChallengeManager from "./QuizChallengeManager";

// ============================================
// ADMIN VIEW COMPONENT
// ============================================

interface AdminViewProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onLogout: () => void;
  onRefetch?: () => Promise<void>;
}

export default function AdminView({
  subjects: initialSubjects,
  onSubjectsChange,
  onLogout,
  onRefetch,
}: AdminViewProps) {
  const { fetchCollection } = useFirestore();
  const [subjects] = useState<Subject[]>(initialSubjects);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [challenges, setChallenges] = useState<QuizChallenge[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'challenge'>('quiz');
  const [quizListKey, setQuizListKey] = useState(0);
  const auth = getAuth();

  // Custom Hooks
  const stats = useStatsCalculation(subjects);

  // Sync changes back to parent
  useEffect(() => {
    onSubjectsChange(subjects);
  }, [subjects, onSubjectsChange]);

  useEffect(() => {
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

  const handleAbbreviationUpdated = () => {
    // Force QuizListManager to re-render and reload data
    setQuizListKey(prev => prev + 1);
  };

  // Show Profile Modal as full-screen view
  if (showProfileModal) {
    return (
      <AdminProfileView
        onClose={() => setShowProfileModal(false)}
        onAbbreviationUpdated={handleAbbreviationUpdated}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <AdminHeader 
          onProfileClick={() => setShowProfileModal(true)}
        />

        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <AdminStats
            totalSubjects={stats.totalSubjects}
            totalTopics={stats.totalTopics}
            totalQuizzes={stats.totalQuizzes}
            totalQuestions={stats.totalQuestions}
          />

          {/* Content Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Tab Navigation */}
            <div className="overflow-x-auto mb-6 -mx-6 px-6">
              <div className="flex gap-4 min-w-max">
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === 'quiz'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  Standard Quiz
                </button>
                <button
                  onClick={() => setActiveTab('challenge')}
                  className={`relative pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === 'challenge'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  Quiz-Challenge
                  <span className="absolute top-0 right-1 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                  </span>
                </button>
              </div>
            </div>

            {activeTab === 'quiz' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white force-break" lang="de">Quiz verwalten</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-md text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      title="Quiz exportieren"
                      aria-label="Quiz exportieren"
                    >
                      <Download className="w-4 h-4" />
                      <span className="max-[640px]:hidden">Exportieren</span>
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-md text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                      title="Quiz importieren"
                      aria-label="Quiz importieren"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="max-[640px]:hidden">Importieren</span>
                    </button>
                  </div>
                </div>

                <QuizListManager key={quizListKey} onRefetch={onRefetch} />
              </>
            )}

            {activeTab === 'challenge' && (
              <>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <BadgeInfoIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-2">
                        BETA Feature
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                          <Sparkles className="w-3 h-3" />
                          BETA
                        </span>
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-400">
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

        {/* Import Modal */}
        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onImportComplete={async () => {
              setShowImportModal(false);
              if (onRefetch) await onRefetch();
            }}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
}
