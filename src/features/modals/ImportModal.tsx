import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, X, Download, ClipboardList } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import type { QuizDocument } from 'quizTypes';
import { saveQuizDocument, loadAllQuizDocuments } from '@utils/quiz-collection';

// ============================================
// IMPORT MODAL COMPONENT
// ============================================

interface ImportModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: string[];
}

export default function ImportModal({ onClose, onImportComplete }: ImportModalProps) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = (type: 'json' | 'csv') => {
    if (type === 'json') {
      const template = {
        subject: "Mathematik",
        class: "Klasse 3",
        topic: "Multiplikation",
        quizzes: [
          {
            title: "Einmaleins Übung",
            questions: [
              {
                question: "Was ist 3 × 4?",
                answerType: "text",
                answers: [
                  { type: "text", content: "12" },
                  { type: "text", content: "10" },
                  { type: "text", content: "15" }
                ],
                correctAnswerIndex: 0
              },
              {
                question: "Was ist 5 × 2?",
                answerType: "text",
                answers: [
                  { type: "text", content: "10" },
                  { type: "text", content: "12" },
                  { type: "text", content: "8" }
                ],
                correctAnswerIndex: 0
              }
            ]
          }
        ]
      };
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz-template.json';
      a.click();
    } else {
      const csv = `Subject,Class,Topic,Quiz,Question,Answer1,Answer2,Answer3,CorrectAnswer
Mathematik,Klasse 3,Multiplikation,Einmaleins,Was ist 3 × 4?,12,10,15,1
Mathematik,Klasse 3,Multiplikation,Einmaleins,Was ist 5 × 2?,10,12,8,1
Deutsch,Klasse 2,Wortarten,Nomen Quiz,Was ist ein Nomen?,Ein Ding,Ein Tuwort,Ein Wiewort,1`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz-template.csv';
      a.click();
    }
  };

  const parseCSV = (csvText: string): any => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV muss mindestens eine Header-Zeile und eine Daten-Zeile enthalten');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['Subject', 'Class', 'Topic', 'Quiz', 'Question', 'Answer1', 'Answer2', 'Answer3', 'CorrectAnswer'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Fehlende Spalten: ${missingHeaders.join(', ')}`);
    }

    // Group by Subject > Class > Topic > Quiz
    const grouped: any = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 9) continue;

      const [subject, classLevel, topic, quiz, question, ans1, ans2, ans3, correctStr] = values;
      const correctAnswer = parseInt(correctStr) - 1; // Convert 1-based to 0-based

      if (correctAnswer < 0 || correctAnswer > 4) {
        throw new Error(`Zeile ${i + 1}: CorrectAnswer muss zwischen 1 und 5 sein`);
      }

      if (!grouped[subject]) grouped[subject] = {};
      if (!grouped[subject][classLevel]) grouped[subject][classLevel] = {};
      if (!grouped[subject][classLevel][topic]) grouped[subject][classLevel][topic] = {};
      if (!grouped[subject][classLevel][topic][quiz]) {
        grouped[subject][classLevel][topic][quiz] = [];
      }

      grouped[subject][classLevel][topic][quiz].push({
        question,
        answerType: 'text',
        answers: [
          { type: 'text', content: ans1 },
          { type: 'text', content: ans2 },
          { type: 'text', content: ans3 }
        ],
        correctAnswerIndex: correctAnswer
      });
    }

    // Convert to import format
    const result = [];
    for (const [subjectName, classes] of Object.entries(grouped)) {
      for (const [className, topics] of Object.entries(classes as any)) {
        for (const [topicName, quizzes] of Object.entries(topics as any)) {
          for (const [quizTitle, questions] of Object.entries(quizzes as any)) {
            result.push({
              subject: subjectName,
              class: className,
              topic: topicName,
              quizzes: [{
                title: quizTitle,
                questions: questions
              }]
            });
          }
        }
      }
    }

    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setImportResult({
        success: false,
        message: 'Nicht eingeloggt',
      });
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const text = await file.text();
      let importData: any[];

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        importData = Array.isArray(parsed) ? parsed : [parsed];
      } else if (file.name.endsWith('.csv')) {
        importData = parseCSV(text);
      } else {
        throw new Error('Nur JSON oder CSV Dateien werden unterstützt');
      }

      // Import directly to the quizzes collection
      const result = await importToQuizzesCollection(importData, user.uid, user.email || undefined);
      
      setImportResult(result);
      
      if (result.success) {
        onImportComplete();
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: `Import fehlgeschlagen: ${error.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const importToQuizzesCollection = async (
    importData: any[], 
    authorId: string, 
    authorEmail?: string
  ): Promise<ImportResult> => {
    const details: string[] = [];
    let quizzesAdded = 0;
    let questionsAdded = 0;

    // Load existing quizzes to check for duplicates
    const existingQuizzes = await loadAllQuizDocuments();

    try {
      for (const item of importData) {
        // Validate required fields
        if (!item.subject || !item.class || !item.topic || !item.quizzes) {
          throw new Error('Fehlende erforderliche Felder (subject, class, topic, quizzes)');
        }

        // Generate IDs for subject, class, topic
        const subjectId = `subject-${item.subject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        const classId = `${subjectId}-class-${item.class.toLowerCase().replace(/\s+/g, '-')}`;
        const topicId = `${classId}-topic-${item.topic.toLowerCase().replace(/\s+/g, '-')}`;

        // Check existing quizzes to reuse IDs if they exist
        const existingWithSameSubject = existingQuizzes.find(q => 
          q.subjectName?.toLowerCase() === item.subject.toLowerCase()
        );
        const existingWithSameClass = existingQuizzes.find(q => 
          q.subjectName?.toLowerCase() === item.subject.toLowerCase() &&
          q.className?.toLowerCase() === item.class.toLowerCase()
        );
        const existingWithSameTopic = existingQuizzes.find(q => 
          q.subjectName?.toLowerCase() === item.subject.toLowerCase() &&
          q.className?.toLowerCase() === item.class.toLowerCase() &&
          q.topicName?.toLowerCase() === item.topic.toLowerCase()
        );

        const finalSubjectId = existingWithSameSubject?.subjectId || subjectId;
        const finalClassId = existingWithSameClass?.classId || classId;
        const finalTopicId = existingWithSameTopic?.topicId || topicId;

        // Add quizzes
        for (const quiz of item.quizzes) {
          if (!quiz.title || !quiz.questions || quiz.questions.length === 0) {
            throw new Error(`Quiz "${quiz.title || 'unbenannt'}" hat keine gültigen Fragen`);
          }

          // Check for duplicate quiz
          const existingQuiz = existingQuizzes.find(q => 
            q.title.toLowerCase() === quiz.title.toLowerCase() &&
            q.topicId === finalTopicId
          );
          if (existingQuiz) {
            details.push(`Quiz "${quiz.title}" existiert bereits und wurde übersprungen`);
            continue;
          }

          // Validate questions
          for (const q of quiz.questions) {
            if (!q.question || !q.answers || q.answers.length < 2 || q.answers.length > 5) {
              throw new Error(`Ungültige Frage in Quiz "${quiz.title}": Jede Frage braucht Text und 2-5 Antworten`);
            }
            if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.answers.length) {
              throw new Error(`Ungültiger correctAnswerIndex in Quiz "${quiz.title}": Muss zwischen 0 und ${q.answers.length - 1} sein`);
            }
          }

          const now = Date.now();
          const quizId = crypto.randomUUID();

          const quizDoc: QuizDocument = {
            id: quizId,
            uuid: quizId,
            title: quiz.title,
            shortTitle: quiz.title.substring(0, 20),
            questions: quiz.questions,
            hidden: true, // Start hidden
            createdAt: now,
            updatedAt: now,
            authorId,
            authorEmail,
            subjectId: finalSubjectId,
            subjectName: item.subject,
            classId: finalClassId,
            className: item.class,
            topicId: finalTopicId,
            topicName: item.topic,
          };

          const result = await saveQuizDocument(quizDoc);
          
          if (result.success) {
            quizzesAdded++;
            questionsAdded += quiz.questions.length;
            details.push(`Quiz hinzugefügt: "${quiz.title}" (${quiz.questions.length} Fragen)`);
          } else {
            details.push(`Fehler bei "${quiz.title}": ${result.error}`);
          }
        }
      }

      return {
        success: quizzesAdded > 0,
        message: quizzesAdded > 0 
          ? `Import erfolgreich!` 
          : 'Keine neuen Quizze importiert',
        details: [
          `${quizzesAdded} Quiz(ze) mit ${questionsAdded} Fragen importiert`,
          ...details
        ]
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        details: details
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white force-break" lang="de">Quiz Import</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            title="Schließen"
            aria-label="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Anleitung
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Lade eine Vorlage herunter (JSON oder CSV)</li>
              <li>Fülle die Vorlage mit deinen Quiz-Daten</li>
              <li>Lade die Datei hier hoch</li>
              <li>Fehlende Fächer/Klassen/Themen werden automatisch erstellt</li>
            </ol>
          </div>

          {/* Download Templates */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => downloadTemplate('json')}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              title="JSON Vorlage herunterladen"
              aria-label="JSON Vorlage herunterladen"
            >
              <Download className="w-4 h-4" />
              JSON Vorlage
            </button>
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              title="CSV Vorlage herunterladen"
              aria-label="CSV Vorlage herunterladen"
            >
              <Download className="w-4 h-4" />
              CSV Vorlage
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block w-full">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                Datei hier ablegen oder klicken
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JSON oder CSV (max. 10MB)
              </p>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          </label>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-blue-800 dark:text-blue-200">Verarbeite Daten...</span>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`mb-6 rounded-lg p-4 ${
            importResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {importResult.message}
                </p>
                {importResult.details && importResult.details.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm">
                    {importResult.details.map((detail, index) => (
                      <p key={index} className={
                        importResult.success ? 'text-green-800' : 'text-red-800'
                      }>
                        {detail}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Format Examples */}
        <div className="border-t pt-4">
          <details className="text-sm">
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer mb-2">
              Format-Beispiele anzeigen
            </summary>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">JSON Format:</h5>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
{`{
  "subject": "Mathematik",
  "class": "Klasse 3",
  "topic": "Multiplikation",
  "quizzes": [
    {
      "title": "Einmaleins",
      "questions": [
        {
          "question": "Was ist 3 × 4?",
          "answerType": "text",
          "answers": [
            { "type": "text", "content": "12" },
            { "type": "text", "content": "10" },
            { "type": "text", "content": "15" }
          ],
          "correctAnswerIndex": 0
        }
      ]
    }
  ]
}`}
                </pre>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">CSV Format:</h5>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
{`Subject,Class,Topic,Quiz,Question,Answer1,Answer2,Answer3,CorrectAnswer
Mathematik,Klasse 3,Multiplikation,Einmaleins,Was ist 3 × 4?,12,10,15,1
Mathematik,Klasse 3,Multiplikation,Einmaleins,Was ist 5 × 2?,10,12,8,1`}
                </pre>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                  <strong>Hinweis:</strong> CorrectAnswer ist 1-basiert (1 bis 5)
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}