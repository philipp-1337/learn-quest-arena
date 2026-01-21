import { useNavigate } from 'react-router-dom';
import { slugify } from '@utils/slugify';
import type { Subject, Class, Topic, Quiz } from "quizTypes";

export function useQuizNavigation() {
  const navigate = useNavigate();

  const navigateToSubject = (subject: Subject) => {
    navigate(`/quiz/${slugify(subject.name)}`);
  };

  const navigateToClass = (subject: Subject, classItem: Class) => {
    navigate(`/quiz/${slugify(subject.name)}/${slugify(classItem.name)}`);
  };

  const navigateToTopic = (subject: Subject, classItem: Class, topic: Topic) => {
    navigate(`/quiz/${slugify(subject.name)}/${slugify(classItem.name)}/${slugify(topic.name)}`);
  };

  const navigateToQuiz = (subject: Subject, classItem: Class, topic: Topic, quiz: Quiz, mode?: 'fresh' | 'continue' | 'review') => {
    const subjectSlug = slugify(subject.name);
    const classSlug = slugify(classItem.name);
    const topicSlug = slugify(topic.name);
    const quizSlug = slugify(quiz.title);

    console.log('Generated slugs:', { subjectSlug, classSlug, topicSlug, quizSlug });
    
    const path = `/quiz/${subjectSlug}/${classSlug}/${topicSlug}/${quizSlug}`;
    const url = mode ? `${path}?mode=${mode}` : path;
    
    console.log('Navigating to:', url);

    navigate(url);
  };

  const navigateToHome = () => {
    window.location.hash = '';
    navigate('/');
  };

  return {
    navigateToSubject,
    navigateToClass,
    navigateToTopic,
    navigateToQuiz,
    navigateToHome,
  };
}
