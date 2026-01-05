import { useState, useEffect } from 'react';
import { Trophy, Home, ArrowLeft, Shield } from 'lucide-react';
import type { QuizChallenge, Question, Answer } from '@types/quizTypes';
import type { UserQuizChallengeProgress } from '@types/userProgress';
import QuizQuestion from './QuizQuestion';
import { PRIZE_LEVELS, formatPrize } from '@utils/quizChallengeConstants';
import { getQuestionId } from '@utils/questionIdHelper';
import { loadAllQuizDocuments } from '@utils/quizzesCollection';

interface QuizChallengePlayerProps {
  challenge: QuizChallenge;
  onBack: () => void;
  onHome: () => void;
  username?: string;
  initialProgress?: UserQuizChallengeProgress;
  onProgressUpdate?: (progress: UserQuizChallengeProgress) => void;
}

export default function QuizChallengePlayer({
  challenge,
  onBack,
  onHome,
  username,
  initialProgress,
  onProgressUpdate,
}: QuizChallengePlayerProps) {
  const [currentLevel, setCurrentLevel] = useState(initialProgress?.currentLevel || 1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<Array<Answer & { originalIndex: number }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<(Answer & { originalIndex: number }) | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [finalPrize, setFinalPrize] = useState(0);
  const [safetyPrize, setSafetyPrize] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionMap, setQuestionMap] = useState<Map<string, Question>>(new Map());

  // Load all questions from quizzes and create a map
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const quizDocs = await loadAllQuizDocuments();
        const qMap = new Map<string, Question>();
        
        quizDocs.forEach((quizDoc) => {
          quizDoc.questions?.forEach((question, index) => {
            const questionId = getQuestionId(question, quizDoc.id, index);
            qMap.set(questionId, question);
          });
        });
        
        setQuestionMap(qMap);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    
    loadQuestions();
  }, []);

  // Update elapsed time
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, gameOver]);

  // Update safety prize based on current level
  useEffect(() => {
    const currentLevelInfo = PRIZE_LEVELS.find(p => p.level === currentLevel);
    if (!currentLevelInfo) return;

    // Find the highest safety level below current level
    const safeLevels = PRIZE_LEVELS.filter(p => p.isSafety && p.level < currentLevel);
    if (safeLevels.length > 0) {
      const highestSafe = safeLevels[safeLevels.length - 1];
      setSafetyPrize(highestSafe.prize);
    } else {
      setSafetyPrize(0);
    }
  }, [currentLevel]);

  // Load a random question for the current level
  useEffect(() => {
    if (gameOver || questionMap.size === 0) return;
    
    const levelData = challenge.levels.find(l => l.level === currentLevel);
    if (!levelData || !levelData.questionIds || levelData.questionIds.length === 0) {
      console.error(`No questions found for level ${currentLevel}`);
      return;
    }

    // Get actual questions from IDs
    const levelQuestions = levelData.questionIds
      .map(id => questionMap.get(id))
      .filter((q): q is Question => q !== undefined);

    if (levelQuestions.length === 0) {
      console.error(`No valid questions found for level ${currentLevel}`);
      return;
    }

    // Select a random question from this level
    const randomQuestion = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    setCurrentQuestion(randomQuestion);
    
    // Shuffle answers
    const answerIndices = randomQuestion.answers.map((_, idx) => idx);
    const shuffled: Array<Answer & { originalIndex: number }> = answerIndices
      .sort(() => Math.random() - 0.5)
      .map(idx => ({
        ...randomQuestion.answers[idx],
        originalIndex: idx
      }));
    setShuffledAnswers(shuffled);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentLevel, gameOver, challenge, questionMap]);

  const handleAnswerSelect = (answer: Answer & { originalIndex: number }) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer.originalIndex === currentQuestion.correctAnswerIndex;
    
    if (isCorrect) {
      setShowResult(true);
      // Update progress
      if (username && onProgressUpdate) {
        const currentPrize = PRIZE_LEVELS.find(p => p.level === currentLevel)?.prize || 0;
        const progress: UserQuizChallengeProgress = {
          username,
          challengeId: challenge.id,
          currentLevel: currentLevel + 1,
          highestLevel: Math.max(currentLevel, initialProgress?.highestLevel || 0),
          highestPrize: Math.max(currentPrize, initialProgress?.highestPrize || 0),
          safetyPrize,
          completed: currentLevel === 15,
          lastUpdated: Date.now(),
        };
        onProgressUpdate(progress);
      }
    } else {
      // Wrong answer - game over
      setShowResult(true);
      setGameOver(true);
      setFinalPrize(safetyPrize);
    }
  };

  const handleNext = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer.originalIndex === currentQuestion.correctAnswerIndex;
    
    if (isCorrect) {
      if (currentLevel === 15) {
        // Won the game!
        setGameOver(true);
        setIsWinner(true);
        setFinalPrize(1000000);
      } else {
        // Next level
        setCurrentLevel(currentLevel + 1);
      }
    }
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setGameOver(false);
    setIsWinner(false);
    setFinalPrize(0);
    setSafetyPrize(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              {isWinner ? (
                <>
                  <div className="mb-6">
                    <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 Glückwunsch! 🎉
                  </h1>
                  <p className="text-2xl text-gray-700 mb-2">
                    Du hast die Quiz-Challenge gewonnen!
                  </p>
                  <p className="text-5xl font-bold text-green-600 mb-8">
                    {formatPrize(finalPrize)}
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-6xl">😢</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Leider falsch!
                  </h1>
                  <p className="text-xl text-gray-700 mb-2">
                    Du hast Level {currentLevel} erreicht
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mb-8">
                    Gewinn: {formatPrize(finalPrize)}
                  </p>
                </>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Nochmal spielen
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Zurück
                </button>
                <button
                  onClick={onHome}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Startseite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700">Lade Frage...</p>
        </div>
      </div>
    );
  }

  const correctAnswer = shuffledAnswers.find(
    a => a.originalIndex === currentQuestion.correctAnswerIndex
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Prize Ladder - Sidebar on desktop, top on mobile */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">Gewinnstufen</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {PRIZE_LEVELS.slice().reverse().map((level) => (
                <div
                  key={level.level}
                  className={`
                    px-3 py-2 rounded-lg text-center text-sm font-medium transition-all
                    ${level.level === currentLevel 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105' 
                      : level.level < currentLevel
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                    }
                    ${level.isSafety ? 'ring-2 ring-yellow-400' : ''}
                  `}
                >
                  <div className="flex items-center justify-center gap-1">
                    {level.isSafety && <Shield className="w-3 h-3" />}
                    <span className="text-xs">{level.level}.</span>
                  </div>
                  <div className="font-bold">{formatPrize(level.prize)}</div>
                </div>
              ))}
            </div>
            {safetyPrize > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-center">
                <p className="text-sm text-yellow-800">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Gesichert: <span className="font-bold">{formatPrize(safetyPrize)}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Question Display */}
        <QuizQuestion
          question={currentQuestion}
          shuffledAnswers={shuffledAnswers}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          currentQuestion={currentLevel - 1}
          totalQuestions={15}
          onAnswerSelect={handleAnswerSelect}
          onNext={handleNext}
          onHome={onHome}
          onBack={onBack}
          elapsedTime={elapsedTime}
          showResultOverride={showResult}
        />
      </div>
    </div>
  );
}
