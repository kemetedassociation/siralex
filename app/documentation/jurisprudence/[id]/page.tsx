import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toggleFavoriteJurisprudence } from "@/lib/actions/documentation";
import { CopyReferenceButton } from "@/components/copy-reference-button";

export default async function JurisprudencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await prisma.jurisprudence.findUnique({ where: { id } });
  if (!decision) notFound();

  const session = await getSession();
  let isFavorite = false;
  if (session?.user) {
    isFavorite = !!(await prisma.favorite.findFirst({
      where: { userId: session.user.id, jurisprudenceId: id },
    }));
  }

  const reference = `${decision.title}, ${decision.juridiction}, ${decision.date.toLocaleDateString("fr-FR")}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/documentation?onglet=jurisprudence" className="text-sm text-brand hover:underline">
        ← Retour à la documentation
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">{decision.juridiction}</span>
        <span className="text-foreground/50">{decision.matiere}</span>
      </div>

      <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-dark">{decision.title}</h1>
      <p className="mt-2 text-sm text-foreground/60">
        {decision.date.toLocaleDateString("fr-FR")} · mots-clés : {decision.keywords}
      </p>

      {session?.user && (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <CopyReferenceButton reference={reference} />
          <form action={toggleFavoriteJurisprudence}>
            <input type="hidden" name="jurisprudenceId" value={decision.id} />
            <button className="rounded border border-black/15 px-3 py-1.5 hover:bg-black/5">
              {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 rounded border border-black/10 bg-white p-4 text-sm">
        <p className="font-medium text-brand-dark">Résumé</p>
        <p className="mt-1 text-foreground/70">{decision.summary}</p>
      </div>

      <article className="prose-course mt-8 max-w-none whitespace-pre-line text-foreground/90">
        {decision.content}
      </article>
    </div>
  );
}
