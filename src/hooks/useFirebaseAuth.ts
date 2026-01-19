import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Hilfsfunktion zur Übersetzung von Firebase Auth-Fehlercodes in benutzerfreundliche deutsche Nachrichten
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-Mail oder Passwort ist falsch.';
    case 'auth/invalid-email':
      return 'Die E-Mail-Adresse ist ungültig.';
    case 'auth/user-disabled':
      return 'Dieser Account wurde deaktiviert.';
    case 'auth/too-many-requests':
      return 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.';
    case 'auth/network-request-failed':
      return 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
    case 'auth/operation-not-allowed':
      return 'Anmeldung ist derzeit nicht möglich.';
    case 'auth/weak-password':
      return 'Das Passwort ist zu schwach.';
    case 'auth/email-already-in-use':
      return 'Diese E-Mail-Adresse wird bereits verwendet.';
    case 'auth/requires-recent-login':
      return 'Bitte melden Sie sich erneut an.';
    default:
      return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
  }
};

const useFirebaseAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const auth = getAuth();
      const db = getFirestore();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
        // Nach Login: author-Dokument prüfen/anlegen
        const uid = userCredential.user.uid;
        const authorRef = doc(db, "author", uid);
        const authorSnap = await getDoc(authorRef);
        if (!authorSnap.exists()) {
            await setDoc(authorRef, {
              name: userCredential.user.displayName || "",
              email: userCredential.user.email || "",
              role: "supporter" // Default role
            });
        }
      return userCredential.user;
    } catch (err: any) {
      const errorCode = err.code || 'unknown';
      const userFriendlyMessage = getFirebaseErrorMessage(errorCode);
      setError(userFriendlyMessage);
      setLoading(false);
      return null;
    }
  };

  return { login, error, loading };
};

export default useFirebaseAuth;