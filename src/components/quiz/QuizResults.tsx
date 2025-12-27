import { 
  Trophy, 
  PartyPopper, 
  ThumbsUp, 
  Award,
  Clock,
  Target,
  RefreshCw,
  AlertCircle,
  Home,
  ArrowLeft,
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

  const isPerfect = allSolved && wrongQuestions.length === 0;
  const isGood = percentage >= 80;
  const isOkay = percentage >= 60;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full border border-gray-100">
        {/* Header mit Icon */}
        <div className="text-center mb-6">
          <div className="mb-4">
            {isPerfect ? (
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto drop-shadow-lg" />
            ) : isGood ? (
              <PartyPopper className="w-20 h-20 text-green-500 mx-auto" />
            ) : isOkay ? (
              <ThumbsUp className="w-20 h-20 text-blue-500 mx-auto" />
            ) : (
              <Award className="w-20 h-20 text-orange-500 mx-auto" />
            )}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {isPerfect ? '🎉 Perfekt!' : isGood ? 'Sehr gut!' : isOkay ? 'Gut gemacht!' : 'Weiter so!'}
          </h2>
          <p className="text-gray-600">Quiz abgeschlossen</p>
        </div>

        {/* Haupt-Statistik */}
        <div className={`rounded-xl p-6 mb-6 ${
          isPerfect 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
            : isGood
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
            : 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200'
        }`}>
          {isPerfect ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-green-700 mb-2">
                🏆 {totalQuestions}/{totalQuestions}
              </div>
              <p className="text-lg text-green-800 font-semibold">
                Alle Fragen korrekt gelöst!
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {correctCount}/{totalAnswered}
              </div>
              <p className="text-xl text-gray-700">
                Richtige Antworten
              </p>
              <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-full mt-3 ${
                isGood ? 'bg-green-200 text-green-800' : isOkay ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'
              } text-sm font-bold`}>
                {percentage}%
              </div>
            </div>
          )}
        </div>

        {/* Detaillierte Statistiken */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Zeit */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <p className="text-xs text-indigo-700 uppercase tracking-wide font-semibold">
                Gesamtzeit
              </p>
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {formatTime(elapsedTime)}
            </p>
          </div>

          {/* Versuche */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <p className="text-xs text-purple-700 uppercase tracking-wide font-semibold">
                Durchläufe
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {totalTries}
            </p>
          </div>
        </div>

        {/* Falsche Fragen */}
        {wrongQuestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">
                Zu wiederholende Fragen ({wrongQuestions.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wrongQuestions.map((q, idx) => (
                <div 
                  key={q.index} 
                  className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors"
                >
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-200 text-red-800 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-800 text-sm flex-1 force-break" lang="de">
                      {q.question}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Fortschritt</span>
            <span className="font-semibold">{correctCount}/{totalQuestions} gelöst</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                isPerfect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                isGood ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 
                'bg-gradient-to-r from-orange-500 to-yellow-500'
              }`}
              style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {wrongQuestions.length > 0 && (
            <button
              onClick={onRepeatWrong}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              title="Falsche Fragen wiederholen"
              aria-label="Falsche Fragen wiederholen"
            >
              <RefreshCw className="w-5 h-5" />
              Falsche Fragen wiederholen ({wrongQuestions.length})
            </button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (isPerfect) {
                  showCompletedQuizWarning(onRestart);
                } else {
                  onRestart();
                }
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              title="Neu starten"
              aria-label="Neu starten"
            >
              <RefreshCw className="w-5 h-5" />
              Neu starten
            </button>
            
            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              title="Zurück"
              aria-label="Zurück"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück
            </button>
          </div>
          
          <button
            onClick={onHome}
            className="w-full text-gray-600 hover:text-gray-900 py-2 transition-colors flex items-center justify-center gap-2"
            title="Zum Start"
            aria-label="Zum Start"
          >
            <Home className="w-4 h-4" />
            Zum Start
          </button>
        </div>
      </div>
    </div>
  );
}
