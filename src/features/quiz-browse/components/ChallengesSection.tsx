import { Trophy, Sparkles, BadgeInfoIcon } from 'lucide-react';
import { useChallenges } from '../hooks/useChallenges';
import type { QuizChallenge } from "quizTypes";

interface ChallengesSectionProps {
  isAuthenticated: boolean;
  onChallengeSelect: (challenge: QuizChallenge) => void;
}

export default function ChallengesSection({
  isAuthenticated,
  onChallengeSelect,
}: ChallengesSectionProps) {
  const { challenges, loading } = useChallenges();

  if (!isAuthenticated || challenges.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl shadow-lg p-6 mb-5">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quiz-Challenge
        </h2>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
          <Sparkles className="w-3 h-3" />
          BETA
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        Stelle dich der ultimativen Herausforderung! Beantworte Fragen auf 15
        verschiedenen Schwierigkeitsstufen und gewinne bis zu 1 Million Euro!
      </p>
      <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-4">
        <BadgeInfoIcon className="w-4 h-4 inline-block mr-1 mb-1" /> Dieses
        Feature befindet sich in der Beta-Phase und ist nur für Lehrkräfte und
        Administration sichtbar.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : (
          challenges.map((challenge: import("quizTypes").QuizChallenge) => (
            <button
              key={challenge.id}
              onClick={() => onChallengeSelect(challenge)}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow border-2 border-yellow-200 dark:border-yellow-700 hover:border-yellow-400 dark:hover:border-yellow-500"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    15 Levels • 2 Sicherheitsstufen
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
