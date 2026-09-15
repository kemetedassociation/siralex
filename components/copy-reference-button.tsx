"use client";

import { useState } from "react";

export function CopyReferenceButton({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex gap-2">
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // clipboard indisponible dans ce contexte
          }
        }}
        className="rounded border border-black/15 px-3 py-1.5 hover:bg-black/5"
      >
        {copied ? "Référence copiée ✓" : "Copier la référence"}
      </button>
      <button onClick={() => window.print()} className="rounded border border-black/15 px-3 py-1.5 hover:bg-black/5">
        Exporter (PDF)
      </button>
    </div>
  );
}
