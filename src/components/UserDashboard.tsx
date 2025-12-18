import React, { useEffect, useState } from 'react';
import { loadUserQuizProgress } from '../utils/userProgressFirestore';
import type { UserQuizProgress } from '../types/userProgress';

interface UserDashboardProps {
  username: string;
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ username, onClose }) => {
  const [progressList, setProgressList] = useState<UserQuizProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firestore: Alle Quiz-Fortschritte für den User laden
    async function fetchProgress() {
      setLoading(true);
      // TODO: Hier müsste ein Firestore-Query alle Quiz-Progress-Dokumente für den User laden
      // Platzhalter: Nur ein Quiz laden (Demo)
      // In echt: Query auf Collection "users/{username}/progress"
      const quizIds = ["demo-quiz-1", "demo-quiz-2"];
      const allProgress: UserQuizProgress[] = [];
      for (const quizId of quizIds) {
        const progress = await loadUserQuizProgress(username, quizId);
        if (progress) allProgress.push(progress);
      }
      setProgressList(allProgress);
      setLoading(false);
    }
    fetchProgress();
  }, [username]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Zurück
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dein Fortschritt</h1>
        {loading ? (
          <div>Lade Fortschritt...</div>
        ) : progressList.length === 0 ? (
          <div>Kein Fortschritt vorhanden.</div>
        ) : (
          <div className="space-y-6">
            {progressList.map((progress) => (
              <div key={progress.quizId} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold text-lg mb-2">Quiz: {progress.quizId}</div>
                <div className="mb-1">Abgeschlossen: {progress.completed ? '✅' : '❌'}</div>
                <div className="mb-1">Versuche: {progress.totalTries}</div>
                <div className="mb-1">Zuletzt bearbeitet: {new Date(progress.lastUpdated).toLocaleString()}</div>
                <div className="mb-1">Fragen:</div>
                <ul className="ml-4 list-disc">
                  {Object.entries(progress.questions).map(([qId, q]) => (
                    <li key={qId}>
                      {qId}: {q.answered ? '✔️' : '❌'} (Versuche: {q.attempts})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
