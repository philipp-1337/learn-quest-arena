import type { Subject, Class, Topic, Quiz } from '../types/quizTypes';

/**
 * Prüft, ob ein Topic mindestens ein sichtbares Quiz enthält.
 * @param topic Das zu prüfende Topic
 * @returns true, wenn mindestens ein Quiz sichtbar ist
 */
export function hasVisibleQuizInTopic(topic: Topic): boolean {
  return topic.quizzes.some((q: Quiz) => !q.hidden);
}

/**
 * Prüft, ob eine Klasse mindestens ein Topic mit sichtbarem Quiz enthält.
 * @param cls Die zu prüfende Klasse
 * @returns true, wenn mindestens ein sichtbares Quiz in einem Topic existiert
 */
export function hasVisibleQuizInClass(cls: Class): boolean {
  return cls.topics.some(hasVisibleQuizInTopic);
}

/**
 * Prüft, ob ein Fach mindestens eine Klasse mit sichtbarem Quiz enthält.
 * @param subject Das zu prüfende Fach
 * @returns true, wenn mindestens ein sichtbares Quiz in einer Klasse existiert
 */
export function hasVisibleQuizInSubject(subject: Subject): boolean {
  return subject.classes.some(hasVisibleQuizInClass);
}

/**
 * Filtert Subjects und gibt nur jene zurück, die sichtbare Quizze enthalten.
 * @param subjects Array von Subjects
 * @returns Gefiltertes Array von Subjects
 */
export function filterVisibleSubjects(subjects: Subject[]): Subject[] {
  return subjects.filter(hasVisibleQuizInSubject);
}

/**
 * Filtert Classes und gibt nur jene zurück, die sichtbare Quizze enthalten.
 * @param classes Array von Classes
 * @returns Gefiltertes Array von Classes
 */
export function filterVisibleClasses(classes: Class[]): Class[] {
  return classes.filter(hasVisibleQuizInClass);
}

/**
 * Filtert Topics und gibt nur jene zurück, die sichtbare Quizze enthalten.
 * @param topics Array von Topics
 * @returns Gefiltertes Array von Topics
 */
export function filterVisibleTopics(topics: Topic[]): Topic[] {
  return topics.filter(hasVisibleQuizInTopic);
}

/**
 * Filtert Quizze und gibt nur sichtbare zurück.
 * @param quizzes Array von Quizzen
 * @returns Gefiltertes Array von sichtbaren Quizzen
 */
export function filterVisibleQuizzes(quizzes: Quiz[]): Quiz[] {
  return quizzes.filter((q: Quiz) => !q.hidden);
}
