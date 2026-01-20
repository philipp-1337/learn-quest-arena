import { X, Edit3 } from "lucide-react";
import { getAuth } from "firebase/auth";
import type { FilterState, FilterOptions } from "../../hooks/useQuizFilters";

interface QuizFiltersProps {
  filters: FilterState;
  filterOptions: FilterOptions;
  hasActiveFilters: boolean;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onRenameCategory: (
    type: "subject" | "class" | "topic",
    id: string,
    name: string
  ) => void;
  onClose: () => void;
}

export default function QuizFilters({
  filters,
  filterOptions,
  hasActiveFilters,
  onFilterChange,
  onClearFilters,
  onRenameCategory
}: QuizFiltersProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">
          Filter & Sortierung
        </h4>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Schnellfilter
        </label>
        <div className="flex flex-wrap gap-2">
            {/* Meine Quiz Schnellfilter */}
            <button
              onClick={() => {
                const auth = getAuth();
                if (filters.author === auth.currentUser?.uid) {
                  onFilterChange({ author: "" });
                } else {
                  onFilterChange({ author: auth.currentUser?.uid || "" });
                }
              }}
              className={`px-3 py-1.5 text-xs border rounded-lg transition-colors
                ${filters.author === getAuth().currentUser?.uid
                  ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700"}
              `}
            >
              Meine Quiz
            </button>
            {/* Versteckte Quiz Schnellfilter */}
            <button
              onClick={() => {
                if (filters.showHidden === false) {
                  onFilterChange({ showHidden: undefined });
                } else {
                  onFilterChange({ showHidden: false });
                }
              }}
              className={`px-3 py-1.5 text-xs border rounded-lg transition-colors
                ${filters.showHidden === false
                  ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700"}
              `}
            >
              Versteckte Quiz
            </button>
            {/* Neuste 10 Schnellfilter */}
            <button
              onClick={() => {
                if (filters.sortBy === "createdAt-desc" && filters.limit === 10) {
                  onFilterChange({ sortBy: "title", limit: null });
                } else {
                  onFilterChange({ sortBy: "createdAt-desc", limit: 10 });
                }
              }}
              className={`px-3 py-1.5 text-xs border rounded-lg transition-colors
                ${(filters.sortBy === "createdAt-desc" && filters.limit === 10)
                  ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700"}
              `}
            >
              Neuste 10
            </button>
            {/* Quiz ohne Fragen Schnellfilter */}
            <button
              onClick={() => {
                if (filters.search === "__noQuestions__") {
                  onFilterChange({ search: "" });
                } else {
                  onFilterChange({ search: "__noQuestions__" });
                }
              }}
              className={`px-3 py-1.5 text-xs border rounded-lg transition-colors
                ${filters.search === "__noQuestions__"
                  ? "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700"}
              `}
            >
              Quiz ohne Fragen
            </button>
        </div>
      </div>

      {/* Sort and Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Sortierung
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as FilterState["sortBy"],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="title">Alphabetisch (A-Z)</option>
            <option value="createdAt-desc">Neueste zuerst</option>
            <option value="createdAt-asc">Älteste zuerst</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Anzeige-Limit
          </label>
          <select
            value={filters.limit || ""}
            onChange={(e) =>
              onFilterChange({
                limit: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle anzeigen</option>
            <option value="5">Erste 5</option>
            <option value="10">Erste 10</option>
            <option value="20">Erste 20</option>
            <option value="50">Erste 50</option>
          </select>
        </div>
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Subject Filter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Fach
            </label>
            {filters.subject && (
              <button
                onClick={() => {
                  const subject = filterOptions.subjects.find(
                    (s) => s.id === filters.subject
                  );
                  if (subject) onRenameCategory("subject", subject.id, subject.name);
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
            onChange={(e) => onFilterChange({ subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle Fächer</option>
            {filterOptions.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Klasse
            </label>
            {filters.class && (
              <button
                onClick={() => {
                  const classItem = filterOptions.classes.find(
                    (c) => c.id === filters.class
                  );
                  if (classItem) onRenameCategory("class", classItem.id, classItem.name);
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
            onChange={(e) => onFilterChange({ class: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle Klassen</option>
            {filterOptions.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Thema
            </label>
            {filters.topic && (
              <button
                onClick={() => {
                  const topic = filterOptions.topics.find(
                    (t) => t.id === filters.topic
                  );
                  if (topic) onRenameCategory("topic", topic.id, topic.name);
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
            onChange={(e) => onFilterChange({ topic: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle Themen</option>
            {filterOptions.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Author Filter */}
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
          Autor
        </label>
        <select
          value={filters.author}
          onChange={(e) => onFilterChange({ author: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Alle Autoren</option>
          {filterOptions.authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}