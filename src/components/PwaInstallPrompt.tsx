import React, { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
    if (isStandaloneMode()) {
      setInstalled(true);
      return;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 1200);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const helperText = useMemo(() => {
    if (installEvent) {
      return 'Install Kibs Connect on this device for faster field access.';
    }

    return 'Install from your browser menu if the native prompt is not shown.';
  }, [installEvent]);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice.catch(() => undefined);
    setInstallEvent(null);
    setVisible(false);
  }

  if (installed || !visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-2 bottom-14 z-40 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-center gap-3">
        <img
          src="/kibs-logo-mobile.png"
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-slate-950">Install Kibs Connect</h2>
          <p className="mt-0.5 text-xs leading-snug text-slate-600">{helperText}</p>
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
        disabled={!installEvent}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-kibs-deepGreen px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-600"
      >
        <Download className="h-4 w-4" />
        Install App
      </button>
    </div>
  );
}
