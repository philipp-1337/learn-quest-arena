import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { QuizChallenge, Question } from 'quizTypes';
import useFirestore from '@hooks/useFirestore';
import { toast } from 'sonner';
import { CustomToast } from '@shared/CustomToast';
import { PRIZE_LEVELS, formatPrize } from '@utils/quizChallengeConstants';
import { getQuestionId } from '@utils/questionIdHelper';
import { loadAllQuizDocuments } from '@utils/quiz-collection';
import OptimizedImage from '@shared/OptimizedImage';

interface QuizChallengeManagerProps {
  challenges: QuizChallenge[];
  onChallengesChange: (challenges: QuizChallenge[]) => void;
}

export default function QuizChallengeManager({
  challenges,
  onChallengesChange,
}: QuizChallengeManagerProps) {
  const { saveDocument, deleteDocument } = useFirestore();
  const [selectedChallenge, setSelectedChallenge] = useState<QuizChallenge | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<(Question & { quizTitle?: string; topicName?: string })[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Lade alle Fragen erst, wenn der Frageauswahl-Dialog geöffnet wird
  useEffect(() => {
    if (!showQuestionSelector || availableQuestions.length > 0) return;
    const loadQuestions = async () => {
      try {
        const quizDocs = await loadAllQuizDocuments();
        const allQuestions: (Question & { quizTitle?: string; topicName?: string })[] = [];
        quizDocs.forEach((quizDoc) => {
          quizDoc.questions?.forEach((question, index) => {
            const questionId = getQuestionId(question, quizDoc.id, index);
            allQuestions.push({
              ...question,
              id: questionId,
              quizTitle: quizDoc.title,
              topicName: quizDoc.topicName,
            });
          });
        });
        setAvailableQuestions(allQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    loadQuestions();
  }, [showQuestionSelector, availableQuestions.length]);

  // Load selected questions when level changes
  useEffect(() => {
    if (selectedChallenge && selectedLevel !== null) {
      const levelData = selectedChallenge.levels.find(l => l.level === selectedLevel);
      if (levelData) {
        setSelectedQuestions(new Set(levelData.questionIds || []));
      }
    }
  }, [selectedChallenge, selectedLevel]);

  const handleCreateChallenge = async () => {
    const title = prompt('Name für die Quiz-Challenge:');
    if (!title) return;

    const newChallenge: QuizChallenge = {
      id: Date.now().toString(),
      title,
      levels: PRIZE_LEVELS.map(level => ({
        level: level.level,
        prize: level.prize,
        isSafetyLevel: level.isSafety,
        questionIds: [],
      })),
      hidden: false,
    };

    await saveDocument(`quizChallenges/${newChallenge.id}`, newChallenge);
    onChallengesChange([...challenges, newChallenge]);
    toast.custom(() => (
      <CustomToast 
        message="Quiz-Challenge erstellt" 
        type="success" 
      />
    ));
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Möchtest du diese Quiz-Challenge wirklich löschen?')) return;

    await deleteDocument(`quizChallenges/${challengeId}`);
    onChallengesChange(challenges.filter(c => c.id !== challengeId));
    toast.custom(() => (
      <CustomToast 
        message="Quiz-Challenge gelöscht" 
        type="success" 
      />
    ));
  };

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSaveQuestionSelection = async () => {
    if (!selectedChallenge || selectedLevel === null) return;

    const updatedChallenge = { ...selectedChallenge };
    const levelData = updatedChallenge.levels.find(l => l.level === selectedLevel);
    
    if (!levelData) return;

    levelData.questionIds = Array.from(selectedQuestions);

    await saveDocument(`quizChallenges/${updatedChallenge.id}`, updatedChallenge);
    onChallengesChange(
      challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c)
    );
    setSelectedChallenge(updatedChallenge);
    setShowQuestionSelector(false);
    toast.custom(() => (
      <CustomToast 
        message="Fragen gespeichert" 
        type="success" 
      />
    ));
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (!selectedChallenge || selectedLevel === null) return;

    const updatedChallenge = { ...selectedChallenge };
    const levelData = updatedChallenge.levels.find(l => l.level === selectedLevel);
    
    if (!levelData) return;

    levelData.questionIds = levelData.questionIds.filter(id => id !== questionId);

    await saveDocument(`quizChallenges/${updatedChallenge.id}`, updatedChallenge);
    onChallengesChange(
      challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c)
    );
    setSelectedChallenge(updatedChallenge);
    toast.custom(() => (
      <CustomToast 
        message="Frage entfernt" 
        type="success" 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Challenge List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz-Challenge</h2>
          <button
            onClick={handleCreateChallenge}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Neue Challenge
          </button>
        </div>

        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedChallenge?.id === challenge.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedChallenge(challenge);
                setSelectedLevel(null);
                setShowQuestionSelector(false);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {challenge.levels.reduce((sum, level) => sum + (level.questionIds?.length || 0), 0)} Fragen insgesamt
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChallenge(challenge.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level and Question Selector */}
      {selectedChallenge && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Fragen für: {selectedChallenge.title}
          </h3>

          {/* Level Selector */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Wähle ein Level</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {selectedChallenge.levels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => {
                    setSelectedLevel(level.level);
                    setShowQuestionSelector(false);
                  }}
                  className={`
                    px-3 py-2 rounded-lg text-center text-sm font-medium transition-all
                    ${selectedLevel === level.level
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                    ${level.isSafetyLevel ? 'ring-2 ring-yellow-400' : ''}
                  `}
                >
                  <div className="text-xs">Level {level.level}</div>
                  <div className="font-bold">{formatPrize(level.prize)}</div>
                  <div className="text-xs mt-1">{level.questionIds?.length || 0} Fragen</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Management */}
          {selectedLevel !== null && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Fragen für Level {selectedLevel}
                </h4>
                <button
                  onClick={() => setShowQuestionSelector(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Fragen auswählen
                </button>
              </div>

              {/* Question Selector Modal */}
              {showQuestionSelector && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-md font-semibold text-gray-800">
                      Wähle Fragen aus dem Pool ({availableQuestions.length} verfügbar)
                    </h5>
                    <button
                      onClick={() => setShowQuestionSelector(false)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                    {availableQuestions.map((question) => {
                      if (!question.id) return null; // Guard clause for safety
                      
                      return (
                        <div
                          key={question.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedQuestions.has(question.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleToggleQuestion(question.id!)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.has(question.id)}
                              onChange={() => handleToggleQuestion(question.id!)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              {(question.questionType || 'text') === 'image' && question.questionImage ? (
                                <div className="mb-2">
                                  <OptimizedImage
                                    src={question.questionImage}
                                    alt={question.questionImageAlt || 'Frage'}
                                    className="w-32 h-24 object-cover rounded"
                                    width={128}
                                    height={96}
                                  />
                                </div>
                              ) : null}
                              <p className="font-medium text-gray-900 dark:text-white mb-1">
                                {(question.questionType || 'text') === 'image' 
                                  ? (question.question || '[Bild-Frage]')
                                  : question.question
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {question.topicName} • {question.quizTitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveQuestionSelection}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Auswahl speichern ({selectedQuestions.size} Fragen)
                    </button>
                    <button
                      onClick={() => setShowQuestionSelector(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Questions List */}
              <div className="space-y-2">
                {selectedChallenge.levels
                  .find(l => l.level === selectedLevel)
                  ?.questionIds?.map((questionId) => {
                    const question = availableQuestions.find(q => q.id === questionId);
                    if (!question) return null;
                    
                    return (
                      <div
                        key={questionId}
                        className="p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {(question.questionType || 'text') === 'image' && question.questionImage ? (
                              <div className="mb-2">
                                <OptimizedImage
                                  src={question.questionImage}
                                  alt={question.questionImageAlt || 'Frage'}
                                  className="w-48 h-36 object-cover rounded"
                                  width={192}
                                  height={144}
                                />
                              </div>
                            ) : null}
                            <p className="font-medium text-gray-900 dark:text-white mb-1">
                              {(question.questionType || 'text') === 'image' 
                                ? (question.question || '[Bild-Frage]')
                                : question.question
                              }
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {question.topicName} • {question.quizTitle}
                            </p>
                            <div className="space-y-1">
                              {question.answers.map((answer, ansIdx) => (
                                <p
                                  key={ansIdx}
                                  className={`text-sm ${
                                    ansIdx === question.correctAnswerIndex
                                      ? 'text-green-600 font-semibold'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {ansIdx === question.correctAnswerIndex && '✓ '}
                                  {answer.content}
                                </p>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveQuestion(questionId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
