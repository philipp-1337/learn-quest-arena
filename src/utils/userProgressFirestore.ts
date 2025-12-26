import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProgress, UserQuizProgress, QuestionSRSData } from "../types/userProgress";

// Stellt sicher, dass alle SRS-Felder vorhanden sind (für Abwärtskompatibilität)
function ensureSRSFields(questionData: Partial<QuestionSRSData>): QuestionSRSData {
  return {
    answered: questionData.answered ?? false,
    attempts: questionData.attempts ?? 0,
    lastAnswerCorrect: questionData.lastAnswerCorrect ?? false,
    correctStreak: questionData.correctStreak ?? 0,
    lastAttemptDate: questionData.lastAttemptDate,
    nextReviewDate: questionData.nextReviewDate,
    difficultyLevel: questionData.difficultyLevel ?? 0,
  };
}

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
    
    // SRS-Felder für alle Fragen sicherstellen
    if (data.questions) {
      const normalizedQuestions: UserQuizProgress['questions'] = {};
      for (const [key, value] of Object.entries(data.questions)) {
        normalizedQuestions[key] = ensureSRSFields(value);
      }
      data.questions = normalizedQuestions;
    }
    
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
