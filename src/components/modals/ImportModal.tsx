import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, X, Download } from "lucide-react";
import type { Subject } from "../../types/quizTypes";

// ============================================
// IMPORT MODAL COMPONENT
// ============================================

interface ImportModalProps {
  subjects: Subject[];
  onImport: (updatedSubjects: Subject[]) => void;
  onClose: () => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: string[];
}

export default function ImportModal({ subjects, onImport, onClose }: ImportModalProps) {
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

      if (correctAnswer < 0 || correctAnswer > 2) {
        throw new Error(`Zeile ${i + 1}: CorrectAnswer muss 1, 2 oder 3 sein`);
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

      // Validate and merge data
      const result = mergeImportData(importData, subjects);
      
      if (result.success) {
        onImport(result.subjects);
        setImportResult({
          success: true,
          message: `✅ Import erfolgreich!`,
          details: result.details
        });
      } else {
        setImportResult({
          success: false,
          message: result.message,
          details: result.details
        });
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: `❌ Import fehlgeschlagen: ${error.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const mergeImportData = (importData: any[], existingSubjects: Subject[]) => {
    const details: string[] = [];
    let newSubjects = [...existingSubjects];
    let quizzesAdded = 0;
    let questionsAdded = 0;

    try {
      for (const item of importData) {
        // Validate required fields
        if (!item.subject || !item.class || !item.topic || !item.quizzes) {
          throw new Error('Fehlende erforderliche Felder (subject, class, topic, quizzes)');
        }

        // Find or create subject
        let subject = newSubjects.find(s => s.name.toLowerCase() === item.subject.toLowerCase());
        if (!subject) {
          subject = {
            id: Date.now().toString() + Math.random(),
            name: item.subject,
            order: newSubjects.length + 1,
            classes: []
          };
          newSubjects.push(subject);
          details.push(`➕ Neues Fach erstellt: ${item.subject}`);
        }

        // Find or create class
        let classItem = subject.classes.find(c => c.name.toLowerCase() === item.class.toLowerCase());
        if (!classItem) {
          classItem = {
            id: `${subject.id}-${Date.now()}`,
            name: item.class,
            level: subject.classes.length + 1,
            topics: []
          };
          subject.classes.push(classItem);
          details.push(`➕ Neue Klasse erstellt: ${item.class}`);
        }

        // Find or create topic
        let topic = classItem.topics.find(t => t.name.toLowerCase() === item.topic.toLowerCase());
        if (!topic) {
          topic = {
            id: `${classItem.id}-${Date.now()}`,
            name: item.topic,
            quizzes: []
          };
          classItem.topics.push(topic);
          details.push(`➕ Neues Thema erstellt: ${item.topic}`);
        }

        // Add quizzes
        for (const quiz of item.quizzes) {
          if (!quiz.title || !quiz.questions || quiz.questions.length === 0) {
            throw new Error(`Quiz "${quiz.title || 'unbenannt'}" hat keine gültigen Fragen`);
          }

          // Check for duplicate quiz
          const existingQuiz = topic.quizzes.find(q => q.title.toLowerCase() === quiz.title.toLowerCase());
          if (existingQuiz) {
            details.push(`⚠️ Quiz "${quiz.title}" existiert bereits und wurde übersprungen`);
            continue;
          }

          // Validate questions
          for (const q of quiz.questions) {
            if (!q.question || !q.answers || q.answers.length !== 3) {
              throw new Error(`Ungültige Frage in Quiz "${quiz.title}": Jede Frage braucht Text und genau 3 Antworten`);
            }
            if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 2) {
              throw new Error(`Ungültiger correctAnswerIndex in Quiz "${quiz.title}": Muss 0, 1 oder 2 sein`);
            }
          }

          const newQuiz = {
            id: `${topic.id}-${Date.now()}-${Math.random()}`,
            title: quiz.title,
            questions: quiz.questions
          };
          topic.quizzes.push(newQuiz);
          quizzesAdded++;
          questionsAdded += quiz.questions.length;
          details.push(`✅ Quiz hinzugefügt: "${quiz.title}" (${quiz.questions.length} Fragen)`);
        }
      }

      return {
        success: true,
        subjects: newSubjects,
        message: `Import erfolgreich!`,
        details: [
          `📊 ${quizzesAdded} Quiz(ze) mit ${questionsAdded} Fragen importiert`,
          ...details
        ]
      };
    } catch (error: any) {
      return {
        success: false,
        subjects: existingSubjects,
        message: error.message,
        details: details
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Quiz Import</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Anleitung</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
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
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              JSON Vorlage
            </button>
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              CSV Vorlage
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                Datei hier ablegen oder klicken
              </p>
              <p className="text-sm text-gray-500">
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
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Verarbeite Daten...</span>
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
            <summary className="font-semibold text-gray-900 cursor-pointer mb-2">
              Format-Beispiele anzeigen
            </summary>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">JSON Format:</h5>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
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
                <h5 className="font-medium text-gray-700 mb-2">CSV Format:</h5>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`Subject,Class,Topic,Quiz,Question,Answer1,Answer2,Answer3,CorrectAnswer
Mathematik,Klasse 3,Multiplikation,Einmaleins,Was ist 3 × 4?,12,10,15,1
Mathematik,Klasse 3,Multiplikation,Einmaleins,Was ist 5 × 2?,10,12,8,1`}
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Hinweis:</strong> CorrectAnswer ist 1-basiert (1, 2 oder 3)
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}