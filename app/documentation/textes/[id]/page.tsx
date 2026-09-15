import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TEXT_TYPE_LABELS } from "@/lib/labels";
import { toggleFavoriteText, subscribeAlert } from "@/lib/actions/documentation";
import { CopyReferenceButton } from "@/components/copy-reference-button";

export default async function LegalTextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const text = await prisma.legalText.findUnique({ where: { id } });
  if (!text) notFound();

  const session = await getSession();
  let isFavorite = false;
  let hasAlert = false;
  if (session?.user) {
    isFavorite = !!(await prisma.favorite.findFirst({ where: { userId: session.user.id, legalTextId: id } }));
    hasAlert = !!(await prisma.alert.findFirst({ where: { userId: session.user.id, legalTextId: id } }));
  }

  const reference = `${text.title}, ${TEXT_TYPE_LABELS[text.type]}, ${text.juridiction}, réf. ${text.reference} (mis à jour le ${text.dateMajRecente.toLocaleDateString("fr-FR")})`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/documentation" className="text-sm text-brand hover:underline">
        ← Retour à la documentation
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
          {TEXT_TYPE_LABELS[text.type]}
        </span>
        <span className="text-foreground/50">{text.matiere}</span>
        <span className="text-foreground/50">· {text.juridiction}</span>
      </div>

      <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-dark">{text.title}</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Référence {text.reference} · publié le {text.datePublication.toLocaleDateString("fr-FR")} · dernière
        mise à jour le {text.dateMajRecente.toLocaleDateString("fr-FR")}
      </p>

      {session?.user && (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <CopyReferenceButton reference={reference} />
          <form action={toggleFavoriteText}>
            <input type="hidden" name="legalTextId" value={text.id} />
            <button className="rounded border border-black/15 px-3 py-1.5 hover:bg-black/5">
              {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
            </button>
          </form>
          <form action={subscribeAlert}>
            <input type="hidden" name="legalTextId" value={text.id} />
            <button
              disabled={hasAlert}
              className="rounded border border-black/15 px-3 py-1.5 hover:bg-black/5 disabled:opacity-50"
            >
              {hasAlert ? "Alerte activée ✓" : "Activer une alerte de mise à jour"}
            </button>
          </form>
        </div>
      )}

      <article className="prose-course mt-8 max-w-none whitespace-pre-line text-foreground/90">
        {text.content}
      </article>
    </div>
  );
}
