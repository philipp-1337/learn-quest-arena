import { useState } from 'react';
import UsernamePicker from './UsernamePicker';
import UsernameManualEntry from './UsernameManualEntry';

interface UsernameFlowProps {
  onComplete: (username: string) => void;
}

export default function UsernameFlow({ onComplete }: UsernameFlowProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleUsernameSelected = (name: string) => {
    if (name === 'skip') {
      onComplete('Gast');
    } else {
      onComplete(name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Wähle deinen Nutzernamen
        </h2>
        {!showManualEntry ? (
          <UsernamePicker
            onUsernameSelected={handleUsernameSelected}
            onManualEntryRequested={() => setShowManualEntry(true)}
          />
        ) : (
          <UsernameManualEntry
            onUsernameSelected={handleUsernameSelected}
            onBack={() => setShowManualEntry(false)}
          />
        )}
      </div>
    </div>
  );
}
