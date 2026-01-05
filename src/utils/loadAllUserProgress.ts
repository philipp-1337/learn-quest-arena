import '../firebaseConfig';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import type { UserQuizProgress, UserProgress } from "../types/userProgress";
import { ensureSRSFields } from "./srsHelpers";

// Lädt den Fortschritt eines Users für alle Quizzes (neues Modell bevorzugt)
export async function loadAllUserProgress(username: string): Promise<Record<string, UserQuizProgress>> {
  if (username === "Gast") {
    return {};
  }
  const db = getFirestore();
  const progressCol = collection(db, "users", username, "progress");
  const snap = await getDocs(progressCol);
  const result: Record<string, UserQuizProgress> = {};
  snap.forEach(docSnap => {
    const data = docSnap.data();
    // Prüfe, ob neues Modell (questions-Feld vorhanden)
    if (data.questions) {
      const quizProgress = data as UserQuizProgress;
      if (!quizProgress.quizId) quizProgress.quizId = docSnap.id;
      
      // SRS-Felder für alle Fragen sicherstellen
      const normalizedQuestions: UserQuizProgress['questions'] = {};
      for (const [key, value] of Object.entries(quizProgress.questions)) {
        normalizedQuestions[key] = ensureSRSFields(value);
      }
      quizProgress.questions = normalizedQuestions;
      
      result[docSnap.id] = quizProgress;
    } else {
      // Fallback: altes Modell in neues Modell umwandeln
      const old = data as UserProgress;
      result[docSnap.id] = {
        username: old.username,
        quizId: old.quizId || docSnap.id,
        questions: {},
        totalTries: old.totalTries,
        completed: Array.isArray(old.answers) ? old.answers.every(Boolean) : false,
        lastUpdated: old.lastUpdated,
      };
    }
  });
  return result;
}
