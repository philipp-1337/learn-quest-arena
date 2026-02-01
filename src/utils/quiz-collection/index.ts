/**
 * Central export file for quiz collection utilities.
 * This maintains backwards compatibility with existing imports.
 */

// CRUD operations
export {
  createQuizDocument,
  saveQuizDocument,
  loadQuizDocument,
  updateQuizDocument,
  deleteQuizDocument,
  quizDocumentToQuiz,
} from './quizCrud';

// Query operations
export {
  loadAllQuizDocuments,
  loadQuizzesBySubject,
  loadQuizzesByClass,
  loadQuizzesByTopic,
  loadQuizzesByAuthor,
  hasQuizzesCollection,
  getQuizzesCollectionCount,
} from './quizQueries';

// Lock management
export {
  isQuizLocked,
  acquireEditLock,
  releaseEditLock,
  refreshEditLock,
  LOCK_TIMEOUT_MS,
} from './quizLocking';

// Category management
export {
  reassignQuiz,
  renameCategory,
} from './quizCategoryManagement';

// Question management
export {
  moveQuestionToQuiz,
} from './questionManagement';

// Subscriptions
export {
  subscribeToQuizzes,
  subscribeToQuiz,
} from './quizSubscriptions';

// Helpers
export {
  removeUndefinedFields,
} from './quizHelpers';
