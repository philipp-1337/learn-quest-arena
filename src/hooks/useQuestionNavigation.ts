import { useNavigate } from 'react-router-dom';
import { useSwipe } from './useSwipe';
import { useKeyboardNavigation } from './useKeyboardNavigation';

interface UseQuestionNavigationOptions {
  quizId: string;
  currentIndex: number;
  totalQuestions: number;
  isDirty: boolean;
  onNavigateAway?: () => void;
}

export function useQuestionNavigation(options: UseQuestionNavigationOptions) {
  const { quizId, currentIndex, totalQuestions, isDirty, onNavigateAway } = options;
  const navigate = useNavigate();

  const canNavigate = !isDirty;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalQuestions - 1;

  const animateNavigation = (callback: () => void) => {
    // Check if browser supports View Transitions API
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        callback();
      });
    } else {
      callback();
    }
  };

  const navigateToPrevious = () => {
    if (!canNavigate) {
      alert('Du hast ungespeicherte Änderungen. Bitte speichern oder verwerfen.');
      return;
    }
    if (!hasPrevious) return;
    
    onNavigateAway?.();
    animateNavigation(() => {
      navigate(`/admin/quiz/edit/${quizId}/question/${currentIndex - 1}`);
    });
  };

  const navigateToNext = () => {
    if (!canNavigate) {
      alert('Du hast ungespeicherte Änderungen. Bitte speichern oder verwerfen.');
      return;
    }
    if (!hasNext) return;
    
    onNavigateAway?.();
    animateNavigation(() => {
      navigate(`/admin/quiz/edit/${quizId}/question/${currentIndex + 1}`);
    });
  };

  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: navigateToNext,
    onSwipeRight: navigateToPrevious,
    minSwipeDistance: 75,
  });

  useKeyboardNavigation({
    onLeftArrow: navigateToPrevious,
    onRightArrow: navigateToNext,
    enabled: true,
  });

  return {
    swipeRef,
    navigateToPrevious,
    navigateToNext,
    canNavigatePrevious: canNavigate && hasPrevious,
    canNavigateNext: canNavigate && hasNext,
  };
}
