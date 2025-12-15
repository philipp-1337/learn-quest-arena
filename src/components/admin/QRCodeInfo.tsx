import { QrCode } from 'lucide-react';

export default function QRCodeInfo() {
  return (
    <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <QrCode className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-gray-900 mb-2">
            Direktlink zu Quizzen
          </h3>
          <p className="text-gray-700 mb-3">
            Klicke auf das QR-Code-Symbol neben einem Quiz, um einen
            Direktlink zu kopieren. Dieser Link führt direkt zum Quiz.
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Format:{' '}
            <code className="bg-white px-2 py-1 rounded text-xs">
              #/quiz/[subject]/[class]/[topic]/[quiz]
            </code>
          </p>
          <p className="text-sm text-gray-600">
            💡 Tipp: Erstelle QR-Codes aus diesen Links mit Tools wie{' '}
            <a
              href="https://kraft-qr.web.app/"
              className="text-indigo-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              kraft-qr.web.app
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
