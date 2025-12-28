import { useState } from "react";
import { Download, X, FileJson, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { exportQuizzesToJSON, exportQuizzesToCSV } from "../../utils/quizExport";

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const result = format === 'json' 
        ? await exportQuizzesToJSON()
        : await exportQuizzesToCSV();

      if (result.success) {
        setExportResult({
          success: true,
          message: `Export erfolgreich! Die Datei wurde heruntergeladen.`,
        });
      } else {
        setExportResult({
          success: false,
          message: result.error || "Export fehlgeschlagen",
        });
      }
    } catch (error: any) {
      setExportResult({
        success: false,
        message: `Fehler: ${error.message}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quizze Exportieren</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Was wird exportiert?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Alle Quizze aus der Quiz-Collection</li>
              <li>Gruppiert nach Fach, Klasse und Thema</li>
              <li>Mit allen Fragen und Antworten</li>
              <li>Kompatibel mit dem Import-Format</li>
            </ul>
          </div>

          {/* Export Options */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Format wählen:</h3>
            
            {/* JSON Export */}
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-shrink-0">
                <FileJson className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">JSON Format</div>
                <div className="text-sm text-gray-600">
                  Strukturiert und leicht zu bearbeiten. Empfohlen für große Datenmengen.
                </div>
              </div>
              {isExporting && (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              )}
            </button>

            {/* CSV Export */}
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-shrink-0">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">CSV Format</div>
                <div className="text-sm text-gray-600">
                  Einfaches Tabellenformat. Gut für Excel/Google Sheets.
                </div>
              </div>
              {isExporting && (
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              )}
            </button>
          </div>

          {/* Result Message */}
          {exportResult && (
            <div className={`rounded-lg p-4 ${
              exportResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {exportResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  exportResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {exportResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Info Text */}
          <div className="mt-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            <p className="font-semibold mb-2">💡 Tipp:</p>
            <p>
              Die exportierte Datei kann direkt wieder importiert werden. 
              So kannst du Backups erstellen oder Quizze zwischen verschiedenen Instanzen übertragen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
