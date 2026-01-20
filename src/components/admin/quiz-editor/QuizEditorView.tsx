import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "../../misc/CustomToast";
import DeleteConfirmModal from "../../modals/DeleteConfirmModal";
import { getAuth } from "firebase/auth";
import { useQuizEditLock } from "../../../contexts/QuizEditLockContext";
import { updateQuizDocument } from "../../../utils/quizzesCollection";
import { useQuizEditorState } from "../../../hooks/useQuizEditorState";
import QuizEditorHeader from "./QuizEditorHeader";
import QuizDetailsForm from "./QuizDetailsForm";
import QuestionsList from "./QuestionsList";

export default function QuizEditorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Use custom hooks
  const {
    editedQuiz,
    setEditedQuiz,
    quizDocument,
    urlShared,
    setUrlShared,
    allChangesSaved,
    isLoading: quizLoading,
  } = useQuizEditorState({ quizId: id || "" });

  const { hasLock, lockConflict, isLoading: lockLoading } = useQuizEditLock();

  const loading = quizLoading || lockLoading;

  // Redirect if no ID or not logged in
  useEffect(() => {
    if (!id || !currentUser) {
      navigate("/admin");
    }
  }, [id, currentUser, navigate]);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!currentUser) return;
        const db = await import("firebase/firestore");
        const { getFirestore, doc, getDoc } = db;
        const authorDoc = await getDoc(
          doc(getFirestore(), "author", currentUser.uid),
        );
        if (authorDoc.exists()) {
          const data = authorDoc.data();
          setUserRole(data.role || null);
        }
      } catch (err) {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [currentUser]);

  const handleSaveQuiz = async () => {
    if (!editedQuiz || !quizDocument || !currentUser) return;

    if (!hasLock) {
      toast.custom(() => (
        <CustomToast
          message="Kein Edit-Lock vorhanden. Speichern nicht möglich."
          type="error"
        />
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
      await updateQuizDocument(quizDocument.id, {
        title: editedQuiz.title,
        shortTitle: editedQuiz.shortTitle,
        questions: editedQuiz.questions,
        hidden: editedQuiz.hidden,
        urlShared: urlShared,
      });

      toast.custom(() => (
        <CustomToast message="Quiz erfolgreich gespeichert" type="success" />
      ));

      navigate("/admin"); // ✅ Lock wird automatisch durch Context released
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Speichern des Quiz" type="error" />
      ));
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!allChangesSaved) {
      toast.custom((t) => (
        <div className="max-w-xs w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col">
          <div className="text-gray-900 dark:text-white text-base font-medium mb-2">
            Ungespeicherte Änderungen
          </div>
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            Du hast ungespeicherte Änderungen. Bitte speichere zuerst oder
            verwerfe deine Änderungen.
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
                    hidden:
                      quizDocument.hidden === undefined
                        ? true
                        : quizDocument.hidden,
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
    navigate("/admin");
  };

  const confirmDeleteQuestion = async () => {
    if (!editedQuiz || !quizDocument || deleteModal.index === null) return;

    const newQuestions = editedQuiz.questions.filter(
      (_, i) => i !== deleteModal.index,
    );

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Lade Quiz...</div>
      </div>
    );
  }

  // Lock conflict state
  if (lockConflict) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quiz in Bearbeitung
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {lockConflict}
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Zurück zur Übersicht
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
      {/* Delete Modal */}
      {deleteModal.open && (
        <DeleteConfirmModal
          itemName={`Frage ${deleteModal.index !== null ? deleteModal.index + 1 : ""}`}
          onConfirm={confirmDeleteQuestion}
          onClose={() => setDeleteModal({ open: false, index: null })}
        />
      )}

      {/* Header */}
      <QuizEditorHeader
        quizDocument={quizDocument}
        allChangesSaved={allChangesSaved}
        saving={saving}
        onBack={handleBack}
        onSave={handleSaveQuiz}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Quiz Details Form */}
          <QuizDetailsForm
            quiz={editedQuiz}
            urlShared={urlShared}
            userRole={userRole}
            onQuizChange={(updates) =>
              setEditedQuiz((q) => (q ? { ...q, ...updates } : null))
            }
            onUrlSharedChange={setUrlShared}
          />

          {/* Questions List */}
          <QuestionsList
            questions={editedQuiz.questions}
            onAddQuestion={() =>
              navigate(`/admin/quiz/edit/${id}/question/new`)
            }
            onEditQuestion={(index) =>
              navigate(`/admin/quiz/edit/${id}/question/${index}`)
            }
            onDeleteQuestion={(index) => setDeleteModal({ open: true, index })}
          />
        </div>
      </div>
    </div>
  );
}
