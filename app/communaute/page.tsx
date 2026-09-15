import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function CommunautePage() {
  const session = await getSession();

  const threads = await prisma.forumThread.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, posts: { select: { id: true } } },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-brand-dark">Communauté</h1>
          <p className="mt-1 text-foreground/60">Échangez par matière ou par promotion.</p>
        </div>
        {session?.user ? (
          <Link href="/communaute/nouveau" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Nouveau fil
          </Link>
        ) : (
          <Link href="/connexion" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Se connecter
          </Link>
        )}
      </div>

      <div className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {threads.map((t) => (
          <Link key={t.id} href={`/communaute/${t.id}`} className="block p-4 hover:bg-black/[0.02]">
            <div className="flex items-center gap-2 text-xs text-foreground/50">
              {t.matiere && <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">{t.matiere}</span>}
              {t.promotion && <span>{t.promotion}</span>}
              <span>· {t.createdAt.toLocaleDateString("fr-FR")}</span>
            </div>
            <h3 className="mt-1 font-semibold text-brand-dark">{t.title}</h3>
            <p className="mt-1 text-sm text-foreground/60">
              Par {t.author.name} · {t.posts.length} message{t.posts.length > 1 ? "s" : ""}
            </p>
          </Link>
        ))}
        {threads.length === 0 && <p className="p-6 text-foreground/60">Aucun fil pour le moment.</p>}
      </div>
    </div>
  );
}
