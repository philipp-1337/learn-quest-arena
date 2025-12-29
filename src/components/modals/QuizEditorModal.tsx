import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Lightbulb, MessageCircleWarning } from 'lucide-react';
import type { Quiz, Question, Answer } from '../../types/quizTypes';
import { toast } from 'sonner';

interface QuizEditorModalProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
}

type QuestionEditor = Question & { isEditing?: boolean; editIndex?: number };

const MAX_IMAGE_SIZE = 500 * 1024; // 500 KB
const MAX_BASE64_SIZE = 1 * 1024 * 1024; // 1 MB for Base64 encoded data

const compressImage = (file: Blob, maxWidth: number = 1024, maxHeight: number = 1024): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function QuizEditorModal({
  quiz,
  onSave,
  onClose,
}: QuizEditorModalProps) {
  const [editedQuiz, setEditedQuiz] = useState<Quiz>({
    ...quiz,
    shortTitle: quiz.shortTitle || quiz.title,
    questions: quiz.questions || [],
    hidden: quiz.hidden === undefined ? true : quiz.hidden,
  });
  const [currentQuestion, setCurrentQuestion] = useState<QuestionEditor | null>(
    null
  );

  const handleAddQuestion = () => {
    setCurrentQuestion({
      question: '',
      answerType: 'text',
      answers: [
        { type: 'text', content: '' },
        { type: 'text', content: '' },
        { type: 'text', content: '' },
      ],
      correctAnswerIndex: 0,
    });
  };

  const handleAddAnswer = () => {
    if (!currentQuestion || currentQuestion.answers.length >= 5) return;
    const newAnswers = [
      ...currentQuestion.answers,
      {
        type: currentQuestion.answerType,
        content: '',
        alt: currentQuestion.answerType === 'image' ? '' : undefined,
      },
    ];
    setCurrentQuestion({
      ...currentQuestion,
      answers: newAnswers,
    });
  };

  const handleRemoveAnswer = (index: number) => {
    if (!currentQuestion || currentQuestion.answers.length <= 2) return;
    const newAnswers = currentQuestion.answers.filter((_, i) => i !== index);
    let newCorrectIndex = currentQuestion.correctAnswerIndex;
    if (newCorrectIndex >= newAnswers.length) {
      newCorrectIndex = newAnswers.length - 1;
    }
    setCurrentQuestion({
      ...currentQuestion,
      answers: newAnswers,
      correctAnswerIndex: newCorrectIndex,
    });
  };

  const handleAnswerTypeChange = (type: string) => {
    if (!currentQuestion) return;
    setCurrentQuestion({
      ...currentQuestion,
      answerType: type,
      answers: currentQuestion.answers.map((a) => ({
        type: type,
        content: type === 'text' ? a.content || '' : '',
        alt: type === 'image' ? '' : undefined,
      })),
    });
  };

  const handleImageUpload = async (index: number, file: Blob) => {
    try {
      const fileName = (file as File).name;

      // Check original file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Bild zu groß! Max. 500 KB. Dein Bild: ${(file.size / 1024).toFixed(1)} KB`
        );

        // Ask user if they want compression help
        const shouldCompress = window.confirm(
          `Dein Bild ist zu groß (${(file.size / 1024).toFixed(1)} KB, max. 500 KB).\n\nMöchtest du eine Anleitung zur Bildkomprimierung?\n\nEmpfohlen:\n• Online: tinypng.com oder imagecompressor.com\n• Desktop: ImageMagick, GIMP oder Preview (macOS)`
        );

        if (shouldCompress) {
          toast.info(
            'Komprimiere dein Bild online oder mit einem Tool und lade es erneut hoch.'
          );
        }
        return;
      }

      const loadingToast = toast.loading('Bild wird verarbeitet...');

      // Compress image if needed
      let compressedFile = file;
      if (file.size > 300 * 1024) {
        compressedFile = await compressImage(file);
      }

      // Convert to Base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        // Check Base64 size
        if (base64String.length > MAX_BASE64_SIZE) {
          toast.dismiss(loadingToast);
          toast.error(
            'Base64-Daten zu groß! Bitte komprimiere das Bild stärker.'
          );
          return;
        }

        if (!currentQuestion) return;

        const newAnswers = [...currentQuestion.answers];
        newAnswers[index] = {
          type: 'image',
          content: base64String, // Base64 encoded image
          alt: newAnswers[index].alt || fileName,
        };

        setCurrentQuestion({
          ...currentQuestion,
          answers: newAnswers,
        });

        toast.dismiss(loadingToast);
        toast.success('Bild erfolgreich hochgeladen!');
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      toast.error('Fehler beim Verarbeiten des Bildes. Versuche es erneut.');
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion || !currentQuestion.question.trim()) {
      alert('Bitte gib eine Frage ein!');
      return;
    }

    if (currentQuestion.answers.length < 2) {
      alert('Mindestens 2 Antworten erforderlich!');
      return;
    }

    if (currentQuestion.answers.length > 5) {
      alert('Maximal 5 Antworten erlaubt!');
      return;
    }

    if (currentQuestion.answerType === 'text') {
      if (currentQuestion.answers.some((a) => !a.content.trim())) {
        alert('Bitte fülle alle Antworten aus!');
        return;
      }
    } else {
      if (currentQuestion.answers.some((a) => !a.content)) {
        alert('Bitte lade alle Bilder hoch!');
        return;
      }
    }

    const newQuestions =
      currentQuestion.isEditing && typeof currentQuestion.editIndex === 'number'
        ? editedQuiz.questions.map((q, i) =>
          i === currentQuestion.editIndex ? currentQuestion : q
        )
        : [...editedQuiz.questions, currentQuestion];

    setEditedQuiz({ ...editedQuiz, questions: newQuestions });
    setCurrentQuestion(null);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion({
      ...editedQuiz.questions[index],
      isEditing: true,
      editIndex: index,
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setEditedQuiz({
      ...editedQuiz,
      questions: editedQuiz.questions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto max-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl my-8 z-10 flex flex-col max-h-[90vh] p-0">
        <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b dark:border-gray-700 z-10 px-6 pt-6">
          <div className="flex flex-col gap-2 w-full lg:flex-row lg:gap-4">
            <div className="flex flex-col flex-2">
              <label htmlFor="quiz-title" className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quiz-Titel</label>
              <input
                id="quiz-title"
                type="text"
                value={editedQuiz.title}
                onChange={e => setEditedQuiz(q => ({ ...q, title: e.target.value }))}
                className="text-xl font-bold text-gray-900 dark:text-white force-break bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Quiz-Titel eingeben"
                lang="de"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="quiz-short-title" className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kurztitel (für Admin-Anzeige & URL)</label>
              <input
                id="quiz-short-title"
                type="text"
                value={editedQuiz.shortTitle}
                onChange={e => setEditedQuiz(q => ({ ...q, shortTitle: e.target.value }))}
                className="text-xl font-bold text-gray-900 dark:text-white force-break bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Kurztitel"
                lang="de"
              />
            </div>
          </div>
        </div>

        {/* Question List */}
        {!currentQuestion && (
          <div className="space-y-8 mb-10 flex-1 overflow-y-auto px-6">
            <div className="flex justify-between items-center my-6">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight force-break" lang="de">
                Fragen <span className="text-base font-normal text-gray-500 dark:text-gray-400">({editedQuiz.questions.length})</span>
              </h4>
              <button
                onClick={handleAddQuestion}
                title="Frage hinzufügen"
                aria-label="Frage hinzufügen"
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {editedQuiz.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Noch keine Fragen vorhanden. Klicke auf "Frage hinzufügen" um zu
                starten.
              </div>
            ) : (
              <div className="space-y-3">
                {editedQuiz.questions.map((q: Question, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {index + 1}. {q.question}
                            <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded align-middle">
                              {q.answerType === 'text' ? 'Text' : 'Bilder'}
                            </span>
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {q.answers.map((answer: Answer, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              {i === q.correctAnswerIndex ? (
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
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
                                    src={answer.content}
                                    alt={answer.alt}
                                    className="w-16 h-16 object-cover rounded"
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
                          onClick={() => handleEditQuestion(index)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          title="Frage bearbeiten"
                          aria-label="Frage bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
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
        )}

        {/* Question Editor */}
        {currentQuestion && (
          <div className="space-y-4 mb-6 flex-1 overflow-y-auto px-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white my-4 force-break" lang="de">
              {currentQuestion.isEditing ? 'Frage bearbeiten' : 'Neue Frage'}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frage
              </label>
              <input
                type="text"
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Was ist 2 + 2?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Antwort-Typ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswerTypeChange('text')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${currentQuestion.answerType === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  Text
                </button>
                <button
                  onClick={() => handleAnswerTypeChange('image')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${currentQuestion.answerType === 'image'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  Bilder
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Antworten ({currentQuestion.answers.length}/5)
                </label>
                <button
                  onClick={handleAddAnswer}
                  disabled={currentQuestion.answers.length >= 5}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Antwort hinzufügen"
                  aria-label="Antwort hinzufügen"
                >
                  + Hinzufügen
                </button>
              </div>

              {currentQuestion.answerType === 'text' ? (
                <div className="space-y-2">
                  {currentQuestion.answers.map((answer: Answer, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={answer.content}
                        onChange={(e) => {
                          const newAnswers = [...currentQuestion.answers];
                          newAnswers[i] = {
                            type: 'text',
                            content: e.target.value,
                          };
                          setCurrentQuestion({
                            ...currentQuestion,
                            answers: newAnswers,
                          });
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Antwort ${i + 1}`}
                      />
                      <button
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswerIndex: i,
                          })
                        }
                        className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${currentQuestion.correctAnswerIndex === i
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        title={currentQuestion.correctAnswerIndex === i ? 'Korrekte Antwort' : 'Als korrekt markieren'}
                        aria-label={currentQuestion.correctAnswerIndex === i ? 'Korrekte Antwort' : 'Als korrekt markieren'}
                      >
                        {currentQuestion.correctAnswerIndex === i ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4 inline text-white" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-700">
                            <Check className="w-4 h-4 inline text-gray-500" />
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveAnswer(i)}
                        disabled={currentQuestion.answers.length <= 2}
                        className="px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        title="Antwort löschen"
                        aria-label="Antwort löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-900 flex items-center gap-1.5">
                      <MessageCircleWarning className="w-4 h-4 text-blue-600" />
                      <span>Bildgröße max. 500 KB. Größere Bilder werden automatisch komprimiert.</span>
                    </p>
                    <p className="text-xs text-blue-700 mt-2 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span>
                        Tipp: Nutze tinypng.com oder imagecompressor.com zur Optimierung.
                      </span>
                    </p>
                  </div>
                  {currentQuestion.answers.map((answer: Answer, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-300 rounded-lg p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bild {i + 1}
                          </label>

                          {answer.content && (
                            <img
                              src={answer.content}
                              alt="Vorschau"
                              className="w-full h-32 object-cover rounded-md mt-2 mb-2"
                            />
                          )}

                          <label
                            htmlFor={`file-upload-${i}`}
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <span>
                              {answer.content
                                ? 'Bild ändern'
                                : 'Bild auswählen'}
                            </span>
                            <input
                              id={`file-upload-${i}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(i, e.target.files[0]);
                                }
                              }}
                              disabled={false}
                              className="sr-only"
                            />
                          </label>

                          <input
                            type="text"
                            value={answer.alt || ''}
                            onChange={(e) => {
                              const newAnswers = [...currentQuestion.answers];
                              newAnswers[i] = {
                                ...answer,
                                alt: e.target.value,
                              };
                              setCurrentQuestion({
                                ...currentQuestion,
                                answers: newAnswers,
                              });
                            }}
                            className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Beschreibung (optional)"
                          />
                        </div>
                        <button
                          onClick={() =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              correctAnswerIndex: i,
                            })
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap self-start ${currentQuestion.correctAnswerIndex === i
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          title={currentQuestion.correctAnswerIndex === i ? 'Korrekte Antwort' : 'Als korrekt markieren'}
                          aria-label={currentQuestion.correctAnswerIndex === i ? 'Korrekte Antwort' : 'Als korrekt markieren'}
                        >
                          {currentQuestion.correctAnswerIndex === i ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-4 h-4 inline text-white" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-700">
                              <Check className="w-4 h-4 inline text-gray-500" />
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveAnswer(i)}
                          disabled={currentQuestion.answers.length <= 2}
                          className="px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap self-start"
                          title="Antwort löschen"
                          aria-label="Antwort löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveQuestion}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                title={currentQuestion.isEditing ? 'Änderungen speichern' : 'Frage hinzufügen'}
                aria-label={currentQuestion.isEditing ? 'Änderungen speichern' : 'Frage hinzufügen'}
              >
                {currentQuestion.isEditing
                  ? 'Änderungen speichern'
                  : 'Frage hinzufügen'}
              </button>
              <button
                onClick={() => setCurrentQuestion(null)}
                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300"
                title="Abbrechen"
                aria-label="Abbrechen"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Hidden Toggle */}
        {!currentQuestion && (
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 px-6 pb-6 z-10">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hidden-toggle"
                checked={!!editedQuiz.hidden}
                onChange={e => setEditedQuiz(q => ({ ...q, hidden: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
              />
              <label htmlFor="hidden-toggle" className="text-sm text-gray-700 dark:text-gray-300">
                Quiz ist <span className={editedQuiz.hidden ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>{editedQuiz.hidden ? 'ausgeblendet' : 'sichtbar'}</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onSave(editedQuiz)}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                title="Quiz speichern"
                aria-label="Quiz speichern"
              >
                Quiz speichern
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Schließen"
                aria-label="Schließen"
              >
                Schließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
