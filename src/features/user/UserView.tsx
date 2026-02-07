import React, { useState, useMemo } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UserDashboard } from "./components/UserDashboard";
import { QuizSuggestions } from "./components/QuizSuggestions";
import { WrongQuestionsPool } from "./WrongQuestionsPool";
import QuizPlayer from "@quiz-player/components/QuizPlayer";
import {
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { loadAllUserProgress } from "@utils/loadAllUserProgress";
import type { Subject, Quiz } from "quizTypes";
import { showConfirmationToast } from "@utils/confirmationToast";
import { findQuizById } from "@utils/quizHierarchySearch";
import { useQuizNavigation } from "@features/quiz-browse";
import type { QuizPlayerInitialState } from "@hooks/useQuizPlayer";
import type { UserQuizProgress } from "userProgress";

interface UserViewProps {
  subjects: Subject[];
}

interface QuizMetadata {
  subject: Subject;
  classItem: any;
  topic: any;
}

const UserView: React.FC<UserViewProps> = ({ subjects }) => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const { navigateToQuiz } = useQuizNavigation();
  const [wrongPoolSession, setWrongPoolSession] = useState<{
    quiz: Quiz;
    initialState: QuizPlayerInitialState;
    originProgressByQuizId: Record<string, UserQuizProgress>;
  } | null>(null);
  const [username] = useState<string>(() => {
    const stored = localStorage.getItem("lqa_username");
    return stored && stored !== "" ? stored : "Gast";
  });

  const activeTab = tab ?? "name";

  const tabs = [
    { id: "name", label: "Nutzername" },
    { id: "progress", label: "Fortschritt" },
    { id: "suggestions", label: "Vorschläge" },
    { id: "wrong-questions", label: "Falsche Fragen" },
  ];

  // Quiz-Metadaten-Map für effiziente Lookup - nur einmal berechnen
  const quizMetadataMap = useMemo(() => {
    const map = new Map<string, QuizMetadata>();
    subjects.forEach((subject) => {
      subject.classes?.forEach((classItem) => {
        classItem.topics?.forEach((topic) => {
          topic.quizzes?.forEach((quiz) => {
            map.set(quiz.id, { subject, classItem, topic });
          });
        });
      });
    });
    return map;
  }, [subjects]);

  // Alle Quizze für Vorschläge - memoized
  const allQuizzes = useMemo(
    () =>
      subjects.flatMap(
        (s) =>
          s.classes?.flatMap(
            (c) => c.topics?.flatMap((t) => t.quizzes || []) || [],
          ) || [],
      ),
    [subjects],
  );

  const handleClose = () => {
    navigate("/");
  };

  const handleChooseName = () => {
    navigate("/?chooseName=true");
  };

  const handleNavigateToQuiz = (
    quizId: string,
    mode: "fresh" | "continue" | "review",
  ) => {
    const result = findQuizById(subjects, quizId);
    if (result) {
      const { quiz, subject, classItem, topic } = result;
      navigateToQuiz(subject, classItem, topic, quiz, mode);
    }
  };

  if (wrongPoolSession) {
    return (
      <QuizPlayer
        quiz={wrongPoolSession.quiz}
        onBack={() => setWrongPoolSession(null)}
        onHome={() => {
          setWrongPoolSession(null);
          navigate("/");
        }}
        username={username}
        initialStateOverride={wrongPoolSession.initialState}
        originProgressByQuizId={wrongPoolSession.originProgressByQuizId}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleClose}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group cursor-pointer"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>

        {/* Main Heading */}
        <h1
          className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 force-break"
          lang="de"
        >
          Profil
        </h1>

        {/* Tabs */}
        <nav className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <NavLink
              key={item.id}
              to={`/user/${item.id}`}
              className={({ isActive }) =>
                [
                  "px-3 py-2 rounded-lg text-sm font-semibold transition-colors border",
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-300",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {activeTab === "name" && (
          <>
            {/* Header */}
            <div className="mb-4">
              <h2
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2 force-break"
                lang="de"
              >
                Nutzername
              </h2>
              <p className="text-gray-600 dark:text-gray-400 force-break" lang="de">
                {username === "Gast"
                  ? "Du hast noch keinen Namen. Klicke auf das Stift-Icon, um einen auszuwählen."
                  : "Dein zufällig generierter Nutzername"}
              </p>
            </div>

            {/* Username Display mit Icon-Button */}
            <div className="mb-6 flex items-center justify-between text-2xl text-gray-800 dark:text-gray-200 font-mono break-all select-all border border-gray-200 dark:border-gray-700 rounded-lg py-4 px-4 bg-gray-50 dark:bg-gray-900">
              <span className="truncate">{username}</span>
              <button
                onClick={async (_) => {
                  // Fortschritt laden
                  let hasProgress = false;
                  try {
                    const progressObj = await loadAllUserProgress(username);
                    hasProgress = Object.keys(progressObj).length > 0;
                  } catch (e) {
                    hasProgress = false;
                  }
                  if (username !== "Gast" || hasProgress) {
                    showConfirmationToast({
                      message:
                        "Wenn du deinen Namen änderst, siehst du deinen Fortschritt nicht mehr. Bist du sicher?",
                      onConfirm: handleChooseName,
                      confirmText: "Weiter",
                      cancelText: "Abbrechen",
                    });
                  } else {
                    handleChooseName();
                  }
                }}
                onMouseDown={(e) => {
                  // Prevent selection of the username span when clicking the button
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="ml-2 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors relative cursor-pointer"
                title="Anderen Namen wählen"
                aria-label="Anderen Namen wählen"
                type="button"
              >
                <Pencil
                  className={`w-5 h-5 ${
                    username === "Gast" ? "animate-pulse" : ""
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {activeTab === "wrong-questions" && (
          <WrongQuestionsPool
            username={username}
            allQuizzes={allQuizzes}
            onStartWrongPool={(quiz, initialState, originProgressByQuizId) => {
              setWrongPoolSession({ quiz, initialState, originProgressByQuizId });
            }}
          />
        )}

        {activeTab === "suggestions" && (
          <QuizSuggestions
            username={username}
            allQuizzes={allQuizzes}
            quizMetadataMap={quizMetadataMap}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}

        {activeTab === "progress" && (
          <UserDashboard
            username={username}
            subjects={subjects}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}
      </div>
    </div>
  );
};

export default UserView;
