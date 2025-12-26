import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProgress, UserQuizProgress } from "../types/userProgress";
import { sanitizeUsername } from "./usernameValidation";

// Speichert den Fortschritt eines Users für ein Quiz (neues Modell)
export async function saveUserQuizProgress(progress: UserQuizProgress) {
  const sanitizedUsername = sanitizeUsername(progress.username);
  if (sanitizedUsername === "Gast" || !sanitizedUsername) {
    return;
  }
  const db = getFirestore();
  const ref = doc(db, "users", sanitizedUsername, "progress", progress.quizId);
  await setDoc(ref, { ...progress, username: sanitizedUsername, quizId: progress.quizId }, { merge: true });
}

// Lädt den Fortschritt eines Users für ein Quiz (neues Modell)
export async function loadUserQuizProgress(username: string, quizId: string): Promise<UserQuizProgress | null> {
  const sanitizedUsername = sanitizeUsername(username);
  if (sanitizedUsername === "Gast" || !sanitizedUsername) {
    return null;
  }
  const db = getFirestore();
  const ref = doc(db, "users", sanitizedUsername, "progress", quizId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as UserQuizProgress;
    if (!data.quizId) data.quizId = quizId;
    return data;
  }
  return null;
}

// Speichert den Fortschritt eines Users für ein Quiz
export async function saveUserProgress(progress: UserProgress) {
  const sanitizedUsername = sanitizeUsername(progress.username);
  if (sanitizedUsername === "Gast" || !sanitizedUsername) {
    // Niemals Gast-User speichern
    return;
  }
  const db = getFirestore();
  const ref = doc(db, "users", sanitizedUsername, "progress", progress.quizId);
  // quizId explizit im Dokument speichern
  await setDoc(ref, { ...progress, username: sanitizedUsername, quizId: progress.quizId }, { merge: true });
}

// Lädt den Fortschritt eines Users für ein Quiz
export async function loadUserProgress(username: string, quizId: string): Promise<UserProgress | null> {
  const sanitizedUsername = sanitizeUsername(username);
  if (sanitizedUsername === "Gast" || !sanitizedUsername) {
    // Niemals Gast-Fortschritt laden
    return null;
  }
  const db = getFirestore();
  const ref = doc(db, "users", sanitizedUsername, "progress", quizId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as UserProgress;
    // quizId ergänzen, falls nicht vorhanden
    if (!data.quizId) data.quizId = quizId;
    return data;
  }
  return null;
}
