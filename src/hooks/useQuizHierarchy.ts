import type { Subject, Class, Topic, Quiz, QuizDocument } from 'quizTypes';
import { getAuth } from 'firebase/auth';
import { saveQuizDocument, updateQuizDocument, deleteQuizDocument } from '@utils/quiz-collection';

export function useQuizHierarchy(
  subjects: Subject[],
  onSubjectsChange: (subjects: Subject[]) => void,
  onRefetch?: () => Promise<void>
) {
  const auth = getAuth();

  /* ---------- Helpers ---------- */

  // Helper to update local state after changes
  const updateLocalSubjects = (updater: (subjects: Subject[]) => Subject[]) => {
    const newSubjects = updater(subjects);
    onSubjectsChange(newSubjects);
  };

  /* ---------- Add ---------- */

  const addSubject = async (name: string) => {
    // Subjects are now just metadata derived from quizzes
    // Creating a new "subject" means we'll add a quiz to it later
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name,
      order: subjects.length + 1,
      classes: [],
    };
    updateLocalSubjects(prev => [...prev, newSubject]);
  };

  const addClass = async (name: string, subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newClass: Class = {
      id: `${subjectId}-${Date.now()}`,
      name,
      level: subject.classes.length + 1,
      topics: [],
    };

    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? { ...s, classes: [...s.classes, newClass] }
        : s
    ));
  };

  const addTopic = async (
    name: string,
    subjectId: string,
    classId: string
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const cls = subject.classes.find(c => c.id === classId);
    if (!cls) return;

    const newTopic: Topic = {
      id: `${classId}-${Date.now()}`,
      name,
      quizzes: [],
    };

    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId
                ? { ...c, topics: [...c.topics, newTopic] }
                : c
            ),
          }
        : s
    ));
  };

  const addQuiz = async (
    title: string,
    subjectId: string,
    classId: string,
    topicId: string,
    hidden: boolean = false
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const cls = subject.classes.find(c => c.id === classId);
    if (!cls) return;

    const topic = cls.topics.find(t => t.id === topicId);
    if (!topic) return;

    const user = auth.currentUser;
    if (!user) {
      console.error('User must be authenticated to create a quiz');
      return;
    }

    const now = Date.now();
    const quizUuid = crypto.randomUUID();

    const newQuiz: Quiz = {
      id: quizUuid,
      uuid: quizUuid,
      title,
      shortTitle: title,
      url: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      questions: [],
      hidden,
      isFlashCardQuiz: false,
    };

    // Save to quizzes collection only
    const quizDoc: QuizDocument = {
      ...newQuiz,
      id: quizUuid,
      createdAt: now,
      updatedAt: now,
      authorId: user.uid,
      authorEmail: user.email || undefined,
      subjectId: subject.id,
      subjectName: subject.name,
      classId: cls.id,
      className: cls.name,
      topicId: topic.id,
      topicName: topic.name,
    };
    
    await saveQuizDocument(quizDoc);

    // Update local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId
                ? {
                    ...c,
                    topics: c.topics.map(t =>
                      t.id === topicId
                        ? { ...t, quizzes: [...t.quizzes, newQuiz] }
                        : t
                    ),
                  }
                : c
            ),
          }
        : s
    ));
  };

  /* ---------- Delete ---------- */

  const deleteSubject = async (subjectId: string) => {
    // Subjects are now derived from quizzes, so we need to delete all quizzes for this subject
    // For now, just remove from local state - actual quizzes can be deleted individually
    updateLocalSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  const deleteClass = async (subjectId: string, classId: string) => {
    // Classes are derived from quizzes, remove from local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? { ...s, classes: s.classes.filter(c => c.id !== classId) }
        : s
    ));
  };

  const deleteTopic = async (
    subjectId: string,
    classId: string,
    topicId: string
  ) => {
    // Topics are derived from quizzes, remove from local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId
                ? { ...c, topics: c.topics.filter(t => t.id !== topicId) }
                : c
            ),
          }
        : s
    ));
  };

  const deleteQuiz = async (
    subjectId: string,
    classId: string,
    topicId: string,
    quizId: string
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    // Find the quiz to get its ID for deletion
    const cls = subject.classes.find(c => c.id === classId);
    const topic = cls?.topics.find(t => t.id === topicId);
    const quiz = topic?.quizzes.find(q => q.id === quizId);

    // Delete from quizzes collection
    const deleteId = quiz?.uuid || quiz?.id || quizId;
    await deleteQuizDocument(deleteId);

    // Update local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId
                ? {
                    ...c,
                    topics: c.topics.map(t =>
                      t.id === topicId
                        ? {
                            ...t,
                            quizzes: t.quizzes.filter(q => q.id !== quizId),
                          }
                        : t
                    ),
                  }
                : c
            ),
          }
        : s
    ));

    // Refetch to ensure consistency
    if (onRefetch) {
      await onRefetch();
    }
  };

  /* ---------- Update ---------- */

  const updateQuiz = async (
    updatedQuiz: Quiz,
    subjectId: string,
    classId: string,
    topicId: string
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const cls = subject.classes.find(c => c.id === classId);
    const topic = cls?.topics.find(t => t.id === topicId);

    if (!updatedQuiz.uuid) {
      updatedQuiz.uuid = updatedQuiz.id;
    }

    // Update in quizzes collection only
    const updateId = updatedQuiz.uuid || updatedQuiz.id;
    await updateQuizDocument(updateId, {
      title: updatedQuiz.title,
      shortTitle: updatedQuiz.shortTitle,
      questions: updatedQuiz.questions,
      hidden: updatedQuiz.hidden,
      isFlashCardQuiz: updatedQuiz.isFlashCardQuiz === true,
      updatedAt: Date.now(),
      // Update denormalized names if available
      subjectName: subject.name,
      className: cls?.name,
      topicName: topic?.name,
    });

    // Update local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId
                ? {
                    ...c,
                    topics: c.topics.map(t =>
                      t.id === topicId
                        ? {
                            ...t,
                            quizzes: t.quizzes.map(q =>
                              q.id === updatedQuiz.id ? updatedQuiz : q
                            ),
                          }
                        : t
                    ),
                  }
                : c
            ),
          }
        : s
    ));
  };

  /* ---------- Rename/Update ---------- */

  const updateSubjectName = async (subjectId: string, newName: string) => {
    // Update all quizzes with this subject to have the new name
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    // Update all quizzes with this subjectId
    for (const cls of subject.classes) {
      for (const topic of cls.topics) {
        for (const quiz of topic.quizzes) {
          const quizId = quiz.uuid || quiz.id;
          await updateQuizDocument(quizId, {
            subjectName: newName,
            updatedAt: Date.now(),
          });
        }
      }
    }

    // Update local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId ? { ...s, name: newName } : s
    ));
  };

  const updateClassName = async (subjectId: string, classId: string, newName: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const cls = subject.classes.find(c => c.id === classId);
    if (!cls) return;

    // Update all quizzes with this classId
    for (const topic of cls.topics) {
      for (const quiz of topic.quizzes) {
        const quizId = quiz.uuid || quiz.id;
        await updateQuizDocument(quizId, {
          className: newName,
          updatedAt: Date.now(),
        });
      }
    }

    // Update local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId ? { ...c, name: newName } : c
            ),
          }
        : s
    ));
  };

  const updateTopicName = async (subjectId: string, classId: string, topicId: string, newName: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const cls = subject.classes.find(c => c.id === classId);
    if (!cls) return;

    const topic = cls.topics.find(t => t.id === topicId);
    if (!topic) return;

    // Update all quizzes with this topicId
    for (const quiz of topic.quizzes) {
      const quizId = quiz.uuid || quiz.id;
      await updateQuizDocument(quizId, {
        topicName: newName,
        updatedAt: Date.now(),
      });
    }

    // Update local state
    updateLocalSubjects(prev => prev.map(s =>
      s.id === subjectId
        ? {
            ...s,
            classes: s.classes.map(c =>
              c.id === classId
                ? {
                    ...c,
                    topics: c.topics.map(t =>
                      t.id === topicId ? { ...t, name: newName } : t
                    ),
                  }
                : c
            ),
          }
        : s
    ));
  };

  /* ---------- Public API ---------- */

  return {
    addSubject,
    addClass,
    addTopic,
    addQuiz,

    deleteSubject,
    deleteClass,
    deleteTopic,
    deleteQuiz,

    updateQuiz,
    updateSubjectName,
    updateClassName,
    updateTopicName,
  };
}
