import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  QrCode,
  ArrowLeftRight,
  Lock,
  MoreVertical,
} from 'lucide-react';
import type { QuizDocument } from 'quizTypes';
import { canEditQuiz, canReassignQuiz } from '@utils/quizPermissions';
import { getAuth } from 'firebase/auth';

interface QuizListItemProps {
  quiz: QuizDocument;
  userRole: string | null;
  authorAbbreviation?: string;
  onToggleHidden: () => void;
  onCopyLink: () => void;
  onReassign: () => void;
  onDelete: () => void;
}

export default function QuizListItem({
  quiz,
  userRole,
  authorAbbreviation,
  onToggleHidden,
  onCopyLink,
  onReassign,
  onDelete,
}: QuizListItemProps) {
  const navigate = useNavigate();
  const auth = getAuth();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const editPermission = canEditQuiz(userRole, quiz, auth.currentUser?.uid);
  const reassignPermission = canReassignQuiz(
    userRole,
    quiz,
    auth.currentUser?.uid
  );

  // Check toggle hidden permission inline (we'd need to export this or check here)
  const canToggle =
    userRole !== "supporter" &&
    (userRole !== "teacher" || quiz.authorId === auth.currentUser?.uid);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow ${
        quiz.hidden
          ? "border-gray-200 dark:border-gray-700"
          : "border-gray-300 dark:border-gray-600"
      } relative`}
    >
      <div className={`flex flex-col gap-1 ${quiz.hidden ? "opacity-60" : ""}`}>
        {/* Header: Title and Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {quiz.shortTitle ?? quiz.title}
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
              onClick={onToggleHidden}
              disabled={!canToggle}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:dark:hover:text-gray-500 disabled:hover:bg-transparent cursor-pointer"
              title={quiz.hidden ? "Sichtbar machen" : "Verstecken"}
            >
              {quiz.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              onClick={onCopyLink}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
              title="Link kopieren"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={onReassign}
              disabled={!reassignPermission.allowed}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:dark:hover:text-gray-500 disabled:hover:bg-transparent cursor-pointer"
              title="Fach/Klasse/Thema ändern"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate(`/admin/quiz/edit/${quiz.id}`)}
              disabled={!editPermission.allowed}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:dark:hover:text-gray-500 disabled:hover:bg-transparent cursor-pointer"
              title={editPermission.reason || "Bearbeiten"}
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={onDelete}
              disabled={
                userRole === "supporter" &&
                quiz.authorId !== undefined &&
                quiz.authorId !== auth.currentUser?.uid
              }
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:dark:hover:text-gray-500 disabled:hover:bg-transparent cursor-pointer"
              title="Löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Actions Mobile - Button only */}
          <div className="sm:hidden shrink-0">
            <button
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg cursor-pointer"
              title="Aktionen"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMobileMenu(!openMobileMenu);
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
          {quiz.editLock && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 truncate"
              title={`Wird bearbeitet von ${quiz.editLock.userName} seit ${new Date(quiz.editLock.lockedAt).toLocaleTimeString("de-DE")}`}
            >
              <Lock className="w-3 h-3" />
              In Bearbeitung ({quiz.editLock.userName})
            </span>
          )}
          {quiz.createdAt && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 truncate"
              title={`Erstellt am ${new Date(quiz.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
            >
              {new Date(quiz.createdAt).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 truncate">
            {quiz.questions?.length || 0} Fragen
          </span>
          {authorAbbreviation && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 truncate">
              {authorAbbreviation}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {openMobileMenu && (
        <div className="sm:hidden absolute right-4 top-16 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 mobile-menu-container">
          <button
            onClick={() => {
              onToggleHidden();
              setOpenMobileMenu(false);
            }}
            disabled={!canToggle}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            {quiz.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {quiz.hidden ? "Sichtbar machen" : "Verstecken"}
          </button>

          <button
            onClick={() => {
              onCopyLink();
              setOpenMobileMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Link kopieren
          </button>

          <button
            onClick={() => {
              onReassign();
              setOpenMobileMenu(false);
            }}
            disabled={!reassignPermission.allowed}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Neu zuordnen
          </button>

          <button
            onClick={() => {
              navigate(`/admin/quiz/edit/${quiz.id}`);
              setOpenMobileMenu(false);
            }}
            disabled={!editPermission.allowed}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            {quiz.editLock ? <Lock className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {quiz.editLock ? "Bearbeitung läuft" : "Bearbeiten"}
          </button>

          <button
            onClick={() => {
              onDelete();
              setOpenMobileMenu(false);
            }}
            disabled={
              userRole === "supporter" &&
              quiz.authorId !== undefined &&
              quiz.authorId !== auth.currentUser?.uid
            }
            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        </div>
      )}
    </div>
  );
}