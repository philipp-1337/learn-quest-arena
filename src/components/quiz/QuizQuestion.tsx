import AnswerButton from './AnswerButton';
import type { Question, Answer } from '../../types/quizTypes';
import { formatTime } from '../../utils/formatTime';
import OptimizedImage from '../shared/OptimizedImage';

interface QuizQuestionProps {
  question: Question;
  shuffledAnswers: Array<Answer & { originalIndex: number }>;
  selectedAnswer: (Answer & { originalIndex: number }) | null;
  isAnswerSubmitted: boolean;
  correctAnswer: (Answer & { originalIndex: number }) | undefined;
  currentQuestion: number;
  totalQuestions: number;
  onAnswerSelect: (answer: Answer & { originalIndex: number }) => void;
  onSubmitAnswer: () => void;
  onNext: () => void;
  onHome: () => void;
  onBack?: () => void; // For Quiz Challenge mode
  elapsedTime: number;
  showResultOverride?: boolean; // For Quiz Challenge mode
  hasProgress?: boolean; // Whether the user has progress being saved
}

export default function QuizQuestion({
  question,
  shuffledAnswers,
  selectedAnswer,
  isAnswerSubmitted,
  correctAnswer,
  currentQuestion,
  totalQuestions,
  onAnswerSelect,
  onSubmitAnswer,
  onNext,
  onHome,
  onBack,
  elapsedTime,
  showResultOverride,
  hasProgress = false,
}: QuizQuestionProps) {
  const showFeedback = showResultOverride !== undefined ? showResultOverride : isAnswerSubmitted;
  const cancelButtonText = hasProgress ? 'Pausieren' : 'Quiz abbrechen';
  const cancelButtonTitle = hasProgress 
    ? 'Quiz pausieren - Dein Fortschritt wird automatisch gespeichert' 
    : 'Quiz abbrechen';

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
        <div className="mb-8">
          {(question.questionType || 'text') === 'image' && question.questionImage ? (
            <div className="space-y-4">
              <OptimizedImage
                src={question.questionImage}
                alt={question.questionImageAlt || 'Frage'}
                className="w-full rounded-lg"
                width={800}
                height={600}
              />
              {question.question && (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white force-break" lang="de">
                  {question.question}
                </h2>
              )}
            </div>
          ) : (question.questionType || 'text') === 'audio' && question.questionAudio ? (
            <div className="space-y-4">
              <audio controls className="w-full">
                <source src={question.questionAudio} />
                Dein Browser unterstützt das Audio-Element nicht.
              </audio>
              {question.question && (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white force-break" lang="de">
                  {question.question}
                </h2>
              )}
            </div>
          ) : (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white force-break" lang="de">
              {question.question}
            </h2>
          )}
        </div>

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
                disabled={isAnswerSubmitted}
              />
            );
          })}
        </div>

        {/* Submit Answer Button - erscheint wenn Antwort gewählt aber noch nicht geprüft */}
        {selectedAnswer && !isAnswerSubmitted && (
          <button
            onClick={onSubmitAnswer}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors mb-4"
            title="Antwort prüfen"
            aria-label="Antwort prüfen"
          >
            Antwort prüfen
          </button>
        )}

        {/* Next Button - erscheint nach Prüfung */}
        {isAnswerSubmitted && (
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
          title={cancelButtonTitle}
          aria-label={cancelButtonTitle}
        >
          {cancelButtonText}
        </button>
      </div>
    </div>
  );
}
