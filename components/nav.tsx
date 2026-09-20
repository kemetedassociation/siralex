import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";
import { MobileMenu } from "@/components/mobile-menu";
import { InstallAppButton } from "@/components/install-app-button";

const PUBLIC_LINKS = [
  { href: "/formation", label: "Formation" },
  { href: "/documentation", label: "Documentation" },
  { href: "/communaute", label: "Communauté" },
  { href: "/carrieres", label: "Carrières" },
  { href: "/tarifs", label: "Tarifs" },
];

export async function Nav() {
  const session = await getSession();
  const user = session?.user;

  const roleLink =
    user?.role === "ADMIN"
      ? { href: "/admin", label: "Administration" }
      : user?.role === "ENSEIGNANT"
        ? { href: "/enseignant", label: "Espace enseignant" }
        : null;

  return (
    <header className="relative bg-brand-dark text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Image src="/logo-badge.png" alt="SiraLex" width={32} height={32} className="h-8 w-8" priority />
          SiraLex
        </Link>

        <nav className="hidden flex-1 items-center gap-5 text-sm text-white/85 md:flex">
          {PUBLIC_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
          {roleLink && (
            <Link href={roleLink.href} className="transition-colors hover:text-white">
              {roleLink.label}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <InstallAppButton />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/connexion" className="text-white/85 transition-colors hover:text-white">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded bg-gold px-3 py-1.5 font-medium text-brand-dark transition hover:brightness-95"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
          <MobileMenu links={PUBLIC_LINKS} roleLink={roleLink} user={user ?? null} />
        </div>
      </div>
    </header>
  );
}
