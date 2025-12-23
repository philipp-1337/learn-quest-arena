import { 
  Trophy, 
  PartyPopper, 
  ThumbsUp, 
  Award, 
  // Timer
} from 'lucide-react';
import type { Question } from '../../types/quizTypes';
import { showCompletedQuizWarning } from '../../utils/showCompletedQuizWarning';

interface QuizResultsProps {
  statistics: {
    correctCount: number;
    totalAnswered: number;
    percentage: number;
    totalQuestions: number;
    solvedCount: number;
    allSolved: boolean;
    totalTries: number;
    elapsedTime: number;
  };
  wrongQuestions: Array<Question & { index: number; wasCorrect: boolean }>;
  onRestart: () => void;
  onRepeatWrong: () => void;
  onBack: () => void;
  onHome: () => void;
}

export default function QuizResults({
  statistics,
  wrongQuestions,
  onRestart,
  onRepeatWrong,
  onBack,
  onHome,
}: QuizResultsProps) {
  const { correctCount, totalAnswered, percentage, totalQuestions, allSolved, totalTries, elapsedTime } = statistics;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
        <div className="mb-6">
          {allSolved && wrongQuestions.length === 0 ? (
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
          ) : percentage >= 80 ? (
            <PartyPopper className="w-16 h-16 text-green-500 mx-auto" />
          ) : percentage >= 60 ? (
            <ThumbsUp className="w-16 h-16 text-blue-500 mx-auto" />
          ) : (
            <Award className="w-16 h-16 text-orange-500 mx-auto" />
          )}
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Quiz beendet!
        </h2>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-6">
          {allSolved && wrongQuestions.length === 0 ? (
            <>
              <div className="text-4xl font-bold text-green-700 mb-2">
                Alle {totalQuestions} Fragen korrekt gelöst!
              </div>
              <div className="text-lg text-gray-700 mb-2">
                Benötigte Durchläufe: {totalTries}
              </div>
              <div className="text-lg font-semibold text-indigo-600">
                {/* <Timer /> */}
                Zeit: {formatTime(elapsedTime)}
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {correctCount} / {totalAnswered}
              </div>
              <p className="text-xl text-gray-700">
                Richtige Antworten ({percentage}%)
              </p>
            </>
          )}
        </div>
        {wrongQuestions.length > 0 && (
          <div className="mb-6 text-left">
            <h3 className="text-lg font-semibold text-red-600 mb-2 force-break" lang="de">Falsch beantwortete Fragen:</h3>
            <ul className="list-disc list-inside text-gray-800">
              {wrongQuestions.map(q => (
                <li key={q.index} className="mb-1">
                  <span className="font-bold">Frage {q.index + 1}:</span> {q.question}
                </li>
              ))}
            </ul>
            <button
              onClick={onRepeatWrong}
              className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              title="Nur falsche Fragen wiederholen"
              aria-label="Nur falsche Fragen wiederholen"
            >
              Nur falsche Fragen wiederholen
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              if (allSolved && wrongQuestions.length === 0) {
                showCompletedQuizWarning(onRestart);
              } else {
                onRestart();
              }
            }}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            title="Nochmal spielen"
            aria-label="Nochmal spielen"
          >
            Nochmal spielen
          </button>
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-900 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            title="Zurück"
            aria-label="Zurück"
          >
            Zurück
          </button>
        </div>
        <button
          onClick={onHome}
          className="mt-4 text-gray-600 hover:text-gray-900"
          title="Zum Start"
          aria-label="Zum Start"
        >
          Zum Start
        </button>
      </div>
    </div>
  );
}
