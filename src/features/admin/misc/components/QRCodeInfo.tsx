import { QrCode } from 'lucide-react';

export default function QRCodeInfo() {
  return (
    <div className="mt-6 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <QrCode className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 force-break " lang="de">
            Direktlink zu Quizzen
          </h3>
          <p className="text-indigo-700 dark:text-indigo-300 mb-3">
            Klicke auf das QR-Code-Symbol neben einem Quiz, um einen
            Direktlink zu kopieren. Dieser Link führt direkt zum Quiz.
          </p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Tipp: Erstelle QR-Codes aus diesen Links mit Tools wie{' '}
            <a
              href="https://kraft-qr.web.app/"
              className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
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
