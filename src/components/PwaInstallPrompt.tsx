import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { KibsLogo } from './KibsLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __kibsInstallPromptEvent?: BeforeInstallPromptEvent | null;
    __kibsAppInstalled?: boolean;
  }
}

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandaloneMode() || window.__kibsAppInstalled) {
      setInstalled(true);
      return;
    }

    if (window.__kibsInstallPromptEvent) {
      setInstallEvent(window.__kibsInstallPromptEvent);
      setVisible(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__kibsInstallPromptEvent = promptEvent;
      setInstallEvent(promptEvent);
      setVisible(true);
    };

    const handleStoredInstallPrompt = () => {
      if (window.__kibsInstallPromptEvent) {
        setInstallEvent(window.__kibsInstallPromptEvent);
        setVisible(true);
      }
    };

    const handleInstalled = () => {
      window.__kibsAppInstalled = true;
      window.__kibsInstallPromptEvent = null;
      setInstallEvent(null);
      setInstalled(true);
      setVisible(false);
    };

    const handleStandaloneChange = () => {
      if (isStandaloneMode()) {
        handleInstalled();
      }
    };

    const displayModeQuery = window.matchMedia('(display-mode: standalone)');

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('kibs-install-ready', handleStoredInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('kibs-app-installed', handleInstalled);
    displayModeQuery.addEventListener('change', handleStandaloneChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('kibs-install-ready', handleStoredInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('kibs-app-installed', handleInstalled);
      displayModeQuery.removeEventListener('change', handleStandaloneChange);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      setVisible(false);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => undefined);

    if (choice?.outcome === 'accepted') {
      setInstalled(true);
    }

    window.__kibsInstallPromptEvent = null;
    setInstallEvent(null);
    setVisible(false);
  }

  if (installed || !visible || !installEvent) {
    return null;
  }

  return (
    <div className="fixed inset-x-2 bottom-14 z-40 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-center gap-3">
        <KibsLogo variant="badge" badgeSize={44} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-slate-950">Install Kibs Connect</h2>
          <p className="mt-0.5 text-xs leading-snug text-slate-600">
            Add the app to this device for faster field access.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          onClick={() => setVisible(false)}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
      >
        <Download className="h-4 w-4" />
        Install App
      </button>
    </div>
  );
}
