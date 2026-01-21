import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CustomToast } from "../../../misc/CustomToast";
import DeleteConfirmModal from "../../../modals/DeleteConfirmModal";
import CreateQuizWizard from "../../../modals/CreateQuizWizard";
import RenameCategoryModal from "../../../modals/RenameCategoryModal";
import ReassignQuizModal from "../../../modals/ReassignQuizModal";
import QuizListHeader from "../../../quiz/QuizListHeader";
import QuizFilters from "../../../quiz/QuizFilters";
import QuizListItem from "../../../quiz/QuizListItem";
import { useQuizzes } from "../../../../hooks/useQuizzes";
import { useQuizFilters } from "../../../../hooks/useQuizFilters";
import { useQuizActions } from "../../../../hooks/useQuizActions";
import { useUserRole } from "../../../../hooks/useUserRole";
import type { QuizDocument } from "../../../../types/quizTypes";

interface QuizListManagerProps {
  onRefetch?: () => Promise<void>;
}

export default function QuizListManager({}: QuizListManagerProps) {
  const { quizzes, setQuizzes, loading, authorAbbreviations } = useQuizzes();
  const { userRole } = useUserRole();
  const {
    filters,
    setFilters,
    filterOptions,
    filteredQuizzes,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useQuizFilters(quizzes, authorAbbreviations);
  const { handleToggleHidden, handleDelete, handleCopyLink } = useQuizActions(
    userRole,
    setQuizzes
  );

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<QuizDocument | null>(null);
  const [reassignQuiz, setReassignQuiz] = useState<QuizDocument | null>(null);
  const [renameModal, setRenameModal] = useState<{
    type: "subject" | "class" | "topic";
    id: string;
    name: string;
    count: number;
  } | null>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".mobile-menu-container")) {
        // Mobile menu close is now handled in QuizListItem
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuizCreated = () => {
    setShowCreateWizard(false);
  };

  const handleRenameCategory = (
    type: "subject" | "class" | "topic",
    id: string,
    name: string
  ) => {
    const count = quizzes.filter((q: QuizDocument) => {
      if (type === "subject") return q.subjectId === id;
      if (type === "class") return q.classId === id;
      if (type === "topic") return q.topicId === id;
      return false;
    }).length;

    setRenameModal({ type, id, name, count });
  };

  const handleRenameSuccess = () => {
    clearFilters();
    toast.custom(() => (
      <CustomToast message="Kategorie erfolgreich umbenannt" type="success" />
    ));
  };

  const onDeleteConfirm = async () => {
    if (!deletingQuiz) return;
    await handleDelete(deletingQuiz);
    setDeletingQuiz(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <QuizListHeader
        filters={filters}
        onFilterChange={(partial) => setFilters((prev) => ({ ...prev, ...partial }))}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={!!hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onCreateQuiz={() => setShowCreateWizard(true)}
      />

      {/* Filter Panel */}
      {showFilters && (
        <QuizFilters
          filters={filters}
          filterOptions={filterOptions}
          hasActiveFilters={!!hasActiveFilters}
          onFilterChange={(partial) => setFilters((prev) => ({ ...prev, ...partial }))}
          onClearFilters={clearFilters}
          onRenameCategory={handleRenameCategory}
          onClose={() => setShowFilters(false)}
        />
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
              : "Keine Quizze gefunden. Passe deine Filter an."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuizzes.map((quiz) => (
            <QuizListItem
              key={quiz.id}
              quiz={quiz}
              userRole={userRole}
              authorAbbreviation={authorAbbreviations.get(quiz.authorId)}
              onToggleHidden={() => handleToggleHidden(quiz)}
              onCopyLink={() => handleCopyLink(quiz)}
              onReassign={() => setReassignQuiz(quiz)}
              onDelete={() => setDeletingQuiz(quiz)}
            />
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
          onConfirm={onDeleteConfirm}
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
          onSuccess={() => {
            toast.custom(() => (
              <CustomToast message="Quiz neu zugeordnet" type="success" />
            ));
          }}
        />
      )}
    </div>
  );
}