import { useState, useEffect } from 'react';
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

  // Handle URL-based selection
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
