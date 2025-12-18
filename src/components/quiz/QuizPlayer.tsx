import { useEffect, useState } from 'react';
import { useQuizPlayer } from '../../hooks/useQuizPlayer';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import type { Quiz } from '../../types/quizTypes';
import { saveUserQuizProgress, loadUserQuizProgress } from '../../utils/userProgressFirestore';
import type { UserQuizProgress } from '../../types/userProgress';



interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onHome: () => void;
    username?: string;
  }

export default function QuizPlayer({ quiz, onBack, onHome, username }: QuizPlayerProps) {
  // Fortschritt laden und an useQuizPlayer übergeben (nur wenn username gesetzt)
  const [initialState, setInitialState] = useState<any>(undefined);
  const [progressLoaded, setProgressLoaded] = useState(!username);

  useEffect(() => {
    if (!username) {
      setInitialState(undefined);
      setProgressLoaded(true);
      return;
    }
    let mounted = true;
    async function fetchProgress() {
      const progress = await loadUserQuizProgress(username as string, quiz.id);
      if (mounted) {
        if (progress) {
          setInitialState(progress);
        }
        setProgressLoaded(true);
      }
    }
    fetchProgress();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id, username]);

  // useQuizPlayer erst initialisieren, wenn Fortschritt geladen wurde (nur beim ersten Mount)
  // TODO: useQuizPlayer muss auf das neue Modell angepasst werden!
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


  // Fortschritt speichern nach jeder Aktion (neues Modell)
  useEffect(() => {
    if (!progressLoaded || !username) return;
    // questions-Objekt für Firestore erzeugen
    const questionsObj: UserQuizProgress['questions'] = {};
    quiz.questions.forEach((_, idx) => {
      const key = String(idx);
      if (quizPlayer.questionProgress && quizPlayer.questionProgress[key]) {
        questionsObj[key] = quizPlayer.questionProgress[key];
      } else {
        questionsObj[key] = {
          answered: answers[idx] ?? false,
          attempts: answers[idx] !== undefined ? 1 : 0,
          lastAnswerCorrect: answers[idx] ?? false,
        };
      }
    });
    const completed = Object.values(questionsObj).every(q => q.answered);
    const progress: UserQuizProgress = {
      username: username as string,
      quizId: quiz.id,
      questions: questionsObj,
      totalTries: typeof totalTries === 'function' ? 1 : totalTries,
      completed,
      lastUpdated: Date.now(),
    };
    saveUserQuizProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, solvedQuestions, totalTries, quiz.id, username, progressLoaded, quizPlayer.questionProgress]);

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
