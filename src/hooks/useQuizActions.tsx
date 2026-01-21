import { toast } from "sonner";
import { getAuth } from "firebase/auth";
import { CustomToast } from "../features/misc/CustomToast";
import type { QuizDocument } from "quizTypes";
import {
  deleteQuizDocument,
  updateQuizDocument,
} from "@utils/quiz-collection";
import { slugify } from "@utils/slugify";
import {
  canToggleVisibility,
  canDeleteQuiz,
} from "@utils/quizPermissions";

export function useQuizActions(
  userRole: string | null,
  setQuizzes: React.Dispatch<React.SetStateAction<QuizDocument[]>>
) {
  const auth = getAuth();

  const handleToggleHidden = async (quiz: QuizDocument) => {
    const permission = canToggleVisibility(
      userRole,
      quiz,
      auth.currentUser?.uid
    );

    if (!permission.allowed) {
      toast.custom(() => (
        <CustomToast message={permission.reason || "Keine Berechtigung"} type="error" />
      ));
      return;
    }

    const result = await updateQuizDocument(quiz.id, { hidden: !quiz.hidden });
    if (!result.success) {
      let errorMsg = "Fehler beim Ändern der Sichtbarkeit";
      if (result.error && result.error.includes("permission-denied")) {
        errorMsg = "Du hast für diese Aktion keine Berechtigung.";
      }
      toast.custom(() => <CustomToast message={errorMsg} type="error" />);
    }
  };

  const handleDelete = async (quiz: QuizDocument) => {
    const permission = canDeleteQuiz(userRole, quiz, auth.currentUser?.uid);

    if (!permission.allowed) {
      toast.custom(() => (
        <CustomToast message={permission.reason || "Keine Berechtigung"} type="error" />
      ));
      return;
    }

    const result = await deleteQuizDocument(quiz.id);
    if (result.success) {
      setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
      toast.custom(() => (
        <CustomToast message="Quiz gelöscht" type="success" />
      ));
    } else {
      let errorMsg = "Fehler beim Löschen";
      if (result.error && result.error.includes("permission-denied")) {
        errorMsg = "Du hast für diese Aktion keine Berechtigung.";
      }
      toast.custom(() => <CustomToast message={errorMsg} type="error" />);
    }
  };

  const handleCopyLink = async (quiz: QuizDocument) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/quiz/${slugify(quiz.subjectName || "")}/${slugify(quiz.className || "")}/${slugify(quiz.topicName || "")}/${slugify(quiz.title)}`;
    navigator.clipboard.writeText(url);

    if (!quiz.urlShared) {
      const result = await updateQuizDocument(quiz.id, { urlShared: true });
      if (result.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === quiz.id ? { ...q, urlShared: true } : q))
        );
      }
    }

    toast.custom(() => (
      <CustomToast message="Link in Zwischenablage kopiert!" type="success" />
    ));
  };

  return {
    handleToggleHidden,
    handleDelete,
    handleCopyLink,
  };
}
