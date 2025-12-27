import { useEffect, useState } from 'react';
import { useQuizPlayer, type QuizStartMode, type QuizPlayerInitialState } from '../../hooks/useQuizPlayer';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import type { Quiz } from '../../types/quizTypes';
import { saveUserQuizProgress, loadUserQuizProgress } from '../../utils/userProgressFirestore';
import type { UserQuizProgress } from '../../types/userProgress';
import { getQuestionId } from '../../utils/questionIdHelper';
import { ensureSRSFields } from '../../utils/srsHelpers';



interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onHome: () => void;
  username?: string;
  startMode?: QuizStartMode;
}

export default function QuizPlayer({ quiz, onBack, onHome, username, startMode = 'fresh' }: QuizPlayerProps) {
  // Fortschritt laden und an useQuizPlayer übergeben (nur wenn username gesetzt)
  const [initialState, setInitialState] = useState<QuizPlayerInitialState | undefined>(undefined);
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
  }, [quiz.id, username]);

  // useQuizPlayer erst initialisieren, wenn Fortschritt geladen wurde (nur beim ersten Mount)
  const quizPlayer = useQuizPlayer(quiz, progressLoaded ? initialState : undefined, startMode);
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
    totalTries,
    elapsedTime,
    setCompletedTime
  } = quizPlayer;


  // Fortschritt speichern nach jeder Aktion (neues Modell mit Question IDs)
  useEffect(() => {
    if (!progressLoaded || !username) return;
    // questions-Objekt für Firestore erzeugen mit Question IDs
    const questionsObj: UserQuizProgress['questions'] = {};
    
    // Übernehme den questionProgress direkt, da dieser bereits Question IDs verwendet
    if (quizPlayer.questionProgress) {
      Object.entries(quizPlayer.questionProgress).forEach(([key, value]) => {
        questionsObj[key] = value;
      });
    }
    
    // Füge fehlende Fragen als unbeantwortet hinzu (mit Default-SRS-Werten)
    quiz.questions.forEach((q, idx) => {
      const questionId = getQuestionId(q, quiz.id, idx);
      if (!questionsObj[questionId]) {
        questionsObj[questionId] = ensureSRSFields({});
      }
    });
    
    const completed = Object.values(questionsObj).every(q => q.answered);
    
    // Wenn gerade abgeschlossen, Zeit speichern
    if (completed && !quizPlayer.completedTime) {
      setCompletedTime(elapsedTime);
    }
    
    const progress: UserQuizProgress = {
      username: username as string,
      quizId: quiz.id,
      questions: questionsObj,
      totalTries: typeof totalTries === 'function' ? 1 : totalTries,
      completed,
      lastUpdated: Date.now(),
      completedTime: completed ? (quizPlayer.completedTime || elapsedTime) : undefined,
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
      elapsedTime={elapsedTime}
    />
  );
}
