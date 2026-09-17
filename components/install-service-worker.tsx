"use client";

import { useEffect } from "react";

export function InstallServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Enregistrement non critique : l'application fonctionne normalement sans.
      });
    }
  }, []);

  return null;
}
