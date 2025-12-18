import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProgress, UserQuizProgress } from "../types/userProgress";
// Speichert den Fortschritt eines Users für ein Quiz (neues Modell)
export async function saveUserQuizProgress(progress: UserQuizProgress) {
  if (progress.username === "Gast") {
    return;
  }
  const db = getFirestore();
  const ref = doc(db, "users", progress.username, "progress", progress.quizId);
  await setDoc(ref, { ...progress, quizId: progress.quizId }, { merge: true });
}

// Lädt den Fortschritt eines Users für ein Quiz (neues Modell)
export async function loadUserQuizProgress(username: string, quizId: string): Promise<UserQuizProgress | null> {
  if (username === "Gast") {
    return null;
  }
  const db = getFirestore();
  const ref = doc(db, "users", username, "progress", quizId);
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
  if (progress.username === "Gast") {
    // Niemals Gast-User speichern
    return;
  }
  const db = getFirestore();
  const ref = doc(db, "users", progress.username, "progress", progress.quizId);
  // quizId explizit im Dokument speichern
  await setDoc(ref, { ...progress, quizId: progress.quizId }, { merge: true });
}

// Lädt den Fortschritt eines Users für ein Quiz
export async function loadUserProgress(username: string, quizId: string): Promise<UserProgress | null> {
  if (username === "Gast") {
    // Niemals Gast-Fortschritt laden
    return null;
  }
  const db = getFirestore();
  const ref = doc(db, "users", username, "progress", quizId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as UserProgress;
    // quizId ergänzen, falls nicht vorhanden
    if (!data.quizId) data.quizId = quizId;
    return data;
  }
  return null;
}
