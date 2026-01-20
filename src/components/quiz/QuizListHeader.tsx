import { Search, Filter, Plus, ChevronDown } from "lucide-react";
import type { FilterState } from "../../hooks/useQuizFilters";

interface QuizListHeaderProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onCreateQuiz: () => void;
}

export default function QuizListHeader({
  filters,
  onFilterChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  activeFilterCount,
  onCreateQuiz,
}: QuizListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Quizze durchsuchen..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        onClick={onToggleFilters}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="max-sm:hidden">Filter</span>
        {hasActiveFilters && (
          <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
        />
      </button>

      <button
        onClick={onCreateQuiz}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Neues Quiz</span>
      </button>
    </div>
  );
}
