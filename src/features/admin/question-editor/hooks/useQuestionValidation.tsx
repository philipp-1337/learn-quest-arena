
import { toast } from "sonner";
import { CustomToast } from "../../../misc/CustomToast";
import type { Question } from "quizTypes";

// Die Datei muss als .tsx gespeichert werden, damit JSX funktioniert.
// Sonst gibt es Syntaxfehler bei JSX in Funktionen.
// Falls die Datei noch .ts ist, bitte in .tsx umbenennen.
export function useQuestionValidation() {
  const validateQuestion = (question: Question): boolean => {
    // Validate question content based on type
    if (question.questionType === "text" && !question.question.trim()) {
      toast.custom(() => (
        <CustomToast message="Bitte gib eine Frage ein" type="error" />
      ));
      return false;
    }

    if (question.questionType === "image" && !question.questionImage) {
      toast.custom(() => (
        <CustomToast message="Bitte lade ein Fragen-Bild hoch" type="error" />
      ));
      return false;
    }

    if (question.questionType === "audio" && !question.questionAudio) {
      toast.custom(() => (
        <CustomToast
          message="Bitte lade eine Fragen-Audio-Datei hoch"
          type="error"
        />
      ));
      return false;
    }

    // Validate answers count
    if (question.answers.length < 2) {
      toast.custom(() => (
        <CustomToast message="Mindestens 2 Antworten erforderlich" type="error" />
      ));
      return false;
    }

    if (question.answers.length > 5) {
      toast.custom(() => (
        <CustomToast message="Maximal 5 Antworten erlaubt" type="error" />
      ));
      return false;
    }

    // Validate correct answers
    if (
      !question.correctAnswerIndices ||
      question.correctAnswerIndices.length === 0
    ) {
      toast.custom(() => (
        <CustomToast
          message="Mindestens eine richtige Antwort erforderlich"
          type="error"
        />
      ));
      return false;
    }

    // Validate answer content based on type
    if (question.answerType === "text") {
      if (question.answers.some((a) => !a.content.trim())) {
        toast.custom(() => (
          <CustomToast message="Bitte fülle alle Antworten aus" type="error" />
        ));
        return false;
      }
    } else if (question.answerType === "image") {
      if (question.answers.some((a) => !a.content)) {
        toast.custom(() => (
          <CustomToast message="Bitte lade alle Bilder hoch" type="error" />
        ));
        return false;
      }
    } else if (question.answerType === "audio") {
      if (question.answers.some((a) => !a.content)) {
        toast.custom(() => (
          <CustomToast
            message="Bitte lade alle Audio-Dateien hoch"
            type="error"
          />
        ));
        return false;
      }
    }

    return true;
  };

  return { validateQuestion };
}
