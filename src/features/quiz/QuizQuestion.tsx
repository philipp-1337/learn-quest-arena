import AnswerButton from './AnswerButton';
import type { Question, Answer } from 'quizTypes';
import { formatTime } from '@utils/formatTime';
import OptimizedImage from '@shared/OptimizedImage';

interface QuizQuestionProps {
  question: Question;
  shuffledAnswers: Array<Answer & { originalIndex: number }>;
  selectedAnswers: Array<Answer & { originalIndex: number }>; // Changed to array for multi-select
  isAnswerSubmitted: boolean;
  correctAnswers: Array<Answer & { originalIndex: number }>; // Changed to array for multi-select support
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
  isMultiSelect?: boolean; // Whether this question has multiple correct answers
}

export default function QuizQuestion({
  question,
  shuffledAnswers,
  selectedAnswers,
  isAnswerSubmitted,
  correctAnswers,
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
  isMultiSelect = false,
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
          
          {/* Multi-Select Hinweis */}
          {isMultiSelect && !isAnswerSubmitted && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                ⚠️ Mehrfachauswahl: Diese Frage hat mehrere richtige Antworten. Wähle alle richtigen Antworten aus.
              </p>
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="space-y-4 mb-8">
          {shuffledAnswers.map((answer, idx) => {
            const isSelected = selectedAnswers.some(a => a.originalIndex === answer.originalIndex);
            const isCorrect = correctAnswers.some(ca => ca.originalIndex === answer.originalIndex);

            return (
              <AnswerButton
                key={idx}
                answer={answer}
                isSelected={isSelected}
                isCorrect={isCorrect}
                showFeedback={showFeedback}
                onSelect={onAnswerSelect}
                disabled={isAnswerSubmitted}
                isMultiSelect={isMultiSelect}
              />
            );
          })}
        </div>

        {/* Feedback nach Submit bei Multi-Select */}
        {isAnswerSubmitted && isMultiSelect && (
          (() => {
            const selectedCorrectCount = selectedAnswers.filter(a => 
              correctAnswers.some(ca => ca.originalIndex === a.originalIndex)
            ).length;
            const totalCorrectCount = correctAnswers.length;
            const missedCount = totalCorrectCount - selectedCorrectCount;
            const hasWrongSelections = selectedAnswers.some(a => 
              !correctAnswers.some(ca => ca.originalIndex === a.originalIndex)
            );

            if (selectedCorrectCount === totalCorrectCount && !hasWrongSelections) {
              // Alles richtig
              return (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✅ Perfekt! Du hast alle {totalCorrectCount} richtigen Antworten erkannt.
                  </p>
                </div>
              );
            } else {
              // Nicht alle richtig oder falsche dabei
              return (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ❌ Leider falsch. {totalCorrectCount > 1 ? `Es gab ${totalCorrectCount} richtige Antworten` : 'Es gab 1 richtige Antwort'}
                    {missedCount > 0 && ` (${missedCount} ${missedCount === 1 ? 'wurde' : 'wurden'} nicht erkannt - gelb markiert)`}
                    {hasWrongSelections && ' und du hast falsche Antworten ausgewählt'}.
                  </p>
                </div>
              );
            }
          })()
        )}

        {/* Submit Answer Button - erscheint wenn Antwort gewählt aber noch nicht geprüft */}
        {selectedAnswers.length > 0 && !isAnswerSubmitted && (
          <button
            onClick={onSubmitAnswer}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors mb-4 cursor-pointer"
            title="Antwort prüfen"
            aria-label="Antwort prüfen"
          >
            Antwort prüfen {isMultiSelect && `(${selectedAnswers.length} ausgewählt)`}
          </button>
        )}

        {/* Next Button - erscheint nach Prüfung */}
        {isAnswerSubmitted && (
          <button
            onClick={onNext}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
            title={currentQuestion < totalQuestions - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
            aria-label={currentQuestion < totalQuestions - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
          >
            {currentQuestion < totalQuestions - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
          </button>
        )}

        <button
          onClick={onBack || onHome}
          className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          title={cancelButtonTitle}
          aria-label={cancelButtonTitle}
        >
          {cancelButtonText}
        </button>
      </div>
    </div>
  );
}
