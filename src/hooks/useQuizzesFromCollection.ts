/**
 * Hook for loading quizzes from the new quizzes collection
 * and building the Subject hierarchy for display.
 */

import { useState, useEffect, useCallback } from 'react';
import { loadAllQuizDocuments, quizDocumentToQuiz } from '../utils/quiz-collection';
import type { Subject, QuizDocument } from '../types/quizTypes';

interface UseQuizzesFromCollectionResult {
  subjects: Subject[];
  quizDocuments: QuizDocument[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Builds the Subject hierarchy from QuizDocuments.
 * Groups quizzes by their subjectId, classId, and topicId.
 */
function buildSubjectHierarchy(quizDocs: QuizDocument[]): Subject[] {
  const subjectsMap = new Map<string, Subject>();
  
  console.log(`Building hierarchy from ${quizDocs.length} quiz documents...`);
  
  for (const doc of quizDocs) {
    // Log each quiz for debugging
    console.log(`Processing quiz: "${doc.title}" with subjectId=${doc.subjectId}, classId=${doc.classId}, topicId=${doc.topicId}`);
    
    // Use default values if hierarchy references are missing
    const subjectId = doc.subjectId || 'unknown-subject';
    const subjectName = doc.subjectName || 'Unbekanntes Fach';
    const classId = doc.classId || 'unknown-class';
    const className = doc.className || 'Unbekannte Klasse';
    const topicId = doc.topicId || 'unknown-topic';
    const topicName = doc.topicName || 'Unbekanntes Thema';
    
    // Get or create subject
    let subject = subjectsMap.get(subjectId);
    if (!subject) {
      subject = {
        id: subjectId,
        name: subjectName,
        order: subjectsMap.size + 1,
        classes: [],
      };
      subjectsMap.set(subjectId, subject);
    }
    
    // Get or create class within subject
    let classItem = subject.classes.find(c => c.id === classId);
    if (!classItem) {
      classItem = {
        id: classId,
        name: className,
        level: subject.classes.length + 1,
        topics: [],
      };
      subject.classes.push(classItem);
    }
    
    // Get or create topic within class
    let topic = classItem.topics.find(t => t.id === topicId);
    if (!topic) {
      topic = {
        id: topicId,
        name: topicName,
        quizzes: [],
      };
      classItem.topics.push(topic);
    }
    
    // Convert QuizDocument to Quiz and add to topic
    const quiz = quizDocumentToQuiz(doc);
    topic.quizzes.push(quiz);
  }
  
  // Sort the hierarchy
  const subjects = Array.from(subjectsMap.values());
  subjects.sort((a, b) => a.name.localeCompare(b.name));
  
  for (const subject of subjects) {
    subject.classes.sort((a, b) => a.name.localeCompare(b.name));
    for (const cls of subject.classes) {
      cls.topics.sort((a, b) => a.name.localeCompare(b.name));
      for (const topic of cls.topics) {
        topic.quizzes.sort((a, b) => a.title.localeCompare(b.title));
      }
    }
  }
  
  console.log(`Built hierarchy with ${subjects.length} subjects`);
  return subjects;
}

/**
 * Hook to load all quizzes from the new collection and build the hierarchy.
 */
export function useQuizzesFromCollection(): UseQuizzesFromCollectionResult {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quizDocuments, setQuizDocuments] = useState<QuizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading quizzes from collection...');
      const docs = await loadAllQuizDocuments();
      console.log(`Loaded ${docs.length} quizzes from collection`);
      
      setQuizDocuments(docs);
      
      // Build the hierarchy from quiz documents
      const hierarchy = buildSubjectHierarchy(docs);
      console.log(`Built hierarchy with ${hierarchy.length} subjects`);
      
      setSubjects(hierarchy);
    } catch (err) {
      console.error('Error loading quizzes from collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
      setSubjects([]);
      setQuizDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    subjects,
    quizDocuments,
    loading,
    error,
    refetch: fetchQuizzes,
  };
}

/**
 * Finds a quiz document by its ID.
 */
export function findQuizDocumentById(docs: QuizDocument[], quizId: string): QuizDocument | undefined {
  return docs.find(doc => doc.id === quizId || doc.legacyQuizId === quizId);
}

/**
 * Gets all unique subjects from quiz documents.
 */
export function getUniqueSubjects(docs: QuizDocument[]): { id: string; name: string }[] {
  const subjectsMap = new Map<string, string>();
  
  for (const doc of docs) {
    if (doc.subjectId && doc.subjectName) {
      subjectsMap.set(doc.subjectId, doc.subjectName);
    }
  }
  
  return Array.from(subjectsMap.entries()).map(([id, name]) => ({ id, name }));
}

/**
 * Gets all unique classes from quiz documents for a given subject.
 */
export function getClassesForSubject(docs: QuizDocument[], subjectId: string): { id: string; name: string }[] {
  const classesMap = new Map<string, string>();
  
  for (const doc of docs) {
    if (doc.subjectId === subjectId && doc.classId && doc.className) {
      classesMap.set(doc.classId, doc.className);
    }
  }
  
  return Array.from(classesMap.entries()).map(([id, name]) => ({ id, name }));
}

/**
 * Gets all unique topics from quiz documents for a given class.
 */
export function getTopicsForClass(docs: QuizDocument[], classId: string): { id: string; name: string }[] {
  const topicsMap = new Map<string, string>();
  
  for (const doc of docs) {
    if (doc.classId === classId && doc.topicId && doc.topicName) {
      topicsMap.set(doc.topicId, doc.topicName);
    }
  }
  
  return Array.from(topicsMap.entries()).map(([id, name]) => ({ id, name }));
}
