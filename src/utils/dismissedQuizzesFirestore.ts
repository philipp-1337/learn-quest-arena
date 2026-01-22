import { getFirestore, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';

export async function addDismissedQuiz(username: string, quizId: string) {
  if (username === 'Gast') return;
  const db = getFirestore();
  const ref = doc(db, 'users', username);
  
  // setDoc mit merge erstellt das Dokument falls nötig, sonst update
  await setDoc(ref, {
    dismissedQuizzes: arrayUnion(quizId)
  }, { merge: true });
}

export async function getDismissedQuizzes(username: string): Promise<string[]> {
  if (username === 'Gast') return [];
  const db = getFirestore();
  const ref = doc(db, 'users', username);
  const snap = await getDoc(ref);
  if (snap.exists() && Array.isArray(snap.data().dismissedQuizzes)) {
    return snap.data().dismissedQuizzes;
  }
  return [];
}
