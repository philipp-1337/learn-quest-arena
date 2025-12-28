import { useState, useEffect } from "react";
import { Database, Play, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { Subject, MigrationStatus } from "../../types/quizTypes";
import {
  migrateQuizzesToCollection,
  loadLatestMigrationStatus,
  extractAllQuizzesFromSubjects,
  getQuizzesCollectionCount,
} from "../../utils/quizzesCollection";

interface QuizMigrationPanelProps {
  subjects: Subject[];
}

export default function QuizMigrationPanel({ subjects }: QuizMigrationPanelProps) {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial status
  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      try {
        const [status, count] = await Promise.all([
          loadLatestMigrationStatus(),
          getQuizzesCollectionCount(),
        ]);
        setMigrationStatus(status);
        setCollectionCount(count);
      } catch (error) {
        console.error("Error loading migration status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, []);

  const totalEmbeddedQuizzes = extractAllQuizzesFromSubjects(subjects).length;

  const handleMigration = async () => {
    setIsMigrating(true);
    setProgress({ current: 0, total: totalEmbeddedQuizzes, message: "Migration wird gestartet..." });

    try {
      const status = await migrateQuizzesToCollection(subjects, (current, total, message) => {
        setProgress({ current, total, message });
      });

      setMigrationStatus(status);
      const count = await getQuizzesCollectionCount();
      setCollectionCount(count);
    } catch (error) {
      console.error("Migration failed:", error);
    } finally {
      setIsMigrating(false);
      setProgress(null);
    }
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    try {
      const [status, count] = await Promise.all([
        loadLatestMigrationStatus(),
        getQuizzesCollectionCount(),
      ]);
      setMigrationStatus(status);
      setCollectionCount(count);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Lade Migrationsstatus...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Quiz-Daten Migration</h3>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Was macht diese Migration?</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Kopiert alle Quizze in eine neue, eigenständige Sammlung</li>
          <li>Fügt Metadaten hinzu (Erstelldatum, Autor)</li>
          <li>Verknüpft Quizze mit Fächern, Klassen und Themen als Attribute</li>
          <li>Die alten Daten bleiben erhalten und funktionieren weiterhin</li>
        </ul>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Eingebettete Quizze</div>
          <div className="text-2xl font-bold text-gray-900">{totalEmbeddedQuizzes}</div>
          <div className="text-xs text-gray-500">In Fächer-Struktur</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Migrierte Quizze</div>
          <div className="text-2xl font-bold text-indigo-600">{collectionCount}</div>
          <div className="text-xs text-gray-500">In neuer Sammlung</div>
        </div>
      </div>

      {/* Progress Bar */}
      {isMigrating && progress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{progress.message}</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Last Migration Status */}
      {migrationStatus && !isMigrating && (
        <div className={`rounded-lg p-4 mb-6 ${
          migrationStatus.status === "completed" ? "bg-green-50 border border-green-200" :
          migrationStatus.status === "failed" ? "bg-red-50 border border-red-200" :
          "bg-yellow-50 border border-yellow-200"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {migrationStatus.status === "completed" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold ${
              migrationStatus.status === "completed" ? "text-green-900" : "text-red-900"
            }`}>
              {migrationStatus.status === "completed" ? "Migration abgeschlossen" : "Migration fehlgeschlagen"}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <p className={migrationStatus.status === "completed" ? "text-green-800" : "text-red-800"}>
              Erfolgreich: {migrationStatus.migratedQuizzes} / {migrationStatus.totalQuizzes}
            </p>
            {migrationStatus.failedQuizzes > 0 && (
              <p className="text-red-800">Fehlgeschlagen: {migrationStatus.failedQuizzes}</p>
            )}
            <p className="text-gray-600 text-xs">
              Durchgeführt am: {new Date(migrationStatus.startedAt).toLocaleString("de-DE")}
            </p>
          </div>
          {migrationStatus.errors.length > 0 && (
            <details className="mt-3">
              <summary className="text-sm text-red-700 cursor-pointer">Fehler anzeigen ({migrationStatus.errors.length})</summary>
              <ul className="mt-2 text-xs text-red-700 space-y-1">
                {migrationStatus.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleMigration}
          disabled={isMigrating || totalEmbeddedQuizzes === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
            isMigrating || totalEmbeddedQuizzes === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isMigrating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Migration läuft...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {collectionCount > 0 ? "Migration erneut ausführen" : "Migration starten"}
            </>
          )}
        </button>
        <button
          onClick={refreshStatus}
          disabled={isLoading || isMigrating}
          className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          title="Status aktualisieren"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {totalEmbeddedQuizzes === 0 && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          Keine Quizze zum Migrieren gefunden. Erstelle zuerst Quizze in der Fächerstruktur.
        </p>
      )}
    </div>
  );
}
