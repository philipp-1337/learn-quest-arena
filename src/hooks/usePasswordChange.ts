import { useState } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

interface PasswordChangeResult {
  success: boolean;
  error?: string;
}

const usePasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<PasswordChangeResult> => {
    setError(null);
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      setLoading(false);
      setError("Kein Benutzer angemeldet");
      return { success: false, error: "Kein Benutzer angemeldet" };
    }

    try {
      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update to new password
      await updatePassword(user, newPassword);

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      let errorMessage = "Ein Fehler ist aufgetreten";

      // Handle specific Firebase error codes
      switch (err.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Das aktuelle Passwort ist falsch";
          break;
        case "auth/weak-password":
          errorMessage = "Das neue Passwort ist zu schwach (mind. 6 Zeichen)";
          break;
        case "auth/requires-recent-login":
          errorMessage =
            "Bitte melden Sie sich erneut an, bevor Sie Ihr Passwort ändern";
          break;
        case "auth/network-request-failed":
          errorMessage = "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung";
          break;
        default:
          errorMessage = err.message || "Ein Fehler ist aufgetreten";
      }

      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { changePassword, loading, error };
};

export default usePasswordChange;
