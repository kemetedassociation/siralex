"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { ROLE_LABELS } from "@/lib/labels";

type User = { name?: string | null; role: string };

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const roleHref = user.role === "ADMIN" ? "/admin" : user.role === "ENSEIGNANT" ? "/enseignant" : null;
  const roleLabel = user.role === "ADMIN" ? "Administration" : user.role === "ENSEIGNANT" ? "Espace enseignant" : null;

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded px-2 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
      >
        <span>{user.name} · {ROLE_LABELS[user.role] ?? user.role}</span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full z-30 mt-2 w-56 origin-top-right rounded-lg border border-black/10 bg-white py-1.5 text-sm text-foreground shadow-lg transition duration-150 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <Link href="/tableau-de-bord" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-black/5">
          Tableau de bord
        </Link>
        <Link href="/abonnement" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-black/5">
          Mon abonnement
        </Link>
        {roleHref && (
          <Link href={roleHref} onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-black/5">
            {roleLabel}
          </Link>
        )}
        <div className="my-1.5 border-t border-black/10" />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
