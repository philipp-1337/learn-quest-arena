
import React from 'react';

interface UserModalProps {
  username: string;
  onClose: () => void;
  onChooseName: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ username, onClose, onChooseName }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100 relative">
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Zurück
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 force-break" lang="de">Nutzername</h1>
          <p className="text-gray-600 force-break" lang="de">Dein zufällig generierter Nutzername</p>
        </div>

        {/* Username Display */}
        <div className="mb-8 text-2xl text-gray-800 font-mono text-center break-all select-all border border-gray-200 rounded-lg py-4 bg-gray-50">
          {username}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onChooseName}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm hover:shadow-md"
            title="Anderen Namen wählen"
            aria-label="Anderen Namen wählen"
          >
            Anderen Namen wählen
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
