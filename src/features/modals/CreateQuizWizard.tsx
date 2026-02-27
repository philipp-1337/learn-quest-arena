import { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Check,
  AlertTriangle,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { saveQuizDocument } from "@utils/quiz-collection";
import type { QuizDocument } from "quizTypes";
import { toast } from "sonner";
import { CustomToast } from "@shared/CustomToast";

interface CreateQuizWizardProps {
  existingSubjects: { id: string; name: string }[];
  existingClasses: { id: string; name: string }[];
  existingTopics: { id: string; name: string }[];
  onClose: () => void;
  onQuizCreated: () => void;
  onEditQuiz?: (quizId: string) => void;
}

type WizardStep = "subject" | "class" | "topic" | "details";

interface QuizFormData {
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  topicId: string;
  topicName: string;
  title: string;
  url: string;
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
  onEditQuiz,
}: CreateQuizWizardProps) {
  const [step, setStep] = useState<WizardStep>("subject");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    subjectId: "",
    subjectName: "",
    classId: "",
    className: "",
    topicId: "",
    topicName: "",
    title: "",
    url: "",
    isNewSubject: false,
    isNewClass: false,
    isNewTopic: false,
  });

  // Merkt, ob das URL-Feld manuell verändert wurde
  const [urlManuallyChanged, setUrlManuallyChanged] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);

  const steps: WizardStep[] = ["subject", "class", "topic", "details"];
  const currentStepIndex = steps.indexOf(step);

  const stepTitles: Record<WizardStep, string> = {
    subject: "Fach wählen",
    class: "Klasse wählen",
    topic: "Thema wählen",
    details: "Quiz-Details",
  };

  const canProceed = (): boolean => {
    switch (step) {
      case "subject":
        return formData.subjectName.trim().length > 0;
      case "class":
        return formData.className.trim().length > 0;
      case "topic":
        return formData.topicName.trim().length > 0;
      case "details":
        return (
          formData.title.trim().length > 0 &&
          formData.url.trim().length > 0 &&
          /^[a-z0-9-]+$/.test(formData.url)
        );
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

  const handleSubjectSelect = (
    subject: { id: string; name: string } | null,
    newName?: string,
  ) => {
    if (subject) {
      setFormData((prev) => ({
        ...prev,
        subjectId: subject.id,
        subjectName: subject.name,
        isNewSubject: false,
      }));
    } else if (newName) {
      setFormData((prev) => ({
        ...prev,
        subjectId: `subject-${Date.now()}`,
        subjectName: newName,
        isNewSubject: true,
      }));
    }
  };

  const handleClassSelect = (
    classItem: { id: string; name: string } | null,
    newName?: string,
  ) => {
    if (classItem) {
      setFormData((prev) => ({
        ...prev,
        classId: classItem.id,
        className: classItem.name,
        isNewClass: false,
      }));
    } else if (newName) {
      setFormData((prev) => ({
        ...prev,
        classId: `${formData.subjectId}-${Date.now()}`,
        className: newName,
        isNewClass: true,
      }));
    }
  };

  const handleTopicSelect = (
    topic: { id: string; name: string } | null,
    newName?: string,
  ) => {
    if (topic) {
      setFormData((prev) => ({
        ...prev,
        topicId: topic.id,
        topicName: topic.name,
        isNewTopic: false,
      }));
    } else if (newName) {
      setFormData((prev) => ({
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
      // Prüfe, ob die Kombination aus subjectName, className, topicName und url bereits existiert
      const { getFirestore, collection, query, where, getDocs } =
        await import("firebase/firestore");
      const db = getFirestore();
      const quizzesRef = collection(db, "quizzes");
      const q = query(
        quizzesRef,
        where("url", "==", formData.url.trim()),
        where("subjectName", "==", formData.subjectName.trim()),
        where("className", "==", formData.className.trim()),
        where("topicName", "==", formData.topicName.trim()),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast.custom(() => (
          <CustomToast
            message="Diese URL ist in dieser Kombination bereits vergeben. Bitte wähle eine andere."
            type="error"
          />
        ));
        setIsSubmitting(false);
        return;
      }

      const now = Date.now();
      const quizId = crypto.randomUUID();
      // shortTitle ist optional, kann leer sein
      const quizDoc: QuizDocument = {
        id: quizId,
        uuid: quizId,
        title: formData.title.trim(),
        shortTitle:
          formData.title.trim().length > 0
            ? formData.title.trim().substring(0, 20)
            : undefined,
        url: formData.url.trim(),
        questions: [],
        hidden: true, // New quizzes start hidden
        isFlashCardQuiz: false,
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
          <CustomToast
            message="Quiz erstellt! Füge jetzt Fragen hinzu."
            type="success"
          />
        ));
        setCreatedQuizId(quizId);
        if (onQuizCreated) onQuizCreated(); // Nur die Liste aktualisieren, nicht schließen
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Neues Quiz erstellen
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Schritt {currentStepIndex + 1} von {steps.length}:{" "}
              {stepTitles[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
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
                  index <= currentStepIndex
                    ? "bg-indigo-600 dark:bg-indigo-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {createdQuizId ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Quiz wurde erfolgreich erstellt!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Du kannst jetzt direkt Fragen hinzufügen und weitere Details
                  bearbeiten.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                  onClick={() => onEditQuiz && onEditQuiz(createdQuizId)}
                >
                  Quiz bearbeiten
                </button>
                <button
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={onClose}
                >
                  Schließen
                </button>
              </div>
            </div>
          ) : (
            <>
              {step === "subject" && (
                <SelectOrCreateStep
                  label="Fach"
                  options={existingSubjects}
                  selectedId={formData.subjectId}
                  newValue={formData.isNewSubject ? formData.subjectName : ""}
                  onSelect={handleSubjectSelect}
                  placeholder="Neues Fach eingeben..."
                />
              )}

              {step === "class" && (
                <SelectOrCreateStep
                  label="Klasse"
                  options={existingClasses}
                  selectedId={formData.classId}
                  newValue={formData.isNewClass ? formData.className : ""}
                  onSelect={handleClassSelect}
                  placeholder="Neue Klasse eingeben..."
                />
              )}

              {step === "topic" && (
                <SelectOrCreateStep
                  label="Thema"
                  options={existingTopics}
                  selectedId={formData.topicId}
                  newValue={formData.isNewTopic ? formData.topicName : ""}
                  onSelect={handleTopicSelect}
                  placeholder="Neues Thema eingeben..."
                />
              )}

              {step === "details" && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-gray-700 text-sm">
                      Zusammenfassung
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                        {formData.subjectName}
                        {formData.isNewSubject && (
                          <Plus className="w-3 h-3 ml-1" />
                        )}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                        {formData.className}
                        {formData.isNewClass && (
                          <Plus className="w-3 h-3 ml-1" />
                        )}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-purple-100 text-purple-800">
                        {formData.topicName}
                        {formData.isNewTopic && (
                          <Plus className="w-3 h-3 ml-1" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quiz title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quiz-Titel
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setFormData((prev) => {
                          // Nur synchronisieren, wenn URL nicht manuell geändert wurde
                          if (!urlManuallyChanged) {
                            const slug = newTitle
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, "");
                            return { ...prev, title: newTitle, url: slug };
                          }
                          return { ...prev, title: newTitle };
                        });
                      }}
                      placeholder="z.B. Grundlagen der Addition"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                  </div>
                  {/* Quiz URL */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quiz-URL
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        (einmalig, nur Kleinbuchstaben, Zahlen und Bindestriche)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => {
                        setUrlManuallyChanged(true);
                        const raw = e.target.value;
                        // Nur basic slugify, OHNE Trimming
                        const slug = raw
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-"); // Bindestriche erlaubt, keine Mehrfach-Bindestriche
                        setFormData((prev) => ({ ...prev, url: slug }));
                      }}
                      onBlur={(e) => {
                        // Trimming nur beim Verlassen des Feldes
                        const cleaned = e.target.value
                          .replace(/^-+|-+$/g, "") // Führende/nachfolgende Bindestriche entfernen
                          .replace(/-+/g, "-"); // Mehrfach-Bindestriche zusammenfassen
                        setFormData((prev) => ({ ...prev, url: cleaned }));
                      }}
                      placeholder="z.B. grundlagen-der-addition"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      maxLength={40}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Die URL kann nach dem Erstellen nicht mehr geändert werden
                      und muss eindeutig sein.
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Das Quiz wird zunächst als{" "}
                    <span className="font-medium">versteckt</span> erstellt.
                    Nach dem Hinzufügen von Fragen kannst du es sichtbar machen.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!createdQuizId && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={currentStepIndex === 0 ? onClose : goBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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

            {step === "details" ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Weiter
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to normalize strings for comparison
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/^(der|die|das)/, ""); // Remove common German articles at the start
}

// Helper function to find similar existing options
function findSimilarOption(
  inputValue: string,
  options: { id: string; name: string }[],
): {
  exact: { id: string; name: string } | null;
  similar: { id: string; name: string } | null;
} {
  const trimmedInput = inputValue.trim();
  if (trimmedInput.length === 0) {
    return { exact: null, similar: null };
  }

  const normalizedInput = normalizeForComparison(trimmedInput);

  // Check for exact match (case-insensitive)
  const exactMatch = options.find(
    (option) => option.name.toLowerCase() === trimmedInput.toLowerCase(),
  );

  if (exactMatch) {
    return { exact: exactMatch, similar: null };
  }

  // Check for similar match (substring or contains)
  const similarMatch = options.find((option) => {
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
  onSelect: (
    item: { id: string; name: string } | null,
    newName?: string,
  ) => void;
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
  const [similarOption, setSimilarOption] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedId === option.id && !showNewInput
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              oder
            </span>
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
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-yellow-800">
                    Ähnlicher Eintrag gefunden
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Es existiert bereits:{" "}
                    <span className="font-semibold">{similarOption.name}</span>
                  </p>
                  <button
                    onClick={handleUseSimilar}
                    className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline cursor-pointer"
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
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Neues {label} erstellen
        </button>
      )}
    </div>
  );
}
