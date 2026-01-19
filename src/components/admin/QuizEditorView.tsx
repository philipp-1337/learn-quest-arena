import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, X, ArrowLeft, Save, Check as CheckIcon, Image as ImageIcon, Lock, Volume2 } from 'lucide-react';
import type { Quiz, Question, Answer } from '../../types/quizTypes';
import { toast } from 'sonner';
import { CustomToast } from '../misc/CustomToast';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { loadAllQuizDocuments, updateQuizDocument, acquireEditLock, releaseEditLock, refreshEditLock, subscribeToQuiz } from '../../utils/quizzesCollection';
import type { QuizDocument } from '../../types/quizTypes';
import { getThumbnailUrl } from '../../utils/cloudinaryTransform';
import { showConfirmationToast } from '../../utils/confirmationToast';
import OptimizedImage from '../shared/OptimizedImage';
import { getAuth } from 'firebase/auth';

export default function QuizEditorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const [allChangesSaved, setAllChangesSaved] = useState(true); // Neu: Status für dynamischen Button
  const [urlShared, setUrlShared] = useState(false);
  const [hasLock, setHasLock] = useState(false);
  const [lockConflict, setLockConflict] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [userRole, setUserRole] = useState<string | null>(null);
  const lockRefreshInterval = useRef<number | null>(null);

  // Track, ob es ungespeicherte Änderungen gibt (außer Fragen, die werden direkt gespeichert)
  useEffect(() => {
    if (!editedQuiz || !quizDocument) return;
    // Vergleiche relevante Felder
    const changed =
      editedQuiz.title !== quizDocument.title ||
      editedQuiz.shortTitle !== (quizDocument.shortTitle || quizDocument.title) ||
      editedQuiz.hidden !== (quizDocument.hidden === undefined ? true : quizDocument.hidden) ||
      urlShared !== (quizDocument.urlShared || false);
    setAllChangesSaved(!changed);
  }, [editedQuiz, quizDocument, urlShared]);

  // Acquire edit lock and load quiz data
  useEffect(() => {
    if (!id) {
      navigate('/admin');
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast.custom(() => (
        <CustomToast message="Nicht angemeldet" type="error" />
      ));
      navigate('/admin');
      return;
    }

    const initializeEditor = async () => {
      try {
        // Try to acquire edit lock
        const lockResult = await acquireEditLock(
          id,
          currentUser.uid,
          currentUser.email || 'Unbekannt'
        );

        if (!lockResult.success) {
          if (lockResult.lockedBy) {
            setLockConflict(`Dieses Quiz wird bereits von ${lockResult.lockedBy.userName} bearbeitet.`);
            
            // Subscribe to quiz to detect when lock is released
            const unsubscribe = subscribeToQuiz(id, (quiz) => {
              if (quiz && !quiz.editLock) {
                toast.custom(() => (
                  <CustomToast message="Quiz ist jetzt verfügbar. Seite neu laden." type="info" />
                ));
              }
            });

            setLoading(false);
            return () => unsubscribe();
          } else {
            toast.custom(() => (
              <CustomToast message={lockResult.error || "Lock konnte nicht erworben werden"} type="error" />
            ));
            navigate('/admin');
            return;
          }
        }

        setHasLock(true);

        // Load quiz data
        const quizzes = await loadAllQuizDocuments();
        const quiz = quizzes.find(q => q.id === id);

        if (!quiz) {
          await releaseEditLock(id, currentUser.uid);
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
        setUrlShared(quiz.urlShared || false);

        // Set up lock refresh interval (every 15 minutes)
        lockRefreshInterval.current = setInterval(async () => {
          const refreshResult = await refreshEditLock(id, currentUser.uid);
          if (!refreshResult.success) {
            console.warn('Failed to refresh lock:', refreshResult.error);
            setHasLock(false);
            toast.custom(() => (
              <CustomToast message="Edit-Lock verloren. Bitte Änderungen speichern." type="error" />
            ));
          }
        }, 15 * 60 * 1000); // 15 minutes

        setLoading(false);
      } catch (error) {
        console.error('Error initializing editor:', error);
        toast.custom(() => (
          <CustomToast message="Fehler beim Laden des Quiz" type="error" />
        ));
        navigate('/admin');
      }
    };

    initializeEditor();

    // Cleanup: Release lock on unmount
    return () => {
      if (lockRefreshInterval.current) {
        clearInterval(lockRefreshInterval.current);
      }
      if (currentUser && id) {
        releaseEditLock(id, currentUser.uid).catch(console.error);
      }
    };
  }, [id, navigate]);

  // Rolle des aktuellen Nutzers
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const db = await import('firebase/firestore');
        const { getFirestore, doc, getDoc } = db;
        const authorDoc = await getDoc(doc(getFirestore(), 'author', currentUser.uid));
        if (authorDoc.exists()) {
          const data = authorDoc.data();
          setUserRole(data.role || null);
        }
      } catch (err) {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, []);

  const handleSaveQuiz = async () => {
    if (!editedQuiz || !quizDocument) return;

    if (!hasLock) {
      toast.custom(() => (
        <CustomToast message="Kein Edit-Lock vorhanden. Speichern nicht möglich." type="error" />
      ));
      return;
    }

    if (!editedQuiz.title.trim()) {
      toast.custom(() => (
        <CustomToast message="Bitte gib einen Quiz-Titel ein" type="error" />
      ));
      return;
    }

    setSaving(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      await updateQuizDocument(quizDocument.id, {
        title: editedQuiz.title,
        shortTitle: editedQuiz.shortTitle,
        questions: editedQuiz.questions,
        hidden: editedQuiz.hidden,
        urlShared: urlShared,
      });
      setAllChangesSaved(true);
      
      // Release lock after successful save
      if (currentUser) {
        await releaseEditLock(quizDocument.id, currentUser.uid);
      }
      
      toast.custom(() => (
        <CustomToast message="Quiz erfolgreich gespeichert" type="success" />
      ));
      // Navigiere zurück nach kurzer Verzögerung
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

  // Öffnet das DeleteConfirmModal für die Frage
  const handleDeleteQuestion = (index: number) => {
    setDeleteModal({ open: true, index });
  }

  // Handler für Zurück-Pfeil: prüft auf ungespeicherte Änderungen
  const handleBack = () => {
    if (!allChangesSaved) {
      toast.custom((t) => (
        <div className="max-w-xs w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col">
          <div className="text-gray-900 dark:text-white text-base font-medium mb-2">
            Ungespeicherte Änderungen
          </div>
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            Du hast ungespeicherte Änderungen. Bitte speichere zuerst oder verwerfe deine Änderungen.
          </div>
          <div className="flex gap-2 w-full">
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium border border-gray-300 dark:border-gray-600 transition-colors"
              onClick={() => {
                if (quizDocument) {
                  setEditedQuiz({
                    id: quizDocument.id,
                    uuid: quizDocument.id,
                    title: quizDocument.title,
                    shortTitle: quizDocument.shortTitle || quizDocument.title,
                    questions: quizDocument.questions || [],
                    hidden: quizDocument.hidden === undefined ? true : quizDocument.hidden,
                  });
                  setUrlShared(quizDocument.urlShared || false);
                }
                toast.dismiss(t);
              }}
            >
              Änderungen verwerfen
            </button>
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium border border-indigo-700 transition-colors"
              onClick={() => {
                handleSaveQuiz();
                toast.dismiss(t);
              }}
            >
              Speichern
            </button>
          </div>
        </div>
      ));
      return;
    }
    navigate('/admin');
  };

  // Persistente Löschung nach Bestätigung
  const confirmDeleteQuestion = async () => {
    if (!editedQuiz || !quizDocument || deleteModal.index === null) return;
    const newQuestions = editedQuiz.questions.filter((_, i) => i !== deleteModal.index);
    try {
      await updateQuizDocument(quizDocument.id, {
        ...quizDocument,
        questions: newQuestions,
      });
      setEditedQuiz({ ...editedQuiz, questions: newQuestions });
      toast.custom(() => (
        <CustomToast message="Frage gelöscht" type="success" />
      ));
    } catch (error) {
      toast.custom(() => (
        <CustomToast message="Fehler beim Löschen der Frage" type="error" />
      ));
    } finally {
      setDeleteModal({ open: false, index: null });
    }
  };

  const handleUrlSharedToggle = (checked: boolean) => {
    if (!checked) {
      // User wants to deactivate "URL wurde geteilt" - show warning
      showConfirmationToast({
        message: 'Achtung: Eine Änderung am Kurztitel ändert auch die URL. Dies kann Auswirkungen auf bereits geteilte URLs haben.',
        confirmText: 'Verstanden',
        cancelText: 'Abbrechen',
        onConfirm: () => {
          setUrlShared(false);
        },
        onCancel: () => {
          // Keep checkbox active, do nothing
        },
      });
    } else {
      // User wants to activate "URL wurde geteilt" - just set it
      setUrlShared(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Lade Quiz...</div>
      </div>
    );
  }

  if (lockConflict) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz in Bearbeitung</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{lockConflict}</p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Zur\u00fcck zur \u00dcbersicht
          </button>
        </div>
      </div>
    );
  }

  if (!editedQuiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* DeleteConfirmModal für Frage-Löschung */}
      {deleteModal.open && editedQuiz && (
        <DeleteConfirmModal
          itemName={`Frage ${deleteModal.index !== null ? deleteModal.index + 1 : ''}`}
          onConfirm={confirmDeleteQuestion}
          onClose={() => setDeleteModal({ open: false, index: null })}
        />
      )}
      {/* Header with Save/Cancel buttons */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleBack}
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
                onClick={handleBack}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              {allChangesSaved ? (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Gespeichert</span>
                  <span className="sm:hidden">Gespeichert</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveQuiz}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? 'Speichert...' : 'Speichern'}</span>
                  <span className="sm:hidden">{saving ? 'Speichert...' : 'Speichern'}</span>
                </button>
              )}
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
                  disabled={urlShared}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Kurztitel"
                  lang="de"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hidden-toggle"
                    checked={!!editedQuiz.hidden}
                    onChange={e => setEditedQuiz(q => q ? { ...q, hidden: e.target.checked } : null)}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                    disabled={userRole === 'supporter'}
                  />
                  <label htmlFor="hidden-toggle" className="text-sm text-gray-700 dark:text-gray-300">
                    Quiz ist <span className={editedQuiz.hidden ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>{editedQuiz.hidden ? 'ausgeblendet' : 'sichtbar'}</span>
                    {userRole === 'supporter' && (
                      <span className="ml-2 text-xs text-gray-400">(Du kannst die Sichtbarkeit nicht ändern)</span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="url-shared-toggle"
                    checked={urlShared}
                    onChange={e => handleUrlSharedToggle(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                  />
                  <label htmlFor="url-shared-toggle" className="text-sm text-gray-700 dark:text-gray-300">
                    Kurztitel nicht änderbar (URL wurde geteilt)
                  </label>
                </div>
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
                        <div className="flex items-start gap-3 mb-2">
                          {(q.questionType || 'text') === 'image' && q.questionImage && (
                            <OptimizedImage
                              src={q.questionImage}
                              alt={q.questionImageAlt || 'Frage'}
                              className="w-24 h-18 object-cover rounded"
                              width={96}
                              height={72}
                            />
                          )}
                          {(q.questionType || 'text') === 'audio' && q.questionAudio && (
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                              <Volume2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {index + 1}. {(q.questionType || 'text') === 'image' 
                                  ? (q.question || '[Bild-Frage]') 
                                  : (q.questionType || 'text') === 'audio'
                                  ? (q.question || '[Audio-Frage]')
                                  : q.question
                                }
                              </span>
                              {(q.questionType || 'text') === 'image' && (
                                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />
                                  Bild-Frage
                                </span>
                              )}
                              {(q.questionType || 'text') === 'audio' && (
                                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded flex items-center gap-1">
                                  <Volume2 className="w-3 h-3" />
                                  Audio-Frage
                                </span>
                              )}
                              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                                {q.answerType === 'text' ? 'Text' : q.answerType === 'image' ? 'Bilder' : 'Audio'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          {q.answers.map((answer: Answer, i: number) => {
                            const correctIndices = q.correctAnswerIndices || [q.correctAnswerIndex];
                            const isCorrect = correctIndices.includes(i);
                            return (
                              <div key={i} className="flex items-center gap-2">
                                {isCorrect ? (
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                {answer.type === 'text' ? (
                                  <span
                                    className={
                                      isCorrect
                                        ? 'text-green-700 dark:text-green-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }
                                  >
                                    {answer.content}
                                  </span>
                                ) : answer.type === 'image' ? (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={getThumbnailUrl(answer.content, 64)}
                                      alt={answer.alt}
                                      className="w-16 h-16 object-cover rounded"
                                      loading="lazy"
                                    />
                                    <span
                                      className={
                                        isCorrect
                                          ? 'text-green-700 dark:text-green-400 font-medium'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }
                                    >
                                      {answer.alt || 'Bild'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                                      <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span
                                      className={
                                        isCorrect
                                          ? 'text-green-700 dark:text-green-400 font-medium'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }
                                    >
                                      Audio
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
