import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Dataprotection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 group"
            aria-label="Zurück zur Startseite"
            title="Zurück zur Startseite"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
            Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Datenschutzerklärung
          </h1>

            <p className="mb-4">
              Wir legen größten Wert auf den Schutz Ihrer Daten und die Wahrung
              Ihrer Privatsphäre. Nachfolgend informieren wir Sie deshalb über
              die Erhebung und Verwendung persönlicher Daten bei Nutzung unserer
              Webseite/Anwendung "Learn Quest".
            </p>
            <h2 className="text-xl font-semibold mt-6 mb-3">
              Datenerfassung auf unserer Webseite/Anwendung
            </h2>
            <h3 className="text-lg font-medium mt-4 mb-2">
              Hosting und Content Delivery Networks (CDN)
            </h3>
            <p className="mb-4">
              Unsere Anwendung wird bei Firebase Hosting (Google Ireland
              Limited, Gordon House, Barrow Street, Dublin 4, Irland) gehostet.
              Firebase Hosting dient der Bereitstellung unserer Webanwendung.
              Wenn Sie unsere Anwendung nutzen, werden Ihre IP-Adresse sowie
              Informationen über Ihren Browser und Ihr Betriebssystem an
              Firebase-Server übertragen. Diese Daten sind technisch notwendig,
              um Ihnen die Anwendung korrekt anzuzeigen und die Stabilität und
              Sicherheit zu gewährleisten. Die Server für Firebase Hosting
              befinden sich innerhalb der Europäischen Union (EU). Die Nutzung
              von Firebase Hosting erfolgt im Interesse einer sicheren,
              schnellen und effizienten Bereitstellung unseres Online-Angebots
              durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">
              Firebase Authentication
            </h3>
            <p className="mb-4">
              Zur Authentifizierung und Verwaltung von Benutzerkonten nutzen wir
              Firebase Authentication (Google Ireland Limited). Wenn Sie sich
              registrieren oder anmelden, werden die von Ihnen eingegebenen
              Daten (z.B. E-Mail-Adresse, Passwort) an Firebase übertragen und
              dort gespeichert, um Ihren Zugang zu ermöglichen und zu sichern.
              Die Datenverarbeitung dient der Durchführung des Nutzungsvertrags
              (Art. 6 Abs. 1 lit. b DSGVO). Die Server für Firebase
              Authentication befinden sich innerhalb der Europäischen Union
              (EU).
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">
              Firebase Firestore (Datenbank)
            </h3>
            <p className="mb-4">
              Zur Speicherung der Anwendungsdaten (z.B. Quizfragen,
              Fortschritt, Konfigurationen) nutzen wir Firebase Firestore
              (Google Ireland Limited), eine NoSQL-Cloud-Datenbank. Die von
              Ihnen in der Anwendung eingegebenen und generierten Daten werden
              in Firestore gespeichert. Dies ist notwendig für die
              Kernfunktionalität der Anwendung. Die Datenverarbeitung dient der
              Durchführung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).
              Die Server für Firebase Firestore befinden sich innerhalb der
              Europäischen Union (EU).
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">
              Datenverwendung durch Firebase/Google
            </h3>
            <p className="mb-4">
              Wir haben die Einstellungen für die Firebase-Dienste so
              konfiguriert, dass Google keine Erlaubnis hat, die über unsere
              Anwendung verarbeiteten Daten für Produktverbesserungen oder
              andere eigene Zwecke von Google zu nutzen. Die Datenverarbeitung
              durch Firebase erfolgt ausschließlich im Rahmen der Bereitstellung
              der genannten Dienste für uns als Auftragsverarbeiter.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">Cookies</h3>
            <p className="mb-4">
              Unsere Anwendung verwendet ausschließlich technisch notwendige
              Cookies. Firebase Authentication kann Cookies verwenden, um
              Sitzungen zu verwalten und die Sicherheit der Authentifizierung zu
              gewährleisten. Diese Cookies dienen nicht dem Tracking Ihres
              Surfverhaltens oder für Werbezwecke. Die Rechtsgrundlage für die
              Verwendung technisch notwendiger Cookies ist Art. 6 Abs. 1 lit. f
              DSGVO, unser berechtigtes Interesse an einer nutzerfreundlichen
              und funktionsfähigen Bereitstellung unserer Dienste.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">
              Kein Tracking oder Analyse durch Drittanbieter
            </h3>
            <p className="mb-4">
              Wir setzen keine externen Tracking- oder Analyse-Tools (wie z.B.
              Google Analytics, Matomo, etc.) ein, die Ihr Nutzungsverhalten
              über unsere Anwendung hinaus verfolgen.
            </p>
            <h2 className="text-xl font-semibold mt-6 mb-3">Ihre Rechte</h2>
            <p className="mb-2">
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen
              jederzeit das Recht auf unentgeltliche Auskunft über Ihre
              gespeicherten personenbezogenen Daten, deren Herkunft und
              Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht
              auf Berichtigung, Sperrung oder Löschung dieser Daten.
            </p>
            <h2 className="text-xl font-semibold mt-6 mb-3">
              Änderung unserer Datenschutzbestimmungen
            </h2>
            <p className="mb-4">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
              sie stets den aktuellen rechtlichen Anforderungen entspricht oder
              um Änderungen unserer Leistungen in der Datenschutzerklärung
              umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren
              erneuten Besuch gilt dann die neue Datenschutzerklärung.
            </p>
            <p>
              <span
                aria-label="Letzte Aktualisierung"
                className="font-semibold"
              >
                Stand: Dezember 2025
              </span>
            </p>
        </div>
        </div>
      </div>

  );
}
