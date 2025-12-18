import { animalNames, reservedAnimalNames } from "./animalNames";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";

// Hilfsfunktion: Zufällige 6-stellige Buchstaben-/Zahlen-Kombination
function randomSuffix(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Prüft, ob ein Username bereits in Firestore existiert
async function usernameExists(username: string): Promise<boolean> {
  const db = getFirestore();
  const userRef = doc(collection(db, "users"), username);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
}

// Generiert 3 einzigartige Usernamen, die noch nicht in Firestore existieren
// Reservierte Tiernamen werden dabei nicht verwendet
export async function generateUniqueUsernames(): Promise<string[]> {
  const usernames: string[] = [];
  const usedNames = new Set<string>();
  const availableAnimals = animalNames.filter(
    (animal) => !reservedAnimalNames.includes(animal)
  );
  
  while (usernames.length < 3) {
    const animal =
      availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
    const suffix = randomSuffix();
    const username = `${animal}-${suffix}`;
    if (usedNames.has(username)) continue;
    if (!(await usernameExists(username))) {
      usernames.push(username);
      usedNames.add(username);
    }
  }
  return usernames;
}
