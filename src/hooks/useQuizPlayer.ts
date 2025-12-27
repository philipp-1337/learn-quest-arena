import { useState, useEffect } from 'react';
import type { Quiz, Question, Answer } from '../types/quizTypes';
import type { QuestionSRSData } from '../types/userProgress';
import { getQuestionId } from '../utils/questionIdHelper';

// Quiz start mode - determines how to start the quiz
export type QuizStartMode = 'fresh' | 'continue';

// Helper function to find the original index of a question in the quiz
function findOriginalQuestionIndex(question: Question, quiz: Quiz): number {
  // First try direct reference match
  const directIndex = quiz.questions.indexOf(question);
  if (directIndex >= 0) return directIndex;
  
  // If direct match fails, try matching by question text and correct answer index
  // This handles cases where question objects have been copied
  return quiz.questions.findIndex(q => 
    q.question === question.question && 
    q.correctAnswerIndex === question.correctAnswerIndex
  );
}

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
  initialState?: QuizPlayerInitialState,
  startMode: QuizStartMode = 'fresh'
) {
  // Fragen einmalig mischen (gleiche Reihenfolge für die Session)
  // Bei 'continue' Modus: Nur falsch beantwortete Fragen anzeigen
  const [shuffledQuestions] = useState(() => {
    let questionsToUse = [...quiz.questions];
    
    // In 'continue' mode, filter to only incorrectly answered questions
    if (startMode === 'continue' && initialState?.questions) {
      questionsToUse = questionsToUse.filter((q, idx) => {
        const qId = getQuestionId(q, quiz.id, idx);
        const questionData = initialState.questions?.[qId];
        // Only include questions that were attempted but not answered correctly
        return questionData && !questionData.answered && questionData.attempts > 0;
      });
    }
    
    // If no questions to continue with, fall back to all questions
    if (questionsToUse.length === 0) {
      questionsToUse = [...quiz.questions];
    }
    
    // Shuffle the questions
    for (let i = questionsToUse.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionsToUse[i], questionsToUse[j]] = [questionsToUse[j], questionsToUse[i]];
    }
    return questionsToUse;
  });
  // Finde die erste ungelöste Frage, falls Fortschritt vorhanden

  // Neues Modell: Fragen-Fortschritt mit Question IDs initialisieren
  function getFirstUnsolvedIndex() {
    if (initialState?.questions) {
      // Verwende Question IDs statt Indizes
      const idx = shuffledQuestions.findIndex((q) => {
        const originalIdx = findOriginalQuestionIndex(q, quiz);
        const qId = getQuestionId(q, quiz.id, originalIdx >= 0 ? originalIdx : 0);
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
  const [previousElapsedTime] = useState<number>(initialState?.totalElapsedTime || 0);
  const [elapsedTime, setElapsedTime] = useState<number>(previousElapsedTime);
  const [completedTime, setCompletedTime] = useState<number | null>(null);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);

  // Starte Timer beim ersten Laden des Hooks
  useEffect(() => {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  }, []);

  // Page Visibility API - pausiere Timer wenn Tab nicht sichtbar
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update elapsed time - stoppt wenn showResults true, completedTime gesetzt oder Seite nicht sichtbar
  // Addiert die aktuelle Session-Zeit zur bisherigen Gesamtzeit
  useEffect(() => {
    if (startTime === null || completedTime !== null || showResults || !isPageVisible) return;
    const interval = setInterval(() => {
      setElapsedTime(previousElapsedTime + (Date.now() - startTime));
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, completedTime, showResults, previousElapsedTime, isPageVisible]);

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
    
    // Question ID für das Progress-Tracking ermitteln - verwende Helper-Funktion
    const originalIndex = findOriginalQuestionIndex(currentQ, quiz);
    const questionId = getQuestionId(currentQ, quiz.id, originalIndex >= 0 ? originalIndex : 0);
    
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
    totalQuestions: repeatQuestions ? repeatQuestions.length : shuffledQuestions.length,
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
