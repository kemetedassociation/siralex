import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TEXT_TYPE_LABELS } from "@/lib/labels";
import { toggleFavoriteText, subscribeAlert } from "@/lib/actions/documentation";
import { createNote, deleteNote } from "@/lib/actions/notes";
import { CopyReferenceButton } from "@/components/copy-reference-button";
import { extractHeadings, segmentContent } from "@/lib/legal-structure";

const HEADING_TAG = ["h2", "h2", "h3", "h4", "h5"] as const;
const HEADING_CLASS = [
  "",
  "mt-8 text-xl font-serif font-semibold text-brand-dark",
  "mt-6 text-lg font-serif font-semibold text-brand-dark",
  "mt-5 font-semibold text-brand-dark",
  "mt-4 font-medium text-brand-dark",
];

export default async function LegalTextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const text = await prisma.legalText.findUnique({ where: { id } });
  if (!text) notFound();

  const session = await getSession();
  let isFavorite = false;
  let hasAlert = false;
  let notes: { id: string; content: string; createdAt: Date }[] = [];
  if (session?.user) {
    isFavorite = !!(await prisma.favorite.findFirst({ where: { userId: session.user.id, legalTextId: id } }));
    hasAlert = !!(await prisma.alert.findFirst({ where: { userId: session.user.id, legalTextId: id } }));
    notes = await prisma.note.findMany({
      where: { userId: session.user.id, legalTextId: id },
      orderBy: { createdAt: "desc" },
    });
  }

  const reference = `${text.title}, ${TEXT_TYPE_LABELS[text.type]}, ${text.juridiction}, réf. ${text.reference} (mis à jour le ${text.dateMajRecente.toLocaleDateString("fr-FR")})`;

  const headings = extractHeadings(text.content);
  const segments = segmentContent(text.content, headings);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/documentation" className="text-sm text-brand hover:underline">
        ← Retour à la documentation
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {headings.length > 0 && (
            <div className="rounded-lg border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">Sommaire</p>
              <nav className="mt-2 max-h-[60vh] overflow-y-auto text-sm">
                <ul className="space-y-1">
                  {headings.map((h) => (
                    <li key={h.id} style={{ paddingLeft: (h.level - 1) * 10 }}>
                      <a href={`#${h.id}`} className="block truncate text-foreground/70 hover:text-brand hover:underline">
                        {h.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}

          {session?.user && (
            <div className="rounded-lg border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Mes notes ({notes.length})
              </p>
              <form action={createNote} className="mt-3 space-y-2">
                <input type="hidden" name="legalTextId" value={text.id} />
                <textarea
                  name="content"
                  required
                  rows={3}
                  placeholder="Pense-bête, rappel d'article…"
                  className="w-full rounded border border-black/15 px-2 py-1.5 text-sm"
                />
                <button className="w-full rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">
                  Ajouter
                </button>
              </form>
              {notes.length > 0 && (
                <ul className="mt-4 space-y-3 border-t border-black/10 pt-3">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded bg-gold/10 p-2 text-sm">
                      <p className="whitespace-pre-line text-foreground/80">{n.content}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-foreground/40">
                          {n.createdAt.toLocaleDateString("fr-FR")}
                        </span>
                        <form action={deleteNote}>
                          <input type="hidden" name="noteId" value={n.id} />
                          <input type="hidden" name="legalTextId" value={text.id} />
                          <button className="text-xs text-foreground/40 hover:text-red-600">Supprimer</button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
              {TEXT_TYPE_LABELS[text.type]}
            </span>
            <span className="text-foreground/50">{text.matiere}</span>
            <span className="text-foreground/50">· {text.juridiction}</span>
          </div>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-dark">{text.title}</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Référence {text.reference} · publié le {text.datePublication.toLocaleDateString("fr-FR")} ·
            dernière mise à jour le {text.dateMajRecente.toLocaleDateString("fr-FR")}
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

          <article className="prose-course mt-8 max-w-none text-foreground/90">
            {segments.map((seg, i) =>
              seg.type === "heading" ? (
                (() => {
                  const Tag = HEADING_TAG[seg.level] ?? "h2";
                  return (
                    <Tag key={i} id={seg.id} className={`scroll-mt-6 ${HEADING_CLASS[seg.level] ?? ""}`}>
                      {seg.text}
                    </Tag>
                  );
                })()
              ) : (
                <div key={i} className="whitespace-pre-line">
                  {seg.text}
                </div>
              )
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
