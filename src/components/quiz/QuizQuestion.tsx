import AnswerButton from './AnswerButton';
import type { Question, Answer } from '../../types/quizTypes';

interface QuizQuestionProps {
  question: Question;
  shuffledAnswers: Array<Answer & { originalIndex: number }>;
  selectedAnswer: (Answer & { originalIndex: number }) | null;
  correctAnswer: (Answer & { originalIndex: number }) | undefined;
  currentQuestion: number;
  totalQuestions: number;
  onAnswerSelect: (answer: Answer & { originalIndex: number }) => void;
  onNext: () => void;
  onHome: () => void;
  onBack?: () => void; // For Quiz Challenge mode
  elapsedTime: number;
  showResultOverride?: boolean; // For Quiz Challenge mode
}

export default function QuizQuestion({
  question,
  shuffledAnswers,
  selectedAnswer,
  correctAnswer,
  currentQuestion,
  totalQuestions,
  onAnswerSelect,
  onNext,
  onHome,
  onBack,
  elapsedTime,
  showResultOverride,
}: QuizQuestionProps) {
  const showFeedback = showResultOverride !== undefined ? showResultOverride : selectedAnswer !== null;

  // Format elapsed time
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Progress and Timer */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Frage {currentQuestion + 1} von {totalQuestions}</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{formatTime(elapsedTime)}</span>
            <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 force-break" lang="de">
          {question.question}
        </h2>

        {/* Answers */}
        <div className="space-y-4 mb-8">
          {shuffledAnswers.map((answer, idx) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === correctAnswer;

            return (
              <AnswerButton
                key={idx}
                answer={answer}
                isSelected={isSelected}
                isCorrect={isCorrect}
                showFeedback={showFeedback}
                onSelect={onAnswerSelect}
                disabled={selectedAnswer !== null}
              />
            );
          })}
        </div>

        {/* Next Button */}
        {selectedAnswer && (
          <button
            onClick={onNext}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            title={currentQuestion < totalQuestions - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
            aria-label={currentQuestion < totalQuestions - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
          >
            {currentQuestion < totalQuestions - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
          </button>
        )}

        <button
          onClick={onBack || onHome}
          className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Quiz abbrechen"
          aria-label="Quiz abbrechen"
        >
          Quiz abbrechen
        </button>
      </div>
    </div>
  );
}
