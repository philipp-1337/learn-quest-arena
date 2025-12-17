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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (name.trim()) {
      setLoading(true);
      try {
        await Promise.resolve(onSave(name.trim()));
        setName('');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 force-break" lang="de">
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
          disabled={loading}
        />

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : null}
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
