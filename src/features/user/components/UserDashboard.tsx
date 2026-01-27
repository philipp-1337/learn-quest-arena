import React, { useEffect, useState } from "react";
import { ProgressAccordionItem } from "./ProgressAccordionItem";
import { Zap } from "lucide-react";
import { loadAllUserProgress } from "@utils/loadAllUserProgress";
import { deleteUserQuizProgress } from "@utils/deleteUserQuizProgress";
import { findQuizOnly } from "@utils/quizHierarchySearch";
import type { UserQuizProgress } from "userProgress";
import type { Subject } from "quizTypes";

interface UserDashboardProps {
  username: string;
  subjects: Subject[];
  onNavigateToQuiz: (
    quizId: string,
    mode: "fresh" | "continue" | "review",
  ) => void;
}

interface ProgressItemWithQuiz extends UserQuizProgress {
  quiz?: any;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  username,
  subjects,
  onNavigateToQuiz,
}) => {
  const [progressList, setProgressList] = useState<ProgressItemWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);

  // Fortschritt für ein Quiz entfernen
  const handleRemoveProgress = async (quizId: string) => {
    const removedProgress = progressList.find((p) => p.quizId === quizId);
    
    await deleteUserQuizProgress(username, quizId);
    setProgressList((list) => list.filter((p) => p.quizId !== quizId));
    
    // XP neu berechnen - mit Null-Check
    if (removedProgress?.xp) {
      setTotalXP(prev => prev - removedProgress.xp!);
    }
  };

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        const progressObj: Record<string, UserQuizProgress> =
          await loadAllUserProgress(username);
        const allProgress: UserQuizProgress[] = Object.values(progressObj);
        allProgress.sort((a, b) => {
          // Zuerst incomplete nach oben (false > true = -1)
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Dann nach lastUpdated absteigend
          return b.lastUpdated - a.lastUpdated;
        });

        // Quiz-Daten enrichen
        const enrichedProgress: ProgressItemWithQuiz[] = allProgress.map(
          (progress) => ({
            ...progress,
            quiz: findQuizOnly(subjects, progress.quizId),
          }),
        );

        setProgressList(enrichedProgress);

        // Berechne Gesamt-XP: Summiere XP von allen Quizzes
        const calculatedTotalXP = allProgress.reduce(
          (sum, progress) => sum + (progress.xp || 0),
          0,
        );
        setTotalXP(calculatedTotalXP);
      } catch {
        setProgressList([]);
        setTotalXP(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [username, subjects]);

  const toggleItem = (quizId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
      }
      return newSet;
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 force-break">
        Dein Fortschritt
      </h2>

      {/* Total XP Display */}
      {totalXP > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/40 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/60 p-3 rounded-full">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wide">
                  Gesamt-Erfahrung
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-200">
                  {totalXP} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 dark:text-gray-400">
          Lade Fortschritt...
        </div>
      ) : progressList.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400">
          {username === "Gast"
            ? "Wähle deinen Namen, wenn du Fortschritt speichern willst."
            : "Kein Fortschritt vorhanden."}
        </div>
      ) : (
        <div className="space-y-2">
          {progressList.map((progress) => (
            <ProgressAccordionItem
              key={progress.quizId}
              progress={progress}
              isOpen={openItems.has(progress.quizId)}
              onToggle={() => toggleItem(progress.quizId)}
              onNavigateToQuiz={(mode) =>
                onNavigateToQuiz(progress.quizId, mode)
              }
              onRemoveProgress={handleRemoveProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};