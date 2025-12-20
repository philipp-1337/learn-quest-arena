import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook, der die Seite nach oben scrollt, wenn die Route sich ändert.
 * Dies sollte in der App-Komponente verwendet werden.
 */
export default function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
