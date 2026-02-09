import { useState, useEffect, useMemo, useRef } from 'react';
import type { Quiz, Question, Answer } from 'quizTypes';
import type { QuestionSRSData } from 'userProgress';
import { getQuestionId } from '@utils/questionIdHelper';
import { calculateNextReviewDate, calculateDifficultyLevel } from '@utils/srsHelpers';

// Quiz start mode - determines how to start the quiz
export type QuizStartMode = 'fresh' | 'continue' | 'review';

// Helper function to find the original index of a question in the quiz
function findOriginalQuestionIndex(question: Question, quiz: Quiz): number {
  // First try direct reference match
  const directIndex = quiz.questions.indexOf(question);
  if (directIndex >= 0) return directIndex;
  
  // If direct match fails, try matching by question text and correct answer indices
  // This handles cases where question objects have been copied
  return quiz.questions.findIndex(q => {
    const qIndices = q.correctAnswerIndices || [q.correctAnswerIndex];
    const questionIndices = question.correctAnswerIndices || [question.correctAnswerIndex];
    return q.question === question.question && 
      JSON.stringify(qIndices) === JSON.stringify(questionIndices);
  });
}

// Akzeptiert jetzt auch das neue Modell mit SRS
export type QuizPlayerInitialState = {
  answers?: boolean[];
  solvedQuestions?: string[];
  totalTries?: number;
  totalElapsedTime?: number;
  questions?: {
    [questionId: string]: QuestionSRSData;
  };
  completed?: boolean;
  xp?: number;
  lastXP?: number;
};

type QuizPlayerOptions = {
  flashCardMode?: boolean;
};

export function useQuizPlayer(
  quiz: Quiz,
  initialState?: QuizPlayerInitialState,
  startMode: QuizStartMode = 'fresh',
  options: QuizPlayerOptions = {}
) {
  const flashCardMode = options.flashCardMode === true;
  // Fragen einmalig mischen (gleiche Reihenfolge für die Session)
  // Bei 'continue' Modus: Nur falsch beantwortete Fragen anzeigen
  // Bei 'review' Modus: Nur fällige Wiederholungsfragen anzeigen
  const [shuffledQuestions] = useState(() => {
    const allQuestions = [...quiz.questions];
    let questionsToUse = [...allQuestions];
    
    // In 'continue' mode, filter to only incorrectly answered questions
    if (startMode === 'continue' && initialState?.questions) {
      questionsToUse = questionsToUse.filter((q, idx) => {
        const qId = getQuestionId(q, quiz.id, idx);
        const questionData = initialState.questions?.[qId];
        // Only include questions that were attempted but not answered correctly
        return questionData && !questionData.answered && questionData.attempts > 0;
      });
    }
    
    // In 'review' mode, filter to only questions due for review (SRS)
    if (startMode === 'review' && initialState?.questions) {
      const now = Date.now();
      questionsToUse = questionsToUse.filter((q, idx) => {
        const qId = getQuestionId(q, quiz.id, idx);
        const questionData = initialState.questions?.[qId];
        // Only include questions that have a review date and are due
        return questionData && questionData.nextReviewDate && questionData.nextReviewDate <= now && questionData.answered;
      });
    }
    
    if (flashCardMode) {
      questionsToUse = questionsToUse.filter((q) => {
        const correctIndices = q.correctAnswerIndices || [q.correctAnswerIndex];
        if (!q.answers || q.answers.length === 0) return false;
        return correctIndices.every((idx) => q.answers[idx]?.type === 'text');
      });
    }

    // If no questions to continue with, fall back to all questions (filtered if flash-card mode)
    if (questionsToUse.length === 0) {
      questionsToUse = flashCardMode
        ? allQuestions.filter((q) => {
            const correctIndices = q.correctAnswerIndices || [q.correctAnswerIndex];
            if (!q.answers || q.answers.length === 0) return false;
            return correctIndices.every((idx) => q.answers[idx]?.type === 'text');
          })
        : [...allQuestions];
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
  const [selectedAnswers, setSelectedAnswers] = useState<Array<Answer & { originalIndex: number }>>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [answers, setAnswers] = useState<boolean[]>(initialState?.answers || []);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [repeatQuestions, setRepeatQuestions] = useState<Question[] | null>(null);
  const [totalTries, setTotalTries] = useState<number>(initialState?.totalTries || 1);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(
    initialState?.solvedQuestions ? new Set(initialState.solvedQuestions) : new Set()
  );

  // Zeit-Tracking - use ref for startTime to avoid re-renders
  const startTimeRef = useRef<number>(Date.now());
  const [previousElapsedTime] = useState<number>(initialState?.totalElapsedTime || 0);
  const [elapsedTime, setElapsedTime] = useState<number>(previousElapsedTime);
  const [completedTime, setCompletedTime] = useState<number | null>(null);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);

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

  // Update elapsed time - stoppt wenn completedTime gesetzt oder Seite nicht sichtbar
  // Addiert die aktuelle Session-Zeit zur bisherigen Gesamtzeit
  useEffect(() => {
    if (completedTime !== null || showResults || !isPageVisible) return;
    const interval = setInterval(() => {
      setElapsedTime(previousElapsedTime + (Date.now() - startTimeRef.current));
    }, 100);
    return () => clearInterval(interval);
  }, [completedTime, showResults, previousElapsedTime, isPageVisible]);

  // Shuffle answers when question changes - use useMemo to avoid setState in useEffect
  const shuffledAnswers = useMemo(() => {
    const questions = repeatQuestions || shuffledQuestions;
    const question = questions[currentQuestion];
    
    // Safety check: ensure answers exist
    if (!question || !question.answers || !Array.isArray(question.answers)) {
      console.error('Question has no valid answers array:', question);
      return [];
    }
    
    const answerIndices = question.answers.map((_, idx) => idx);
    return answerIndices
      .sort(() => Math.random() - 0.5)
      .map(idx => ({
        ...question.answers[idx],
        originalIndex: idx
      }));
  }, [currentQuestion, shuffledQuestions, repeatQuestions]);

  const handleAnswerSelect = (answer: Answer & { originalIndex: number }) => {
    if (isAnswerSubmitted) return; // Kann nicht ändern nach Submit
    
    const questions = repeatQuestions || shuffledQuestions;
    const currentQ = questions[currentQuestion];
    const correctIndices = currentQ.correctAnswerIndices || [currentQ.correctAnswerIndex];
    const isSingleSelect = correctIndices.length === 1;
    
    if (isSingleSelect) {
      // Bei Single-Select: Ersetze Auswahl (nur eine Antwort möglich)
      setSelectedAnswers([answer]);
    } else {
      // Bei Multi-Select: Toggle answer in selection
      setSelectedAnswers(prev => {
        const isSelected = prev.some(a => a.originalIndex === answer.originalIndex);
        if (isSelected) {
          return prev.filter(a => a.originalIndex !== answer.originalIndex);
        } else {
          return [...prev, answer];
        }
      });
    }
  };

  const handleSubmitAnswer = (options?: { typedAnswer?: string; selfCorrect?: boolean }) => {
    if (isAnswerSubmitted) return;
    if (flashCardMode) {
      if (typeof options?.selfCorrect !== 'boolean') return;
    } else if (selectedAnswers.length === 0) {
      return;
    }

    setIsAnswerSubmitted(true);
    const questions = repeatQuestions || shuffledQuestions;
    const currentQ = questions[currentQuestion];
    const correctIndices = currentQ.correctAnswerIndices || [currentQ.correctAnswerIndex];

    let isCorrect = false;
    if (flashCardMode) {
      isCorrect = options?.selfCorrect === true;
    } else {
      // Support for multiple correct answers - ALL must be selected
      const selectedIndices = selectedAnswers.map(a => a.originalIndex).sort();
      // Check if selected answers exactly match correct answers
      isCorrect = correctIndices.length === selectedIndices.length &&
        correctIndices.every(idx => selectedIndices.includes(idx));
    }
    
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
      setSelectedAnswers([]);
      setIsAnswerSubmitted(false);
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
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    setAnswers([]);
    setShowResults(false);
    setRepeatQuestions(null);
    setTotalTries(1);
    setSolvedQuestions(new Set());
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    setCompletedTime(null);
    // Reset question progress for fresh start
    setQuestionProgress({});
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
      setSelectedAnswers([]);
      setIsAnswerSubmitted(false);
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
    const correctIndices = question.correctAnswerIndices || [question.correctAnswerIndex];
    return shuffledAnswers.filter(a => correctIndices.includes(a.originalIndex));
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
    selectedAnswers,
    isAnswerSubmitted,
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
    handleSubmitAnswer,
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
    isMultiSelect: () => {
      const question = (repeatQuestions || shuffledQuestions)[currentQuestion];
      const correctIndices = question.correctAnswerIndices || [question.correctAnswerIndex];
      return correctIndices.length > 1;
    },
  };
}
