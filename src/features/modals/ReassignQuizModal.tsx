import { useState, useEffect } from "react";
import { MoveHorizontal, X, Loader2, CheckCircle } from "lucide-react";
import { reassignQuiz, loadAllQuizDocuments } from "../../utils/quiz-collection";
import type { QuizDocument } from "../../types/quizTypes";

interface ReassignQuizModalProps {
  quiz: QuizDocument;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReassignQuizModal({
  quiz,
  onClose,
  onSuccess,
}: ReassignQuizModalProps) {
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  
  const [selectedSubject, setSelectedSubject] = useState(quiz.subjectName || "");
  const [selectedClass, setSelectedClass] = useState(quiz.className || "");
  const [selectedTopic, setSelectedTopic] = useState(quiz.topicName || "");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load all unique subjects, classes, topics
    loadAllQuizDocuments().then(allQuizzes => {
      const subjectsMap = new Map<string, string>();
      const classesMap = new Map<string, string>();
      const topicsMap = new Map<string, string>();

      allQuizzes.forEach(q => {
        if (q.subjectId && q.subjectName) subjectsMap.set(q.subjectName, q.subjectName);
        if (q.classId && q.className) classesMap.set(q.className, q.className);
        if (q.topicId && q.topicName) topicsMap.set(q.topicName, q.topicName);
      });

      setSubjects(Array.from(subjectsMap.entries()).map(([name]) => ({ id: name, name })).sort((a, b) => a.name.localeCompare(b.name)));
      setClasses(Array.from(classesMap.entries()).map(([name]) => ({ id: name, name })).sort((a, b) => a.name.localeCompare(b.name)));
      setTopics(Array.from(topicsMap.entries()).map(([name]) => ({ id: name, name })).sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  const handleReassign = async () => {
    setIsProcessing(true);

    try {
      const updates: any = {};

      if (selectedSubject !== quiz.subjectName) {
        updates.newSubject = { name: selectedSubject };
      }
      if (selectedClass !== quiz.className) {
        updates.newClass = { name: selectedClass };
      }
      if (selectedTopic !== quiz.topicName) {
        updates.newTopic = { name: selectedTopic };
      }

      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      const result = await reassignQuiz(
        quiz.id,
        updates.newSubject,
        updates.newClass,
        updates.newTopic
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Reassign error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasChanges = 
    selectedSubject !== (quiz.subjectName || "") ||
    selectedClass !== (quiz.className || "") ||
    selectedTopic !== (quiz.topicName || "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MoveHorizontal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz neu zuordnen</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            aria-label="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Quiz:</strong> {quiz.title}
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fach
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Kein Fach</option>
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Klasse
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Keine Klasse</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thema
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Kein Thema</option>
              {topics.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200 font-medium">Erfolgreich zugeordnet!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleReassign}
            disabled={isProcessing || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wird zugeordnet...
              </>
            ) : (
              <>
                <MoveHorizontal className="w-4 h-4" />
                Zuordnen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
