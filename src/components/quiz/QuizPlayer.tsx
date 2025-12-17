import { useQuizPlayer } from '../../hooks/useQuizPlayer';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import type { Quiz } from '../../types/quizTypes';

interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onHome: () => void;
}

export default function QuizPlayer({ quiz, onBack, onHome }: QuizPlayerProps) {
  const {
    currentQuestion,
    selectedAnswer,
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
  } = useQuizPlayer(quiz);

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
