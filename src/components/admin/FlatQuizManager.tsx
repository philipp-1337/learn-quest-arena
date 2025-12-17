import { copyQuizUrlToClipboard } from "../../utils/quizUrlHelper";
import { toast, Toaster } from "sonner";
import type { Subject, Class, Topic, Quiz } from "../../types/quizTypes";

import { useExpandedState } from "../../hooks/useExpandedState";
import { useModalState } from "../../hooks/useModalState";
import { useQuizHierarchy } from "../../hooks/useQuizHierarchy";

import { SubjectItem } from "./QuizHierarchyItem/SubjectItem";
import { ClassItem } from "./QuizHierarchyItem/ClassItem";
import { TopicItem } from "./QuizHierarchyItem/TopicItem";
import { QuizItem } from "./QuizHierarchyItem/QuizItem";

import AddModal from "../modals/AddModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import QuizEditorModal from "../modals/QuizEditorModal";

interface FlatQuizManagerProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
}

export default function FlatQuizManager({
  subjects,
  onSubjectsChange,
}: FlatQuizManagerProps) {
  /* ---------------- Hooks ---------------- */
  const expanded = useExpandedState();
  const modals = useModalState();
  const hierarchy = useQuizHierarchy(subjects, onSubjectsChange);

  const handleCopyQuizLink = async (
    subject: Subject,
    classItem: Class,
    topic: Topic,
    quiz: Quiz
  ) => {
    const success = await copyQuizUrlToClipboard(
      subject,
      classItem,
      topic,
      quiz
    );

    if (success) {
      toast.success("Link kopiert!", {});
    } else {
      toast.error("Fehler beim Kopieren des Links", {});
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-3">
      <Toaster position="top-center" richColors closeButton />
      {[...subjects].sort((a, b) => a.name.localeCompare(b.name)).map((subject) => {
        const subjectExpanded = expanded.expandedSubjects.has(subject.id);

        return (
          <div key={subject.id} className="space-y-2 break-words">
            {/* ---------- Subject ---------- */}
            <SubjectItem
              subject={subject}
              expanded={subjectExpanded}
              onToggle={() => expanded.toggleSubject(subject.id)}
              onAddClass={() =>
                modals.setAddModal({ type: "class", parentId: subject.id })
              }
              onDelete={() =>
                modals.setDeleteModal({
                  type: "subject",
                  id: subject.id,
                  name: subject.name,
                })
              }
            />

            {/* ---------- Classes ---------- */}
            {subjectExpanded &&
              [...subject.classes].sort((a, b) => a.name.localeCompare(b.name)).map((cls) => {
                const classExpanded = expanded.expandedClasses.has(cls.id);

                return (
                  <div key={cls.id} className="ml-6 space-y-2">
                    <ClassItem
                      classItem={cls}
                      expanded={classExpanded}
                      onToggle={() => expanded.toggleClass(cls.id)}
                      onAddTopic={() =>
                        modals.setAddModal({
                          type: "topic",
                          parentId: `${subject.id}:${cls.id}`,
                        })
                      }
                      onDelete={() =>
                        modals.setDeleteModal({
                          type: "class",
                          id: `${subject.id}:${cls.id}`,
                          name: cls.name,
                        })
                      }
                    />

                    {/* ---------- Topics ---------- */}
                    {classExpanded &&
                      [...cls.topics].sort((a, b) => a.name.localeCompare(b.name)).map((topic) => {
                        const topicExpanded = expanded.expandedTopics.has(
                          topic.id
                        );

                        return (
                          <div key={topic.id} className="ml-6 space-y-2">
                            <TopicItem
                              topic={topic}
                              expanded={topicExpanded}
                              onToggle={() => expanded.toggleTopic(topic.id)}
                              onAddQuiz={() =>
                                modals.setAddModal({
                                  type: "quiz",
                                  parentId: `${subject.id}:${cls.id}:${topic.id}`,
                                })
                              }
                              onDelete={() =>
                                modals.setDeleteModal({
                                  type: "topic",
                                  id: `${subject.id}:${cls.id}:${topic.id}`,
                                  name: topic.name,
                                })
                              }
                            />

                            {/* ---------- Quizzes ---------- */}
                            {topicExpanded &&
                              [...topic.quizzes].sort((a, b) => a.title.localeCompare(b.title)).map((quiz) => (
                                <QuizItem
                                  key={quiz.id}
                                  quiz={quiz}
                                  onCopyLink={() =>
                                    handleCopyQuizLink(
                                      subject,
                                      cls,
                                      topic,
                                      quiz
                                    )
                                  }
                                  onEdit={() =>
                                    modals.setEditQuizModal({
                                      quiz,
                                      subjectId: subject.id,
                                      classId: cls.id,
                                      topicId: topic.id,
                                    })
                                  }
                                  onDelete={() =>
                                    modals.setDeleteModal({
                                      type: "quiz",
                                      id: `${subject.id}:${cls.id}:${topic.id}:${quiz.id}`,
                                      name: quiz.title,
                                    })
                                  }
                                  onToggleHidden={async (hidden) => {
                                    const updatedQuiz = { ...quiz, hidden };
                                    await hierarchy.updateQuiz(
                                      updatedQuiz,
                                      subject.id,
                                      cls.id,
                                      topic.id
                                    );
                                  }}
                                />
                              ))}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        );
      })}

      {/* ================= Modals ================= */}

      {modals.addModal && (
        <AddModal
          type={modals.addModal.type}
          onSave={(name) => {
            if (modals.addModal?.type === "subject") {
              hierarchy.addSubject(name);
            }

            if (modals.addModal?.type === "class") {
              hierarchy.addClass(name, modals.addModal.parentId!);
            }

            if (modals.addModal?.type === "topic") {
              const [subjectId, classId] = modals.addModal.parentId!.split(":");
              hierarchy.addTopic(name, subjectId, classId);
            }

            if (modals.addModal?.type === "quiz") {
              const [subjectId, classId, topicId] =
                modals.addModal.parentId!.split(":");
              hierarchy.addQuiz(name, subjectId, classId, topicId);
            }

            modals.setAddModal(null);
          }}
          onClose={() => modals.setAddModal(null)}
        />
      )}

      {modals.deleteModal && (
        <DeleteConfirmModal
          itemName={modals.deleteModal.name}
          onConfirm={() => {
            const ids = modals.deleteModal!.id.split(":");

            if (modals.deleteModal!.type === "subject") {
              hierarchy.deleteSubject(ids[0]);
            }

            if (modals.deleteModal!.type === "class") {
              hierarchy.deleteClass(ids[0], ids[1]);
            }

            if (modals.deleteModal!.type === "topic") {
              hierarchy.deleteTopic(ids[0], ids[1], ids[2]);
            }

            if (modals.deleteModal!.type === "quiz") {
              hierarchy.deleteQuiz(ids[0], ids[1], ids[2], ids[3]);
            }

            modals.setDeleteModal(null);
          }}
          onClose={() => modals.setDeleteModal(null)}
        />
      )}

      {modals.editQuizModal && (
        <QuizEditorModal
          quiz={modals.editQuizModal.quiz}
          onSave={(updatedQuiz) => {
            hierarchy.updateQuiz(
              updatedQuiz,
              modals.editQuizModal!.subjectId,
              modals.editQuizModal!.classId,
              modals.editQuizModal!.topicId
            );
            modals.setEditQuizModal(null);
          }}
          onClose={() => modals.setEditQuizModal(null)}
        />
      )}
    </div>
  );
}
