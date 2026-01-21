import { useState, useMemo } from "react";
import type { QuizDocument } from "quizTypes";

export interface FilterState {
  search: string;
  subject: string;
  class: string;
  topic: string;
  showHidden: boolean;
  author: string;
  sortBy: "title" | "createdAt-desc" | "createdAt-asc";
  limit: number | null;
}

export interface FilterOptions {
  subjects: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string }>;
  topics: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
}

export function useQuizFilters(
  quizzes: QuizDocument[],
  authorAbbreviations: Map<string, string>
) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    subject: "",
    class: "",
    topic: "",
    showHidden: true,
    author: "",
    sortBy: "title",
    limit: null,
  });

  const filterOptions = useMemo((): FilterOptions => {
    const subjects = new Map<string, string>();
    const classes = new Map<string, string>();
    const topics = new Map<string, string>();
    const authors = new Map<string, string>();

    quizzes.forEach((q) => {
      if (q.subjectId && q.subjectName) subjects.set(q.subjectId, q.subjectName);
      if (q.classId && q.className) classes.set(q.classId, q.className);
      if (q.topicId && q.topicName) topics.set(q.topicId, q.topicName);
      
      if (q.authorId) {
        const abbrev = authorAbbreviations.get(q.authorId);
        if (abbrev) {
          authors.set(q.authorId, abbrev);
        }
      }
    });

    return {
      subjects: Array.from(subjects.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      classes: Array.from(classes.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      topics: Array.from(topics.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      authors: Array.from(authors.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [quizzes, authorAbbreviations]);

  const filteredQuizzes = useMemo(() => {
    let result = quizzes.filter((quiz) => {
      // __noQuestions__ ist jetzt eine zusätzliche Bedingung
      if (filters.search === "__noQuestions__" && quiz.questions && quiz.questions.length > 0) {
        return false;
      }

      if (
        filters.search &&
        filters.search !== "__editLock__" &&
        filters.search !== "__noQuestions__"
      ) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          quiz.title.toLowerCase().includes(searchLower) ||
          quiz.shortTitle?.toLowerCase().includes(searchLower) ||
          quiz.subjectName?.toLowerCase().includes(searchLower) ||
          quiz.className?.toLowerCase().includes(searchLower) ||
          quiz.topicName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.subject && quiz.subjectId !== filters.subject) return false;
      if (filters.class && quiz.classId !== filters.class) return false;
      if (filters.topic && quiz.topicId !== filters.topic) return false;

      if (filters.showHidden === false && quiz.hidden !== true) {
        return false;
      }

      if (filters.author && quiz.authorId !== filters.author) return false;

      return true;
    });

    if (filters.sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "createdAt-desc") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (filters.sortBy === "createdAt-asc") {
      result.sort((a, b) => a.createdAt - b.createdAt);
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }, [quizzes, filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: "",
      class: "",
      topic: "",
      showHidden: true,
      author: "",
      sortBy: "title",
      limit: null,
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.subject !== "" ||
    filters.class !== "" ||
    filters.topic !== "" ||
    filters.showHidden === false ||
    filters.author !== "" ||
    filters.sortBy !== "title" ||
    filters.limit !== null;

  const activeFilterCount = [
    filters.search !== "",
    filters.subject !== "",
    filters.class !== "",
    filters.topic !== "",
    filters.showHidden === false,
    filters.author !== "",
    filters.sortBy !== "title",
    filters.limit !== null,
  ].filter(Boolean).length;

  return {
    filters,
    setFilters,
    filterOptions,
    filteredQuizzes,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
