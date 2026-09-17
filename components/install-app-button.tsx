"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // window/navigator only exist client-side, so this can't be a lazy useState initializer.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with browser display-mode on mount
    setInstalled(standalone);

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return { installed, canPrompt: !!deferredPrompt, install };
}

const IOS_HINT =
  "Sur iPhone/iPad : appuyez sur Partager puis «Sur l'écran d'accueil». Sur Chrome desktop/Android : icône d'installation dans la barre d'adresse.";

/** Bouton compact affiché dans l'en-tête (masqué sur petit mobile, le menu burger prend le relais). */
export function InstallAppButton() {
  const { installed, canPrompt, install } = useInstallPrompt();
  const [iosHint, setIosHint] = useState(false);

  if (installed) return null;

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={canPrompt ? install : () => setIosHint((v) => !v)}
        className="flex items-center gap-1.5 rounded border border-gold/50 px-2.5 py-1.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a.75.75 0 01.75.75v8.19l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V2.75A.75.75 0 0110 2z" />
          <path d="M4 13a.75.75 0 01.75.75v2a.75.75 0 00.75.75h9a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0114.5 18h-9A2.25 2.25 0 013.25 15.75v-2A.75.75 0 014 13z" />
        </svg>
        Installer
      </button>
      {iosHint && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-lg border border-black/10 bg-white p-3 text-xs text-foreground shadow-lg">
          {IOS_HINT}
        </div>
      )}
    </div>
  );
}

/** Version pour le menu mobile déroulant : une simple ligne cliquable. */
export function InstallAppMenuItem() {
  const { installed, canPrompt, install } = useInstallPrompt();
  const [iosHint, setIosHint] = useState(false);

  if (installed) return null;

  return (
    <>
      <button
        onClick={canPrompt ? install : () => setIosHint((v) => !v)}
        className="rounded px-2 py-2 text-left text-gold transition-colors hover:bg-white/10"
      >
        Installer l&apos;application
      </button>
      {iosHint && <p className="px-2 pb-1 text-xs text-white/60">{IOS_HINT}</p>}
    </>
  );
}
