import { useEffect } from 'react';

export function useDisableIOSSwipeBack(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const preventSwipeNavigation = (e: TouchEvent) => {
      // Nur verhindern wenn Touch am linken oder rechten Rand startet
      const touchX = e.touches[0].clientX;
      const edgeThreshold = 50; // 50px vom Rand
      
      if (touchX <= edgeThreshold || touchX >= window.innerWidth - edgeThreshold) {
        e.preventDefault();
      }
    };

    // passive: false ist wichtig, damit preventDefault funktioniert
    document.addEventListener('touchstart', preventSwipeNavigation, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventSwipeNavigation);
    };
  }, [enabled]);
}
