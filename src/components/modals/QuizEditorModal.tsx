import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Quiz, Question, Answer } from '../../types/quizTypes';

interface QuizEditorModalProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
}

type QuestionEditor = Question & { isEditing?: boolean; editIndex?: number };

export default function QuizEditorModal({
  quiz,
  onSave,
  onClose,
}: QuizEditorModalProps) {
  const [editedQuiz, setEditedQuiz] = useState<Quiz>({
    ...quiz,
    questions: quiz.questions || [],
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

  const handleImageUpload = (index: number, file: Blob) => {
    // Mock: Create preview URL
    // In production: Upload to Firebase Storage
    /*
    Firebase Storage Implementation:
    
    const uploadImage = async (file, quizId, questionIndex, answerIndex) => {
      const storage = getStorage();
      const storageRef = ref(storage, `quizzes/${quizId}/q${questionIndex}/a${answerIndex}/${file.name}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    };
    
    const url = await uploadImage(file, quiz.id, currentQuestion.editIndex || editedQuiz.questions.length, index);
    */

    // Mock: Use local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!currentQuestion) return;
      const newAnswers = [...currentQuestion.answers];
      newAnswers[index] = {
        type: 'image',
        content: reader.result as string, // In production: Firebase Storage URL
        alt: newAnswers[index].alt || (file as File).name,
      };
      setCurrentQuestion({
        ...currentQuestion,
        answers: newAnswers,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion || !currentQuestion.question.trim()) {
      alert('Bitte gib eine Frage ein!');
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
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h3 className="text-2xl font-bold text-gray-900">
            Quiz bearbeiten: {quiz.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Question List */}
        {!currentQuestion && (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900">
                Fragen ({editedQuiz.questions.length})
              </h4>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Frage hinzufügen
              </button>
            </div>

            {editedQuiz.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Noch keine Fragen vorhanden. Klicke auf "Frage hinzufügen" um zu
                starten.
              </div>
            ) : (
              <div className="space-y-3">
                {editedQuiz.questions.map((q: Question, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {index + 1}. {q.question}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {q.answerType === 'text' ? '📝 Text' : '🖼️ Bilder'}
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
                                      ? 'text-green-700 font-medium'
                                      : 'text-gray-600'
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
                                        ? 'text-green-700 font-medium'
                                        : 'text-gray-600'
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
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
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Was ist 2 + 2?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antwort-Typ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswerTypeChange('text')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentQuestion.answerType === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📝 Text
                </button>
                <button
                  onClick={() => handleAnswerTypeChange('image')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentQuestion.answerType === 'image'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🖼️ Bilder
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antworten (3 Stück)
              </label>

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
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Antwort ${i + 1}`}
                      />
                      <button
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswerIndex: i,
                          })
                        }
                        className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          currentQuestion.correctAnswerIndex === i
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {currentQuestion.correctAnswerIndex === i
                          ? '✓ Richtig'
                          : 'Als richtig markieren'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.answers.map((answer: Answer, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-300 rounded-lg p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Bild {i + 1}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpload(i, e.target.files[0]);
                              }
                            }}
                            className="w-full text-sm"
                          />
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
                            className="w-full px-3 py-2 mt-2 border border-gray-300 rounded text-sm"
                            placeholder="Beschreibung (optional)"
                          />
                          {answer.content && (
                            <img
                              src={answer.content}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded mt-2"
                            />
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              correctAnswerIndex: i,
                            })
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap self-start ${
                            currentQuestion.correctAnswerIndex === i
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {currentQuestion.correctAnswerIndex === i
                            ? '✓ Richtig'
                            : 'Richtig'}
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
              >
                {currentQuestion.isEditing
                  ? 'Änderungen speichern'
                  : 'Frage hinzufügen'}
              </button>
              <button
                onClick={() => setCurrentQuestion(null)}
                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Save Quiz Button */}
        {!currentQuestion && (
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              onClick={() => onSave(editedQuiz)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Quiz speichern
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
