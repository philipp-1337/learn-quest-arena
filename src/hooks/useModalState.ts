import { useState } from 'react';
import type { Quiz } from '../types/quizTypes';

export function useModalState() {
  const [addModal, setAddModal] = useState<{
    type: 'subject' | 'class' | 'topic' | 'quiz';
    parentId?: string;
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  const [editQuizModal, setEditQuizModal] = useState<{
    quiz: Quiz;
    subjectId: string;
    classId: string;
    topicId: string;
  } | null>(null);

  return {
    addModal,
    deleteModal,
    editQuizModal,
    setAddModal,
    setDeleteModal,
    setEditQuizModal,
  };
}
