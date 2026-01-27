import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FadeDismissQuiz } from "./components/FadeDismissQuiz";
import { UserDashboard } from "./components/UserDashboard";
import {
  Pencil,
  ArrowLeft,
  ChevronDown,
  Play,
  Bot,
  School,
  Book,
  Boxes,
  BotOff,
} from "lucide-react";
import { loadAllUserProgress } from "@utils/loadAllUserProgress";
import type { Subject, Quiz } from "quizTypes";
import { showConfirmationToast } from "@utils/confirmationToast";
import { addDismissedQuiz } from "@utils/dismissedQuizzesFirestore";
import { findQuizById } from "@utils/quizHierarchySearch";
import { useQuizNavigation } from "@features/quiz-browse";

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
  const { navigateToQuiz } = useQuizNavigation();
  const [username] = useState<string>(() => {
    const stored = localStorage.getItem("lqa_username");
    return stored && stored !== "" ? stored : "Gast";
  });

  // Quiz-Metadaten-Map für effiziente Lookup - nur einmal berechnen
  const quizMetadataMap = useMemo(() => {
    const map = new Map<string, QuizMetadata>();
    subjects.forEach(subject => {
      subject.classes?.forEach(classItem => {
        classItem.topics?.forEach(topic => {
          topic.quizzes?.forEach(quiz => {
            map.set(quiz.id, { subject, classItem, topic });
          });
        });
      });
    });
    return map;
  }, [subjects]);

  // Alle Quizze für Vorschläge - memoized
  const allQuizzes = useMemo(() => 
    subjects.flatMap(s => 
      s.classes?.flatMap(c => 
        c.topics?.flatMap(t => t.quizzes || []) || []
      ) || []
    ), [subjects]
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

  // Vorschlags-Accordion State
  const [suggestAccordionOpen, setSuggestAccordionOpen] = useState(false);
  const [suggestedQuizzes, setSuggestedQuizzes] = useState<Quiz[]>([]);
  const [fadingQuizIds, setFadingQuizIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSuggestedQuizzes() {
      try {
        // Lade User-Fortschritt
        const progressObj = await loadAllUserProgress(username);
        const doneQuizIds = new Set(Object.keys(progressObj));
        
        // Lade dismissedQuizzes
        const dismissedQuizIds = new Set(
          await import("@utils/dismissedQuizzesFirestore").then((m) =>
            m.getDismissedQuizzes(username),
          ),
        );
        
        // Finde alle Quizze, die noch nicht begonnen und nicht dismissed wurden
        const notStartedQuizzes = allQuizzes.filter(
          (quiz) =>
            !doneQuizIds.has(quiz.id) &&
            !dismissedQuizIds.has(quiz.id) &&
            quiz.hidden !== true &&
            Array.isArray(quiz.questions) &&
            quiz.questions.length >= 4,
        );
        
        // Shuffle array for random order
        const shuffled = [...notStartedQuizzes].sort(() => Math.random() - 0.5);
        setSuggestedQuizzes(shuffled.slice(0, 5)); // max. 5 Vorschläge
      } catch {
        setSuggestedQuizzes([]);
      }
    }
    fetchSuggestedQuizzes();
  }, [username, allQuizzes]);

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

        {/* Quiz-Vorschläge Section */}
        <div className="mb-8">
          {username !== "Gast" && (
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2 force-break"
                lang="de"
              >
                Noch offen
              </h2>
              <p
                className="text-gray-600 dark:text-gray-400 force-break mb-4"
                lang="de"
              >
                Diese Quizze hast du bisher nicht gestartet.
              </p>
              <button
                type="button"
                onClick={() => setSuggestAccordionOpen((open) => !open)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-lg transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
                aria-expanded={suggestAccordionOpen}
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Vorschläge für dich
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${suggestAccordionOpen ? "rotate-180" : ""}`}
                />
              </button>
              {suggestAccordionOpen && (
                <div className="mt-2 px-4 py-3 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 rounded-lg space-y-3">
                  {suggestedQuizzes.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      Keine neuen Quizze gefunden!
                    </div>
                  ) : (
                    suggestedQuizzes.map((quiz) => {
                      const metadata = quizMetadataMap.get(quiz.id);
                      
                      return (
                        <FadeDismissQuiz
                          key={quiz.id}
                          duration={600}
                          onFadeOut={async () => {
                            setSuggestedQuizzes((prev) =>
                              prev.filter((q) => q.id !== quiz.id),
                            );
                            setFadingQuizIds((prev) => {
                              const next = new Set(prev);
                              next.delete(quiz.id);
                              return next;
                            });
                            await addDismissedQuiz(username, quiz.id);
                          }}
                        >
                          {(triggerFade) => (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {quiz.shortTitle || quiz.title}
                                </span>
                                {/* Tags: Topic, Class, Subject */}
                                {metadata && (metadata.topic?.name || metadata.classItem?.name || metadata.subject?.name) && (
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-2">
                                    {metadata.topic?.name && (
                                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 whitespace-nowrap">
                                        <Boxes className="w-3.5 h-3.5" />
                                        {metadata.topic.name}
                                      </span>
                                    )}
                                    {metadata.classItem?.name && (
                                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        <School className="w-3.5 h-3.5" />
                                        {metadata.classItem.name}
                                      </span>
                                    )}
                                    {metadata.subject?.name && (
                                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                        <Book className="w-3.5 h-3.5" />
                                        {metadata.subject.name}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white font-medium text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 cursor-pointer"
                                  onClick={() =>
                                    handleNavigateToQuiz(quiz.id, "fresh")
                                  }
                                >
                                  <span className="inline sm:hidden">
                                    <Play className="w-5 h-5" />
                                  </span>
                                  <span className="hidden sm:inline">
                                    Starten
                                  </span>
                                </button>
                                <button
                                  className="px-2 py-1 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center cursor-pointer"
                                  title="Nicht mehr vorschlagen"
                                  disabled={fadingQuizIds.has(quiz.id)}
                                  onClick={() => {
                                    showConfirmationToast({
                                      message: `Dieses Quiz nicht mehr vorschlagen?`,
                                      confirmText: "Nicht mehr vorschlagen",
                                      cancelText: "Abbrechen",
                                      onConfirm: () => {
                                        setFadingQuizIds((prev) => {
                                          const next = new Set(prev);
                                          next.add(quiz.id);
                                          return next;
                                        });
                                        triggerFade();
                                      },
                                    });
                                  }}
                                >
                                  <BotOff className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </FadeDismissQuiz>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dashboard */}
          <UserDashboard
            username={username}
            subjects={subjects}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        </div>
      </div>
    </div>
  );
};

export default UserView;