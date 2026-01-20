import { useEffect, useState } from 'react';

export function usePageTransition(key: string | number) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check if browser supports View Transitions API
    if (!document.startViewTransition) {
      return;
    }

    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    
    return () => clearTimeout(timer);
  }, [key]);

  return { isTransitioning };
}
