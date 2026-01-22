import { ArrowLeft, LogOut } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AbbreviationForm, PasswordChangeForm } from '@admin';

interface AdminProfileViewProps {
  onLogout?: () => void;
  onAbbreviationUpdated?: () => void;
}

export default function AdminProfileView({
  onLogout,
  onAbbreviationUpdated,
}: AdminProfileViewProps) {
  const auth = getAuth();
  const navigate = useNavigate();
  const userEmail = auth.currentUser?.email;

  const handleBack = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      auth.signOut().then(() => {
        navigate('/');
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group cursor-pointer"
          aria-label="Zurück"
          title="Zurück"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>

        {/* Header */}
        <div className="mb-4">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            lang="de"
          >
            Admin-Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400" lang="de">
            Verwalte deine Profil-Einstellungen
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Email Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Angemeldet als
            </label>
            <input
              type="text"
              value={userEmail || ""}
              disabled
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
            />
          </div>

          {/* Abbreviation Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <AbbreviationForm onAbbreviationUpdated={onAbbreviationUpdated} />
          </div>

          {/* Password Change Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <PasswordChangeForm />
          </div>

          {/* Logout Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
