import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProtectedEmail from './ProtectedEmail';

export default function Imprint() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 group"
            aria-label="Zurück zur Startseite"
            title="Zurück zur Startseite"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
            Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Impressum</h1>

          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 my-3">
            Angaben gemäß § 5 TMG
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Learn Quest Arena
            <br />
            Eine Online-Lernplattform
          </p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 my-3">Kontakt</h2>
            <ProtectedEmail />
          
            <br />
     
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 my-3">
            Haftung für Inhalte
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Als Betreiber dieser Plattform sind wir für die eigenen Inhalte
            verantwortlich. Die Inhalte wurden sorgfältig erstellt. Sollten
            dennoch Fehler oder Rechtsverletzungen auftreten, bitten wir um
            sofortige Mitteilung.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 my-3">
            Haftung für Links
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Unsere Seite enthält Links zu externen Webseiten. Für den Inhalt
            dieser verlinkten Seiten sind wir nicht verantwortlich.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 my-3">Urheberrecht</h2>
          <p className="text-gray-700 dark:text-gray-300  ">
            Die durch den Betreiber erstellten Inhalte sind urheberrechtlich
            geschützt. Eine Vervielfältigung, Bearbeitung, Verbreitung und jede
            Art der Verwertung außerhalb der Grenzen des Urheberrechts bedarf
            der Zustimmung des Betreibers.
          </p>
        </div>
      </div>
    </div>
  );
}
