import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, X, ArrowLeft, Save } from 'lucide-react';
import type { Quiz, Question, Answer } from '../../types/quizTypes';
import { toast } from 'sonner';
import { CustomToast } from '../misc/CustomToast';
import { loadAllQuizDocuments, updateQuizDocument } from '../../utils/quizzesCollection';
import type { QuizDocument } from '../../types/quizTypes';
import { getThumbnailUrl } from '../../utils/cloudinaryTransform';

export default function QuizEditorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [saving, setSaving] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      if (!id) {
        navigate('/admin');
        return;
      }

      try {
        const quizzes = await loadAllQuizDocuments();
        const quiz = quizzes.find(q => q.id === id);

        if (!quiz) {
          toast.custom(() => (
            <CustomToast message="Quiz nicht gefunden" type="error" />
          ));
          navigate('/admin');
          return;
        }

        setQuizDocument(quiz);
        setEditedQuiz({
          id: quiz.id,
          uuid: quiz.id,
          title: quiz.title,
          shortTitle: quiz.shortTitle || quiz.title,
          questions: quiz.questions || [],
          hidden: quiz.hidden === undefined ? true : quiz.hidden,
        });
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Laden des Quiz" type="error" />
        ));
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, navigate]);

  const handleSaveQuiz = async () => {
    if (!editedQuiz || !quizDocument) return;

    if (!editedQuiz.title.trim()) {
      toast.custom(() => (
        <CustomToast message="Bitte gib einen Quiz-Titel ein" type="error" />
      ));
      return;
    }

    setSaving(true);
    try {
      await updateQuizDocument(quizDocument.id, {
        title: editedQuiz.title,
        shortTitle: editedQuiz.shortTitle,
        questions: editedQuiz.questions,
        hidden: editedQuiz.hidden,
      });
      
      toast.custom(() => (
        <CustomToast message="Quiz erfolgreich gespeichert" type="success" />
      ));
      
      // Navigate back to admin after short delay
      setTimeout(() => navigate('/admin'), 500);
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Speichern des Quiz" type="error" />
      ));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    if (!editedQuiz) return;
    setEditedQuiz({
      ...editedQuiz,
      questions: editedQuiz.questions.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Lade Quiz...</div>
      </div>
    );
  }

  if (!editedQuiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Save/Cancel buttons */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Zurück zur Admin-Übersicht"
                aria-label="Zurück zur Admin-Übersicht"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Quiz bearbeiten</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {quizDocument?.subjectName} • {quizDocument?.className} • {quizDocument?.topicName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/admin')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveQuiz}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{saving ? 'Speichert...' : 'Speichern'}</span>
                <span className="sm:hidden">{saving ? 'Speichert...' : 'Speichern'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Quiz Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz-Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz-Titel
                </label>
                <input
                  id="quiz-title"
                  type="text"
                  value={editedQuiz.title}
                  onChange={e => setEditedQuiz(q => q ? { ...q, title: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Quiz-Titel eingeben"
                  lang="de"
                />
              </div>
              <div>
                <label htmlFor="quiz-short-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kurztitel (für Admin-Anzeige & URL)
                </label>
                <input
                  id="quiz-short-title"
                  type="text"
                  value={editedQuiz.shortTitle}
                  onChange={e => setEditedQuiz(q => q ? { ...q, shortTitle: e.target.value } : null)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Kurztitel"
                  lang="de"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hidden-toggle"
                  checked={!!editedQuiz.hidden}
                  onChange={e => setEditedQuiz(q => q ? { ...q, hidden: e.target.checked } : null)}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                />
                <label htmlFor="hidden-toggle" className="text-sm text-gray-700 dark:text-gray-300">
                  Quiz ist <span className={editedQuiz.hidden ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>{editedQuiz.hidden ? 'ausgeblendet' : 'sichtbar'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions List Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fragen <span className="text-base font-normal text-gray-500 dark:text-gray-400">({editedQuiz.questions.length})</span>
              </h2>
              <button
                onClick={() => navigate(`/admin/quiz/edit/${id}/question/new`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Frage hinzufügen
              </button>
            </div>

            {editedQuiz.questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="mb-2">Noch keine Fragen vorhanden.</p>
                <p className="text-sm">Klicke auf "Frage hinzufügen" um zu starten.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {editedQuiz.questions.map((q: Question, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {index + 1}. {q.question}
                            <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                              {q.answerType === 'text' ? 'Text' : 'Bilder'}
                            </span>
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {q.answers.map((answer: Answer, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              {i === q.correctAnswerIndex ? (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              {answer.type === 'text' ? (
                                <span
                                  className={
                                    i === q.correctAnswerIndex
                                      ? 'text-green-700 dark:text-green-400 font-medium'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }
                                >
                                  {answer.content}
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={getThumbnailUrl(answer.content, 64)}
                                    alt={answer.alt}
                                    className="w-16 h-16 object-cover rounded"
                                    loading="lazy"
                                  />
                                  <span
                                    className={
                                      i === q.correctAnswerIndex
                                        ? 'text-green-700 dark:text-green-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }
                                  >
                                    {answer.alt || 'Bild'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/quiz/edit/${id}/question/${index}`)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Frage bearbeiten"
                          aria-label="Frage bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Frage löschen"
                          aria-label="Frage löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
