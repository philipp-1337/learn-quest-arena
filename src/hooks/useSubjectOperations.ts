import { useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import type { Subject } from '../types/quizTypes';
import useFirestore from './useFirestore';

/**
 * Hook für alle Subject-bezogenen CRUD-Operationen
 */
export function useSubjectOperations(
  subjects: Subject[],
  setSubjects: (subjects: Subject[]) => void
) {
  const { saveDocument, deleteDocument } = useFirestore();
  const auth = getAuth();

  const handleAddSubject = useCallback(
    async (name: string) => {
      const user = auth.currentUser;
      if (!user) {
        alert('Nicht authentifiziert!');
        return;
      }

      const newSubject: Subject = {
        id: Date.now().toString(),
        name,
        order: subjects.length + 1,
        classes: [],
      };

      await saveDocument(`subjects/${newSubject.id}`, newSubject);
      setSubjects([...subjects, newSubject]);
      return newSubject;
    },
    [auth, subjects, setSubjects, saveDocument]
  );

  const handleDeleteSubject = useCallback(
    async (id: string) => {
      const user = auth.currentUser;
      if (!user) {
        alert('Nicht authentifiziert!');
        return;
      }

      try {
        await deleteDocument(`subjects/${id}`);
        setSubjects(subjects.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen des Fachs:', error);
        alert('Fehler beim Löschen des Fachs. Bitte versuchen Sie es erneut.');
      }
    },
    [auth, subjects, setSubjects, deleteDocument]
  );

  const handleUpdateSubject = useCallback(
    async (updatedSubject: Subject) => {
      await saveDocument(`subjects/${updatedSubject.id}`, updatedSubject);
      setSubjects(
        subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s))
      );
    },
    [subjects, setSubjects, saveDocument]
  );

  return {
    handleAddSubject,
    handleDeleteSubject,
    handleUpdateSubject,
  };
}
