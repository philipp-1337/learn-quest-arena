import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Cog,
  UserCircle,
  Sword,
  Component,
} from 'lucide-react';

import AppHeader, { type MenuItem } from '@shared/AppHeader';
import Footer from '@features/footer/Footer';
import {Breadcrumb, SubjectSelector, ClassSelector, TopicSelector, QuizSelector } from '@quiz';

import { useUsername } from '@username/hooks/useUsername';
import UsernameFlow from '@username/components/UsernameFlow';
import FeaturedQuizzes from './FeaturedQuizzes';
import ChallengesSection from './ChallengesSection';
import QuizPlayer from '@quiz-player/components/QuizPlayer';

import { useQuizNavigation, useQuizState } from '@features/quiz-browse';
import type { QuizStartMode } from '@hooks/useQuizPlayer';
import { useAuth } from '@auth';

import {
  filterVisibleSubjects,
  filterVisibleClasses,
  filterVisibleTopics,
  filterVisibleQuizzes,
} from '@utils/quizVisibilityHelpers';

import type {
  Subject,
  Class,
  Topic,
  Quiz,
  QuizChallenge,
  QuizDocument,
} from "quizTypes";

interface QuizBrowserProps {
  subjects: Subject[];
  onAdminClick: () => void;
}

export default function QuizBrowser({
  subjects,
  onAdminClick,
}: QuizBrowserProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { username, isGuest, showPicker, setShowPicker, updateUsername } = useUsername();
  const { isAuthenticated } = useAuth();
  
  const [quizStartMode, setQuizStartMode] = useState<QuizStartMode>('fresh');
  const [loading] = useState(false);

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

  // Read quiz start mode from URL query parameter and handle username picker
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    
    if (mode === 'fresh' || mode === 'continue' || mode === 'review') {
      setQuizStartMode(mode);
    }

    // Check if we should open the username picker
    const chooseName = searchParams.get('chooseName');
    if (chooseName === 'true') {
      setShowPicker(true);
      // Remove the query parameter from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, setShowPicker]);

  // Handlers
  const handleReset = () => {
    resetSelection();
    navigateToHome();
  };

  const handleSubjectSelect = (subject: Subject) => {
    selectSubject(subject);
    navigateToSubject(subject);
  };

  const handleClassSelect = (classItem: Class) => {
    if (!selectedSubject) return;
    selectClass(classItem);
    navigateToClass(selectedSubject, classItem);
  };

  const handleTopicSelect = (topic: Topic) => {
    if (!selectedSubject || !selectedClass) return;
    selectTopic(topic);
    navigateToTopic(selectedSubject, selectedClass, topic);
  };

  const handleQuizSelect = (quiz: Quiz | QuizDocument, mode?: QuizStartMode) => {
    console.log('Selected quiz:', quiz, 'mode:', mode);
    setQuizStartMode(mode || 'fresh');

    // Support QuizDocument (from featuredQuizzes) and legacy Quiz
    let subject: Subject | undefined;
    let classItem: Class | undefined;
    let topic: Topic | undefined;

    // If quiz has subjectId/classId/topicId, use those for lookup
    const hasIds =
      (quiz as any).subjectId && (quiz as any).classId && (quiz as any).topicId;
    
    if (hasIds) {
      subject = subjects.find((s) => s.id === (quiz as any).subjectId);
      classItem = subject?.classes.find((c) => c.id === (quiz as any).classId);
      topic = classItem?.topics.find((t) => t.id === (quiz as any).topicId);
    } else {
      // Fallback: legacy lookup
      subject = subjects.find((s) =>
        s.classes.some((c) => c.topics.some((t) => t.quizzes.includes(quiz as Quiz))),
      );
      classItem = subject?.classes.find((c) =>
        c.topics.some((t) => t.quizzes.includes(quiz as Quiz)),
      );
      topic = classItem?.topics.find((t) => t.quizzes.includes(quiz as Quiz));
    }

    if (!subject) {
      console.error('Subject not found for quiz:', quiz);
      return;
    }
    if (!classItem) {
      console.error('Class not found for quiz:', quiz);
      return;
    }
    if (!topic) {
      console.error('Topic not found for quiz:', quiz);
      return;
    }

    console.log(
      'Navigating to quiz with subject, class, topic:',
      subject,
      classItem,
      topic,
    );
    selectQuiz(quiz);
    navigateToQuiz(subject, classItem, topic, quiz);
  };

  const handleBackFromQuiz = () => {
    selectQuiz(null as any);
    setQuizStartMode('fresh');
    navigateToHome();
  };

  const handleNavigateToSubject = () => {
    if (!selectedSubject) return;
    selectClass(null as any);
    selectTopic(null as any);
    navigateToSubject(selectedSubject);
  };

  const handleNavigateToClass = () => {
    if (!selectedSubject || !selectedClass) return;
    selectTopic(null as any);
    navigateToClass(selectedSubject, selectedClass);
  };

  const handleChallengeSelect = (challenge: QuizChallenge) => {
    navigate(`/challenge/${challenge.id}`);
  };

  // Username picker flow
  if (showPicker) {
    return <UsernameFlow onComplete={(name) => updateUsername(name)} />;
  }

  // Quiz player
  if (selectedQuiz) {
    // Wenn kein Username gesetzt ist oder Username "Gast" ist, QuizPlayer ohne username-Prop
    if (isGuest) {
      return (
        <QuizPlayer
          quiz={selectedQuiz}
          onBack={handleBackFromQuiz}
          onHome={handleReset}
        />
      );
    }
    return (
      <QuizPlayer
        quiz={selectedQuiz}
        onBack={handleBackFromQuiz}
        onHome={handleReset}
        username={username}
        startMode={quizStartMode}
      />
    );
  }

  // Gefilterte Daten
  const visibleSubjects = filterVisibleSubjects(subjects);
  const visibleClasses = selectedSubject
    ? filterVisibleClasses(selectedSubject.classes)
    : [];
  const visibleTopics = selectedClass
    ? filterVisibleTopics(selectedClass.topics)
    : [];

  const menuItems: MenuItem[] = [
    {
      icon: UserCircle,
      label: username !== 'Gast' ? username : 'Gast',
      onClick: () => navigate('/user'),
      hasNotification: isGuest,
    },
    {
      icon: Cog,
      label: 'Admin',
      onClick: onAdminClick,
    },
  ];

  const headerIcon = (
    <svg className="inline w-7 h-7 ml-1" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="swordGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(221 83% 53%)" />
          <stop offset="100%" stopColor="hsl(264 79% 61%)" />
        </linearGradient>
      </defs>
      <Sword stroke="url(#swordGradient)" strokeWidth={2} />
    </svg>
  );

  const breadcrumbComponent = (
    <Breadcrumb
      selectedSubject={selectedSubject}
      selectedClass={selectedClass}
      selectedTopic={selectedTopic}
      onNavigateHome={handleReset}
      onNavigateToSubject={handleNavigateToSubject}
      onNavigateToClass={handleNavigateToClass}
    />
  );

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="max-w-4xl mx-auto w-full flex-1">
        {/* Header */}
        <AppHeader
          title="Learn Quest"
          subtitle="Fordere dein Wissen heraus!"
          titleIcon={headerIcon}
          menuItems={menuItems}
          breadcrumb={breadcrumbComponent}
          homeUrl="/"
        />

        {/* Feature Section & Challenges - nur auf Hauptseite */}
        {!selectedSubject && (
          <>
            <FeaturedQuizzes 
              subjects={subjects} 
              onQuizSelect={handleQuizSelect} 
            />
            
            <ChallengesSection
              isAuthenticated={isAuthenticated}
              onChallengeSelect={handleChallengeSelect}
            />
          </>
        )}

        {/* Hierarchie-Navigation */}
        <div className="flex items-center gap-3 mb-4">
          <Component className="w-8 h-8 text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz nach Thema
          </h2>
        </div>

        {!selectedSubject && (
          <SubjectSelector
            subjects={visibleSubjects}
            onSelect={handleSubjectSelect}
          />
        )}

        {selectedSubject && !selectedClass && (
          <ClassSelector
            classes={visibleClasses}
            onSelect={handleClassSelect}
          />
        )}

        {selectedClass && !selectedTopic && (
          <TopicSelector 
            topics={visibleTopics} 
            onSelect={handleTopicSelect} 
          />
        )}

        {selectedTopic && (
          <QuizSelector
            quizzes={filterVisibleQuizzes(selectedTopic.quizzes)}
            onSelect={handleQuizSelect}
            username={isGuest ? undefined : username}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
