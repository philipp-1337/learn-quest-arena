import { useState, useEffect } from 'react';
import type { Quiz, Question, Answer } from '../types/quizTypes';


// Akzeptiert jetzt auch das neue Modell
export type QuizPlayerInitialState = {
  answers?: boolean[];
  solvedQuestions?: string[];
  totalTries?: number;
  questions?: {
    [questionId: string]: {
      answered: boolean;
      attempts: number;
      lastAnswerCorrect: boolean;
    };
  };
  completed?: boolean;
};

export function useQuizPlayer(
  quiz: Quiz,
  initialState?: QuizPlayerInitialState
) {
  // Finde die erste ungelöste Frage, falls Fortschritt vorhanden

  // Neues Modell: Fragen-Fortschritt initialisieren
  function getFirstUnsolvedIndex() {
    if (initialState?.questions) {
      const idx = quiz.questions.findIndex(q => !initialState.questions?.[q.question]?.answered);
      return idx === -1 ? 0 : idx;
    }
    if (!initialState?.answers || initialState.answers.length === 0) return 0;
    const idx = initialState.answers.findIndex(a => a === false);
    if (idx === -1) return initialState.answers.length < quiz.questions.length ? initialState.answers.length : 0;
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

  // Shuffle answers when question changes
  useEffect(() => {
    const questions = repeatQuestions || quiz.questions;
    const question = questions[currentQuestion];
    const answerIndices = question.answers.map((_, idx) => idx);
    const shuffled: Array<Answer & { originalIndex: number }> = answerIndices
      .sort(() => Math.random() - 0.5)
      .map(idx => ({
        ...question.answers[idx],
        originalIndex: idx
      }));
    setShuffledAnswers(shuffled);
  }, [currentQuestion, quiz, repeatQuestions]);

  const handleAnswerSelect = (answer: Answer & { originalIndex: number }) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const questions = repeatQuestions || quiz.questions;
    const isCorrect = answer.originalIndex === questions[currentQuestion].correctAnswerIndex;
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers, isCorrect];
      // Neues Modell: Frage-Fortschritt aktualisieren
      setQuestionProgress(prev => {
        const qId = questions[currentQuestion].question;
        const prevQ = prev?.[qId] || { answered: false, attempts: 0, lastAnswerCorrect: false };
        return {
          ...prev,
          [qId]: {
            answered: isCorrect ? true : prevQ.answered,
            attempts: prevQ.attempts + 1,
            lastAnswerCorrect: isCorrect,
          }
        };
      });
      // Wenn richtig beantwortet, sofort zu solvedQuestions hinzufügen
      if (isCorrect) {
        setSolvedQuestions(prevSolved => {
          const newSolved = new Set(prevSolved);
          newSolved.add(questions[currentQuestion].question);
          return newSolved;
        });
      }
      return newAnswers;
    });
  };

  const handleNext = () => {
    const questions = repeatQuestions || quiz.questions;
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
  };

  const handleRepeatWrong = () => {
    const questions = repeatQuestions || quiz.questions;
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
    const questions = repeatQuestions || quiz.questions;
    return questions[currentQuestion];
  };

  const getCorrectAnswer = () => {
    const question = getCurrentQuestion();
    return shuffledAnswers.find(
      a => a.originalIndex === question.correctAnswerIndex
    );
  };

  const getWrongQuestions = () => {
    const questions = repeatQuestions || quiz.questions;
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
    const allSolved = solvedQuestions.size === quiz.questions.length;
    
    return {
      correctCount,
      totalAnswered: answers.length,
      percentage,
      totalQuestions: quiz.questions.length,
      solvedCount: solvedQuestions.size,
      allSolved,
      totalTries,
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
    handleAnswerSelect,
    handleNext,
    handleRestart,
    handleRepeatWrong,
    getCurrentQuestion,
    getCorrectAnswer,
    getWrongQuestions,
    getStatistics,
  };
}
