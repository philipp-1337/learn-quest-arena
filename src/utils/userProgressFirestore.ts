import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProgress } from "../types/userProgress";

// Speichert den Fortschritt eines Users für ein Quiz
export async function saveUserProgress(progress: UserProgress) {
  const db = getFirestore();
  const ref = doc(db, "users", progress.username, "progress", progress.quizId);
  await setDoc(ref, progress, { merge: true });
}

// Lädt den Fortschritt eines Users für ein Quiz
export async function loadUserProgress(username: string, quizId: string): Promise<UserProgress | null> {
  const db = getFirestore();
  const ref = doc(db, "users", username, "progress", quizId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProgress;
  }
  return null;
}
