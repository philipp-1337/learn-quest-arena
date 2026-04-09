import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

// Utility: iOS-Detection
function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

// Portal-Komponente, die ihre Kinder in #toast-portal rendert und bei iOS die Position anpasst
export const CustomToastPortal: React.FC<{ children: React.ReactNode; position?: 'top' | 'bottom' }> = ({ children, position = 'bottom' }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const portal = document.getElementById('toast-portal');
    setPortalElement(portal);
    if (!portal) return;

    if (isIOS()) {
      const updatePosition = () => {
        if (position === 'top') {
          portal.style.top = window.scrollY + 'px';
          portal.style.bottom = '';
        } else {
          portal.style.top = '';
          portal.style.bottom = (-window.scrollY) + 'px';
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
      portal.style.position = 'fixed';
      portal.style.top = position === 'top' ? '0' : '';
      portal.style.bottom = position === 'bottom' ? '0' : '';
    }
  }, [position]);

  if (!portalElement) return null;
  return ReactDOM.createPortal(children, portalElement);
};
