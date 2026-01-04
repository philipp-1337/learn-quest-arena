import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for smooth count-up animation with easing
 * @param end - The target number to count up to
 * @param duration - Duration of the animation in milliseconds (default: 1500ms)
 * @param start - Starting number (default: 0)
 * @param enabled - Whether the animation should run (default: true)
 * @returns The current animated value
 */
export function useCountUpAnimation(
  end: number,
  duration: number = 1500,
  start: number = 0,
  enabled: boolean = true
): number {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled || start === end) {
      setCount(end);
      return;
    }

    startTimeRef.current = undefined;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutCubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentCount = Math.floor(start + (end - start) * easeOutCubic);
      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start, enabled]);

  return count;
}
