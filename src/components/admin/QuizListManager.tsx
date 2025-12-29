import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, X, Eye, EyeOff, Pencil, Trash2, QrCode, ChevronDown, Edit3, MoreVertical, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";
import type { QuizDocument } from "../../types/quizTypes";
import { loadAllQuizDocuments, deleteQuizDocument, updateQuizDocument } from "../../utils/quizzesCollection";
import QuizEditorModal from "../modals/QuizEditorModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import CreateQuizWizard from "../modals/CreateQuizWizard";
import RenameCategoryModal from "../modals/RenameCategoryModal";
import ReassignQuizModal from "../modals/ReassignQuizModal";
import { slugify } from "../../utils/slugify";

interface QuizListManagerProps {
  onRefetch?: () => Promise<void>;
}

interface FilterState {
  search: string;
  subject: string;
  class: string;
  topic: string;
  showHidden: boolean;
}

export default function QuizListManager({ onRefetch }: QuizListManagerProps) {
  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    subject: "",
    class: "",
    topic: "",
    showHidden: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizDocument | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<QuizDocument | null>(null);
  const [reassignQuiz, setReassignQuiz] = useState<QuizDocument | null>(null);
  const [openMobileMenuId, setOpenMobileMenuId] = useState<string | null>(null);
  const [renameModal, setRenameModal] = useState<{
    type: 'subject' | 'class' | 'topic';
    id: string;
    name: string;
    count: number;
  } | null>(null);

  // Load quizzes from collection
  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const docs = await loadAllQuizDocuments();
      setQuizzes(docs);
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.custom(() => (
        <CustomToast message="Fehler beim Laden der Quizze" type="error" />
      ));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMobileMenuId) {
        const target = event.target as HTMLElement;
        if (!target.closest('.mobile-menu-container')) {
          setOpenMobileMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMobileMenuId]);

  // Extract unique values for filter dropdowns
  // Group by normalized IDs (which are based on names) to avoid duplicates
  const filterOptions = useMemo(() => {
    const subjects = new Map<string, string>();
    const classes = new Map<string, string>();
    const topics = new Map<string, string>();

    quizzes.forEach(q => {
      // Use normalized IDs (subjectId is already normalized after migration)
      // This ensures "Klasse 1" appears only once, even if it was in multiple subjects before
      if (q.subjectId && q.subjectName) subjects.set(q.subjectId, q.subjectName);
      if (q.classId && q.className) classes.set(q.classId, q.className);
      if (q.topicId && q.topicName) topics.set(q.topicId, q.topicName);
    });

    return {
      subjects: Array.from(subjects.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      classes: Array.from(classes.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      topics: Array.from(topics.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [quizzes]);

  // Filter quizzes based on current filters
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          quiz.title.toLowerCase().includes(searchLower) ||
          quiz.subjectName?.toLowerCase().includes(searchLower) ||
          quiz.className?.toLowerCase().includes(searchLower) ||
          quiz.topicName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Subject filter
      if (filters.subject && quiz.subjectId !== filters.subject) return false;

      // Class filter
      if (filters.class && quiz.classId !== filters.class) return false;

      // Topic filter
      if (filters.topic && quiz.topicId !== filters.topic) return false;

      // Hidden filter
      if (!filters.showHidden && quiz.hidden) return false;

      return true;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [quizzes, filters]);

  // Handle quiz actions
  const handleToggleHidden = async (quiz: QuizDocument) => {
    const result = await updateQuizDocument(quiz.id, { hidden: !quiz.hidden });
    if (result.success) {
      setQuizzes(prev => prev.map(q => 
        q.id === quiz.id ? { ...q, hidden: !q.hidden } : q
      ));
      toast.custom(() => (
        <CustomToast 
          message={quiz.hidden ? "Quiz sichtbar" : "Quiz versteckt"} 
          type="success" 
        />
      ));
    }
  };

  const handleDelete = async () => {
    if (!deletingQuiz) return;
    
    const result = await deleteQuizDocument(deletingQuiz.id);
    if (result.success) {
      setQuizzes(prev => prev.filter(q => q.id !== deletingQuiz.id));
      toast.custom(() => (
        <CustomToast message="Quiz gelöscht" type="success" />
      ));
      if (onRefetch) await onRefetch();
    } else {
      toast.custom(() => (
        <CustomToast message="Fehler beim Löschen" type="error" />
      ));
    }
    setDeletingQuiz(null);
  };

  const handleCopyLink = (quiz: QuizDocument) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/quiz/${slugify(quiz.subjectName || '')}/${slugify(quiz.className || '')}/${slugify(quiz.topicName || '')}/${slugify(quiz.title)}`;
    navigator.clipboard.writeText(url);
    toast.custom(() => (
      <CustomToast message="Link kopiert!" type="success" />
    ));
  };

  const handleQuizCreated = async () => {
    setShowCreateWizard(false);
    await loadQuizzes();
    if (onRefetch) await onRefetch();
  };

  const handleQuizUpdated = async (updatedQuiz: QuizDocument) => {
    const result = await updateQuizDocument(updatedQuiz.id, {
      title: updatedQuiz.title,
      shortTitle: updatedQuiz.shortTitle,
      questions: updatedQuiz.questions,
      hidden: updatedQuiz.hidden,
    });
    
    if (result.success) {
      setQuizzes(prev => prev.map(q => 
        q.id === updatedQuiz.id ? { ...q, ...updatedQuiz } : q
      ));
      toast.custom(() => (
        <CustomToast message="Quiz gespeichert" type="success" />
      ));
    }
    setEditingQuiz(null);
  };

  const handleRenameCategory = (type: 'subject' | 'class' | 'topic', id: string, name: string) => {
    const count = quizzes.filter(q => {
      if (type === 'subject') return q.subjectId === id;
      if (type === 'class') return q.classId === id;
      if (type === 'topic') return q.topicId === id;
      return false;
    }).length;

    setRenameModal({ type, id, name, count });
  };

  const handleRenameSuccess = async () => {
    // Zeige Loading-Indikator
    setLoading(true);
    
    // Lade Quizze neu
    await loadQuizzes();
    
    // Setze alle Filter zurück
    clearFilters();
    
    toast.custom(() => (
      <CustomToast message="Kategorie erfolgreich umbenannt" type="success" />
    ));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      class: "",
      topic: "",
      showHidden: true,
    });
  };

  const hasActiveFilters = filters.search || filters.subject || filters.class || filters.topic || !filters.showHidden;

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quizze durchsuchen..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="max-sm:hidden">Filter</span>
          {hasActiveFilters && (
            <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {[filters.subject, filters.class, filters.topic, !filters.showHidden].filter(Boolean).length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Add Quiz button */}
        <button
          onClick={() => setShowCreateWizard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Neues Quiz</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Filter</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Zurücksetzen
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Subject Filter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">Fach</label>
                {filters.subject && (
                  <button
                    onClick={() => {
                      const subject = filterOptions.subjects.find(s => s.id === filters.subject);
                      if (subject) handleRenameCategory('subject', subject.id, subject.name);
                    }}
                    className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    title="Fach umbenennen"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="max-lg:hidden">Umbenennen</span>
                  </button>
                )}
              </div>
              <select
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle Fächer</option>
                {filterOptions.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">Klasse</label>
                {filters.class && (
                  <button
                    onClick={() => {
                      const classItem = filterOptions.classes.find(c => c.id === filters.class);
                      if (classItem) handleRenameCategory('class', classItem.id, classItem.name);
                    }}
                    className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    title="Klasse umbenennen"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="max-lg:hidden">Umbenennen</span>
                  </button>
                )}
              </div>
              <select
                value={filters.class}
                onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle Klassen</option>
                {filterOptions.classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">Thema</label>
                {filters.topic && (
                  <button
                    onClick={() => {
                      const topic = filterOptions.topics.find(t => t.id === filters.topic);
                      if (topic) handleRenameCategory('topic', topic.id, topic.name);
                    }}
                    className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    title="Thema umbenennen"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="max-lg:hidden">Umbenennen</span>
                  </button>
                )}
              </div>
              <select
                value={filters.topic}
                onChange={(e) => setFilters(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle Themen</option>
                {filterOptions.topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Show hidden toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showHidden}
              onChange={(e) => setFilters(prev => ({ ...prev, showHidden: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Versteckte Quizze anzeigen</span>
          </label>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredQuizzes.length} von {quizzes.length} Quizzen
      </div>

      {/* Quiz List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Lade Quizze...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {quizzes.length === 0 
              ? "Noch keine Quizze vorhanden. Erstelle dein erstes Quiz!"
              : "Keine Quizze gefunden. Passe deine Filter an."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                quiz.hidden ? 'opacity-60 border-gray-200' : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col gap-2">
                {/* Header: Title and Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {quiz.shortTitle || quiz.title}
                    </h3>
                    {quiz.hidden && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded shrink-0">
                        Versteckt
                      </span>
                    )}
                  </div>

                  {/* Actions Desktop */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleHidden(quiz)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={quiz.hidden ? "Sichtbar machen" : "Verstecken"}
                    >
                      {quiz.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopyLink(quiz)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Link kopieren"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReassignQuiz(quiz)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Fach/Klasse/Thema ändern"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingQuiz(quiz)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingQuiz(quiz)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions Mobile */}
                  <div className="sm:hidden relative mobile-menu-container">
                    <button
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Aktionen"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMobileMenuId(openMobileMenuId === quiz.id ? null : quiz.id);
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMobileMenuId === quiz.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button 
                          onClick={() => {
                            handleToggleHidden(quiz);
                            setOpenMobileMenuId(null);
                          }} 
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          {quiz.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          {quiz.hidden ? 'Sichtbar machen' : 'Verstecken'}
                        </button>
                        <button 
                          onClick={() => {
                            handleCopyLink(quiz);
                            setOpenMobileMenuId(null);
                          }} 
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Link kopieren
                        </button>
                        <button 
                          onClick={() => {
                            setReassignQuiz(quiz);
                            setOpenMobileMenuId(null);
                          }} 
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                          Neu zuordnen
                        </button>
                        <button 
                          onClick={() => {
                            setEditingQuiz(quiz);
                            setOpenMobileMenuId(null);
                          }} 
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Bearbeiten
                        </button>
                        <button 
                          onClick={() => {
                            setDeletingQuiz(quiz);
                            setOpenMobileMenuId(null);
                          }} 
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Löschen
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quiz.subjectName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-yellow-800 truncate">
                      {quiz.subjectName}
                    </span>
                  )}
                  {quiz.className && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 truncate">
                      {quiz.className}
                    </span>
                  )}
                  {quiz.topicName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 truncate">
                      {quiz.topicName}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600 truncate">
                    {quiz.questions?.length || 0} Fragen
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateWizard && (
        <CreateQuizWizard
          existingSubjects={filterOptions.subjects}
          existingClasses={filterOptions.classes}
          existingTopics={filterOptions.topics}
          onClose={() => setShowCreateWizard(false)}
          onQuizCreated={handleQuizCreated}
        />
      )}

      {editingQuiz && (
        <QuizEditorModal
          quiz={{
            id: editingQuiz.id,
            uuid: editingQuiz.id,
            title: editingQuiz.title,
            shortTitle: editingQuiz.shortTitle,
            questions: editingQuiz.questions,
            hidden: editingQuiz.hidden,
          }}
          onSave={(updatedQuiz) => handleQuizUpdated({ ...editingQuiz, ...updatedQuiz })}
          onClose={() => setEditingQuiz(null)}
        />
      )}

      {deletingQuiz && (
        <DeleteConfirmModal
          itemName={deletingQuiz.title}
          onConfirm={handleDelete}
          onClose={() => setDeletingQuiz(null)}
        />
      )}

      {renameModal && (
        <RenameCategoryModal
          type={renameModal.type}
          currentId={renameModal.id}
          currentName={renameModal.name}
          affectedCount={renameModal.count}
          onClose={() => setRenameModal(null)}
          onSuccess={handleRenameSuccess}
        />
      )}

      {reassignQuiz && (
        <ReassignQuizModal
          quiz={reassignQuiz}
          onClose={() => setReassignQuiz(null)}
          onSuccess={async () => {
            await loadQuizzes();
            toast.custom(() => (
              <CustomToast message="Quiz neu zugeordnet" type="success" />
            ));
          }}
        />
      )}
    </div>
  );
}
