import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginView from './components/loginView';
import StudentView from './components/quizView';
import AdminView from './components/adminView';
import type { Subject } from './types/quizTypes';
import useFirestore from "./hooks/useFirestore";

// ============================================
// MOCK DATA & AUTH
// ============================================

// Mock Database
const mockDatabase = {
  subjects: [
    { 
      id: '1', 
      name: 'Deutsch', 
      order: 1,
      classes: [
        { 
          id: '1-1', 
          name: 'Klasse 1', 
          level: 1,
          topics: [
            {
              id: '1-1-1',
              name: 'Alphabet',
              quizzes: [
                {
                  id: '1-1-1-1',
                  title: 'Buchstaben erkennen',
                  questions: [
                    {
                      question: 'Welcher Buchstabe kommt nach A?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: 'B' },
                        { type: 'text', content: 'C' },
                        { type: 'text', content: 'D' }
                      ],
                      correctAnswerIndex: 0
                    },
                    {
                      question: 'Welcher Buchstabe ist ein Vokal?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: 'B' },
                        { type: 'text', content: 'E' },
                        { type: 'text', content: 'K' }
                      ],
                      correctAnswerIndex: 1
                    },
                    {
                      question: 'Wie viele Buchstaben hat das ABC?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: '24' },
                        { type: 'text', content: '26' },
                        { type: 'text', content: '28' }
                      ],
                      correctAnswerIndex: 1
                    }
                  ]
                }
              ]
            }
          ]
        },
        { 
          id: '1-2', 
          name: 'Klasse 2', 
          level: 2,
          topics: [
            {
              id: '1-2-1',
              name: 'Wortarten',
              quizzes: [
                {
                  id: '1-2-1-1',
                  title: 'Nomen erkennen',
                  questions: [
                    {
                      question: 'Was ist ein Nomen?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: 'Ein Wort für Dinge' },
                        { type: 'text', content: 'Ein Wort für Tun' },
                        { type: 'text', content: 'Ein Wort für Wie' }
                      ],
                      correctAnswerIndex: 0
                    },
                    {
                      question: 'Welches Wort ist ein Nomen?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: 'laufen' },
                        { type: 'text', content: 'Hund' },
                        { type: 'text', content: 'schnell' }
                      ],
                      correctAnswerIndex: 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    { 
      id: '2', 
      name: 'Mathematik', 
      order: 2,
      classes: [
        { 
          id: '2-1', 
          name: 'Klasse 1', 
          level: 1,
          topics: [
            {
              id: '2-1-1',
              name: 'Addition',
              quizzes: [
                {
                  id: '2-1-1-1',
                  title: 'Zahlen addieren',
                  questions: [
                    {
                      question: 'Was ist 2 + 3?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: '4' },
                        { type: 'text', content: '5' },
                        { type: 'text', content: '6' }
                      ],
                      correctAnswerIndex: 1
                    },
                    {
                      question: 'Was ist 1 + 1?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: '2' },
                        { type: 'text', content: '3' },
                        { type: 'text', content: '1' }
                      ],
                      correctAnswerIndex: 0
                    },
                    {
                      question: 'Was ist 5 + 2?',
                      answerType: 'text',
                      answers: [
                        { type: 'text', content: '6' },
                        { type: 'text', content: '7' },
                        { type: 'text', content: '8' }
                      ],
                      correctAnswerIndex: 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function FlashcardQuizApp() {
  const { fetchCollection } = useFirestore();
  const [subjects, setSubjects] = useState(mockDatabase.subjects);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Simple routing: Check URL for quiz deep link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/quiz/')) {
      // Format: #/quiz/{subjectId}/{classId}/{topicId}/{quizId}
      // This will be handled in StudentView
    }
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      const subjectsData = await fetchCollection("subjects");
      const formattedSubjects = subjectsData.map((subject: any) => ({
        id: subject.id,
        name: subject.name || "",
        order: subject.order || 0,
        classes: subject.classes || [],
      }));
      setSubjects(formattedSubjects);
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
    console.log('Subjects updated:', updatedSubjects);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('Logged out');
    navigate('/'); // Navigiere zurück zum StudentView
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    console.log('Logged in');
  };

  // Removed unused handleSaveQuiz function to resolve the compile error.

  function App() {
    return (
      <Routes>
        <Route
          path="/"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
        <Route
          path="/admin"
          element={
            <AdminView
              subjects={subjects}
              onSubjectsChange={handleSubjectsChange}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/login"
          element={<LoginView onLogin={handleLogin} onBack={() => navigate('/')} />}
        />
        <Route
          path="/quiz/:subjectSlug/:classSlug/:topicSlug/:quizSlug"
          element={<StudentView subjects={subjects} onAdminClick={handleAdminClick} />}
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <App />
    </div>
  );
}