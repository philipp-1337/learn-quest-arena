import { useEffect, useState } from "react";
import UsernamePicker from "../user/UsernamePicker";
import UsernameManualEntry from "../user/UsernameManualEntry";
import { Cog, Sword, UserCircle, Trophy, Sparkles, BadgeInfoIcon, Play, Flame } from "lucide-react";
import AppHeader, { type MenuItem } from "../shared/AppHeader";
import { useQuizState } from "../../hooks/useQuizState";
import { getAuth } from "firebase/auth";
import { useQuizNavigation } from "../../hooks/useQuizNavigation";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import SubjectSelector from "./SubjectSelector";
import ClassSelector from "./ClassSelector";
import TopicSelector from "./TopicSelector";
import { QuizSelector, type QuizStartMode } from "./QuizSelector";
import QuizPlayer from "./QuizPlayer";
import Footer from "../footer/Footer";
import type { Subject, Class, Topic, Quiz, QuizChallenge, QuizChallengeLevel } from "../../types/quizTypes";
import type { QuizDocument } from "../../types/quizTypes";
import { loadAllQuizDocuments } from "../../utils/quizzesCollection";
import useFirestore from "../../hooks/useFirestore";
import { 
  filterVisibleSubjects, 
  filterVisibleClasses, 
  filterVisibleTopics, 
  filterVisibleQuizzes 
} from "../../utils/quizVisibilityHelpers";

interface QuizViewProps {
  subjects: Subject[];
  onAdminClick: () => void;
}

export default function QuizView({
  subjects: initialSubjects,
  onAdminClick,
}: QuizViewProps) {
  const { fetchCollection } = useFirestore();
  const location = useLocation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<QuizChallenge[]>([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState<QuizDocument[]>([]);
  // Username ist standardmäßig "Gast", außer es ist ein anderer im LocalStorage gespeichert
  const [username, setUsername] = useState<string>(() => {
    const stored = localStorage.getItem("lqa_username");
    return stored && stored !== "" ? stored : "Gast";
  });
  // Zeige Username-Auswahl nur, wenn explizit gewünscht
  const [showUsernamePicker, setShowUsernamePicker] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quizStartMode, setQuizStartMode] = useState<QuizStartMode>('fresh');

  const {
    selectedSubject,
    selectedClass,
    selectedTopic,
    selectedQuiz,
    selectSubject,
    selectClass,
    selectTopic,
    selectQuiz,
    resetSelection,
  } = useQuizState({ subjects, loading });

  const {
    navigateToSubject,
    navigateToClass,
    navigateToTopic,
    navigateToQuiz,
    navigateToHome,
  } = useQuizNavigation();

  // Update subjects when prop changes (admin made changes)
  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  // Read quiz start mode from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    if (mode === 'fresh' || mode === 'continue' || mode === 'review') {
      setQuizStartMode(mode);
    }
    
    // Check if we should open the username picker
    const chooseName = searchParams.get('chooseName');
    if (chooseName === 'true') {
      setShowUsernamePicker(true);
      // Remove the query parameter from URL
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  // Check if data is loaded
  useEffect(() => {
    // Set loading to false once we have received the initial subjects (even if empty)
    setLoading(false);
  }, [initialSubjects]);

  // Check Firebase Auth status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Load quiz challenges
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const loadedChallenges = await fetchCollection("quizChallenges");
        const formattedChallenges: QuizChallenge[] = loadedChallenges.map((challenge: { 
          id: string; 
          title?: string; 
          levels?: QuizChallengeLevel[]; 
          hidden?: boolean 
        }) => ({
          id: challenge.id,
          title: challenge.title || "",
          levels: challenge.levels || [],
          hidden: challenge.hidden || false,
        }));
        setChallenges(formattedChallenges.filter(c => !c.hidden));
      } catch (error) {
        console.error('Error loading challenges:', error);
      }
    };
    loadChallenges();
  }, [fetchCollection]);

  // Load featured quizzes (newest 3, visible, >3 questions)
  useEffect(() => {
    const fetchFeaturedQuizzes = async () => {
      try {
        const allQuizzes = await loadAllQuizDocuments();
        const visibleQuizzes = allQuizzes
          .filter(q => !q.hidden && Array.isArray(q.questions) && q.questions.length > 3)
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        setFeaturedQuizzes(visibleQuizzes.slice(0, 3));
      } catch (err) {
        console.error("Error loading featured quizzes:", err);
      }
    };
    fetchFeaturedQuizzes();
  }, []);

  const handleReset = () => {
    resetSelection();
    navigateToHome();
  };

  const handleSubjectSelect = (subject: Subject) => {
    selectSubject(subject);
    navigateToSubject(subject);
  };

  const handleClassSelect = (classItem: Class) => {
    if (!selectedSubject) return;
    selectClass(classItem);
    navigateToClass(selectedSubject, classItem);
  };

  const handleTopicSelect = (topic: Topic) => {
    if (!selectedSubject || !selectedClass) return;
    selectTopic(topic);
    navigateToTopic(selectedSubject, selectedClass, topic);
  };

  const handleQuizSelect = (quiz: Quiz, mode?: QuizStartMode) => {
    console.log("Selected quiz:", quiz, "mode:", mode);
    setQuizStartMode(mode || 'fresh');

    // Support QuizDocument (from featuredQuizzes) and legacy Quiz
    let subject: Subject | undefined;
    let classItem: Class | undefined;
    let topic: Topic | undefined;

    // If quiz has subjectId/classId/topicId, use those for lookup
    const hasIds = (quiz as any).subjectId && (quiz as any).classId && (quiz as any).topicId;
    if (hasIds) {
      subject = subjects.find(s => s.id === (quiz as any).subjectId);
      classItem = subject?.classes.find(c => c.id === (quiz as any).classId);
      topic = classItem?.topics.find(t => t.id === (quiz as any).topicId);
    } else {
      // Fallback: legacy lookup
      subject = subjects.find((s) =>
        s.classes.some((c) => c.topics.some((t) => t.quizzes.includes(quiz)))
      );
      classItem = subject?.classes.find((c) =>
        c.topics.some((t) => t.quizzes.includes(quiz))
      );
      topic = classItem?.topics.find((t) => t.quizzes.includes(quiz));
    }

    if (!subject) {
      console.error("Subject not found for quiz:", quiz);
      return;
    }
    if (!classItem) {
      console.error("Class not found for quiz:", quiz);
      return;
    }
    if (!topic) {
      console.error("Topic not found for quiz:", quiz);
      return;
    }

    console.log("Navigating to quiz with subject, class, topic:", subject, classItem, topic);
    selectQuiz(quiz);
    navigateToQuiz(subject, classItem, topic, quiz);
  };

  const handleBackFromQuiz = () => {
    selectQuiz(null as any); // Explicit cast to satisfy TypeScript
    setQuizStartMode('fresh'); // Reset the mode when going back
    navigateToHome();
  };

  const handleNavigateToSubject = () => {
    if (!selectedSubject) return;
    selectClass(null as any);
    selectTopic(null as any); // Explicit cast to satisfy TypeScript
    navigateToSubject(selectedSubject);
  };

  const handleNavigateToClass = () => {
    if (!selectedSubject || !selectedClass) return;

    // Ensure selectTopic can handle null
    selectTopic(null as any); // Explicit cast to satisfy TypeScript
    navigateToClass(selectedSubject, selectedClass);
  };

  const handleChallengeSelect = async (challenge: QuizChallenge) => {
    // Navigate to the challenge route
    navigate(`/challenge/${challenge.id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Username-Auswahl nur anzeigen, wenn explizit gewünscht
  if (showUsernamePicker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Wähle deinen Nutzernamen</h2>
          {!showManualEntry ? (
            <UsernamePicker
              onUsernameSelected={(name) => {
                if (name === "skip") {
                  setUsername("Gast");
                  localStorage.setItem("lqa_username", "Gast");
                  setShowUsernamePicker(false);
                } else {
                  setUsername(name);
                  localStorage.setItem("lqa_username", name);
                  setShowUsernamePicker(false);
                }
              }}
              onManualEntryRequested={() => setShowManualEntry(true)}
            />
          ) : (
            <UsernameManualEntry
              onUsernameSelected={(name) => {
                setUsername(name);
                localStorage.setItem("lqa_username", name);
                setShowUsernamePicker(false);
              }}
              onBack={() => setShowManualEntry(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // Show QuizPlayer if a quiz is selected
  if (selectedQuiz) {
    // Wenn kein Username gesetzt ist oder Username "Gast" ist, QuizPlayer ohne username-Prop (kein Fortschritt)
    if (!username || username === "Gast") {
      return (
        <QuizPlayer
          quiz={selectedQuiz}
          onBack={handleBackFromQuiz}
          onHome={handleReset}
        />
      );
    }
    return (
      <QuizPlayer
        quiz={selectedQuiz}
        onBack={handleBackFromQuiz}
        onHome={handleReset}
        username={username}
        startMode={quizStartMode}
      />
    );
  }

  // Gefilterte Daten
  const visibleSubjects = filterVisibleSubjects(subjects);
  const visibleClasses = selectedSubject
    ? filterVisibleClasses(selectedSubject.classes)
    : [];
  const visibleTopics = selectedClass
    ? filterVisibleTopics(selectedClass.topics)
    : [];

  const menuItems: MenuItem[] = [
    {
      icon: UserCircle,
      label: username !== "Gast" ? username : "Gast",
      onClick: () => navigate('/user'),
      hasNotification: username === "Gast",
    },
    {
      icon: Cog,
      label: "Admin",
      onClick: onAdminClick,
    },
  ];

  const headerIcon = (
    <svg className="inline w-7 h-7 ml-1" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="swordGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(221 83% 53%)" />  {/* blue-500 */}
          <stop offset="100%" stopColor="hsl(264 79% 61%)" /> {/* purple-500 */}
        </linearGradient>
      </defs>
      <Sword stroke="url(#swordGradient)" strokeWidth={2} />
    </svg>
  );

  const breadcrumbComponent = (
    <Breadcrumb
      selectedSubject={selectedSubject}
      selectedClass={selectedClass}
      selectedTopic={selectedTopic}
      onNavigateHome={handleReset}
      onNavigateToSubject={handleNavigateToSubject}
      onNavigateToClass={handleNavigateToClass}
    />
  );

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="max-w-4xl mx-auto w-full flex-1">
        {/* Header */}
        <AppHeader
          title="Learn Quest"
          subtitle="Fordere dein Wissen heraus!"
          titleIcon={headerIcon}
          menuItems={menuItems}
          breadcrumb={breadcrumbComponent}
          />
          {/* Feature Section: Newest 3 visible quizzes with >3 questions */}
          {!selectedSubject && featuredQuizzes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-8 h-8 text-indigo-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Neue Quizze</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {featuredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="relative flex flex-col h-full">
                    <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-left flex-1">
                            <h3 className="text-2xl font-bold mb-2 force-break" lang="de">{quiz.title}</h3>
                            <p className="text-indigo-100">{quiz.questions.length} Fragen</p>
                            {quiz.topicName && <p className="text-xs text-purple-200 mt-1">{quiz.topicName}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => handleQuizSelect(quiz)}
                          className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                          title={quiz.title}
                          aria-label={quiz.title}
                        >
                          <Play className="w-6 h-6" />
                          <span>Quiz starten</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Quiz Challenge Section - Show before subject selection */}
        {!selectedSubject && challenges.length > 0 && isAuthenticated && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl shadow-lg p-6 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz-Challenge</h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                <Sparkles className="w-3 h-3" />
                BETA
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Stelle dich der ultimativen Herausforderung! Beantworte Fragen auf 15 verschiedenen Schwierigkeitsstufen und gewinne bis zu 1 Million Euro!
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-4">
              <BadgeInfoIcon className="w-4 h-4 inline-block mr-1 mb-1" /> Dieses Feature befindet sich in der Beta-Phase und ist nur für Lehrkräfte und Administration sichtbar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => handleChallengeSelect(challenge)}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow border-2 border-yellow-200 dark:border-yellow-700 hover:border-yellow-400 dark:hover:border-yellow-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        15 Levels • 2 Sicherheitsstufen
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content - Conditional Rendering based on selection */}
        {!selectedSubject && (
          <SubjectSelector
            subjects={visibleSubjects}
            onSelect={handleSubjectSelect}
          />
        )}

        {selectedSubject && !selectedClass && (
          <ClassSelector
            classes={visibleClasses}
            onSelect={handleClassSelect}
          />
        )}

        {selectedClass && !selectedTopic && (
          <TopicSelector topics={visibleTopics} onSelect={handleTopicSelect} />
        )}

        {selectedTopic &&
          (username ? (
            <QuizSelector
              quizzes={filterVisibleQuizzes(selectedTopic.quizzes)}
              onSelect={handleQuizSelect}
              username={username}
            />
          ) : (
            <QuizSelector
              quizzes={filterVisibleQuizzes(selectedTopic.quizzes)}
              onSelect={handleQuizSelect}
            />
          ))}
      </div>
      <Footer />
    </div>
  );
}
