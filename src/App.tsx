import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LoginView from './components/loginView';
import StudentView from './components/quizView';
import AdminView from './components/admin/AdminView';
import type { Subject } from './types/quizTypes';
import useFirestore from "./hooks/useFirestore";
import ProtectedRoute from './utils/ProtectedRoute';

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function FlashcardQuizApp() {
  const { fetchCollection } = useFirestore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load subjects from Firestore
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        console.log('🔄 Loading subjects from Firestore...');
        setIsLoading(true);
        setError(null);
        
        const subjectsData = await fetchCollection("subjects");
        console.log('📦 Subjects data received:', subjectsData);
        
        // Handle empty collection
        if (!subjectsData || subjectsData.length === 0) {
          console.log('⚠️ No subjects found in Firestore - using empty array');
          setSubjects([]);
          setIsLoading(false);
          return;
        }
        
        const formattedSubjects = subjectsData.map((subject: any) => ({
          id: subject.id,
          name: subject.name || "",
          order: subject.order || 0,
          classes: subject.classes || [],
        }));
        
        console.log('✅ Subjects loaded successfully:', formattedSubjects);
        setSubjects(formattedSubjects);
      } catch (error) {
        console.error('❌ Error loading subjects:', error);
        setError(error instanceof Error ? error.message : 'Fehler beim Laden der Daten');
        // Set empty array on error so app can still load
        setSubjects([]);
      } finally {
        setIsLoading(false);
        console.log('✅ Loading complete');
      }
    };
    
    loadSubjects();
    
  }, [fetchCollection]);

  const handleAdminClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/admin');
    }
  };

  const handleSubjectsChange = (updatedSubjects: Subject[]) => {
    if (JSON.stringify(subjects) !== JSON.stringify(updatedSubjects)) {
      console.log('Subjects updated:', updatedSubjects);
      setSubjects(updatedSubjects);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">{error}</p>
              <p className="text-xs text-yellow-600 mt-1">Die App funktioniert trotzdem. Du kannst im Admin-Bereich Fächer hinzufügen.</p>
            </div>
          </div>
        </div>
      )}
      
      <Routes>
        <Route
          path="/"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminView
                subjects={subjects}
                onSubjectsChange={handleSubjectsChange}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={<LoginView onLogin={handleLogin} onBack={() => navigate('/')} />}
        />
        <Route
          path="/quiz"
          element={<Navigate to="/" replace />}
        />
        <Route
          path="/quiz/:subjectSlug"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug/:topicSlug"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug/:topicSlug/:quizSlug"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
      </Routes>
    </div>
  );
}