import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Check, Lightbulb, MessageCircleWarning } from 'lucide-react';
import type { Question, Answer } from '../../types/quizTypes';
import { toast } from 'sonner';
import { CustomToast } from '../misc/CustomToast';
import { uploadWithToast } from '../../utils/cloudinaryUpload';
import { loadAllQuizDocuments, updateQuizDocument } from '../../utils/quizzesCollection';
import type { QuizDocument } from '../../types/quizTypes';

export default function QuestionEditorView() {
  const { id, index } = useParams<{ id: string; index?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [question, setQuestion] = useState<Question>({
    question: '',
    answerType: 'text',
    answers: [
      { type: 'text', content: '' },
      { type: 'text', content: '' },
      { type: 'text', content: '' },
    ],
    correctAnswerIndex: 0,
  });

  const isEditing = index !== undefined;
  const questionIndex = index !== undefined ? parseInt(index, 10) : -1;

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

        // Load existing question if editing
        if (isEditing && quiz.questions && quiz.questions[questionIndex]) {
          setQuestion(quiz.questions[questionIndex]);
        }
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
  }, [id, index, isEditing, questionIndex, navigate]);

  const handleSaveQuestion = async () => {
    if (!question.question.trim()) {
      toast.custom(() => (
        <CustomToast message="Bitte gib eine Frage ein" type="error" />
      ));
      return;
    }

    if (question.answers.length < 2) {
      toast.custom(() => (
        <CustomToast message="Mindestens 2 Antworten erforderlich" type="error" />
      ));
      return;
    }

    if (question.answers.length > 5) {
      toast.custom(() => (
        <CustomToast message="Maximal 5 Antworten erlaubt" type="error" />
      ));
      return;
    }

    if (question.answerType === 'text') {
      if (question.answers.some((a) => !a.content.trim())) {
        toast.custom(() => (
          <CustomToast message="Bitte fülle alle Antworten aus" type="error" />
        ));
        return;
      }
    } else {
      if (question.answers.some((a) => !a.content)) {
        toast.custom(() => (
          <CustomToast message="Bitte lade alle Bilder hoch" type="error" />
        ));
        return;
      }
    }

    if (!quizDocument) return;

    setSaving(true);
    try {
      const updatedQuestions = isEditing
        ? quizDocument.questions.map((q, i) => i === questionIndex ? question : q)
        : [...quizDocument.questions, question];

      await updateQuizDocument(quizDocument.id, {
        questions: updatedQuestions,
      });

      toast.custom(() => (
        <CustomToast 
          message={isEditing ? "Frage aktualisiert" : "Frage hinzugefügt"} 
          type="success" 
        />
      ));

      // Navigate back to quiz editor
      navigate(`/admin/quiz/edit/${id}`);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Speichern der Frage" type="error" />
      ));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAnswer = () => {
    if (question.answers.length >= 5) return;
    const newAnswers = [
      ...question.answers,
      {
        type: question.answerType,
        content: '',
        alt: question.answerType === 'image' ? '' : undefined,
      },
    ];
    setQuestion({
      ...question,
      answers: newAnswers,
    });
  };

  const handleRemoveAnswer = (index: number) => {
    if (question.answers.length <= 2) return;
    const newAnswers = question.answers.filter((_, i) => i !== index);
    let newCorrectIndex = question.correctAnswerIndex;
    if (newCorrectIndex >= newAnswers.length) {
      newCorrectIndex = newAnswers.length - 1;
    }
    setQuestion({
      ...question,
      answers: newAnswers,
      correctAnswerIndex: newCorrectIndex,
    });
  };

  const handleAnswerTypeChange = (type: string) => {
    setQuestion({
      ...question,
      answerType: type,
      answers: question.answers.map((a) => ({
        type: type,
        content: type === 'text' ? a.content || '' : '',
        alt: type === 'image' ? '' : undefined,
      })),
    });
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: 'image',
        folder: 'quiz-images',
        tags: ['quiz', 'answer-image'],
      });

      if (!result) return;

      const newAnswers = [...question.answers];
      newAnswers[index] = {
        type: 'image',
        content: result.url,
        alt: newAnswers[index].alt || file.name,
      };

      setQuestion({
        ...question,
        answers: newAnswers,
      });
    } catch (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      toast.custom(() => (
        <CustomToast 
          message="Fehler beim Verarbeiten des Bildes. Versuche es erneut." 
          type="error" 
        />
      ));
    }
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/admin/quiz/edit/${id}`)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Zurück zum Quiz"
                aria-label="Zurück zum Quiz"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Frage bearbeiten' : 'Neue Frage'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {quizDocument.shortTitle || quizDocument.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/quiz/edit/${id}`)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Speichert...' : isEditing ? 'Aktualisieren' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {/* Question Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frage
              </label>
              <input
                type="text"
                value={question.question}
                onChange={(e) => setQuestion({ ...question, question: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Was ist 2 + 2?"
              />
            </div>

            {/* Answer Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Antwort-Typ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswerTypeChange('text')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    question.answerType === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => handleAnswerTypeChange('image')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    question.answerType === 'image'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Bilder
                </button>
              </div>
            </div>

            {/* Answers */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Antworten ({question.answers.length}/5)
                </label>
                <button
                  onClick={handleAddAnswer}
                  disabled={question.answers.length >= 5}
                  className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  + Antwort hinzufügen
                </button>
              </div>

              {question.answerType === 'text' ? (
                <div className="space-y-3">
                  {question.answers.map((answer: Answer, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={answer.content}
                        onChange={(e) => {
                          const newAnswers = [...question.answers];
                          newAnswers[i] = {
                            type: 'text',
                            content: e.target.value,
                          };
                          setQuestion({
                            ...question,
                            answers: newAnswers,
                          });
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Antwort ${i + 1}`}
                      />
                      <button
                        onClick={() => setQuestion({ ...question, correctAnswerIndex: i })}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          question.correctAnswerIndex === i
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        title={question.correctAnswerIndex === i ? 'Korrekte Antwort' : 'Als korrekt markieren'}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveAnswer(i)}
                        disabled={question.answers.length <= 2}
                        className="px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <MessageCircleWarning className="w-4 h-4" />
                      <span>Bilder werden auf Cloudinary gehostet (max. 10 MB).</span>
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Tipp: Für beste Performance unter 2 MB bleiben.</span>
                    </p>
                  </div>

                  {question.answers.map((answer: Answer, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                    >
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bild {i + 1}
                        </label>

                        {answer.content && (
                          <img
                            src={answer.content}
                            alt="Vorschau"
                            className="w-full max-w-md h-48 object-cover rounded-lg"
                          />
                        )}

                        <label
                          htmlFor={`file-upload-${i}`}
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <span>{answer.content ? 'Bild ändern' : 'Bild auswählen'}</span>
                          <input
                            id={`file-upload-${i}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpload(i, e.target.files[0]);
                              }
                            }}
                            className="sr-only"
                          />
                        </label>

                        <input
                          type="text"
                          value={answer.alt || ''}
                          onChange={(e) => {
                            const newAnswers = [...question.answers];
                            newAnswers[i] = {
                              ...answer,
                              alt: e.target.value,
                            };
                            setQuestion({
                              ...question,
                              answers: newAnswers,
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm"
                          placeholder="Beschreibung (optional)"
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => setQuestion({ ...question, correctAnswerIndex: i })}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                              question.correctAnswerIndex === i
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {question.correctAnswerIndex === i ? (
                              <span className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" />
                                Korrekt
                              </span>
                            ) : (
                              'Als korrekt markieren'
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveAnswer(i)}
                            disabled={question.answers.length <= 2}
                            className="px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Entfernen
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
    </div>
  );
}
