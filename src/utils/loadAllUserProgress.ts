import '../firebaseConfig';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import type { UserProgress } from "../types/userProgress";

// Lädt den Fortschritt eines Users für alle Quizzes
export async function loadAllUserProgress(username: string): Promise<Record<string, UserProgress>> {
  if (username === "Gast") {
    // Niemals Gast-Fortschritt laden
    return {};
  }
  const db = getFirestore();
  const progressCol = collection(db, "users", username, "progress");
  const snap = await getDocs(progressCol);
  const result: Record<string, UserProgress> = {};
  snap.forEach(doc => {
    result[doc.id] = doc.data() as UserProgress;
  });
  return result;
}
