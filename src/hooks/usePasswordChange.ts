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

const MIN_PASSWORD_LENGTH = 6;

const usePasswordChange = () => {
  const [loading, setLoading] = useState(false);

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<PasswordChangeResult> => {
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      setLoading(false);
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
          errorMessage = `Das neue Passwort ist zu schwach (mind. ${MIN_PASSWORD_LENGTH} Zeichen)`;
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

      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { changePassword, loading };
};

export default usePasswordChange;
export { MIN_PASSWORD_LENGTH };
