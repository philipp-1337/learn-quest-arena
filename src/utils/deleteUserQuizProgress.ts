import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

/**
 * Löscht den Fortschritt eines Users für ein bestimmtes Quiz (inkl. XP etc.)
 * @param username Nutzername
 * @param quizId Quiz-ID
 */
export async function deleteUserQuizProgress(username: string, quizId: string): Promise<void> {
  if (!username || username === 'Gast') return;
  const db = getFirestore();
  const ref = doc(db, 'users', username, 'progress', quizId);
  await deleteDoc(ref);
}
