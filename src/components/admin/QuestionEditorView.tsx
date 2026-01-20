import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Lightbulb, MessageCircleWarning, Lock } from 'lucide-react';
import type { Question, Answer } from '../../types/quizTypes';
import { toast } from 'sonner';
import { CustomToast } from '../misc/CustomToast';
import { uploadWithToast } from '../../utils/cloudinaryUpload';
import { loadQuizDocument, updateQuizDocument, isQuizLocked } from '../../utils/quizzesCollection';
import type { QuizDocument } from '../../types/quizTypes';
import OptimizedImage from '../shared/OptimizedImage';
import { getAuth } from 'firebase/auth';

export default function QuestionEditorView() {
  const { id, index } = useParams<{ id: string; index?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizDocument, setQuizDocument] = useState<QuizDocument | null>(null);
  const [lockWarning, setLockWarning] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question>({
    question: '',
    questionType: 'text',
    answerType: 'text',
    answers: [
      { type: 'text', content: '' },
      { type: 'text', content: '' },
      { type: 'text', content: '' },
    ],
    correctAnswerIndex: 0,
    correctAnswerIndices: [0],
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
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          toast.custom(() => (
            <CustomToast message="Nicht angemeldet" type="error" />
          ));
          navigate('/admin');
          return;
        }

        const quiz = await loadQuizDocument(id);
        if (!quiz) {
          toast.custom(() => (
            <CustomToast message="Quiz nicht gefunden" type="error" />
          ));
          navigate('/admin');
          return;
        }

        // Check if quiz is locked by someone else
        const lock = await isQuizLocked(id, currentUser.uid);
        if (lock) {
          setLockWarning(`Achtung: Dieses Quiz wird gerade von ${lock.userName} bearbeitet. Änderungen sollten nur mit Vorsicht gemacht werden.`);
        }

        setQuizDocument(quiz);

        // Load existing question if editing
        if (isEditing && quiz.questions && quiz.questions[questionIndex]) {
          const existingQuestion = quiz.questions[questionIndex];
          // Ensure correctAnswerIndices exists (backwards compatibility)
          const correctIndices = existingQuestion.correctAnswerIndices || [existingQuestion.correctAnswerIndex];
          setQuestion({
            ...existingQuestion,
            correctAnswerIndices: correctIndices,
          });
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
    if (question.questionType === 'text' && !question.question.trim()) {
      toast.custom(() => (
        <CustomToast message="Bitte gib eine Frage ein" type="error" />
      ));
      return;
    }
    
    if (question.questionType === 'image' && !question.questionImage) {
      toast.custom(() => (
        <CustomToast message="Bitte lade ein Fragen-Bild hoch" type="error" />
      ));
      return;
    }

    if (question.questionType === 'audio' && !question.questionAudio) {
      toast.custom(() => (
        <CustomToast message="Bitte lade eine Fragen-Audio-Datei hoch" type="error" />
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

    if (!question.correctAnswerIndices || question.correctAnswerIndices.length === 0) {
      toast.custom(() => (
        <CustomToast message="Mindestens eine richtige Antwort erforderlich" type="error" />
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
    } else if (question.answerType === 'image') {
      if (question.answers.some((a) => !a.content)) {
        toast.custom(() => (
          <CustomToast message="Bitte lade alle Bilder hoch" type="error" />
        ));
        return;
      }
    } else if (question.answerType === 'audio') {
      if (question.answers.some((a) => !a.content)) {
        toast.custom(() => (
          <CustomToast message="Bitte lade alle Audio-Dateien hoch" type="error" />
        ));
        return;
      }
    }

    if (!quizDocument) return;

    setSaving(true);
    try {
      // Bereinige die Frage von undefined-Werten für Firestore
      const correctIndices = question.correctAnswerIndices || [question.correctAnswerIndex];
      
      // Bereinige Antworten von undefined-Werten
      const cleanAnswers = question.answers.map(answer => {
        const cleanAnswer: Answer = {
          type: answer.type,
          content: answer.content,
        };
        // Nur alt hinzufügen, wenn es definiert ist
        if (answer.alt !== undefined && answer.alt !== null && answer.alt !== '') {
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

      // Füge nur die relevanten optionalen Felder hinzu, wenn sie definiert sind
      if (question.id) {
        cleanQuestion.id = question.id;
      }
      if (question.questionType === 'image' && question.questionImage) {
        cleanQuestion.questionImage = question.questionImage;
        if (question.questionImageAlt) {
          cleanQuestion.questionImageAlt = question.questionImageAlt;
        }
      }
      if (question.questionType === 'audio' && question.questionAudio) {
        cleanQuestion.questionAudio = question.questionAudio;
      }

      const updatedQuestions = isEditing
        ? quizDocument.questions.map((q, i) => i === questionIndex ? cleanQuestion : q)
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
    
    // Update correctAnswerIndices: remove deleted index and adjust remaining indices
    const newCorrectIndices = (question.correctAnswerIndices || [question.correctAnswerIndex])
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    
    // Ensure at least one correct answer remains
    if (newCorrectIndices.length === 0) {
      newCorrectIndices.push(0);
    }
    
    setQuestion({
      ...question,
      answers: newAnswers,
      correctAnswerIndex: newCorrectIndices[0],
      correctAnswerIndices: newCorrectIndices,
    });
  };

  const handleAnswerTypeChange = (type: string) => {
    // Preserve correctAnswerIndices when changing answer type
    const currentCorrectIndices = question.correctAnswerIndices || [question.correctAnswerIndex];
    
    setQuestion({
      ...question,
      answerType: type,
      answers: question.answers.map((a) => ({
        type: type,
        content: type === 'text' ? a.content || '' : '',
        alt: type === 'image' ? '' : undefined,
      })),
      correctAnswerIndices: currentCorrectIndices,
    });
  };

  const handleQuestionTypeChange = (type: 'text' | 'image' | 'audio') => {
    setQuestion({
      ...question,
      questionType: type,
      question: type === 'text' ? question.question : '',
      questionImage: type === 'image' ? question.questionImage : undefined,
      questionImageAlt: type === 'image' ? question.questionImageAlt : undefined,
      questionAudio: type === 'audio' ? question.questionAudio : undefined,
    });
  };

  const handleToggleCorrectAnswer = (index: number) => {
    const currentIndices = question.correctAnswerIndices || [question.correctAnswerIndex];
    let newIndices: number[];
    
    if (currentIndices.includes(index)) {
      // Remove from correct answers
      newIndices = currentIndices.filter(i => i !== index);
      // Ensure at least one correct answer remains
      if (newIndices.length === 0) {
        toast.custom(() => (
          <CustomToast message="Mindestens eine Antwort muss richtig sein" type="error" />
        ));
        return;
      }
    } else {
      // Add to correct answers
      newIndices = [...currentIndices, index].sort((a, b) => a - b);
    }
    
    setQuestion({
      ...question,
      correctAnswerIndex: newIndices[0],
      correctAnswerIndices: newIndices,
    });
  };

  // Helper: Get question type with default
  const getQuestionType = (q: Question): 'text' | 'image' | 'audio' => q.questionType || 'text';

  const handleQuestionImageUpload = async (file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: 'image',
        folder: 'quiz-images',
        tags: ['quiz', 'question-image'],
      });

      if (!result) return;

      setQuestion({
        ...question,
        questionImage: result.url,
        questionImageAlt: question.questionImageAlt || file.name,
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

  const handleQuestionAudioUpload = async (file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: 'auto',
        folder: 'quiz-audio',
        tags: ['quiz', 'question-audio'],
      });

      if (!result) return;

      setQuestion({
        ...question,
        questionAudio: result.url,
      });
    } catch (error) {
      console.error('Fehler beim Hochladen der Audio-Datei:', error);
      toast.custom(() => (
        <CustomToast 
          message="Fehler beim Verarbeiten der Audio-Datei. Versuche es erneut." 
          type="error" 
        />
      ));
    }
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
        // Explicitly preserve correctAnswerIndices
        correctAnswerIndices: question.correctAnswerIndices || [question.correctAnswerIndex],
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

  const handleAudioUpload = async (index: number, file: File) => {
    try {
      const result = await uploadWithToast(file, {
        resourceType: 'auto',
        folder: 'quiz-audio',
        tags: ['quiz', 'answer-audio'],
      });

      if (!result) return;

      const newAnswers = [...question.answers];
      newAnswers[index] = {
        type: 'audio',
        content: result.url,
      };

      setQuestion({
        ...question,
        answers: newAnswers,
        // Explicitly preserve correctAnswerIndices
        correctAnswerIndices: question.correctAnswerIndices || [question.correctAnswerIndex],
      });
    } catch (error) {
      console.error('Fehler beim Hochladen der Audio-Datei:', error);
      toast.custom(() => (
        <CustomToast 
          message="Fehler beim Verarbeiten der Audio-Datei. Versuche es erneut." 
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
          {/* Lock Warning Banner */}
          {lockWarning && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start gap-2">
              <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{lockWarning}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(`/admin/quiz/edit/${id}`)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Zurück zum Quiz"
                aria-label="Zurück zum Quiz"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {isEditing ? 'Frage bearbeiten' : 'Neue Frage'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {quizDocument.shortTitle || quizDocument.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(`/admin/quiz/edit/${id}`)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={saving}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Speichert...' : isEditing ? 'Aktualisieren' : 'Hinzufügen'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {/* Question Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fragen-Typ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleQuestionTypeChange('text')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    getQuestionType(question) === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => handleQuestionTypeChange('image')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    getQuestionType(question) === 'image'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Bild
                </button>
                <button
                  onClick={() => handleQuestionTypeChange('audio')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    getQuestionType(question) === 'audio'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Audio
                </button>
              </div>
            </div>

            {/* Question Input */}
            {getQuestionType(question) === 'text' ? (
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
            ) : getQuestionType(question) === 'image' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fragen-Bild
                </label>
                <div className="space-y-4">
                  {question.questionImage && (
                    <OptimizedImage
                      src={question.questionImage}
                      alt={question.questionImageAlt || 'Frage'}
                      className="w-full max-w-2xl rounded-lg"
                      width={800}
                      height={600}
                    />
                  )}
                  
                  <label
                    htmlFor="question-image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <span>{question.questionImage ? 'Bild ändern' : 'Bild auswählen'}</span>
                    <input
                      id="question-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionImageUpload(e.target.files[0]);
                        }
                      }}
                      className="sr-only"
                    />
                  </label>

                  <div>
                    <input
                      type="text"
                      value={question.questionImageAlt || ''}
                      onChange={(e) => setQuestion({ ...question, questionImageAlt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm text-[16px]"
                      placeholder="Alt-Text für Barrierefreiheit (z.B. 'Fragen-Bild')"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ⚠️ Neutral halten - nicht die Antwort verraten!
                    </p>
                  </div>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => setQuestion({ ...question, question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm text-[16px]"
                    placeholder="Optionaler Fragentext (z.B. 'Was siehst du auf diesem Bild?')"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fragen-Audio
                </label>
                <div className="space-y-4">
                  {question.questionAudio && (
                    <audio controls className="w-full max-w-2xl">
                      <source src={question.questionAudio} />
                      Dein Browser unterstützt das Audio-Element nicht.
                    </audio>
                  )}
                  
                  <label
                    htmlFor="question-audio-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <span>{question.questionAudio ? 'Audio ändern' : 'Audio auswählen'}</span>
                    <input
                      id="question-audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionAudioUpload(e.target.files[0]);
                        }
                      }}
                      className="sr-only"
                    />
                  </label>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => setQuestion({ ...question, question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm"
                    placeholder="Optionaler Fragentext (z.B. 'Was hörst du hier?')"
                  />
                </div>
              </div>
            )}

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
                <button
                  onClick={() => handleAnswerTypeChange('audio')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    question.answerType === 'audio'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Audio
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
                  {question.answers.map((answer: Answer, i: number) => {
                    const isCorrect = (question.correctAnswerIndices || [question.correctAnswerIndex]).includes(i);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isCorrect}
                          onChange={() => handleToggleCorrectAnswer(i)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 flex-shrink-0"
                          title="Als richtige Antwort markieren"
                        />
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
                          onClick={() => handleRemoveAnswer(i)}
                          disabled={question.answers.length <= 2}
                          className="px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : question.answerType === 'image' ? (
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
                          <OptimizedImage
                            src={answer.content}
                            alt="Vorschau"
                            className="w-full max-w-md rounded-lg"
                            width={600}
                            height={400}
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

                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(question.correctAnswerIndices || [question.correctAnswerIndex]).includes(i)}
                              onChange={() => handleToggleCorrectAnswer(i)}
                              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                              title="Als richtige Antwort markieren"
                            />
                            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Richtig
                            </label>
                          </div>
                          <button
                            onClick={() => handleRemoveAnswer(i)}
                            disabled={question.answers.length <= 2}
                            className="ml-auto px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Entfernen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200 flex items-center gap-2">
                      <MessageCircleWarning className="w-4 h-4" />
                      <span>Audio-Dateien werden auf Cloudinary gehostet (max. 10 MB).</span>
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Tipp: Unterstützte Formate: MP3, WAV, OGG, WebM</span>
                    </p>
                  </div>

                  {question.answers.map((answer: Answer, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                    >
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Audio {i + 1}
                        </label>

                        {answer.content && (
                          <audio controls className="w-full max-w-md">
                            <source src={answer.content} />
                            Dein Browser unterstützt das Audio-Element nicht.
                          </audio>
                        )}

                        <label
                          htmlFor={`audio-upload-${i}`}
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <span>{answer.content ? 'Audio ändern' : 'Audio auswählen'}</span>
                          <input
                            id={`audio-upload-${i}`}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleAudioUpload(i, e.target.files[0]);
                              }
                            }}
                            className="sr-only"
                          />
                        </label>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(question.correctAnswerIndices || [question.correctAnswerIndex]).includes(i)}
                              onChange={() => handleToggleCorrectAnswer(i)}
                              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                              title="Als richtige Antwort markieren"
                            />
                            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Richtig
                            </label>
                          </div>
                          <button
                            onClick={() => handleRemoveAnswer(i)}
                            disabled={question.answers.length <= 2}
                            className="ml-auto px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
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
