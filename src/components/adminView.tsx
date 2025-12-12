import { useEffect, useState } from "react";
import type {
  Subject,
  Class,
  Topic,
  Quiz,
  Answer,
  Question,
} from "../types/quizTypes";
import {
  BookOpen,
  Users,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Play,
  Check,
  X,
  QrCode,
} from "lucide-react";
import { slugify } from "../utils/slugify";
import useFirestore from "../hooks/useFirestore";

// ============================================
// ADMIN VIEW
// ============================================

export default function AdminView({
  subjects: initialSubjects,
  onSubjectsChange,
  onLogout,
}: {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onLogout: () => void;
}) {
  const { saveDocument, fetchCollection } = useFirestore();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<
    "quiz" | "subject" | "topic" | "class"
  >("subject");

  // Sync changes back to parent
  useEffect(() => {
    onSubjectsChange(subjects);
  }, [subjects, onSubjectsChange]);

  const handleAddSubject = () => {
    setModalType("subject");
    setShowAddModal(true);
  };

  const handleSaveSubject = async (name: string) => {
    const newSubject = {
      id: Date.now().toString(),
      name,
      order: subjects.length + 1,
      classes: [],
    };
    setSubjects([...subjects, newSubject]);
    await saveDocument(`subjects/${newSubject.id}`, newSubject);
    setShowAddModal(false);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s: { id: any }) => s.id !== id));
  };

  const handleLoadSubjects = async () => {
    const subjects = await fetchCollection("subjects");
    const formattedSubjects = subjects.map((subject: any) => ({
      id: subject.id,
      name: subject.name || "",
      order: subject.order || 0,
      classes: subject.classes || [],
    }));
    onSubjectsChange(formattedSubjects);
  };

  useEffect(() => {
    handleLoadSubjects();
  }, []);

  const totalTopics = subjects.reduce(
    (acc: number, s: Subject) =>
      acc + s.classes.reduce((a: number, c: Class) => a + c.topics.length, 0),
    0
  );

  const totalQuizzes = subjects.reduce(
    (acc: number, s: Subject) =>
      acc +
      s.classes.reduce(
        (a: number, c: Class) =>
          a + c.topics.reduce((b: number, t: Topic) => b + t.quizzes.length, 0),
        0
      ),
    0
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <BookOpen className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{subjects.length}</div>
            <div className="text-blue-100">Fächer</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <FolderOpen className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{totalTopics}</div>
            <div className="text-purple-100">Themen</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <Play className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{totalQuizzes}</div>
            <div className="text-green-100">Quizze</div>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Inhalte verwalten
            </h2>
            <button
              onClick={handleAddSubject}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Fach hinzufügen
            </button>
          </div>

          <div className="space-y-4">
            {subjects.map((subject: Subject) => (
              <SubjectManager
                key={subject.id}
                subject={subject}
                onDelete={() => handleDeleteSubject(subject.id)}
                onUpdate={(updated: Subject) => {
                  setSubjects(
                    subjects.map((s: Subject) =>
                      s.id === updated.id ? updated : s
                    )
                  );
                }}
              />
            ))}
          </div>
        </div>

        {/* QR Code Info */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <QrCode className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Direktlink zu Quizzen
              </h3>
              <p className="text-gray-700 mb-3">
                Klicke auf das QR-Code-Symbol neben einem Quiz, um einen
                Direktlink zu kopieren. Dieser Link führt direkt zum Quiz.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Format:{" "}
                <code className="bg-white px-2 py-1 rounded text-xs">
                  #/quiz/[subject]/[class]/[topic]/[quiz]
                </code>
              </p>
              <p className="text-sm text-gray-600">
                💡 Tipp: Erstelle QR-Codes aus diesen Links mit Tools wie{" "}
                <a
                  href="https://kraft-qr.web.app/"
                  className="text-indigo-600 hover:underline"
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
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          type={modalType}
          onSave={(name: any) => {
            if (modalType === "subject") {
              handleSaveSubject(name);
            }
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Define the titles object
const titles = {
  subject: "Neues Fach",
  class: "Neue Klasse",
  topic: "Neues Thema",
  quiz: "Neues Quiz",
};

function AddModal({
  type,
  onSave,
  onClose,
}: {
  type: keyof typeof titles;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
    }
  };

  const titles = {
    subject: "Neues Fach",
    class: "Neue Klasse",
    topic: "Neues Thema",
    quiz: "Neues Quiz",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {titles[type]} hinzufügen
        </h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Name eingeben..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Speichern
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteConfirmModal({
  itemName,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Wirklich löschen?
        </h3>

        <p className="text-gray-700 mb-6">
          Möchtest du "{itemName}" wirklich löschen? Diese Aktion kann nicht
          rückgängig gemacht werden.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Ja, löschen
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

function SubjectManager({
  subject,
  onDelete,
  onUpdate,
}: {
  subject: Subject;
  onDelete: () => void;
  onUpdate: (updatedSubject: Subject) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddClass = (name: string) => {
    const newClass = {
      id: `${subject.id}-${Date.now()}`,
      name,
      level: subject.classes.length + 1,
      topics: [],
    };
    onUpdate({ ...subject, classes: [...subject.classes, newClass] });
    setShowAddModal(false);
  };

  const handleDeleteClass = (classId: string) => {
    onUpdate({
      ...subject,
      classes: subject.classes.filter((c: { id: any }) => c.id !== classId),
    });
  };

  const handleUpdateClass = (updatedClass: Class) => {
    onUpdate({
      ...subject,
      classes: subject.classes.map((c: Class) =>
        c.id === updatedClass.id ? updatedClass : c
      ),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? "▼" : "▶"}
            </button>
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-gray-900">{subject.name}</span>
            <span className="text-sm text-gray-500">
              ({subject.classes.length} Klassen)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-4 space-y-3">
            {subject.classes.length === 0 ? (
              <p className="text-gray-500 text-sm">Keine Klassen vorhanden</p>
            ) : (
              subject.classes.map((cls: Class) => (
                <ClassManager
                  key={cls.id}
                  classItem={cls}
                  onDelete={() => handleDeleteClass(cls.id)}
                  onUpdate={handleUpdateClass}
                  subject={subject}  // ← Vollständiges Objekt statt nur subjectId
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          type="class"
          onSave={handleAddClass}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={subject.name}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

function ClassManager({
  classItem,
  onDelete,
  onUpdate,
  subject,
}: {
  classItem: Class;
  onDelete: () => void;
  onUpdate: (updatedClass: Class) => void;
  subject: Subject;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddTopic = (name: string) => {
    const newTopic = {
      id: `${classItem.id}-${Date.now()}`,
      name,
      quizzes: [],
    };
    onUpdate({ ...classItem, topics: [...classItem.topics, newTopic] });
    setShowAddModal(false);
  };

  const handleDeleteTopic = (topicId: string) => {
    onUpdate({
      ...classItem,
      topics: classItem.topics.filter((t: { id: any }) => t.id !== topicId),
    });
  };

  const handleUpdateTopic = (updatedTopic: Topic) => {
    onUpdate({
      ...classItem,
      topics: classItem.topics.map((t: Topic) =>
        t.id === updatedTopic.id ? { ...t, ...updatedTopic } : t
      ),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? "▼" : "▶"}
            </button>
            <Users className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-900">{classItem.name}</span>
            <span className="text-xs text-gray-500">
              ({classItem.topics.length} Themen)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-3 space-y-2">
            {classItem.topics.length === 0 ? (
              <p className="text-gray-500 text-xs">Keine Themen vorhanden</p>
            ) : (
              classItem.topics.map((topic: Topic) => (
                <TopicManager
                  key={topic.id}
                  topic={topic}
                  onDelete={() => handleDeleteTopic(topic.id)}
                  onUpdate={handleUpdateTopic}
                  subject={subject} // subjectId weitergeben
                  classItem={classItem} // classId weitergeben
                  topicId={topic.id} // topicId weitergeben
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          type="topic"
          onSave={handleAddTopic}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={classItem.name}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

function TopicManager({
  topic,
  onDelete,
  onUpdate,
  subject,
  classItem,
}: {
  topic: Topic;
  onDelete: () => void;
  onUpdate: (updatedTopic: Topic) => void;
  subject: Subject;
  classItem: Class;
  topicId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddQuiz = (title: string) => {
    const newQuiz = {
      id: `${topic.id}-${Date.now()}`,
      title,
      questions: [],
    };
    onUpdate({ ...topic, quizzes: [...topic.quizzes, newQuiz] });
    setShowAddModal(false);
  };

  const handleDeleteQuiz = (quizId: string) => {
    onUpdate({
      ...topic,
      quizzes: topic.quizzes.filter((q: { id: any }) => q.id !== quizId),
    });
  };

  const handleUpdateQuiz = (updatedQuiz: Quiz) => {
    onUpdate({
      ...topic,
      quizzes: topic.quizzes.map((q: Quiz) =>
        q.id === updatedQuiz.id ? updatedQuiz : q
      ),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded bg-gray-50">
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? "▼" : "▶"}
            </button>
            <FolderOpen className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              {topic.name}
            </span>
            <span className="text-xs text-gray-500">
              ({topic.quizzes.length} Quizze)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-2 space-y-1">
            {topic.quizzes.length === 0 ? (
              <p className="text-gray-500 text-xs">Keine Quizze vorhanden</p>
            ) : (
              topic.quizzes.map((quiz: Quiz) => (
                <QuizManager
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={() => handleDeleteQuiz(quiz.id)}
                  onUpdate={handleUpdateQuiz}
                  subject={subject} // Füge subjectId hinzu
                  classItem={classItem} // Füge classId hinzu
                  topic={topic} // topic bleibt erhalten
                />
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddModal
          type="quiz"
          onSave={handleAddQuiz}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={topic.name}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

function QuizEditorModal({
  quiz,
  onSave,
  onClose,
}: {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
}) {
  const [editedQuiz, setEditedQuiz] = useState({
    ...quiz,
    questions: quiz.questions || [],
  });
  const [currentQuestion, setCurrentQuestion] = useState<QuestionEditor | null>(
    null
  );

  type QuestionEditor = Question & { isEditing?: boolean; editIndex?: number };

  const handleAddQuestion = () => {
    setCurrentQuestion({
      question: "",
      answerType: "text",
      answers: [
        { type: "text", content: "" },
        { type: "text", content: "" },
        { type: "text", content: "" },
      ],
      correctAnswerIndex: 0,
    });
  };

  const handleAnswerTypeChange = (type: string) => {
    if (!currentQuestion) return;
    setCurrentQuestion({
      ...currentQuestion,
      answerType: type,
      answers: currentQuestion.answers.map((a) => ({
        type: type,
        content: type === "text" ? a.content || "" : "",
        alt: type === "image" ? "" : undefined,
      })),
    });
  };

  const handleImageUpload = (index: number, file: Blob) => {
    // Mock: Create preview URL
    // In production: Upload to Firebase Storage
    /*
    Firebase Storage Implementation:
    
    const uploadImage = async (file, quizId, questionIndex, answerIndex) => {
      const storage = getStorage();
      const storageRef = ref(storage, `quizzes/${quizId}/q${questionIndex}/a${answerIndex}/${file.name}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    };
    
    const url = await uploadImage(file, quiz.id, currentQuestion.editIndex || editedQuiz.questions.length, index);
    */

    // Mock: Use local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!currentQuestion) return;
      const newAnswers = [...currentQuestion.answers];
      newAnswers[index] = {
        type: "image",
        content: reader.result as string, // In production: Firebase Storage URL
        alt: newAnswers[index].alt || (file as File).name,
      };
      setCurrentQuestion({
        ...currentQuestion,
        answers: newAnswers,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion || !currentQuestion.question.trim()) {
      alert("Bitte gib eine Frage ein!");
      return;
    }

    if (currentQuestion.answerType === "text") {
      if (currentQuestion.answers.some((a) => !a.content.trim())) {
        alert("Bitte fülle alle Antworten aus!");
        return;
      }
    } else {
      if (currentQuestion.answers.some((a) => !a.content)) {
        alert("Bitte lade alle Bilder hoch!");
        return;
      }
    }

    const newQuestions =
      currentQuestion.isEditing && typeof currentQuestion.editIndex === "number"
        ? editedQuiz.questions.map((q, i) =>
            i === currentQuestion.editIndex ? currentQuestion : q
          )
        : [...editedQuiz.questions, currentQuestion];

    setEditedQuiz({ ...editedQuiz, questions: newQuestions });
    setCurrentQuestion(null);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion({
      ...editedQuiz.questions[index],
      isEditing: true,
      editIndex: index,
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setEditedQuiz({
      ...editedQuiz,
      questions: editedQuiz.questions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h3 className="text-2xl font-bold text-gray-900">
            Quiz bearbeiten: {quiz.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Question List */}
        {!currentQuestion && (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-900">
                Fragen ({editedQuiz.questions.length})
              </h4>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Frage hinzufügen
              </button>
            </div>

            {editedQuiz.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Noch keine Fragen vorhanden. Klicke auf "Frage hinzufügen" um zu
                starten.
              </div>
            ) : (
              <div className="space-y-3">
                {editedQuiz.questions.map((q: Question, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {index + 1}. {q.question}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {q.answerType === "text" ? "📝 Text" : "🖼️ Bilder"}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {q.answers.map((answer: Answer, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              {i === q.correctAnswerIndex ? (
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              {answer.type === "text" ? (
                                <span
                                  className={
                                    i === q.correctAnswerIndex
                                      ? "text-green-700 font-medium"
                                      : "text-gray-600"
                                  }
                                >
                                  {answer.content}
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={answer.content}
                                    alt={answer.alt}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <span
                                    className={
                                      i === q.correctAnswerIndex
                                        ? "text-green-700 font-medium"
                                        : "text-gray-600"
                                    }
                                  >
                                    {answer.alt || "Bild"}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Question Editor */}
        {currentQuestion && (
          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              {currentQuestion.isEditing ? "Frage bearbeiten" : "Neue Frage"}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frage
              </label>
              <input
                type="text"
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Was ist 2 + 2?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antwort-Typ
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswerTypeChange("text")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentQuestion.answerType === "text"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  📝 Text
                </button>
                <button
                  onClick={() => handleAnswerTypeChange("image")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentQuestion.answerType === "image"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🖼️ Bilder
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antworten (3 Stück)
              </label>

              {currentQuestion.answerType === "text" ? (
                <div className="space-y-2">
                  {currentQuestion.answers.map((answer: Answer, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={answer.content}
                        onChange={(e) => {
                          const newAnswers = [...currentQuestion.answers];
                          newAnswers[i] = {
                            type: "text",
                            content: e.target.value,
                          };
                          setCurrentQuestion({
                            ...currentQuestion,
                            answers: newAnswers,
                          });
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Antwort ${i + 1}`}
                      />
                      <button
                        onClick={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswerIndex: i,
                          })
                        }
                        className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          currentQuestion.correctAnswerIndex === i
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {currentQuestion.correctAnswerIndex === i
                          ? "✓ Richtig"
                          : "Als richtig markieren"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.answers.map((answer: Answer, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-300 rounded-lg p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Bild {i + 1}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageUpload(i, e.target.files[0]);
                              }
                            }}
                            className="w-full text-sm"
                          />
                          <input
                            type="text"
                            value={answer.alt || ""}
                            onChange={(e) => {
                              const newAnswers = [...currentQuestion.answers];
                              newAnswers[i] = {
                                ...answer,
                                alt: e.target.value,
                              };
                              setCurrentQuestion({
                                ...currentQuestion,
                                answers: newAnswers,
                              });
                            }}
                            className="w-full px-3 py-2 mt-2 border border-gray-300 rounded text-sm"
                            placeholder="Beschreibung (optional)"
                          />
                          {answer.content && (
                            <img
                              src={answer.content}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded mt-2"
                            />
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              correctAnswerIndex: i,
                            })
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap h-fit ${
                            currentQuestion.correctAnswerIndex === i
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {currentQuestion.correctAnswerIndex === i
                            ? "✓ Richtig"
                            : "Richtig"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>💡 Hinweis:</strong> In der Produktionsversion werden
              Bilder zu Firebase Storage hochgeladen. Aktuell werden sie nur
              lokal als Preview gespeichert.
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveQuestion}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Frage speichern
              </button>
              <button
                onClick={() => setCurrentQuestion(null)}
                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Save Quiz Button */}
        {!currentQuestion && (
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              onClick={() => onSave(editedQuiz)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Quiz speichern
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface QuizManagerProps {
  quiz: Quiz;
  onDelete: () => void;
  onUpdate: (updatedQuiz: Quiz) => void;
}

function QuizManager({
  quiz,
  onDelete,
  onUpdate,
  subject,
  classItem,
  topic,
}: QuizManagerProps & { subject: Subject; classItem: Class; topic: Topic }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyQuizLink = (
    quiz: Quiz,
    subject: Subject,
    classItem: any,
    topic: any,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    const subjectSlug = slugify(subject.name);
    const classSlug = slugify(classItem.name);
    const topicSlug = slugify(topic.name);
    const quizSlug = slugify(quiz.title);

    const url = `${window.location.origin}/quiz/${subjectSlug}/${classSlug}/${topicSlug}/${quizSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(quiz.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <>
      <div className="bg-white p-2 rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-600" />
          <span className="text-sm">{quiz.title}</span>
          <span className="text-xs text-gray-500">
            ({quiz.questions.length} Fragen)
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Fragen bearbeiten"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => copyQuizLink(quiz, subject, classItem, topic, e)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            {copiedId === quiz.id ? (
              <Check className="w-3 h-3" />
            ) : (
              <QrCode className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showEditModal && (
        <QuizEditorModal
          quiz={quiz}
          onSave={(updatedQuiz: any) => {
            onUpdate(updatedQuiz);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          itemName={quiz.title}
          onConfirm={() => {
            onDelete();
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
