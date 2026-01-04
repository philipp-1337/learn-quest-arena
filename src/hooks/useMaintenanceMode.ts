import { useState, useEffect } from 'react';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';

/**
 * Hook zum Abrufen des Wartungsmodus-Status aus Firestore
 * Lauscht in Echtzeit auf Änderungen des Wartungsmodus
 * Bypass für localhost - Wartungsmodus wird lokal ignoriert
 */
export default function useMaintenanceMode() {
  // Check if running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.startsWith('192.168.');

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(!isLocalhost);

  useEffect(() => {
    // Bypass für lokale Entwicklung
    if (isLocalhost) {
      console.log('🔧 Development Mode: Wartungsmodus-Check wird übersprungen');
      return;
    }
    
    const db = getFirestore();
    
    // Lausche auf das systemConfig/maintenance Dokument
    const maintenanceDocRef = doc(db, 'systemConfig', 'maintenance');
    
    const unsubscribe = onSnapshot(
      maintenanceDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setIsMaintenanceMode(data.enabled === true);
        } else {
          // Wenn das Dokument nicht existiert, ist Wartungsmodus deaktiviert
          setIsMaintenanceMode(false);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching maintenance mode:', error);
        // Bei Fehler: Wartungsmodus deaktiviert, damit die App funktioniert
        setIsMaintenanceMode(false);
        setIsLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [isLocalhost]);

  return { isMaintenanceMode, isLoading };
}
