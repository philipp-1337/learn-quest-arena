import { useState } from "react";
import { Loader2, Lock, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@shared/CustomToast";
import usePasswordChange, { MIN_PASSWORD_LENGTH } from "@hooks/usePasswordChange";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { changePassword, loading } = usePasswordChange();

  const validateForm = (): string | null => {
    if (!currentPassword) {
      return "Bitte gib dein aktuelles Passwort ein";
    }

    if (!newPassword) {
      return "Bitte gib ein neues Passwort ein";
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein`;
    }

    if (!confirmPassword) {
      return "Bitte bestätige dein neues Passwort";
    }

    if (newPassword !== confirmPassword) {
      return "Die Passwörter stimmen nicht überein";
    }

    if (currentPassword === newPassword) {
      return "Das neue Passwort muss sich vom aktuellen unterscheiden";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.custom(() => (
        <CustomToast message={validationError} type="error" />
      ));
      return;
    }

    const result = await changePassword(currentPassword, newPassword);

    if (result.success) {
      toast.custom(() => (
        <CustomToast message="Passwort erfolgreich geändert" type="success" />
      ));
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      toast.custom(() => (
        <CustomToast message={result.error || "Fehler beim Ändern des Passworts"} type="error" />
      ));
    }
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordStrengthOk = newPassword.length >= MIN_PASSWORD_LENGTH;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
        <Lock className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Passwort ändern</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Aktuelles Passwort
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Aktuelles Passwort"
              autoComplete="current-password"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-[16px]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label={showCurrentPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Neues Passwort
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Neues Passwort"
              autoComplete="new-password"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-[16px]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label={showNewPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {newPassword && (
            <p className={`text-xs mt-1 ${passwordStrengthOk ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {passwordStrengthOk ? "✓ Passwortstärke ausreichend" : `✗ Mindestens ${MIN_PASSWORD_LENGTH} Zeichen erforderlich`}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Passwort bestätigen
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort bestätigen"
              autoComplete="new-password"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {confirmPassword && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {passwordsMatch ? (
                <>
                  <Check className="w-3 h-3" />
                  Passwörter stimmen überein
                </>
              ) : (
                "✗ Passwörter stimmen nicht überein"
              )}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
            loading
              ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Wird geändert...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Passwort ändern
            </>
          )}
        </button>
      </form>
    </div>
  );
}