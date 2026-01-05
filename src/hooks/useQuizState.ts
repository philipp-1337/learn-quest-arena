import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import type { Subject, Class, Topic, Quiz } from '../types/quizTypes';

interface UseQuizStateProps {
  subjects: Subject[];
  loading: boolean;
}

export function useQuizState({ subjects, loading }: UseQuizStateProps) {
  const { subjectSlug, classSlug, topicSlug, quizSlug } = useParams();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Compute selections from URL slugs - this is derived state from URL params
  const urlBasedSelections = useMemo(() => {
    if (loading || !subjectSlug) {
      return { subject: null, classItem: null, topic: null, quiz: null };
    }

    const subject = subjects.find((s) => slugify(s.name) === subjectSlug);
    if (!subject) {
      return { subject: null, classItem: null, topic: null, quiz: null };
    }

    let classItem = null;
    let topic = null;
    let quiz = null;

    if (classSlug) {
      classItem = subject.classes.find((c) => slugify(c.name) === classSlug) || null;
      if (classItem && topicSlug) {
        topic = classItem.topics.find((t) => slugify(t.name) === topicSlug) || null;
        if (topic && quizSlug) {
          quiz = topic.quizzes.find((q) => slugify(q.title) === quizSlug) || null;
        }
      }
    }

    return { subject, classItem, topic, quiz };
  }, [subjectSlug, classSlug, topicSlug, quizSlug, subjects, loading]);

  // Sync state with URL-based selections
  useEffect(() => {
    setSelectedSubject(urlBasedSelections.subject);
    setSelectedClass(urlBasedSelections.classItem);
    setSelectedTopic(urlBasedSelections.topic);
    setSelectedQuiz(urlBasedSelections.quiz);
  }, [urlBasedSelections]);

  const resetSelection = () => {
    setSelectedSubject(null);
    setSelectedClass(null);
    setSelectedTopic(null);
    setSelectedQuiz(null);
  };

  const selectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedClass(null);
    setSelectedTopic(null);
    setSelectedQuiz(null);
  };

  const selectClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setSelectedTopic(null);
    setSelectedQuiz(null);
  };

  const selectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedQuiz(null);
  };

  const selectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  return {
    selectedSubject,
    selectedClass,
    selectedTopic,
    selectedQuiz,
    selectSubject,
    selectClass,
    selectTopic,
    selectQuiz,
    resetSelection,
  };
}
