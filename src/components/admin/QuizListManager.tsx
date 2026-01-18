import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, X, Eye, EyeOff, Pencil, Trash2, QrCode, ChevronDown, Edit3, MoreVertical, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";
import type { QuizDocument } from "../../types/quizTypes";
import { loadAllQuizDocuments, deleteQuizDocument, updateQuizDocument } from "../../utils/quizzesCollection";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import CreateQuizWizard from "../modals/CreateQuizWizard";
import RenameCategoryModal from "../modals/RenameCategoryModal";
import ReassignQuizModal from "../modals/ReassignQuizModal";
import { slugify } from "../../utils/slugify";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface QuizListManagerProps {
  onRefetch?: () => Promise<void>;
}

interface FilterState {
  search: string;
  subject: string;
  class: string;
  topic: string;
  showHidden: boolean;
  author: string;
}

export default function QuizListManager({ onRefetch }: QuizListManagerProps) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorAbbreviations, setAuthorAbbreviations] = useState<Map<string, string>>(new Map());
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    subject: "",
    class: "",
    topic: "",
    showHidden: true,
    author: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<QuizDocument | null>(null);
  const [reassignQuiz, setReassignQuiz] = useState<QuizDocument | null>(null);
  const [openMobileMenuId, setOpenMobileMenuId] = useState<string | null>(null);
  const [renameModal, setRenameModal] = useState<{
    type: 'subject' | 'class' | 'topic';
    id: string;
    name: string;
    count: number;
  } | null>(null);

  // Load author abbreviations for all unique authorIds
  const loadAuthorAbbreviations = async (authorIds: string[]) => {
    const db = getFirestore();
    const abbrevMap = new Map<string, string>();
    
    // Load abbreviations for each unique authorId
    const uniqueAuthorIds = [...new Set(authorIds)].filter(id => id); // Remove duplicates and empty values
    
    await Promise.all(
      uniqueAuthorIds.map(async (authorId) => {
        try {
          const authorDoc = await getDoc(doc(db, 'author', authorId));
          if (authorDoc.exists()) {
            const data = authorDoc.data();
            if (data.authorAbbreviation) {
              abbrevMap.set(authorId, data.authorAbbreviation);
            }
          }
        } catch (error) {
          console.error(`Error loading abbreviation for author ${authorId}:`, error);
        }
      })
    );
    
    setAuthorAbbreviations(abbrevMap);
  };

  // Load quizzes from collection
  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const docs = await loadAllQuizDocuments();
      setQuizzes(docs);
      
      // Load author abbreviations
      const authorIds = docs.map(q => q.authorId).filter(Boolean);
      if (authorIds.length > 0) {
        await loadAuthorAbbreviations(authorIds);
      }
    } catch (error) {
      console.error("Error loading quizzes:", error);
      toast.custom(() => (
        <CustomToast 
          message="Fehler beim Laden der Quizze" 
          type="error" 
        />
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
    const authors = new Map<string, string>();

    quizzes.forEach(q => {
      // Use normalized IDs (subjectId is already normalized after migration)
      // This ensures "Klasse 1" appears only once, even if it was in multiple subjects before
      if (q.subjectId && q.subjectName) subjects.set(q.subjectId, q.subjectName);
      if (q.classId && q.className) classes.set(q.classId, q.className);
      if (q.topicId && q.topicName) topics.set(q.topicId, q.topicName);
      // Add authors
      if (q.authorId) {
        const abbrev = authorAbbreviations.get(q.authorId);
        if (abbrev) {
          authors.set(q.authorId, abbrev);
        }
      }
    });

    return {
      subjects: Array.from(subjects.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      classes: Array.from(classes.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      topics: Array.from(topics.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      authors: Array.from(authors.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [quizzes, authorAbbreviations]);

  // Filter quizzes based on current filters
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          quiz.title.toLowerCase().includes(searchLower) ||
          quiz.shortTitle?.toLowerCase().includes(searchLower) ||
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

      // Author filter
      if (filters.author && quiz.authorId !== filters.author) return false;

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
        <CustomToast 
          message="Quiz gelöscht" 
          type="success" 
        />
      ));
      if (onRefetch) await onRefetch();
    } else {
      toast.custom(() => (
        <CustomToast 
          message="Fehler beim Löschen" 
          type="error" 
        />
      ));
    }
    setDeletingQuiz(null);
  };

  const handleCopyLink = (quiz: QuizDocument) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/quiz/${slugify(quiz.subjectName || '')}/${slugify(quiz.className || '')}/${slugify(quiz.topicName || '')}/${slugify(quiz.title)}`;
    navigator.clipboard.writeText(url);
    toast.custom(() => (
      <CustomToast 
        message="Link kopiert!" 
        type="success" 
      />
    ));
  };

  const handleQuizCreated = async () => {
    setShowCreateWizard(false);
    await loadQuizzes();
    if (onRefetch) await onRefetch();
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
      <CustomToast 
        message="Kategorie erfolgreich umbenannt" 
        type="success" 
      />
    ));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      class: "",
      topic: "",
      showHidden: true,
      author: "",
    });
  };

  const hasActiveFilters = filters.search || filters.subject || filters.class || filters.topic || !filters.showHidden || filters.author;

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Quizze durchsuchen..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Filter</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
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
                <label className="block text-sm text-gray-600 dark:text-gray-400">Fach</label>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm text-gray-600 dark:text-gray-400">Klasse</label>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm text-gray-600 dark:text-gray-400">Thema</label>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle Themen</option>
                {filterOptions.topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Author Filter and Show hidden toggle */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Autor</label>
              <select
                value={filters.author}
                onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Alle Autoren</option>
                {filterOptions.authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showHidden}
                onChange={(e) => setFilters(prev => ({ ...prev, showHidden: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Versteckte Quizze anzeigen</span>
            </label>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {filteredQuizzes.length} von {quizzes.length} Quizzen
      </div>

      {/* Quiz List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Lade Quizze...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
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
              className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow ${
                quiz.hidden ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600'
              } relative`}
            >
              <div className={`flex flex-col gap-1 ${quiz.hidden ? 'opacity-60' : ''}`}>
                {/* Header: Title and Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {quiz.shortTitle || quiz.title}
                    </h3>
                    {quiz.hidden && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded shrink-0">
                        Versteckt
                      </span>
                    )}
                  </div>

                  {/* Actions Desktop */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleHidden(quiz)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title={quiz.hidden ? "Sichtbar machen" : "Verstecken"}
                    >
                      {quiz.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopyLink(quiz)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Link kopieren"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReassignQuiz(quiz)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Fach/Klasse/Thema ändern"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/quiz/edit/${quiz.id}`)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingQuiz(quiz)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions Mobile - Button only */}
                  <div className="sm:hidden shrink-0">
                    <button
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                      title="Aktionen"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMobileMenuId(openMobileMenuId === quiz.id ? null : quiz.id);
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-0">
                  {quiz.subjectName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-100/30 text-yellow-800 dark:text-yellow-400 truncate">
                      {quiz.subjectName}
                    </span>
                  )}
                  {quiz.className && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 truncate">
                      {quiz.className}
                    </span>
                  )}
                  {quiz.topicName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 truncate">
                      {quiz.topicName}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 truncate">
                    {quiz.questions?.length || 0} Fragen
                  </span>
                  {quiz.authorId && authorAbbreviations.get(quiz.authorId) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 truncate">
                      {authorAbbreviations.get(quiz.authorId)}
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Menu - Outside opacity context */}
              {openMobileMenuId === quiz.id && (
                <div className="sm:hidden absolute right-4 top-16 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 mobile-menu-container">
                  <button 
                    onClick={() => {
                      handleToggleHidden(quiz);
                      setOpenMobileMenuId(null);
                    }} 
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    {quiz.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {quiz.hidden ? 'Sichtbar machen' : 'Verstecken'}
                  </button>
                  <button 
                    onClick={() => {
                      handleCopyLink(quiz);
                      setOpenMobileMenuId(null);
                    }} 
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Link kopieren
                  </button>
                  <button 
                    onClick={() => {
                      setReassignQuiz(quiz);
                      setOpenMobileMenuId(null);
                    }} 
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Neu zuordnen
                  </button>
                  <button 
                    onClick={() => {
                      navigate(`/admin/quiz/edit/${quiz.id}`);
                      setOpenMobileMenuId(null);
                    }} 
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Bearbeiten
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingQuiz(quiz);
                      setOpenMobileMenuId(null);
                    }} 
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </button>
                </div>
              )}
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
              <CustomToast 
                message="Quiz neu zugeordnet" 
                type="success" 
              />
            ));
          }}
        />
      )}
    </div>
  );
}
