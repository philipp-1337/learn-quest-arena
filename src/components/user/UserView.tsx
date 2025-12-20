import React, { useEffect, useState } from 'react';
import { Pencil, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { loadAllUserProgress } from '../../utils/loadAllUserProgress';
import type { UserQuizProgress } from '../../types/userProgress';
import type { Subject } from '../../types/quizTypes';

import { CustomToast } from '../misc/CustomToast';


interface UserViewProps {
  username: string;
  onClose: () => void;
  onChooseName: () => void;
  subjects: Subject[];
}

interface UserDashboardProps {
  username: string;
  subjects: Subject[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ username, subjects }) => {
  const [progressList, setProgressList] = useState<UserQuizProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      try {
        const progressObj: Record<string, UserQuizProgress> = await loadAllUserProgress(username);
        const allProgress: UserQuizProgress[] = Object.values(progressObj);
        allProgress.sort((a, b) => b.lastUpdated - a.lastUpdated);
        setProgressList(allProgress);
      } catch (e) {
        setProgressList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [username]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dein Fortschritt</h1>
      {loading ? (
        <div>Lade Fortschritt...</div>
      ) : progressList.length === 0 ? (
        <div>{username === "Gast" ? "Wähle deinen Namen, wenn du Fortschritt speichern willst." : "Kein Fortschritt vorhanden."}</div>
      ) : (
        <div className="space-y-6">
          {progressList.map((progress) => {
            // Quiz-Titel anhand quizId suchen
            let quizTitle = progress.quizId;
            subjects.forEach(subject => {
              subject.classes.forEach(cls => {
                cls.topics.forEach(topic => {
                  const quiz = topic.quizzes.find(q => q.id === progress.quizId);
                  if (quiz) quizTitle = quiz.title;
                });
              });
            });
            return (
              <div key={progress.quizId} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-semibold text-lg mb-2">Quiz: {quizTitle}</div>
                <div className="mb-1 flex items-center">
                  Abgeschlossen: {progress.completed ? <CheckCircle2 className="w-5 h-5 text-green-600 ml-2" /> : <XCircle className="w-5 h-5 text-red-600 ml-2" />}
                </div>
                <div className="mb-1">Versuche: {progress.totalTries}</div>
                <div className="mb-1">Zuletzt bearbeitet: {new Date(progress.lastUpdated).toLocaleString()}</div>
                <div className="mb-1">
                  Fragen: {
                    (() => {
                      const total = Object.keys(progress.questions).length;
                      const correct = Object.values(progress.questions).filter(q => q.answered).length;
                      return `${correct}/${total} korrekt`;
                    })()
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const UserView: React.FC<UserViewProps> = ({ username, onClose, onChooseName, subjects }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 force-break" lang="de">Nutzername</h1>
          <p className="text-gray-600 force-break" lang="de">Dein zufällig generierter Nutzername</p>
        </div>


        {/* Username Display mit Icon-Button */}
        <div className="mb-6 flex items-center justify-between text-2xl text-gray-800 font-mono break-all select-all border border-gray-200 rounded-lg py-4 px-4 bg-gray-50">
          <span className="truncate">{username}</span>
          <button
            onClick={async () => {
              // Fortschritt laden
              let hasProgress = false;
              try {
                const progressObj = await loadAllUserProgress(username);
                hasProgress = Object.keys(progressObj).length > 0;
              } catch (e) {
                hasProgress = false;
              }
              if (username !== 'Gast' || hasProgress) {
                toast.custom(
                  (t) => (
                    <CustomToast
                      message={
                        <>
                          <div className="mb-2">Wenn du deinen Namen änderst, geht dein Fortschritt verloren. Bist du sicher?</div>
                          <div className="flex gap-2 justify-end">
                            <button
                              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                              onClick={() => {
                                toast.dismiss(t);
                                onChooseName();
                              }}
                            >Weiter</button>
                            <button
                              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                              onClick={() => toast.dismiss(t)}
                            >Abbrechen</button>
                          </div>
                        </>
                      }
                    />
                  ),
                  { duration: 10000 }
                );
              } else {
                onChooseName();
              }
            }}
            className="ml-2 p-2 rounded-full hover:bg-indigo-100 text-indigo-600 hover:text-indigo-900 transition-colors"
            title="Anderen Namen wählen"
            aria-label="Anderen Namen wählen"
            type="button"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <UserDashboard username={username} subjects={subjects} />
        </div>

        {/* Action Buttons entfernt, da Icon-Button jetzt im Username-Display ist */}
      </div>
    </div>
  );
};

export default UserView;
