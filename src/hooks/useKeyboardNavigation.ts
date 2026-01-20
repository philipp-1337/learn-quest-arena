import { useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  onLeftArrow?: () => void;
  onRightArrow?: () => void;
  onUpArrow?: () => void;
  onDownArrow?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const {
    onLeftArrow,
    onRightArrow,
    onUpArrow,
    onDownArrow,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onLeftArrow?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onRightArrow?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onUpArrow?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onDownArrow?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLeftArrow, onRightArrow, onUpArrow, onDownArrow, enabled]);
}
