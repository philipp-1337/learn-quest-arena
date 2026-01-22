import { useState, useEffect } from "react";
import LoadingScreen from "./features/shared/LoadingScreen";
import MaintenanceView from "./features/shared/MaintenanceView";
import Toaster from "./utils/ToasterProvider";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import QuizEditLayout from "./features/admin/quiz-editor/components/QuizEditLayout";
import LoginView from "./features/login/LoginView";
import { QuizBrowser } from "./features/quiz-browse";
import AdminView from "./features/admin/dashboard/components/AdminView";
import AdminProfileView from "./features/admin/dashboard/components/AdminProfileView";
import QuizEditorView from "./features/admin/quiz-editor/components/QuizEditorView";
import QuestionEditorView from "./features/admin/question-editor/components/QuestionEditorView";
import UserRoleManagerView from "./features/admin/user-management/components/UserRoleManagerView";
import UserView from "./features/user/UserView";
import QuizChallengePlayer from "./features/quiz/QuizChallengePlayer";
import Dataprotection from "./features/footer/Dataprotection";
import Imprint from "./features/footer/Imprint";
import type { Subject } from "./types/quizTypes";
import useMaintenanceMode from "./hooks/useMaintenanceMode";
import ProtectedRoute from "./utils/ProtectedRoute";
import useScrollToTop from "./hooks/useScrollToTop";
import { getAuth } from "firebase/auth";
import { useQuizzesFromCollection } from "./hooks/useQuizzesFromCollection";
import { usePwaPrompt } from "./hooks/usePwaPrompt";
import { usePwaUpdate } from "./hooks/usePwaUpdate";
import { AlertTriangle } from "lucide-react";

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function FlashcardQuizApp() {
  const {
    subjects: quizSubjects,
    loading: quizzesLoading,
    error: quizzesError,
    refetch,
  } = useQuizzesFromCollection();
  const { isMaintenanceMode, isLoading: maintenanceLoading } =
    useMaintenanceMode();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Scroll to top when route changes
  useScrollToTop();

  // PWA Support
  usePwaPrompt();
  usePwaUpdate();

  // Update subjects when quizzes are loaded from collection
  useEffect(() => {
    if (!quizzesLoading) {
      console.log("Quizzes loaded from collection, subjects:", quizSubjects);
      setSubjects(quizSubjects);
      setIsLoading(false);
      if (quizzesError) {
        setError(quizzesError);
      }
    }
  }, [quizSubjects, quizzesLoading, quizzesError]);

  const handleAdminClick = () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      navigate("/login");
    } else {
      navigate("/admin");
    }
  };

  const handleSubjectsChange = (updatedSubjects: Subject[]) => {
    if (JSON.stringify(subjects) !== JSON.stringify(updatedSubjects)) {
      console.log("Subjects updated:", updatedSubjects);
      setSubjects(updatedSubjects);
    }
  };

  const handleRefetchQuizzes = async () => {
    await refetch();
  };

  const handleLogout = () => {
    const auth = getAuth();
    if (auth.currentUser) {
      auth.signOut();
    }
    navigate("/");
  };

  // handleLogin wird nicht mehr benötigt, da Auth-Status direkt von Firebase kommt
  const handleLogin = () => {};

  if (isLoading || maintenanceLoading) {
    return <LoadingScreen />;
  }

  // Zeige Wartungsseite, wenn Wartungsmodus aktiv ist
  if (isMaintenanceMode) {
    return <MaintenanceView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: { pointerEvents: "auto" },
        }}
      />
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {error}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Die App funktioniert trotzdem. Du kannst im Admin-Bereich Fächer
                hinzufügen.
              </p>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <QuizBrowser subjects={subjects} onAdminClick={handleAdminClick} />
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminView
                subjects={subjects}
                onSubjectsChange={handleSubjectsChange}
                onRefetch={handleRefetchQuizzes}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <LoginView onLogin={handleLogin} onBack={() => navigate("/")} />
          }
        />
        <Route path="/user" element={<UserView subjects={subjects} />} />
        <Route
          path="/challenge/:challengeId"
          element={<QuizChallengePlayer />}
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminProfileView onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute>
              <UserRoleManagerView onBack={() => navigate("/admin")} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quiz/edit/:id"
          element={
            <ProtectedRoute>
              <QuizEditLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes - diese werden im Outlet gerendert */}
          <Route index element={<QuizEditorView />} />
          <Route path="question/new" element={<QuestionEditorView />} />
          <Route path="question/:index" element={<QuestionEditorView />} />
        </Route>
        <Route path="/quiz" element={<Navigate to="/" replace />} />
        <Route
          path="/quiz/:subjectSlug"
          element={
            <QuizBrowser subjects={subjects} onAdminClick={handleAdminClick} />
          }
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug"
          element={
            <QuizBrowser subjects={subjects} onAdminClick={handleAdminClick} />
          }
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug/:topicSlug"
          element={
            <QuizBrowser subjects={subjects} onAdminClick={handleAdminClick} />
          }
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug/:topicSlug/:quizSlug"
          element={
            <QuizBrowser subjects={subjects} onAdminClick={handleAdminClick} />
          }
        />
        <Route path="/datenschutz" element={<Dataprotection />} />
        <Route path="/impressum" element={<Imprint />} />
      </Routes>
    </div>
  );
}
