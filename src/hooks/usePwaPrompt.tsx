import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DownloadIcon, ShareIcon, SquarePlusIcon, MoreHorizontal } from 'lucide-react';
import { CustomToast } from '../components/misc/CustomToast';

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const installToastShown = useRef(false);

  // Detect iOS and version once
  const isIosDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
  const isStandalone = 'standalone' in window.navigator && (window.navigator as Record<string, boolean>).standalone;
  const iosVersion = getIosVersion();
  const isIos = isIosDevice && !isStandalone;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      // Zeige Install-Prompt nach 5 Sekunden
      setTimeout(() => setShowInstallPrompt(true), 5000);
    };

    if (isIos) {
      // Zeige Install-Prompt nach 5 Sekunden auch auf iOS
      setTimeout(() => setShowInstallPrompt(true), 5000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIos]);

  useEffect(() => {
    if (showInstallPrompt && !installToastShown.current) {
      installToastShown.current = true;
      toast.custom(
        (t) => (
          <CustomToast
            toastId={t}
            dismissible={isIos}
            message={
              isIos ? (
                iosVersion && iosVersion >= 18 ? (
                  // iOS 18+ (inkl. iOS 26) - neuer, komplizierter Prozess
                  <div className="text-center leading-relaxed">
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
                  <div className="text-center leading-relaxed">
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
