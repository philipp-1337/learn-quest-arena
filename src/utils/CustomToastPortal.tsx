import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// Utility: iOS-Detection
function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  // @ts-ignore
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// Portal-Komponente, die ihre Kinder in #toast-portal rendert und bei iOS die Position anpasst
export const CustomToastPortal: React.FC<{ children: React.ReactNode; position?: 'top' | 'bottom' }> = ({ children, position = 'bottom' }) => {
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.getElementById('toast-portal');
    if (!portalRef.current) return;

    if (isIOS()) {
      const updatePosition = () => {
        if (position === 'top') {
          portalRef.current!.style.top = window.scrollY + 'px';
          portalRef.current!.style.bottom = '';
        } else {
          portalRef.current!.style.top = '';
          portalRef.current!.style.bottom = (-window.scrollY) + 'px';
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      // Für andere Systeme: fixed
      portalRef.current.style.position = 'fixed';
      portalRef.current.style.top = position === 'top' ? '0' : '';
      portalRef.current.style.bottom = position === 'bottom' ? '0' : '';
    }
  }, [position]);

  if (!portalRef.current) return null;
  return ReactDOM.createPortal(children, portalRef.current);
};
