import { animalNames } from "./animalNames";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";

// Prüft, ob ein Username dem Generator-Format entspricht (Tiername + _ + 6 Zeichen)
export function isValidGeneratedUsername(username: string): boolean {
  const regex = new RegExp(`^(${animalNames.join("|")})_[A-Za-z0-9]{6}$`);
  return regex.test(username);
}

// Prüft, ob ein Username bereits in Firestore existiert
export async function usernameExists(username: string): Promise<boolean> {
  const db = getFirestore();
  const userRef = doc(collection(db, "users"), username);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
}
