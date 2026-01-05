import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCwIcon } from 'lucide-react';
import { CustomToast } from '../components/misc/CustomToast';

export const usePwaUpdate = () => {
  const updateToastShown = useRef(false);
  const updateIntervalId = useRef<number | undefined>(undefined);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Clear any existing interval before creating a new one
      if (updateIntervalId.current !== undefined) {
        clearInterval(updateIntervalId.current);
      }
      
      // Prüfe alle 60 Sekunden auf Updates
      if (r) {
        updateIntervalId.current = window.setInterval(() => {
          r.update();
        }, 60000);
      }
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh && !updateToastShown.current) {
      updateToastShown.current = true;
      
      const handleUpdate = () => {
        toast.dismiss('update-toast');
        updateServiceWorker(true);
      };
      
      toast.custom(
        (_) => (
          <CustomToast
            type="success"
            message={
              <>
                <div className="mb-3">Eine neue Version der App ist verfügbar!</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition active:bg-green-800 cursor-pointer touch-manipulation min-h-[44px] min-w-[44px] pointer-events-auto z-[9999] relative"
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <RefreshCwIcon size={16} /> Aktualisieren
                  </button>
                </div>
              </>
            }
          />
        ),
        {
          duration: Infinity,
          id: 'update-toast',
          dismissible: false,
        }
      );
    } else if (!needRefresh && updateToastShown.current) {
      updateToastShown.current = false;
      toast.dismiss('update-toast');
    }
  }, [needRefresh, updateServiceWorker]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalId.current !== undefined) {
        clearInterval(updateIntervalId.current);
      }
    };
  }, []);
};
