import { useEffect, useState } from 'react';
import { useQuizPlayer } from '@hooks/useQuizPlayer';
import type { QuizStartMode, QuizPlayerInitialState } from '@hooks/useQuizPlayer';
import { QuizQuestion, QuizResults } from '@quiz';
import type { Quiz } from 'quizTypes';
import { saveUserQuizProgress, loadUserQuizProgress } from '@utils/userProgressFirestore';
import type { UserQuizProgress } from 'userProgress';
import { getQuestionId } from '@utils/questionIdHelper';
import { ensureSRSFields } from '@utils/srsHelpers';
import { calculateXP } from '@utils/xpCalculation';
import { useImagePreload } from '@utils/useImagePreload';
import { WRONG_QUESTIONS_POOL_QUIZ_ID } from '@utils/wrongQuestionsPool';



interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onHome: () => void;
  username?: string;
  startMode?: QuizStartMode;
  initialStateOverride?: QuizPlayerInitialState;
  originProgressByQuizId?: Record<string, UserQuizProgress>;
}

// Innere Komponente, die erst gerendert wird, wenn Daten geladen sind
function QuizPlayerInner({
  quiz,
  onBack,
  onHome,
  username,
  startMode,
  initialState,
  originProgressByQuizId,
  flashCardMode,
}: QuizPlayerProps & { initialState?: QuizPlayerInitialState; flashCardMode: boolean }) {
  const quizPlayer = useQuizPlayer(quiz, initialState, startMode || 'fresh', { flashCardMode });
  const {
    currentQuestion,
    selectedAnswers,
    isAnswerSubmitted,
    answers,
    shuffledAnswers,
    showResults,
    handleAnswerSelect,
    handleSubmitAnswer,
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
    setCompletedTime,
    isMultiSelect,
  } = quizPlayer;

  const [xpData, setXpData] = useState<{ xpEarned: number; xpDelta: number }>({ xpEarned: 0, xpDelta: 0 });
  const isWrongQuestionsPool = quiz.id === WRONG_QUESTIONS_POOL_QUIZ_ID;

  // Preload Bilder der nächsten 2 Fragen für bessere UX
  useImagePreload(quiz.questions, currentQuestion, 2);

  // Fortschritt speichern nach jeder Aktion (neues Modell mit Question IDs)
  useEffect(() => {
    if (!username) return;
    if (isWrongQuestionsPool) {
      if (!originProgressByQuizId) return;

      const questionProgress = quizPlayer.questionProgress || {};
      const now = Date.now();
      const updatesByQuizId: Record<string, UserQuizProgress> = {};

      quiz.questions.forEach((q, idx) => {
        const originQuizId = q.originQuizId;
        if (!originQuizId) return;
        const baseProgress = originProgressByQuizId[originQuizId];
        if (!baseProgress) return;

        const questionId = getQuestionId(
          q,
          originQuizId,
          typeof q.originQuestionIndex === 'number' ? q.originQuestionIndex : idx
        );
        const updatedQuestion = questionProgress[questionId];
        if (!updatedQuestion) return;

        if (!updatesByQuizId[originQuizId]) {
          updatesByQuizId[originQuizId] = {
            ...baseProgress,
            questions: { ...baseProgress.questions },
            lastUpdated: now,
          };
        }

        updatesByQuizId[originQuizId].questions[questionId] = updatedQuestion;
      });

      Object.values(updatesByQuizId).forEach((progress) => {
        progress.completed = Object.values(progress.questions).every(q => q.answered);
        saveUserQuizProgress(progress);
      });
      return;
    }
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

    // XP berechnen - nur wenn Quiz läuft oder gerade abgeschlossen wurde
    const statistics = getStatistics();
    let newXP = 0;
    let xpDelta = 0;
    
    if (!flashCardMode && username !== 'Gast' && statistics.totalAnswered > 0) {
      const xpCalculation = calculateXP(
        statistics.percentage,
        elapsedTime,
        quiz.questions.length,
        totalTries
      );
      newXP = xpCalculation.totalXP;
      
      // Delta berechnen: neuer XP minus alter XP
      const previousXP = initialState?.xp || 0;
      xpDelta = newXP - previousXP;
      
      setXpData({ xpEarned: newXP, xpDelta });
    } else if (flashCardMode) {
      setXpData({ xpEarned: 0, xpDelta: 0 });
    }
    
    const progress: UserQuizProgress = {
      username: username as string,
      quizId: quiz.id,
      questions: questionsObj,
      totalTries: typeof totalTries === 'function' ? 1 : totalTries,
      completed,
      lastUpdated: Date.now(),
      totalElapsedTime: elapsedTime,
      ...(completed && { completedTime: quizPlayer.completedTime || elapsedTime }),
      // lastXP speichert den vorherigen XP-Wert für zukünftige Delta-Berechnungen
      ...(!flashCardMode && username !== 'Gast' && newXP > 0 && { xp: newXP, lastXP: initialState?.xp || 0 }),
    };
    saveUserQuizProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, solvedQuestions, totalTries, quiz.id, username, quizPlayer.questionProgress, isWrongQuestionsPool, originProgressByQuizId]);

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
        xpEarned={xpData.xpEarned}
        xpDelta={xpData.xpDelta}
      />
    );
  }

  if (flashCardMode && quizPlayer.totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" lang="de">
            Keine passenden Fragen
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6" lang="de">
            Dieses Quiz hat keine Text-Antworten, die im Flash-Card Modus genutzt werden können.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            title="Zurück"
            aria-label="Zurück"
          >
            Zurück
          </button>
          <button
            onClick={onHome}
            className="w-full mt-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Zur Startseite"
            aria-label="Zur Startseite"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  const question = getCurrentQuestion();
  const correctAnswers = getCorrectAnswer(); // Now returns an array
  const isMultiSelectQuestion = isMultiSelect();

  return (
    <QuizQuestion
      question={question}
      shuffledAnswers={shuffledAnswers}
      selectedAnswers={selectedAnswers}
      isAnswerSubmitted={isAnswerSubmitted}
      correctAnswers={correctAnswers}
      currentQuestion={currentQuestion}
      totalQuestions={quizPlayer.totalQuestions}
      onAnswerSelect={handleAnswerSelect}
      onSubmitAnswer={handleSubmitAnswer}
      onNext={handleNext}
      onHome={onHome}
      elapsedTime={elapsedTime}
      hasProgress={!!username && username !== 'Gast'}
      isMultiSelect={isMultiSelectQuestion}
      flashCardMode={flashCardMode}
      lastAnswerCorrect={answers.length > 0 ? answers[answers.length - 1] : undefined}
    />
  );
}

export default function QuizPlayer({
  quiz,
  onBack,
  onHome,
  username,
  startMode = 'fresh',
  initialStateOverride,
  originProgressByQuizId,
}: QuizPlayerProps) {
  const flashCardMode = quiz.isFlashCardQuiz === true;
  // Fortschritt laden und an useQuizPlayer übergeben (nur wenn username gesetzt)
  const [initialState, setInitialState] = useState<QuizPlayerInitialState | undefined>(undefined);
  const [progressLoaded, setProgressLoaded] = useState(!username || !!initialStateOverride);

  useEffect(() => {
    if (initialStateOverride) {
      setInitialState(initialStateOverride);
      setProgressLoaded(true);
      return;
    }
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

  if (!progressLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Lade Quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <QuizPlayerInner 
      quiz={quiz} 
      onBack={onBack} 
      onHome={onHome} 
      username={username} 
      startMode={startMode}
      initialState={initialState}
      originProgressByQuizId={originProgressByQuizId}
      flashCardMode={flashCardMode}
    />
  );
}
