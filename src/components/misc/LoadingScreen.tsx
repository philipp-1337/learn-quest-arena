import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Lade Inhalte...</p>
      <p className="text-xs text-gray-400 mt-2">Prüfe die Browser-Konsole für Details</p>
    </div>
  </div>
);

export default LoadingScreen;
