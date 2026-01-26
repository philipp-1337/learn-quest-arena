import { useState, useRef, useEffect } from 'react';

export function useSwipeToDelete() {
  const [swipeState, setSwipeState] = useState<{ [key: string]: number }>({});
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const currentItemId = useRef<string>("");

  useEffect(() => {
    // Detect mobile device (iOS, Android, etc.)
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsMobile(mobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    currentItemId.current = itemId;
  };

  const handleTouchMove = (e: React.TouchEvent, itemId: string) => {
    if (!isMobile || currentItemId.current !== itemId) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const deltaX = touchStartX.current - touchCurrentX;
    const deltaY = Math.abs(touchStartY.current - touchCurrentY);
    
    // Nur horizontal swipen wenn der Swipe mehr horizontal als vertikal ist
    if (deltaY > 30) return;
    
    // Nur nach links swipen erlauben (deltaX > 0)
    if (deltaX > 0 && deltaX <= 100) {
      setSwipeState(prev => ({ ...prev, [itemId]: deltaX }));
    } else if (deltaX < 0) {
      setSwipeState(prev => ({ ...prev, [itemId]: 0 }));
    }
  };

  const handleTouchEnd = (itemId: string) => {
    if (!isMobile) return;
    
    const swipeDistance = swipeState[itemId] || 0;
    
    // Wenn mehr als 60px geswiped wurde, Swipe "einrasten" lassen
    if (swipeDistance > 60) {
      setSwipeState(prev => ({ ...prev, [itemId]: 100 }));
    } else {
      // Sonst zurückspringen
      setSwipeState(prev => ({ ...prev, [itemId]: 0 }));
    }
    
    currentItemId.current = "";
  };

  const resetSwipe = (itemId: string) => {
    setSwipeState(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const getSwipeProps = (itemId: string) => ({
    onTouchStart: (e: React.TouchEvent) => handleTouchStart(e, itemId),
    onTouchMove: (e: React.TouchEvent) => handleTouchMove(e, itemId),
    onTouchEnd: () => handleTouchEnd(itemId),
    style: {
      transform: isMobile ? `translateX(-${swipeState[itemId] || 0}px)` : 'none',
      transition: currentItemId.current === itemId ? 'none' : 'transform 0.3s ease-out',
    }
  });

  return {
    isMobile,
    swipeState,
    getSwipeProps,
    resetSwipe,
    currentItemId: currentItemId.current
  };
}