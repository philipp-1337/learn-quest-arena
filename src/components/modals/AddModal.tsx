import { useState } from 'react';

const titles = {
  subject: 'Neues Fach',
  class: 'Neue Klasse',
  topic: 'Neues Thema',
  quiz: 'Neues Quiz',
};

interface AddModalProps {
  type: keyof typeof titles;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function AddModal({ type, onSave, onClose }: AddModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {titles[type]} hinzufügen
        </h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Name eingeben..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Speichern
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
