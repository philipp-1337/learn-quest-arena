import React, { useEffect, useState } from "react";
import { FadeDismissQuiz } from "./FadeDismissQuiz";
import { Play, School, Book, Boxes, BotOff } from "lucide-react";
import { loadAllUserProgress } from "@utils/loadAllUserProgress";
import { showConfirmationToast } from "@utils/confirmationToast";
import { addDismissedQuiz } from "@utils/dismissedQuizzesFirestore";
import type { Quiz } from "quizTypes";

interface QuizMetadata {
  subject: any;
  classItem: any;
  topic: any;
}

interface QuizSuggestionsProps {
  username: string;
  allQuizzes: Quiz[];
  quizMetadataMap: Map<string, QuizMetadata>;
  onNavigateToQuiz: (quizId: string, mode: "fresh") => void;
}

export const QuizSuggestions: React.FC<QuizSuggestionsProps> = ({
  username,
  allQuizzes,
  quizMetadataMap,
  onNavigateToQuiz,
}) => {
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

  // Nicht anzeigen für Gast-User
  if (username === "Gast") {
    return null;
  }

  return (
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
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 rounded-lg space-y-3">
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
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {quiz.shortTitle || quiz.title}
                      </span>
                      {/* Tags: Topic, Class, Subject */}
                      {metadata &&
                        (metadata.topic?.name ||
                          metadata.classItem?.name ||
                          metadata.subject?.name) && (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mt-2 truncate">
                            {metadata.topic?.name && (
                              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 whitespace-nowrap truncate">
                                <Boxes className="w-3.5 h-3.5" />
                                {metadata.topic.name}
                              </span>
                            )}
                            {metadata.classItem?.name && (
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 whitespace-nowrap truncate">
                                <School className="w-3.5 h-3.5" />
                                {metadata.classItem.name}
                              </span>
                            )}
                            {metadata.subject?.name && (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 whitespace-nowrap truncate">
                                <Book className="w-3.5 h-3.5" />
                                {metadata.subject.name}
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white font-medium text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 cursor-pointer"
                        onClick={() => onNavigateToQuiz(quiz.id, "fresh")}
                      >
                        <span className="inline sm:hidden">
                          <Play className="w-4 h-4" />
                        </span>
                        <span className="hidden sm:inline">Starten</span>
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
    </div>
  );
};
