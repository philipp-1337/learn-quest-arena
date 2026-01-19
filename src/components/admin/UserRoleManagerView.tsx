import { UserRoleManager } from "./UserRoleManager";

interface UserRoleManagerViewProps {
  onBack?: () => void;
}

export default function UserRoleManagerView({ onBack }: UserRoleManagerViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100 dark:border-gray-700 relative">
        {/* Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 group"
            aria-label="Zurück"
            title="Zurück"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Zurück
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User & Rollen verwalten</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Hier kannst du die Rollen aller Nutzer ändern</p>
        <UserRoleManager />
      </div>
    </div>
  );
}
