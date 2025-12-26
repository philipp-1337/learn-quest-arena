import { useState, useEffect } from 'react';
import type { Quiz, Question, Answer } from '../types/quizTypes';
import type { QuestionSRSData } from '../types/userProgress';
import { getQuestionId } from '../utils/questionIdHelper';

// SRS Hilfsfunktionen
function calculateNextReviewDate(correctStreak: number, isCorrect: boolean): number {
  // Einfaches SRS: Intervall verdoppelt sich bei richtigen Antworten
  // Intervalle: 1 Tag, 2 Tage, 4 Tage, 8 Tage, 16 Tage, 32 Tage
  const baseInterval = 24 * 60 * 60 * 1000; // 1 Tag in Millisekunden
  const streak = isCorrect ? correctStreak + 1 : 0;
  const multiplier = Math.pow(2, Math.min(streak, 5));
  return Date.now() + (baseInterval * multiplier);
}

function calculateDifficultyLevel(correctStreak: number, attempts: number): number {
  // Schwierigkeitsstufe basierend auf Erfolgsstreak und Versuchen
  // 0 = neu, 1-2 = lernend, 3-4 = bekannt, 5 = gemeistert
  if (correctStreak >= 5) return 5;
  if (correctStreak >= 3) return 4;
  if (correctStreak >= 2) return 3;
  if (correctStreak >= 1) return 2;
  if (attempts > 0) return 1;
  return 0;
}

// Akzeptiert jetzt auch das neue Modell mit SRS
export type QuizPlayerInitialState = {
  answers?: boolean[];
  solvedQuestions?: string[];
  totalTries?: number;
  questions?: {
    [questionId: string]: QuestionSRSData;
  };
  completed?: boolean;
};

export function useQuizPlayer(
  quiz: Quiz,
  initialState?: QuizPlayerInitialState
) {
  // Fragen einmalig mischen (gleiche Reihenfolge für die Session)
  const [shuffledQuestions] = useState(() => {
    const arr = [...quiz.questions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  // Finde die erste ungelöste Frage, falls Fortschritt vorhanden

  // Neues Modell: Fragen-Fortschritt mit Question IDs initialisieren
  function getFirstUnsolvedIndex() {
    if (initialState?.questions) {
      // Verwende Question IDs statt Indizes
      const idx = shuffledQuestions.findIndex((q) => {
        const qId = getQuestionId(q, quiz.id, quiz.questions.indexOf(q));
        return !initialState.questions?.[qId]?.answered;
      });
      return idx === -1 ? 0 : idx;
    }
    if (!initialState?.answers || initialState.answers.length === 0) return 0;
    const idx = initialState.answers.findIndex(a => a === false);
    if (idx === -1) return initialState.answers.length < shuffledQuestions.length ? initialState.answers.length : 0;
    return idx;
  }

  // State für neues Modell
  const [questionProgress, setQuestionProgress] = useState<QuizPlayerInitialState['questions']>(initialState?.questions || {});

  const [currentQuestion, setCurrentQuestion] = useState<number>(getFirstUnsolvedIndex());
  const [selectedAnswer, setSelectedAnswer] = useState<(Answer & { originalIndex: number }) | null>(null);
  const [answers, setAnswers] = useState<boolean[]>(initialState?.answers || []);
  const [shuffledAnswers, setShuffledAnswers] = useState<Array<Answer & { originalIndex: number }>>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [repeatQuestions, setRepeatQuestions] = useState<Question[] | null>(null);
  const [totalTries, setTotalTries] = useState<number>(initialState?.totalTries || 1);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(
    initialState?.solvedQuestions ? new Set(initialState.solvedQuestions) : new Set()
  );

  // Zeit-Tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [completedTime, setCompletedTime] = useState<number | null>(null);

  // Starte Timer beim ersten Laden des Hooks
  useEffect(() => {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  }, []);

  // Update elapsed time - stoppt wenn showResults true oder completedTime gesetzt
  useEffect(() => {
    if (startTime === null || completedTime !== null || showResults) return;
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, completedTime, showResults]);

  // Shuffle answers when question changes
  useEffect(() => {
    const questions = repeatQuestions || shuffledQuestions;
    const question = questions[currentQuestion];
    const answerIndices = question.answers.map((_, idx) => idx);
    const shuffled: Array<Answer & { originalIndex: number }> = answerIndices
      .sort(() => Math.random() - 0.5)
      .map(idx => ({
        ...question.answers[idx],
        originalIndex: idx
      }));
    setShuffledAnswers(shuffled);
  }, [currentQuestion, shuffledQuestions, repeatQuestions]);

  const handleAnswerSelect = (answer: Answer & { originalIndex: number }) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const questions = repeatQuestions || shuffledQuestions;
    const currentQ = questions[currentQuestion];
    const isCorrect = answer.originalIndex === currentQ.correctAnswerIndex;
    
    // Question ID für das Progress-Tracking ermitteln
    const originalIndex = quiz.questions.indexOf(currentQ);
    const questionId = getQuestionId(currentQ, quiz.id, originalIndex >= 0 ? originalIndex : currentQuestion);
    
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers, isCorrect];
      // Neues Modell: Frage-Fortschritt mit Question ID und SRS-Daten aktualisieren
      setQuestionProgress(prev => {
        const prevQ = prev?.[questionId] || { 
          answered: false, 
          attempts: 0, 
          lastAnswerCorrect: false,
          correctStreak: 0,
          difficultyLevel: 0
        };
        const newStreak = isCorrect ? prevQ.correctStreak + 1 : 0;
        const newAttempts = prevQ.attempts + 1;
        return {
          ...prev,
          [questionId]: {
            answered: isCorrect ? true : prevQ.answered,
            attempts: newAttempts,
            lastAnswerCorrect: isCorrect,
            correctStreak: newStreak,
            lastAttemptDate: Date.now(),
            nextReviewDate: calculateNextReviewDate(prevQ.correctStreak, isCorrect),
            difficultyLevel: calculateDifficultyLevel(newStreak, newAttempts),
          }
        };
      });
      // Wenn richtig beantwortet, sofort zu solvedQuestions hinzufügen
      if (isCorrect) {
        setSolvedQuestions(prevSolved => {
          const newSolved = new Set(prevSolved);
          newSolved.add(currentQ.question);
          return newSolved;
        });
      }
      return newAnswers;
    });
  };

  const handleNext = () => {
    const questions = repeatQuestions || shuffledQuestions;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Nach Abschluss: Alle korrekt beantworteten Fragen zu solvedQuestions hinzufügen
      setShowResults(true);
      setSolvedQuestions(prev => {
        const newSolved = new Set(prev);
        questions.forEach((q, idx) => {
          if (answers[idx]) {
            newSolved.add(q.question);
          }
        });
        return newSolved;
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
    setRepeatQuestions(null);
    setTotalTries(1);
    setSolvedQuestions(new Set());
    setStartTime(Date.now());
    setElapsedTime(0);
    setCompletedTime(null);
  };

  const handleRepeatWrong = () => {
    const questions = repeatQuestions || shuffledQuestions;
    const wrongQuestions = questions
      .map((q, idx) => ({ ...q, _originalIndex: idx }))
      .filter((_, idx) => !answers[idx]);
    
    // Update solvedQuestions-Set
    const newSolved = new Set(solvedQuestions);
    questions.forEach((q, idx) => {
      if (answers[idx]) {
        newSolved.add(q.question);
      }
    });
    setSolvedQuestions(newSolved);
    
    if (wrongQuestions.length > 0) {
      setRepeatQuestions(wrongQuestions);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setShowResults(false);
      setTotalTries(t => t + 1);
    }
  };

  const getCurrentQuestion = () => {
    const questions = repeatQuestions || shuffledQuestions;
    return questions[currentQuestion];
  };

  const getCorrectAnswer = () => {
    const question = getCurrentQuestion();
    return shuffledAnswers.find(
      a => a.originalIndex === question.correctAnswerIndex
    );
  };

  const getWrongQuestions = () => {
    const questions = repeatQuestions || shuffledQuestions;
    return questions
      .map((q, idx) => ({
        ...q,
        index: idx,
        wasCorrect: answers[idx]
      }))
      .filter(q => !q.wasCorrect);
  };

  const getStatistics = () => {
    const correctCount = answers.filter(a => a).length;
    const percentage = Math.round((correctCount / answers.length) * 100);
    const allSolved = solvedQuestions.size === shuffledQuestions.length;
    
    return {
      correctCount,
      totalAnswered: answers.length,
      percentage,
      totalQuestions: shuffledQuestions.length,
      solvedCount: solvedQuestions.size,
      allSolved,
      totalTries,
      elapsedTime,
    };
  };

  return {
    currentQuestion,
    selectedAnswer,
    answers,
    shuffledAnswers,
    showResults,
    repeatQuestions,
    solvedQuestions,
    totalTries,
    questionProgress,
    elapsedTime,
    completedTime,
    setCompletedTime,
    handleAnswerSelect,
    handleNext,
    handleRestart,
    handleRepeatWrong,
    getCurrentQuestion: () => {
      const questions = repeatQuestions || shuffledQuestions;
      return questions[currentQuestion];
    },
    getCorrectAnswer,
    getWrongQuestions,
    getStatistics,
  };
}
