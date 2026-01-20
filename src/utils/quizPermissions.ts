import type { QuizDocument } from "../types/quizTypes";

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export function canToggleVisibility(
  userRole: string | null,
  quiz: QuizDocument,
  currentUserId?: string
): PermissionCheck {
  if (userRole === "supporter") {
    return {
      allowed: false,
      reason: "Unterstützer:innen dürfen die Sichtbarkeit von Quizzen nicht ändern.",
    };
  }

  if (userRole === "teacher" && quiz.authorId !== currentUserId) {
    return {
      allowed: false,
      reason: "Lehrer:innen dürfen nur eigene Quiz sichtbar schalten.",
    };
  }

  return { allowed: true };
}

export function canDeleteQuiz(
  userRole: string | null,
  quiz: QuizDocument,
  currentUserId?: string
): PermissionCheck {
  if (userRole === "teacher" && quiz.authorId !== currentUserId) {
    return {
      allowed: false,
      reason: "Lehrer:innen dürfen nur eigene Quiz löschen.",
    };
  }

  if (
    userRole === "supporter" &&
    quiz.authorId !== undefined &&
    quiz.authorId !== currentUserId
  ) {
    return {
      allowed: false,
      reason: "Unterstützer:innen dürfen nur eigene Quiz löschen.",
    };
  }

  return { allowed: true };
}

export function canEditQuiz(
  userRole: string | null,
  quiz: QuizDocument,
  currentUserId?: string
): PermissionCheck {
  if (quiz.editLock) {
    return {
      allowed: false,
      reason: `Wird bearbeitet von ${quiz.editLock.userName}`,
    };
  }

  if (
    userRole === "supporter" &&
    quiz.authorId !== undefined &&
    quiz.authorId !== currentUserId
  ) {
    return {
      allowed: false,
      reason: "Unterstützer:innen dürfen nur eigene Quiz bearbeiten.",
    };
  }

  return { allowed: true };
}

export function canReassignQuiz(
  userRole: string | null,
  quiz: QuizDocument,
  currentUserId?: string
): PermissionCheck {
  if (
    userRole === "supporter" &&
    quiz.authorId !== undefined &&
    quiz.authorId !== currentUserId
  ) {
    return {
      allowed: false,
      reason: "Unterstützer:innen dürfen nur eigene Quiz neu zuordnen.",
    };
  }

  return { allowed: true };
}
