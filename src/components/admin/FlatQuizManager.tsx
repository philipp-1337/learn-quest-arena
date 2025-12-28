import { copyQuizUrlToClipboard, generateQuizUrl } from "../../utils/quizUrlHelper";
import { toast } from "sonner";
import { CustomToast } from "../misc/CustomToast";
import { Clipboard } from "lucide-react";
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
  onRefetch?: () => Promise<void>;
}

export default function FlatQuizManager({
  subjects,
  onSubjectsChange,
  onRefetch,
}: FlatQuizManagerProps) {
  /* ---------------- Hooks ---------------- */
  const expanded = useExpandedState();
  const modals = useModalState();
  const hierarchy = useQuizHierarchy(subjects, onSubjectsChange, onRefetch);

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
      const quizUrl = window.location.origin + generateQuizUrl(subject, classItem, topic, quiz);
      toast.custom((_) => (
        <CustomToast
          message={
            <div className="flex items-center gap-2">
              <Clipboard className="w-5 h-5 flex-shrink-0" />
              <div className="break-all text-sm">Link kopiert: <div className="font-semibold"></div>{quizUrl}</div>
            </div>
          }
          type="success"
        />
      ), { duration: 2000 });
    } else {
      toast.custom((_) => <CustomToast message="Fehler beim Kopieren des Links" type="error" />, { duration: 4000 });
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-3">
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
              onRename={async (newName) => {
                await hierarchy.updateSubjectName(subject.id, newName);
                toast.success("Fach umbenannt");
              }}
            />

            {/* ---------- Classes ---------- */}
            {subjectExpanded &&
              [...subject.classes].sort((a, b) => a.name.localeCompare(b.name)).map((cls) => {
                const classExpanded = expanded.expandedClasses.has(cls.id);

                return (
                  <div key={cls.id} className="ml-3 space-y-2">
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
                      onRename={async (newName) => {
                        await hierarchy.updateClassName(subject.id, cls.id, newName);
                        toast.success("Klasse umbenannt");
                      }}
                    />

                    {/* ---------- Topics ---------- */}
                    {classExpanded &&
                      [...cls.topics].sort((a, b) => a.name.localeCompare(b.name)).map((topic) => {
                        const topicExpanded = expanded.expandedTopics.has(
                          topic.id
                        );

                        return (
                          <div key={topic.id} className="ml-3 space-y-2">
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
                              onRename={async (newName) => {
                                await hierarchy.updateTopicName(subject.id, cls.id, topic.id, newName);
                                toast.success("Thema umbenannt");
                              }}
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
                                  onRename={async (newTitle) => {
                                    await hierarchy.updateQuiz(
                                      { ...quiz, title: newTitle },
                                      subject.id,
                                      cls.id,
                                      topic.id
                                    );
                                    toast.success("Quiz umbenannt");
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
              // Pass hidden=true for new quizzes
              hierarchy.addQuiz(name, subjectId, classId, topicId, true);
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
