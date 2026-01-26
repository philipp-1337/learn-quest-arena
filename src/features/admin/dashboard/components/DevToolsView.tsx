import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { releaseEditLock } from "@utils/quiz-collection";
import { useDisableIOSSwipeBack } from "@hooks/useDisableIOSSwipeBack";
import { SwipeableListItem } from "@shared/SwipeableListItem";
import type { EditLock, QuizDocument } from "quizTypes";

type LockDisplay = {
  quizId: string;
  quizTitle?: string;
  editLock: EditLock;
};

export default function DevToolsView() {
  const [editLocks, setEditLocks] = useState<LockDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useDisableIOSSwipeBack(true);

  useEffect(() => {
    const db = getFirestore();
    const quizzesCol = collection(db, "quizzes");
    const unsubscribe = onSnapshot(quizzesCol, (snapshot) => {
      const locks: LockDisplay[] = snapshot.docs
        .map(docSnap => {
          const data = docSnap.data() as QuizDocument;
          if (data.editLock) {
            return {
              quizId: docSnap.id,
              quizTitle: data.title,
              editLock: data.editLock
            };
          }
          return null;
        })
        .filter(Boolean) as LockDisplay[];
      setEditLocks(locks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const removeEditLock = async (quizId: string) => {
    await releaseEditLock(quizId);
  };

  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group cursor-pointer"
          aria-label="Zurück"
          title="Zurück"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dev Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Hier findest du Entwickler-Tools und Debugging-Optionen für Admins im DevMode.</p>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
            <span className="font-semibold">Edit-Locks</span>
            <br />
            {loading ? (
              <div>Lade Edit-Locks...</div>
            ) : editLocks.length === 0 ? (
              <div>Keine Edit-Locks gefunden.</div>
            ) : (
              <ul className="mt-2 space-y-2">
                {editLocks.map((lock) => (
                  <SwipeableListItem
                    key={lock.quizId}
                    itemId={lock.quizId}
                    onDelete={() => removeEditLock(lock.quizId)}
                    deleteButtonText="Entfernen"
                  >
                    <div className="flex flex-col truncate">
                      {lock.quizTitle && (
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                          {lock.quizTitle}
                        </div>
                      )}
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        Quiz-ID: {lock.quizId}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        User: {lock.editLock.userName} ({lock.editLock.userId})
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Locked at: {new Date(lock.editLock.lockedAt).toLocaleString()} | 
                        Expires: {new Date(lock.editLock.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  </SwipeableListItem>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}