import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Question, Answer } from "../../../types/quizTypes";
import { toast } from "sonner";
import { CustomToast } from "../../misc/CustomToast";
import { updateQuizDocument } from "../../../utils/quiz-collection";
import { useQuestionEditor } from "../../../hooks/useQuestionEditor";
import { useQuestionValidation } from "../../../hooks/useQuestionValidation";
import QuestionEditorHeader from "./QuestionEditorHeader";
import QuestionTypeSelector from "./QuestionTypeSelector";
import QuestionInput from "./QuestionInput";
import AnswerTypeSelector from "./AnswerTypeSelector";
import AnswersList from "./AnswersList";

export default function QuestionEditorView() {
  const { id, index } = useParams<{ id: string; index?: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const isEditing = index !== undefined;
  const questionIndex = index !== undefined ? parseInt(index, 10) : -1;

  const {
    loading,
    quizDocument,
    lockWarning,
    question,
    setQuestion,
    handleAddAnswer,
    handleRemoveAnswer,
    handleToggleCorrectAnswer,
    updateAnswer,
  } = useQuestionEditor({
    quizId: id || "",
    questionIndex,
    isEditing,
  });

  const { validateQuestion } = useQuestionValidation();

  const handleSaveQuestion = async () => {
    if (!validateQuestion(question)) return;
    if (!quizDocument) return;

    setSaving(true);
    try {
      const correctIndices =
        question.correctAnswerIndices || [question.correctAnswerIndex];

      const cleanAnswers = question.answers.map((answer) => {
        const cleanAnswer: Answer = {
          type: answer.type,
          content: answer.content,
        };
        if (answer.alt !== undefined && answer.alt !== null && answer.alt !== "") {
          cleanAnswer.alt = answer.alt;
        }
        return cleanAnswer;
      });

      const cleanQuestion: Question = {
        question: question.question,
        questionType: question.questionType,
        answerType: question.answerType,
        answers: cleanAnswers,
        correctAnswerIndex: correctIndices[0],
        correctAnswerIndices: correctIndices,
      };

      if (question.id) {
        cleanQuestion.id = question.id;
      }
      if (question.questionType === "image" && question.questionImage) {
        cleanQuestion.questionImage = question.questionImage;
        if (question.questionImageAlt) {
          cleanQuestion.questionImageAlt = question.questionImageAlt;
        }
      }
      if (question.questionType === "audio" && question.questionAudio) {
        cleanQuestion.questionAudio = question.questionAudio;
      }

      const updatedQuestions = isEditing
        ? quizDocument.questions.map((q, i) =>
            i === questionIndex ? cleanQuestion : q
          )
        : [...quizDocument.questions, cleanQuestion];

      await updateQuizDocument(quizDocument.id, {
        questions: updatedQuestions,
      });

      toast.custom(() => (
        <CustomToast
          message={isEditing ? "Frage aktualisiert" : "Frage hinzugefügt"}
          type="success"
        />
      ));

      navigate(`/admin/quiz/edit/${id}`);
    } catch (error) {
      console.error("Error saving question:", error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Speichern der Frage" type="error" />
      ));
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionTypeChange = (type: "text" | "image" | "audio") => {
    setQuestion({
      ...question,
      questionType: type,
      question: type === "text" ? question.question : "",
      questionImage: type === "image" ? question.questionImage : undefined,
      questionImageAlt:
        type === "image" ? question.questionImageAlt : undefined,
      questionAudio: type === "audio" ? question.questionAudio : undefined,
    });
  };

  const handleAnswerTypeChange = (type: string) => {
    const currentCorrectIndices =
      question.correctAnswerIndices || [question.correctAnswerIndex];

    setQuestion({
      ...question,
      answerType: type,
      answers: question.answers.map((a) => ({
        type: type,
        content: type === "text" ? a.content || "" : "",
        alt: type === "image" ? "" : undefined,
      })),
      correctAnswerIndices: currentCorrectIndices,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Lade Frage...</div>
      </div>
    );
  }

  if (!quizDocument) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <QuestionEditorHeader
        isEditing={isEditing}
        saving={saving}
        lockWarning={lockWarning}
        quizTitle={quizDocument.shortTitle || quizDocument.title}
        onBack={() => navigate(`/admin/quiz/edit/${id}`)}
        onSave={handleSaveQuestion}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            <QuestionTypeSelector
              selectedType={question.questionType || "text"}
              onChange={handleQuestionTypeChange}
            />

            <QuestionInput
              question={question}
              onChange={(updates) => setQuestion({ ...question, ...updates })}
            />

            <AnswerTypeSelector
              selectedType={question.answerType}
              onChange={handleAnswerTypeChange}
            />

            <AnswersList
              question={question}
              onAddAnswer={handleAddAnswer}
              onRemoveAnswer={handleRemoveAnswer}
              onToggleCorrect={handleToggleCorrectAnswer}
              onUpdateAnswer={updateAnswer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}