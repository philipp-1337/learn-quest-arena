import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Plus, Check } from "lucide-react";
import { getAuth } from "firebase/auth";
import { saveQuizDocument } from "../../utils/quizzesCollection";
import type { QuizDocument } from "../../types/quizTypes";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";

interface CreateQuizWizardProps {
  existingSubjects: { id: string; name: string }[];
  existingClasses: { id: string; name: string }[];
  existingTopics: { id: string; name: string }[];
  onClose: () => void;
  onQuizCreated: () => void;
}

type WizardStep = 'subject' | 'class' | 'topic' | 'details';

interface QuizFormData {
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  topicId: string;
  topicName: string;
  title: string;
  isNewSubject: boolean;
  isNewClass: boolean;
  isNewTopic: boolean;
}

export default function CreateQuizWizard({
  existingSubjects,
  existingClasses,
  existingTopics,
  onClose,
  onQuizCreated,
}: CreateQuizWizardProps) {
  const [step, setStep] = useState<WizardStep>('subject');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    subjectId: "",
    subjectName: "",
    classId: "",
    className: "",
    topicId: "",
    topicName: "",
    title: "",
    isNewSubject: false,
    isNewClass: false,
    isNewTopic: false,
  });

  const steps: WizardStep[] = ['subject', 'class', 'topic', 'details'];
  const currentStepIndex = steps.indexOf(step);

  const stepTitles: Record<WizardStep, string> = {
    subject: 'Fach wählen',
    class: 'Klasse wählen',
    topic: 'Thema wählen',
    details: 'Quiz-Details',
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'subject':
        return formData.subjectName.trim().length > 0;
      case 'class':
        return formData.className.trim().length > 0;
      case 'topic':
        return formData.topicName.trim().length > 0;
      case 'details':
        return formData.title.trim().length > 0;
      default:
        return false;
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleSubjectSelect = (subject: { id: string; name: string } | null, newName?: string) => {
    if (subject) {
      setFormData(prev => ({
        ...prev,
        subjectId: subject.id,
        subjectName: subject.name,
        isNewSubject: false,
      }));
    } else if (newName) {
      setFormData(prev => ({
        ...prev,
        subjectId: `subject-${Date.now()}`,
        subjectName: newName,
        isNewSubject: true,
      }));
    }
  };

  const handleClassSelect = (classItem: { id: string; name: string } | null, newName?: string) => {
    if (classItem) {
      setFormData(prev => ({
        ...prev,
        classId: classItem.id,
        className: classItem.name,
        isNewClass: false,
      }));
    } else if (newName) {
      setFormData(prev => ({
        ...prev,
        classId: `${formData.subjectId}-${Date.now()}`,
        className: newName,
        isNewClass: true,
      }));
    }
  };

  const handleTopicSelect = (topic: { id: string; name: string } | null, newName?: string) => {
    if (topic) {
      setFormData(prev => ({
        ...prev,
        topicId: topic.id,
        topicName: topic.name,
        isNewTopic: false,
      }));
    } else if (newName) {
      setFormData(prev => ({
        ...prev,
        topicId: `${formData.classId}-${Date.now()}`,
        topicName: newName,
        isNewTopic: true,
      }));
    }
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.custom(() => (
        <CustomToast message="Nicht eingeloggt" type="error" />
      ));
      return;
    }

    setIsSubmitting(true);

    try {
      const now = Date.now();
      const quizId = crypto.randomUUID();

      const quizDoc: QuizDocument = {
        id: quizId,
        uuid: quizId,
        title: formData.title.trim(),
        shortTitle: formData.title.trim().substring(0, 20),
        questions: [],
        hidden: true, // New quizzes start hidden
        createdAt: now,
        updatedAt: now,
        authorId: user.uid,
        authorEmail: user.email || undefined,
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        classId: formData.classId,
        className: formData.className,
        topicId: formData.topicId,
        topicName: formData.topicName,
      };

      const result = await saveQuizDocument(quizDoc);

      if (result.success) {
        toast.custom(() => (
          <CustomToast message="Quiz erstellt! Füge jetzt Fragen hinzu." type="success" />
        ));
        onQuizCreated();
      } else {
        toast.custom(() => (
          <CustomToast message={`Fehler: ${result.error}`} type="error" />
        ));
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Erstellen des Quiz" type="error" />
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Neues Quiz erstellen</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schritt {currentStepIndex + 1} von {steps.length}: {stepTitles[step]}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-1">
            {steps.map((s, index) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  index <= currentStepIndex ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'subject' && (
            <SelectOrCreateStep
              label="Fach"
              options={existingSubjects}
              selectedId={formData.subjectId}
              newValue={formData.isNewSubject ? formData.subjectName : ""}
              onSelect={handleSubjectSelect}
              placeholder="Neues Fach eingeben..."
            />
          )}

          {step === 'class' && (
            <SelectOrCreateStep
              label="Klasse"
              options={existingClasses}
              selectedId={formData.classId}
              newValue={formData.isNewClass ? formData.className : ""}
              onSelect={handleClassSelect}
              placeholder="Neue Klasse eingeben..."
            />
          )}

          {step === 'topic' && (
            <SelectOrCreateStep
              label="Thema"
              options={existingTopics}
              selectedId={formData.topicId}
              newValue={formData.isNewTopic ? formData.topicName : ""}
              onSelect={handleTopicSelect}
              placeholder="Neues Thema eingeben..."
            />
          )}

          {step === 'details' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-700 text-sm">Zusammenfassung</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                    {formData.subjectName}
                    {formData.isNewSubject && <Plus className="w-3 h-3 ml-1" />}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                    {formData.className}
                    {formData.isNewClass && <Plus className="w-3 h-3 ml-1" />}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-purple-100 text-purple-800">
                    {formData.topicName}
                    {formData.isNewTopic && <Plus className="w-3 h-3 ml-1" />}
                  </span>
                </div>
              </div>

              {/* Quiz title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quiz-Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="z.B. Grundlagen der Addition"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Das Quiz wird zunächst als <span className="font-medium">versteckt</span> erstellt. 
                Nach dem Hinzufügen von Fragen kannst du es sichtbar machen.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={currentStepIndex === 0 ? onClose : goBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {currentStepIndex === 0 ? (
              <>Abbrechen</>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Zurück
              </>
            )}
          </button>

          {step === 'details' ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Quiz erstellen
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Weiter
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to normalize strings for comparison
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/^(der|die|das)/, ''); // Remove common German articles at the start
}

// Helper function to find similar existing options
function findSimilarOption(
  inputValue: string,
  options: { id: string; name: string }[]
): { exact: { id: string; name: string } | null; similar: { id: string; name: string } | null } {
  const trimmedInput = inputValue.trim();
  if (trimmedInput.length === 0) {
    return { exact: null, similar: null };
  }

  const normalizedInput = normalizeForComparison(trimmedInput);

  // Check for exact match (case-insensitive)
  const exactMatch = options.find(
    option => option.name.toLowerCase() === trimmedInput.toLowerCase()
  );

  if (exactMatch) {
    return { exact: exactMatch, similar: null };
  }

  // Check for similar match (substring or contains)
  const similarMatch = options.find(option => {
    const normalizedOption = normalizeForComparison(option.name);
    
    // Check if one is contained in the other
    return (
      normalizedInput.includes(normalizedOption) ||
      normalizedOption.includes(normalizedInput)
    );
  });

  return { exact: null, similar: similarMatch || null };
}

// Sub-component for select or create functionality
interface SelectOrCreateStepProps {
  label: string;
  options: { id: string; name: string }[];
  selectedId: string;
  newValue: string;
  onSelect: (item: { id: string; name: string } | null, newName?: string) => void;
  placeholder: string;
}

function SelectOrCreateStep({
  label,
  options,
  selectedId,
  newValue,
  onSelect,
  placeholder,
}: SelectOrCreateStepProps) {
  const [showNewInput, setShowNewInput] = useState(newValue.length > 0);
  const [inputValue, setInputValue] = useState(newValue);
  const [similarOption, setSimilarOption] = useState<{ id: string; name: string } | null>(null);

  const handleOptionClick = (option: { id: string; name: string }) => {
    setShowNewInput(false);
    setInputValue("");
    setSimilarOption(null);
    onSelect(option);
  };

  const handleNewClick = () => {
    setShowNewInput(true);
    setSimilarOption(null);
    onSelect(null, "");
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    const { exact, similar } = findSimilarOption(value, options);
    
    if (exact) {
      // Automatically select the exact match
      setShowNewInput(false);
      setInputValue("");
      setSimilarOption(null);
      onSelect(exact);
      return;
    }
    
    // Show warning for similar match
    setSimilarOption(similar);
    onSelect(null, value);
  };

  const handleUseSimilar = () => {
    if (similarOption) {
      handleOptionClick(similarOption);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        Wähle ein bestehendes {label} aus oder erstelle ein neues.
      </p>

      {/* Existing options */}
      {options.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {options.map(option => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedId === option.id && !showNewInput
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      {options.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">oder</span>
          </div>
        </div>
      )}

      {/* New input */}
      {showNewInput ? (
        <div className="space-y-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-indigo-300 dark:border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            autoFocus
          />
          {similarOption && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-800">
                    Ähnlicher Eintrag gefunden
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Es existiert bereits: <span className="font-semibold">{similarOption.name}</span>
                  </p>
                  <button
                    onClick={handleUseSimilar}
                    className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Stattdessen verwenden
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleNewClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neues {label} erstellen
        </button>
      )}
    </div>
  );
}
