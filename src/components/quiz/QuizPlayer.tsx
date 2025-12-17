import { useEffect, useState } from 'react';
import { useQuizPlayer } from '../../hooks/useQuizPlayer';
import type { QuizPlayerInitialState } from '../../hooks/useQuizPlayer';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import type { Quiz } from '../../types/quizTypes';
import { saveUserProgress, loadUserProgress } from '../../utils/userProgressFirestore';
import type { UserProgress } from '../../types/userProgress';



interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onHome: () => void;
    username?: string;
  }

export default function QuizPlayer({ quiz, onBack, onHome, username }: QuizPlayerProps) {
  // Fortschritt laden und an useQuizPlayer übergeben (nur wenn username gesetzt)
  const [initialState, setInitialState] = useState<QuizPlayerInitialState | undefined>(undefined);
  const [progressLoaded, setProgressLoaded] = useState(!username); // Wenn kein username: sofort geladen

  useEffect(() => {
    if (!username) {
      setInitialState(undefined);
      setProgressLoaded(true);
      return;
    }
    let mounted = true;
    async function fetchProgress() {
      const progress = await loadUserProgress(username as string, quiz.id);
      if (mounted) {
        if (progress) {
          setInitialState({
            answers: progress.answers,
            solvedQuestions: progress.solvedQuestions,
            totalTries: progress.totalTries,
          });
        }
        setProgressLoaded(true);
      }
    }
    fetchProgress();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id, username]);

  // useQuizPlayer erst initialisieren, wenn Fortschritt geladen wurde (nur beim ersten Mount)
  const quizPlayer = useQuizPlayer(quiz, progressLoaded ? initialState : undefined);
  const {
    currentQuestion,
    selectedAnswer,
    answers,
    shuffledAnswers,
    showResults,
    handleAnswerSelect,
    handleNext,
    handleRestart,
    handleRepeatWrong,
    getCurrentQuestion,
    getCorrectAnswer,
    getWrongQuestions,
    getStatistics,
    solvedQuestions,
    totalTries
  } = quizPlayer;


  // Fortschritt speichern nach jeder Aktion
  useEffect(() => {
    if (!progressLoaded || !username) return;
    const progress: UserProgress = {
      username: username as string,
      quizId: quiz.id,
      answers,
      solvedQuestions: Array.from(solvedQuestions),
      totalTries: typeof totalTries === 'function' ? 1 : totalTries,
      lastUpdated: Date.now(),
    };
    saveUserProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, solvedQuestions, totalTries, quiz.id, username, progressLoaded]);



  // Fortschritt speichern nach jeder Aktion
  useEffect(() => {
    if (!progressLoaded) return;
    const progress: UserProgress = {
      username: username ?? '',
      quizId: quiz.id,
      answers,
      solvedQuestions: Array.from(solvedQuestions),
      totalTries: typeof totalTries === 'function' ? 1 : totalTries,
      lastUpdated: Date.now(),
    };
    saveUserProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, solvedQuestions, totalTries, quiz.id, username, progressLoaded]);

  if (!progressLoaded) {
    return <div>Lade Fortschritt...</div>;
  }

  if (showResults) {
    const statistics = getStatistics();
    const wrongQuestions = getWrongQuestions();

    return (
      <QuizResults
        statistics={statistics}
        wrongQuestions={wrongQuestions}
        onRestart={handleRestart}
        onRepeatWrong={handleRepeatWrong}
        onBack={onBack}
        onHome={onHome}
      />
    );
  }

  const question = getCurrentQuestion();
  const correctAnswer = getCorrectAnswer();

  return (
    <QuizQuestion
      question={question}
      shuffledAnswers={shuffledAnswers}
      selectedAnswer={selectedAnswer}
      correctAnswer={correctAnswer}
      currentQuestion={currentQuestion}
      totalQuestions={quiz.questions.length}
      onAnswerSelect={handleAnswerSelect}
      onNext={handleNext}
      onHome={onHome}
    />
  );
}
