import { useState, useEffect } from 'react';

/**
 * Custom hook for staggered entrance animations
 * Returns whether the element should be visible based on a delay
 * @param index - The index of the element in the sequence
 * @param delay - Delay between each element in milliseconds (default: 100ms)
 * @param enabled - Whether animations should run (default: true)
 * @returns Whether the element should be visible
 */
export function useStaggeredAnimation(
  index: number,
  delay: number = 100,
  enabled: boolean = true
): boolean {
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, index * delay);

    return () => clearTimeout(timeout);
  }, [index, delay, enabled]);

  return isVisible;
}
