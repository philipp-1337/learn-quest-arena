import UserView from "../user/UserView";
import { useEffect, useState } from "react";
import UsernamePicker from "../user/UsernamePicker";
import UsernameManualEntry from "../user/UsernameManualEntry";
import { Cog, Sword, UserCircle, Trophy, Sparkles, BadgeInfoIcon } from "lucide-react";
import AppHeader, { type MenuItem } from "../shared/AppHeader";
import { useQuizState } from "../../hooks/useQuizState";
import { getAuth } from "firebase/auth";
import { useQuizNavigation } from "../../hooks/useQuizNavigation";
import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import SubjectSelector from "./SubjectSelector";
import ClassSelector from "./ClassSelector";
import TopicSelector from "./TopicSelector";
import { QuizSelector, type QuizStartMode } from "./QuizSelector";
import QuizPlayer from "./QuizPlayer";
import QuizChallengePlayer from "./QuizChallengePlayer";
import Footer from "../footer/Footer";
import type { Subject, Class, Topic, Quiz, QuizChallenge, QuizChallengeLevel } from "../../types/quizTypes";
import type { UserQuizChallengeProgress } from "../../types/userProgress";
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
  const { fetchCollection, saveDocument } = useFirestore();
  const location = useLocation();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<QuizChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<QuizChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<UserQuizChallengeProgress | null>(null);
  // Username ist standardmäßig "Gast", außer es ist ein anderer im LocalStorage gespeichert
  const [username, setUsername] = useState<string>(() => {
    const stored = localStorage.getItem("lqa_username");
    return stored && stored !== "" ? stored : "Gast";
  });
  // Zeige Username-Auswahl nur, wenn explizit gewünscht
  const [showUsernamePicker, setShowUsernamePicker] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showUserView, setShowUserView] = useState(false);
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
  }, [location.search]);

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
    
    // Set the start mode
    setQuizStartMode(mode || 'fresh');

    // Find the subject, class, and topic for this quiz
    const subject = subjects.find((s) =>
      s.classes.some((c) => c.topics.some((t) => t.quizzes.includes(quiz)))
    );

    if (!subject) {
      console.error("Subject not found for quiz:", quiz);
      return;
    }

    const classItem = subject.classes.find((c) =>
      c.topics.some((t) => t.quizzes.includes(quiz))
    );

    if (!classItem) {
      console.error("Class not found for quiz:", quiz);
      return;
    }

    const topic = classItem.topics.find((t) => t.quizzes.includes(quiz));

    if (!topic) {
      console.error("Topic not found for quiz:", quiz);
      return;
    }

    console.log(
      "Navigating to quiz with subject, class, topic:",
      subject,
      classItem,
      topic
    );
    selectQuiz(quiz);
    navigateToQuiz(subject, classItem, topic, quiz);
  };

  const handleBackFromQuiz = () => {
    selectQuiz(null as any); // Explicit cast to satisfy TypeScript
    setSelectedChallenge(null);
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
    setSelectedChallenge(challenge);
    // Load progress for this challenge
    if (username && username !== "Gast") {
      try {
        const progress = await fetchCollection("quizChallengeProgress");
        const userProgress = progress.find(
          (p: { id: string; username?: string; challengeId?: string }) => 
            p.username === username && p.challengeId === challenge.id
        );
        if (userProgress) {
          setChallengeProgress(userProgress as unknown as UserQuizChallengeProgress);
        }
      } catch (error) {
        console.error('Error loading challenge progress:', error);
      }
    }
  };

  const handleChallengeProgressUpdate = async (progress: UserQuizChallengeProgress) => {
    setChallengeProgress(progress);
    if (username && username !== "Gast") {
      await saveDocument(`quizChallengeProgress/${username}_${progress.challengeId}`, progress);
    }
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

  // User Modal anzeigen, wenn gewünscht
  if (showUserView) {
    return (
      <UserView
        username={username}
        onClose={() => setShowUserView(false)}
        onChooseName={() => {
          setShowUserView(false);
          setShowUsernamePicker(true);
          setShowManualEntry(false);
        }}
        subjects={subjects}
      />
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

  // Show Quiz Challenge Player if a challenge is selected
  if (selectedChallenge) {
    return (
      <QuizChallengePlayer
        challenge={selectedChallenge}
        onBack={handleBackFromQuiz}
        onHome={handleReset}
        username={username !== "Gast" ? username : undefined}
        initialProgress={challengeProgress || undefined}
        onProgressUpdate={handleChallengeProgressUpdate}
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
      onClick: () => setShowUserView(true),
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
