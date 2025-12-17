import { useEffect, useState } from 'react';
import { useQuizState } from '../../hooks/useQuizState';
import { useQuizNavigation } from '../../hooks/useQuizNavigation';
import Breadcrumb from './Breadcrumb';
import SubjectSelector from './SubjectSelector';
import ClassSelector from './ClassSelector';
import TopicSelector from './TopicSelector';
import QuizSelector from './QuizSelector';
import QuizPlayer from './QuizPlayer';
import type { Subject, Quiz } from '../../types/quizTypes';

interface QuizViewProps {
  subjects: Subject[];
  onAdminClick: () => void;
}

export default function QuizView({ subjects: initialSubjects, onAdminClick }: QuizViewProps) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(true);

  const {
    selectedSubject,
    selectedClass,
    selectedTopic,
    selectedQuiz,
    selectSubject,
    selectClass,
    selectTopic,
    selectQuiz,
    resetSelection,
  } = useQuizState({ subjects, loading });

  const {
    navigateToSubject,
    navigateToClass,
    navigateToTopic,
    navigateToQuiz,
    navigateToHome,
  } = useQuizNavigation();

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

  const handleReset = () => {
    resetSelection();
    navigateToHome();
  };

  const handleSubjectSelect = (subject: Subject) => {
    selectSubject(subject);
    navigateToSubject(subject);
  };

  const handleClassSelect = (classItem: any) => {
    if (!selectedSubject) return;
    selectClass(classItem);
    navigateToClass(selectedSubject, classItem);
  };

  const handleTopicSelect = (topic: any) => {
    if (!selectedSubject || !selectedClass) return;
    selectTopic(topic);
    navigateToTopic(selectedSubject, selectedClass, topic);
  };

  const handleQuizSelect = (quiz: Quiz) => {
    console.log('Selected quiz:', quiz);
    
    // Find the subject, class, and topic for this quiz
    const subject = subjects.find((s) => 
      s.classes.some((c) => 
        c.topics.some((t) => 
          t.quizzes.includes(quiz)
        )
      )
    );
    
    if (!subject) {
      console.error('Subject not found for quiz:', quiz);
      return;
    }

    const classItem = subject.classes.find((c) => 
      c.topics.some((t) => 
        t.quizzes.includes(quiz)
      )
    );
    
    if (!classItem) {
      console.error('Class not found for quiz:', quiz);
      return;
    }

    const topic = classItem.topics.find((t) => 
      t.quizzes.includes(quiz)
    );
    
    if (!topic) {
      console.error('Topic not found for quiz:', quiz);
      return;
    }

    console.log('Navigating to quiz with subject, class, topic:', subject, classItem, topic);
    selectQuiz(quiz);
    navigateToQuiz(subject, classItem, topic, quiz);
  };

  const handleBackFromQuiz = () => {
    selectQuiz(null as any); // Explicit cast to satisfy TypeScript
    navigateToHome();
  };

  const handleNavigateToSubject = () => {
    if (!selectedSubject) return;
    selectClass(null as any);
    selectTopic(null as any); // Explicit cast to satisfy TypeScript
    navigateToSubject(selectedSubject);
  };

  const handleNavigateToClass = () => {
    if (!selectedSubject || !selectedClass) return;

    // Ensure selectTopic can handle null
    selectTopic(null as any); // Explicit cast to satisfy TypeScript
    navigateToClass(selectedSubject, selectedClass);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Show QuizPlayer if a quiz is selected
  if (selectedQuiz) {
    return (
      <QuizPlayer 
        quiz={selectedQuiz} 
        onBack={handleBackFromQuiz}
        onHome={handleReset}
      />
    );
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
          <Breadcrumb
            selectedSubject={selectedSubject}
            selectedClass={selectedClass}
            selectedTopic={selectedTopic}
            onNavigateHome={handleReset}
            onNavigateToSubject={handleNavigateToSubject}
            onNavigateToClass={handleNavigateToClass}
          />
        </div>

        {/* Content - Conditional Rendering based on selection */}
        {!selectedSubject && (
          <SubjectSelector 
            subjects={subjects}
            onSelect={handleSubjectSelect}
          />
        )}

        {selectedSubject && !selectedClass && (
          <ClassSelector 
            classes={selectedSubject.classes}
            onSelect={handleClassSelect}
          />
        )}

        {selectedClass && !selectedTopic && (
          <TopicSelector 
            topics={selectedClass.topics}
            onSelect={handleTopicSelect}
          />
        )}

        {selectedTopic && (
          <QuizSelector 
            quizzes={selectedTopic.quizzes}
            onSelect={handleQuizSelect}
          />
        )}
      </div>
    </div>
  );
}
