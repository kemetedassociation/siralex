"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type LinkItem = { href: string; label: string };
type User = { name?: string | null; role: string } | null;

export function MobileMenu({
  links,
  roleLink,
  user,
}: {
  links: LinkItem[];
  roleLink?: LinkItem | null;
  user: User;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded transition-colors hover:bg-white/10"
      >
        <span className={`block h-0.5 w-5 rounded bg-white transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block h-0.5 w-5 rounded bg-white transition-opacity duration-150 ${open ? "opacity-0" : "opacity-100"}`} />
        <span className={`block h-0.5 w-5 rounded bg-white transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      <div
        className={`absolute inset-x-0 top-full z-20 overflow-hidden border-b border-black/10 bg-brand-dark shadow-lg transition-[grid-template-rows] duration-300 ease-in-out grid ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <nav id="mobile-nav" aria-label="Menu principal" className="flex min-h-0 flex-col gap-1 overflow-hidden px-4 py-3 text-sm text-white/90">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded px-2 py-2 transition-colors hover:bg-white/10">
              {l.label}
            </Link>
          ))}
          {roleLink && (
            <Link href={roleLink.href} className="rounded px-2 py-2 transition-colors hover:bg-white/10">
              {roleLink.label}
            </Link>
          )}
          <div className="my-1 border-t border-white/15" />
          {user ? (
            <>
              <Link href="/tableau-de-bord" className="rounded px-2 py-2 transition-colors hover:bg-white/10">
                Tableau de bord
              </Link>
              <Link href="/abonnement" className="rounded px-2 py-2 transition-colors hover:bg-white/10">
                Mon abonnement
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded px-2 py-2 text-left text-red-300 transition-colors hover:bg-white/10"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="rounded px-2 py-2 transition-colors hover:bg-white/10">
                Connexion
              </Link>
              <Link href="/inscription" className="rounded bg-gold px-2 py-2 text-center font-medium text-brand-dark">
                S&apos;inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
