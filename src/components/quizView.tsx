import React, { useEffect, useState } from 'react';
import { BookOpen, Users, FolderOpen, Play, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Subject, Class, Topic, Quiz, Answer, Question } from '../types/quizTypes';
import { slugify } from '../utils/slugify';

export default function StudentView({ subjects: initialSubjects, onAdminClick }: { subjects: Subject[], onAdminClick: () => void }) {
  const { subjectSlug, classSlug, topicSlug, quizSlug } = useParams();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Update subjects when prop changes (admin made changes)
  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  // Check if data is loaded
  useEffect(() => {
    if (initialSubjects.length > 0) {
      setLoading(false);
    }
  }, [initialSubjects]);

  // Handle deep linking to quiz
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/quiz/')) {
      const parts = hash.replace('#/quiz/', '').split('/');
      if (parts.length === 4) {
        const [subjectId, classId, topicId, quizId] = parts;
        
        const subject = subjects.find((s: { id: string; }) => s.id === subjectId);
        if (subject) {
          const classItem = subject.classes.find((c: { id: string; }) => c.id === classId);
          if (classItem) {
            const topic = classItem.topics.find((t: { id: string; }) => t.id === topicId);
            if (topic) {
              const quiz = topic.quizzes.find((q: { id: string; }) => q.id === quizId);
              if (quiz) {
                setSelectedSubject(subject);
                setSelectedClass(classItem);
                setSelectedTopic(topic);
                setSelectedQuiz(quiz as Quiz | null);
              }
            }
          }
        }
      }
    }
  }, [subjects]);

  useEffect(() => {
    if (loading) return;

    if (subjectSlug) {
      const subject = subjects.find((s) => slugify(s.name) === subjectSlug);
      if (subject) {
        setSelectedSubject(subject);

        if (classSlug) {
          const classItem = subject.classes.find((c) => slugify(c.name) === classSlug);
          if (classItem) {
            setSelectedClass(classItem);

            if (topicSlug) {
              const topic = classItem.topics.find((t) => slugify(t.name) === topicSlug);
              if (topic) {
                setSelectedTopic(topic);

                if (quizSlug) {
                  const quiz = topic.quizzes.find((q) => slugify(q.title) === quizSlug);
                  if (quiz) {
                    setSelectedQuiz(quiz);
                  }
                }
              }
            }
          }
        }
      }
    }
  }, [subjectSlug, classSlug, topicSlug, quizSlug, subjects, loading]);

  const handleReset = () => {
    setSelectedSubject(null);
    setSelectedClass(null);
    setSelectedTopic(null);
    setSelectedQuiz(null);
    window.location.hash = '';
    navigate('/'); // Ensure route is reset
  };

  const handleQuizSelectWithNavigation = (quiz: Quiz, subject: Subject, classItem: any, topic: any) => {
    const subjectSlug = slugify(subject.name);
    const classSlug = slugify(classItem.name);
    const topicSlug = slugify(topic.name);
    const quizSlug = slugify(quiz.title);

    console.log('Generated slugs:', { subjectSlug, classSlug, topicSlug, quizSlug });
    console.log('Navigating to:', `/quiz/${subjectSlug}/${classSlug}/${topicSlug}/${quizSlug}`);

    navigate(`/quiz/${subjectSlug}/${classSlug}/${topicSlug}/${quizSlug}`);
  };

  if (selectedQuiz) {
    return (
      <QuizPlayer 
        quiz={selectedQuiz} 
        onBack={() => {
          setSelectedQuiz(null);
          window.location.hash = '';
          navigate('/'); // Ensure route is reset
        }}
        onHome={handleReset}
      />
    );
  }

  // Wrap the handleQuizSelectWithNavigation function to match the expected signature
  const handleQuizSelectWrapper = (quiz: Quiz) => {
    console.log('Selected quiz:', quiz);
    const subject = subjects.find((s) => s.classes.some((c) => c.topics.some((t) => t.quizzes.includes(quiz))));
    if (!subject) {
      console.error('Subject not found for quiz:', quiz);
      return;
    }

    const classItem = subject.classes.find((c) => c.topics.some((t) => t.quizzes.includes(quiz)));
    if (!classItem) {
      console.error('Class not found for quiz:', quiz);
      return;
    }

    const topic = classItem.topics.find((t) => t.quizzes.includes(quiz));
    if (!topic) {
      console.error('Topic not found for quiz:', quiz);
      return;
    }

    console.log('Navigating to quiz with subject, class, topic:', subject, classItem, topic);
    handleQuizSelectWithNavigation(quiz, subject, classItem, topic);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Learn Quest 📚
              </h1>
              <p className="text-gray-600">
                Wähle ein Thema und teste dein Wissen!
              </p>
            </div>
            <button
              onClick={onAdminClick}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Admin
            </button>
          </div>
          
          {/* Breadcrumb */}
          {(selectedSubject || selectedClass || selectedTopic) && (
            <div className="flex items-center gap-2 mt-4 text-sm flex-wrap">
              <button
                onClick={() => {
                  handleReset();
                  navigate('/'); // Navigate to home
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Start
              </button>
              {selectedSubject && (
                <>
                  <span className="text-gray-400">→</span>
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      setSelectedTopic(null);
                      navigate(`/quiz/${slugify(selectedSubject.name)}`); // Navigate to subject
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {selectedSubject.name}
                  </button>
                </>
              )}
              {selectedClass && (
                <>
                  <span className="text-gray-400">→</span>
                  <button
                    onClick={() => {
                      setSelectedTopic(null);
                      navigate(`/quiz/${slugify(selectedSubject!.name)}/${slugify(selectedClass.name)}`); // Navigate to class
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {selectedClass.name}
                  </button>
                </>
              )}
              {selectedTopic && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700 font-medium">
                    {selectedTopic.name}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {!selectedSubject && (
          <SubjectSelector 
            subjects={subjects}
            onSelect={setSelectedSubject}
          />
        )}

        {selectedSubject && !selectedClass && (
          <ClassSelector 
            classes={selectedSubject.classes}
            subject={selectedSubject} // Pass subject explicitly
            onSelect={setSelectedClass}
          />
        )}

        {selectedClass && !selectedTopic && (
          <TopicSelector 
            topics={selectedClass.topics}
            subject={selectedSubject!} // Pass subject explicitly
            classItem={selectedClass} // Pass class explicitly
            onSelect={setSelectedTopic}
          />
        )}

        {selectedTopic && (
          <QuizSelector 
            quizzes={selectedTopic.quizzes}
            onSelect={handleQuizSelectWrapper}
          />
        )}
      </div>
    </div>
  );
}

function SubjectSelector({ subjects, onSelect }: { subjects: Subject[]; onSelect: (subject: Subject) => void }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subjects.map((subject: Subject) => (
        <button
          key={subject.id}
          onClick={() => {
            onSelect(subject);
            navigate(`/quiz/${slugify(subject.name)}`); // Update route
          }}
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <BookOpen className="w-12 h-12 text-indigo-600 mb-4 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-900">{subject.name}</h3>
        </button>
      ))}
    </div>
  );
}

function ClassSelector({ classes, subject, onSelect }: { classes: Class[]; subject: Subject; onSelect: (cls: Class) => void }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {classes.map((cls: Class) => (
        <button
          key={cls.id}
          onClick={() => {
            onSelect(cls);
            navigate(`/quiz/${slugify(subject.name)}/${slugify(cls.name)}`); // Update route
          }}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <Users className="w-10 h-10 text-purple-600 mb-3 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
        </button>
      ))}
    </div>
  );
}

function TopicSelector({ topics, subject, classItem, onSelect }: { topics: Topic[]; subject: Subject; classItem: Class; onSelect: (topic: Topic) => void }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {topics.map((topic: Topic) => (
        <button
          key={topic.id}
          onClick={() => {
            onSelect(topic);
            navigate(`/quiz/${slugify(subject.name)}/${slugify(classItem.name)}/${slugify(topic.name)}`); // Update route
          }}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <FolderOpen className="w-10 h-10 text-green-600 mb-3 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">{topic.name}</h3>
        </button>
      ))}
    </div>
  );
}

function QuizSelector({ quizzes, onSelect }: { quizzes: Quiz[]; onSelect: (quiz: Quiz) => void }) {

  return (
    <div className="space-y-4">
      {quizzes.map((quiz: Quiz) => (
        <div key={quiz.id} className="relative">
          <button
            onClick={() => {
              try {
                onSelect(quiz);
              } catch (error) {
                console.error('Error selecting quiz:', error);
              }
            }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2">{quiz.title}</h3>
                <p className="text-indigo-100">
                  {quiz.questions.length} Fragen
                </p>
              </div>
              <Play className="w-12 h-12" />
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// QUIZ PLAYER
// ============================================

function QuizPlayer({ quiz, onBack, onHome }: { quiz: Quiz; onBack: () => void; onHome: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<(Answer & { originalIndex: number }) | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<Array<Answer & { originalIndex: number }>>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [repeatQuestions, setRepeatQuestions] = useState<Question[] | null>(null);
  const [totalTries, setTotalTries] = useState<number>(1);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());

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
    setAnswers([...answers, isCorrect]);
  };

  const handleNext = () => {
    const questions = repeatQuestions || quiz.questions;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
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

  // Spaced Repetition: Nur falsche Fragen wiederholen
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

  if (showResults) {
    const questions = repeatQuestions || quiz.questions;
    const correctCount = answers.filter(a => a).length;
    const percentage = Math.round((correctCount / answers.length) * 100);
    // Falsch beantwortete Fragen sammeln
    const wrongQuestions = questions
      .map((q, idx) => ({
        ...q,
        index: idx,
        wasCorrect: answers[idx]
      }))
      .filter(q => !q.wasCorrect);

    // Update solvedQuestions-Set, falls dies der letzte Durchlauf ist
    let allSolved = solvedQuestions;
    if (wrongQuestions.length === 0 && answers.length > 0) {
      const newSolved = new Set(solvedQuestions);
      questions.forEach((q, idx) => {
        if (answers[idx]) {
          newSolved.add(q.question);
        }
      });
      allSolved = newSolved;
    }
    const totalQuestions = quiz.questions.length;
    const solvedCount = allSolved.size;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6 text-6xl">
            {solvedCount === totalQuestions && wrongQuestions.length === 0 ? '🏆' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz beendet!
          </h2>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-6">
            {solvedCount === totalQuestions && wrongQuestions.length === 0 ? (
              <>
                <div className="text-4xl font-bold text-green-700 mb-2">
                  Alle {totalQuestions} Fragen korrekt gelöst!
                </div>
                <div className="text-lg text-gray-700 mb-2">
                  Benötigte Durchläufe: {totalTries}
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl font-bold text-indigo-600 mb-2">
                  {correctCount} / {answers.length}
                </div>
                <p className="text-xl text-gray-700">
                  Richtige Antworten ({percentage}%)
                </p>
              </>
            )}
          </div>
          {wrongQuestions.length > 0 && (
            <div className="mb-6 text-left">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Falsch beantwortete Fragen:</h3>
              <ul className="list-disc list-inside text-gray-800">
                {wrongQuestions.map(q => (
                  <li key={q.index} className="mb-1">
                    <span className="font-bold">Frage {q.index + 1}:</span> {q.question}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleRepeatWrong}
                className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Nur falsche Fragen wiederholen
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRestart}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Nochmal spielen
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 text-gray-900 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Zurück
            </button>
          </div>
          <button
            onClick={onHome}
            className="mt-4 text-gray-600 hover:text-gray-900"
          >
            Zum Start
          </button>
        </div>
      </div>
    );
  }

  const questions = repeatQuestions || quiz.questions;
  const question = questions[currentQuestion];
  const correctAnswer = shuffledAnswers.find(
    a => a.originalIndex === question.correctAnswerIndex
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Frage {currentQuestion + 1} von {quiz.questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {question.question}
        </h2>

        {/* Answers */}
        <div className="space-y-4 mb-8">
          {shuffledAnswers.map((answer, idx) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === correctAnswer;
            const showFeedback = selectedAnswer !== null;

            let buttonClass = "w-full p-6 rounded-xl transition-all ";
            
            if (!showFeedback) {
              buttonClass += "bg-gray-100 hover:bg-gray-200 text-gray-900";
            } else if (isCorrect) {
              buttonClass += "bg-green-100 text-green-900 border-2 border-green-500";
            } else if (isSelected && !isCorrect) {
              buttonClass += "bg-red-100 text-red-900 border-2 border-red-500";
            } else {
              buttonClass += "bg-gray-100 text-gray-900";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(answer)}
                disabled={selectedAnswer !== null}
                className={buttonClass}
              >
                {answer.type === 'text' ? (
                  <div className="flex items-center justify-between text-left">
                    <span className="font-semibold text-lg">{answer.content}</span>
                    {showFeedback && isCorrect && <Check className="w-6 h-6 flex-shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 flex-shrink-0" />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <img 
                      src={answer.content} 
                      alt={answer.alt || 'Antwort'}
                      className="w-full max-w-xs h-48 object-cover rounded-lg mb-2"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        if (img.nextSibling && img.nextSibling instanceof HTMLElement) {
                          (img.nextSibling as HTMLElement).style.display = 'block';
                        }
                      }}
                    />
                    <div style={{display: 'none'}} className="w-full max-w-xs h-48 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-500">
                      Bild nicht verfügbar
                    </div>
                    {answer.alt && (
                      <span className="font-medium text-sm">{answer.alt}</span>
                    )}
                    <div className="mt-2">
                      {showFeedback && isCorrect && <Check className="w-6 h-6 mx-auto" />}
                      {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 mx-auto" />}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {selectedAnswer && (
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            {currentQuestion < quiz.questions.length - 1 ? 'Nächste Frage' : 'Ergebnis anzeigen'}
          </button>
        )}

        <button
          onClick={onBack}
          className="w-full mt-4 text-gray-600 hover:text-gray-900"
        >
          Quiz abbrechen
        </button>
      </div>
    </div>
  );
}