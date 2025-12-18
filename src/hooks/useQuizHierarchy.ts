import type { Subject, Class, Topic, Quiz } from '../types/quizTypes';
import useFirestore from './useFirestore';

export function useQuizHierarchy(
  subjects: Subject[],
  onSubjectsChange: (subjects: Subject[]) => void
) {
  const { saveDocument, deleteDocument } = useFirestore();

  /* ---------- Helpers ---------- */

  const persistSubject = async (updated: Subject) => {
    await saveDocument(`subjects/${updated.id}`, updated);
    // Tiefe Kopie, um State-Referenz zu ändern und ein Re-Render zu erzwingen
    const newSubjects = subjects.map(s =>
      s.id === updated.id ? JSON.parse(JSON.stringify(updated)) : s
    );
    onSubjectsChange(newSubjects);
  };

  /* ---------- Add ---------- */

  const addSubject = async (name: string) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name,
      order: subjects.length + 1,
      classes: [],
    };

    await saveDocument(`subjects/${newSubject.id}`, newSubject);
    onSubjectsChange([...subjects, newSubject]);
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

    await persistSubject({
      ...subject,
      classes: [...subject.classes, newClass],
    });
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

    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
        c.id === classId
          ? { ...c, topics: [...c.topics, newTopic] }
          : c
      ),
    });
  };

  const addQuiz = async (
    title: string,
    subjectId: string,
    classId: string,
    topicId: string
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const cls = subject.classes.find(c => c.id === classId);
    if (!cls) return;

    const topic = cls.topics.find(t => t.id === topicId);
    if (!topic) return;

    const newQuiz: Quiz = {
      id: `${topicId}-${Date.now()}`,
      title,
      questions: [],
    };

    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
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
    });
  };

  /* ---------- Delete ---------- */

  const deleteSubject = async (subjectId: string) => {
    await deleteDocument(`subjects/${subjectId}`);
    onSubjectsChange(subjects.filter(s => s.id !== subjectId));
  };

  const deleteClass = async (subjectId: string, classId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    await persistSubject({
      ...subject,
      classes: subject.classes.filter(c => c.id !== classId),
    });
  };

  const deleteTopic = async (
    subjectId: string,
    classId: string,
    topicId: string
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
        c.id === classId
          ? { ...c, topics: c.topics.filter(t => t.id !== topicId) }
          : c
      ),
    });
  };

  const deleteQuiz = async (
    subjectId: string,
    classId: string,
    topicId: string,
    quizId: string
  ) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
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
    });
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

    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
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
    });
  };

  /* ---------- Rename/Update ---------- */

  const updateSubjectName = async (subjectId: string, newName: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    await persistSubject({ ...subject, name: newName });
  };

  const updateClassName = async (subjectId: string, classId: string, newName: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
        c.id === classId ? { ...c, name: newName } : c
      ),
    });
  };

  const updateTopicName = async (subjectId: string, classId: string, topicId: string, newName: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    await persistSubject({
      ...subject,
      classes: subject.classes.map(c =>
        c.id === classId
          ? {
              ...c,
              topics: c.topics.map(t =>
                t.id === topicId ? { ...t, name: newName } : t
              ),
            }
          : c
      ),
    });
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
