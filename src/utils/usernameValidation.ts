import { animalNames } from "./animalNames";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";

// Sanitize username input to prevent injection attacks
export function sanitizeUsername(username: string): string {
  // Remove any characters that are not alphanumeric, hyphens, or German umlauts
  const cleaned = username.replace(/[^A-Za-z0-9äöüßÄÖÜ-]/g, '');
  
  // Ensure the sanitized username still matches the expected format
  // This prevents edge cases where sanitization creates invalid usernames
  if (!cleaned.includes('-')) {
    return '';
  }
  
  return cleaned;
}

// Prüft, ob ein Username dem Generator-Format entspricht (Tiername + _ + 6 Zeichen)
export function isValidGeneratedUsername(username: string): boolean {
  // First sanitize the input
  const sanitized = sanitizeUsername(username);
  
  // Prevent excessively long usernames (max 50 characters)
  // Minimum is 10 characters: shortest animal name (3 chars) + hyphen + 6 chars
  if (sanitized.length > 50 || sanitized.length < 10) {
    return false;
  }
  
  const regex = new RegExp(`^(${animalNames.join("|")})-[A-Za-z0-9]{6}$`);
  return regex.test(sanitized);
}

// Prüft, ob ein Username bereits in Firestore existiert
export async function usernameExists(username: string): Promise<boolean> {
  // Sanitize username before checking
  const sanitized = sanitizeUsername(username);
  
  if (!sanitized || sanitized.length === 0) {
    return false;
  }
  
  const db = getFirestore();
  const userRef = doc(collection(db, "users"), sanitized);
  console.log("[usernameExists] Querying username:", sanitized);
  const userSnap = await getDoc(userRef);
  console.log("[usernameExists] Document exists:", userSnap.exists(), "Data:", userSnap.data());
  return userSnap.exists();
}
