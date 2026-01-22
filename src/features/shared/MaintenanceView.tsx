import { AlertTriangle, Info, RefreshCw } from 'lucide-react';

/**
 * MaintenanceView Component
 * Wird angezeigt, wenn die App im Wartungsmodus ist
 */
export default function MaintenanceView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Titel */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Wartungsarbeiten
          </h1>

          {/* Beschreibung */}
          <div className="space-y-4 text-center">
            <p className="text-lg text-gray-700">
              Wir führen gerade wichtige Wartungsarbeiten durch, um die App zu verbessern.
            </p>
            <p className="text-gray-600">
              Die App ist vorübergehend nicht verfügbar. Bitte versuche es in Kürze erneut.
            </p>
          </div>

          {/* Zusätzliche Info */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Was passiert gerade?
                </h3>
                <p className="text-sm text-blue-800">
                  Wir aktualisieren die Systeme, um dir ein noch besseres Lernerlebnis zu bieten. 
                  Deine Fortschritte und Daten sind sicher gespeichert.
                </p>
              </div>
            </div>
          </div>

          {/* Reload Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              Erneut versuchen
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Bei Fragen kontaktiere bitte den Administrator.
        </p>
      </div>
    </div>
  );
}
