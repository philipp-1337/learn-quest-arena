import { animalNames } from './animalNames';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';

// Prüft, ob ein Username dem Generator-Format entspricht (Tiername + _ + 6 Zeichen)
export function isValidGeneratedUsername(username: string): boolean {
  const regex = new RegExp(`^(${animalNames.join("|")})-[A-Za-z0-9]{6}$`);
  return regex.test(username);
}

// Prüft, ob ein Username bereits in Firestore existiert
export async function usernameExists(username: string): Promise<boolean> {
  const db = getFirestore();
  const userRef = doc(collection(db, "users"), username);
  console.log("[usernameExists] Querying username:", username);
  const userSnap = await getDoc(userRef);
  console.log("[usernameExists] Document exists:", userSnap.exists(), "Data:", userSnap.data());
  return userSnap.exists();
}
