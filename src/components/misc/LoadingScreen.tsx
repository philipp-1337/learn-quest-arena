import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Lade Inhalte...</p>
    </div>
  </div>
);

export default LoadingScreen;
