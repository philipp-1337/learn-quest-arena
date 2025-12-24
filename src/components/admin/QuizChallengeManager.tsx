import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import type { QuizChallenge, Question } from '../../types/quizTypes';
import useFirestore from '../../hooks/useFirestore';
import { toast } from 'sonner';

const PRIZE_LEVELS = [
  { level: 1, prize: 50, isSafety: false },
  { level: 2, prize: 100, isSafety: false },
  { level: 3, prize: 200, isSafety: false },
  { level: 4, prize: 300, isSafety: false },
  { level: 5, prize: 500, isSafety: false },
  { level: 6, prize: 1000, isSafety: false },
  { level: 7, prize: 2000, isSafety: false },
  { level: 8, prize: 4000, isSafety: false },
  { level: 9, prize: 8000, isSafety: true },
  { level: 10, prize: 16000, isSafety: false },
  { level: 11, prize: 32000, isSafety: false },
  { level: 12, prize: 64000, isSafety: false },
  { level: 13, prize: 125000, isSafety: true },
  { level: 14, prize: 500000, isSafety: false },
  { level: 15, prize: 1000000, isSafety: false },
];

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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);

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
        questions: [],
      })),
      hidden: false,
    };

    await saveDocument(`quizChallenges/${newChallenge.id}`, newChallenge);
    onChallengesChange([...challenges, newChallenge]);
    toast.success('Quiz-Challenge erstellt');
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Möchtest du diese Quiz-Challenge wirklich löschen?')) return;

    await deleteDocument(`quizChallenges/${challengeId}`);
    onChallengesChange(challenges.filter(c => c.id !== challengeId));
    toast.success('Quiz-Challenge gelöscht');
  };

  const handleAddQuestion = () => {
    if (!selectedChallenge || selectedLevel === null) return;

    setEditingQuestion({
      question: '',
      answerType: 'text',
      answers: [
        { type: 'text', content: '' },
        { type: 'text', content: '' },
        { type: 'text', content: '' },
        { type: 'text', content: '' },
      ],
      correctAnswerIndex: 0,
    });
    setIsNewQuestion(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedChallenge || selectedLevel === null || !editingQuestion) return;

    const updatedChallenge = { ...selectedChallenge };
    const levelData = updatedChallenge.levels.find(l => l.level === selectedLevel);
    
    if (!levelData) return;

    if (isNewQuestion) {
      levelData.questions.push(editingQuestion);
    } else {
      const questionIndex = levelData.questions.findIndex(
        q => q.question === editingQuestion.question
      );
      if (questionIndex >= 0) {
        levelData.questions[questionIndex] = editingQuestion;
      }
    }

    await saveDocument(`quizChallenges/${updatedChallenge.id}`, updatedChallenge);
    onChallengesChange(
      challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c)
    );
    setSelectedChallenge(updatedChallenge);
    setEditingQuestion(null);
    setIsNewQuestion(false);
    toast.success(isNewQuestion ? 'Frage hinzugefügt' : 'Frage aktualisiert');
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (!selectedChallenge || selectedLevel === null) return;
    if (!confirm('Möchtest du diese Frage wirklich löschen?')) return;

    const updatedChallenge = { ...selectedChallenge };
    const levelData = updatedChallenge.levels.find(l => l.level === selectedLevel);
    
    if (!levelData) return;

    levelData.questions = levelData.questions.filter(q => q !== question);

    await saveDocument(`quizChallenges/${updatedChallenge.id}`, updatedChallenge);
    onChallengesChange(
      challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c)
    );
    setSelectedChallenge(updatedChallenge);
    toast.success('Frage gelöscht');
  };

  const formatPrize = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toLocaleString('de-DE')} Mio. €`;
    }
    return `${amount.toLocaleString('de-DE')} €`;
  };

  return (
    <div className="space-y-6">
      {/* Challenge List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quiz-Challenge</h2>
          <button
            onClick={handleCreateChallenge}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                setEditingQuestion(null);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {challenge.levels.reduce((sum, level) => sum + level.questions.length, 0)} Fragen insgesamt
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChallenge(challenge.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level and Question Editor */}
      {selectedChallenge && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Fragen für: {selectedChallenge.title}
          </h3>

          {/* Level Selector */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Wähle ein Level</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {selectedChallenge.levels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => {
                    setSelectedLevel(level.level);
                    setEditingQuestion(null);
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
                  <div className="text-xs mt-1">{level.questions.length} Fragen</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          {selectedLevel !== null && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Fragen für Level {selectedLevel}
                </h4>
                <button
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Frage hinzufügen
                </button>
              </div>

              {/* Question Editor */}
              {editingQuestion && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frage
                      </label>
                      <textarea
                        value={editingQuestion.question}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, question: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Antworten
                      </label>
                      {editingQuestion.answers.map((answer, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={answer.content}
                            onChange={(e) => {
                              const newAnswers = [...editingQuestion.answers];
                              newAnswers[idx] = { ...answer, content: e.target.value };
                              setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder={`Antwort ${idx + 1}`}
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={editingQuestion.correctAnswerIndex === idx}
                              onChange={() =>
                                setEditingQuestion({ ...editingQuestion, correctAnswerIndex: idx })
                              }
                            />
                            <span className="text-sm">Richtig</span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveQuestion}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Speichern
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setIsNewQuestion(false);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Abbrechen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Questions */}
              <div className="space-y-2">
                {selectedChallenge.levels
                  .find(l => l.level === selectedLevel)
                  ?.questions.map((question, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">
                            {question.question}
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsNewQuestion(false);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
