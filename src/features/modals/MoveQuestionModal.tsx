import { useState, useEffect } from 'react';
import { MoveHorizontal, X, Loader2, CheckCircle } from 'lucide-react';
import { moveQuestionToQuiz, loadAllQuizDocuments } from '@utils/quiz-collection';
import type { QuizDocument } from 'quizTypes';
import { canEditQuiz } from '@utils/quizPermissions';
import { getAuth } from 'firebase/auth';

interface MoveQuestionModalProps {
  sourceQuiz: QuizDocument;
  questionIndex: number;
  userRole: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MoveQuestionModal({
  sourceQuiz,
  questionIndex,
  userRole,
  onClose,
  onSuccess,
}: MoveQuestionModalProps) {
  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    // Load all quizzes the user can edit
    loadAllQuizDocuments().then(allQuizzes => {
      const editableQuizzes = allQuizzes
        .filter(quiz =>
          canEditQuiz(userRole, quiz, currentUser?.uid).allowed && quiz.id !== sourceQuiz.id
        )
        .sort((a, b) => {
          const titleA = a.shortTitle ?? a.title;
          const titleB = b.shortTitle ?? b.title;
          return titleA.localeCompare(titleB, 'de');
        });
      setQuizzes(editableQuizzes);
    });
  }, [currentUser, sourceQuiz.id, userRole]);

  const handleMove = async () => {
    if (!selectedQuizId) return;

    setIsProcessing(true);

    try {
      const result = await moveQuestionToQuiz(
        sourceQuiz.id,
        selectedQuizId,
        questionIndex
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        console.error("Move error:", result.error);
      }
    } catch (error) {
      console.error("Move error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const question = sourceQuiz.questions?.[questionIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MoveHorizontal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frage verschieben</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Frage:</strong> {question?.question || "Unbekannte Frage"}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              <strong>Aus Quiz:</strong> {sourceQuiz.title}
            </p>
          </div>

          {/* Target Quiz Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ziel-Quiz auswählen
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Quiz auswählen...</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.shortTitle ?? quiz.title} ({quiz.questions?.length || 0} Fragen)
                </option>
              ))}
            </select>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200 font-medium">Frage erfolgreich verschoben!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            onClick={handleMove}
            disabled={isProcessing || !selectedQuizId}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird verschoben...
              </>
            ) : (
              <>
                <MoveHorizontal className="w-4 h-4" />
                Verschieben
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}