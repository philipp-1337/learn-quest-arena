import { useState } from 'react';

const USERNAME_KEY = 'lqa_username';
const DEFAULT_USERNAME = 'Gast';

export function useUsername() {
  const [username, setUsername] = useState<string>(() => {
    const stored = localStorage.getItem(USERNAME_KEY);
    return stored && stored !== '' ? stored : DEFAULT_USERNAME;
  });

  const [showPicker, setShowPicker] = useState(false);

  const updateUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem(USERNAME_KEY, name);
    setShowPicker(false);
  };

  const isGuest = username === DEFAULT_USERNAME || !username;

  return {
    username,
    isGuest,
    showPicker,
    setShowPicker,
    updateUsername,
  };
}
