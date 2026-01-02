import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DownloadIcon, ShareIcon, SquarePlusIcon, MoreHorizontal, XIcon } from 'lucide-react';
import { CustomToast } from '../components/misc/CustomToast';

// Hilfsfunktion zur Erkennung der iOS-Version
const getIosVersion = (): number | null => {
  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};

export const usePwaPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [iosVersion, setIosVersion] = useState<number | null>(null);
  const installToastShown = useRef(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
      // Zeige Install-Prompt nach 5 Sekunden
      setTimeout(() => setShowInstallPrompt(true), 5000);
    };

    const userAgent = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isStandalone = 'standalone' in window.navigator && (window.navigator as any).standalone;
    const version = getIosVersion();

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      setIosVersion(version);
      // Zeige Install-Prompt nach 5 Sekunden auch auf iOS
      setTimeout(() => setShowInstallPrompt(true), 5000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (showInstallPrompt && !installToastShown.current) {
      installToastShown.current = true;
      toast.custom(
        (t) => (
          <CustomToast
            message={
              isIos ? (
                iosVersion && iosVersion >= 18 ? (
                  // iOS 18+ (inkl. iOS 26) - neuer, komplizierter Prozess
                  <div className="relative text-center leading-relaxed">
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        installToastShown.current = false;
                        setShowInstallPrompt(false);
                      }}
                      className="absolute -top-3 -left-3 p-1 rounded-full transition-colors"
                      type="button"
                      aria-label="Schließen"
                    >
                      <XIcon size={16} />
                    </button>
                    <div className="mb-2 font-semibold">Um die App zu installieren:</div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <MoreHorizontal size={16} />
                      </span>
                      →
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-200 dark:bg-blue-600 rounded">
                        <ShareIcon size={16} />
                      </span>
                      →
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <MoreHorizontal size={16} />
                      </span>
                      "Mehr"
                      →
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-green-200 dark:bg-green-600 rounded">
                        <SquarePlusIcon size={16} />
                      </span>
                    </div>
                    <div className="mt-2 text-sm">"Zum Home-Bildschirm"</div>
                  </div>
                ) : (
                  // iOS < 18 - alter, einfacherer Prozess
                  <div className="relative text-center leading-relaxed">
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        installToastShown.current = false;
                        setShowInstallPrompt(false);
                      }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      type="button"
                      aria-label="Schließen"
                    >
                      <XIcon size={16} />
                    </button>
                    <div className="mb-2 font-semibold">Um die App zu installieren:</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-200 dark:bg-blue-600 rounded">
                        <ShareIcon size={16} />
                      </span>
                      →
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-green-200 dark:bg-green-600 rounded">
                        <SquarePlusIcon size={16} />
                      </span>
                    </div>
                    <div className="mt-2 text-sm">"Zum Home-Bildschirm"</div>
                  </div>
                )
              ) : (
                <>
                  <div className="mb-3">Möchtest du die App installieren?</div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        if (installPrompt) {
                          installPrompt.prompt();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                      type="button"
                    >
                      <DownloadIcon size={16} />
                      Installieren
                    </button>
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        installToastShown.current = false;
                        setShowInstallPrompt(false);
                      }}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                      type="button"
                    >
                      Später
                    </button>
                  </div>
                </>
              )
            }
          />
        ),
        {
          duration: Infinity,
          id: 'pwa-toast',
          dismissible: isIos,
        }
      );
    } else if (!showInstallPrompt && installToastShown.current) {
      installToastShown.current = false;
      toast.dismiss('pwa-toast');
    }
  }, [showInstallPrompt, isIos, iosVersion, installPrompt]);
};
