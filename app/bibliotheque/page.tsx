import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TEXT_TYPE_LABELS } from "@/lib/labels";
import { METHODOLOGY_SLUGS } from "@/lib/methodology-content";
import { PROGRAMMES } from "@/lib/programmes";

// Une étagère par grande matière ; chaque ouvrage reçoit la couleur de son
// étagère sur sa tranche, comme dans une bibliothèque physique.
const SHELVES: { matiere: string; color: string }[] = [
  { matiere: "Droit public et administratif", color: "#123a5e" },
  { matiere: "Droit civil et des affaires", color: "#7a2e2e" },
  { matiere: "Droit pénal", color: "#3d3d3d" },
  { matiere: "Droit social", color: "#2f5d3a" },
  { matiere: "Fiscalité et affaires", color: "#5b4a1f" },
  { matiere: "Droit OHADA", color: "#b8873a" },
];
const FALLBACK_COLOR = "#4a5568";

const COLLECTIONS = ["Sénégal", "OHADA"];

export default async function BibliothequePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; collection?: string }>;
}) {
  const { q, collection } = await searchParams;

  const [texts, guides] = await Promise.all([
    prisma.legalText.findMany({
      where: {
        ...(collection ? { juridiction: collection } : {}),
        ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        title: true,
        type: true,
        matiere: true,
        juridiction: true,
        reference: true,
        fiable: true,
        sourcePdfUrl: true,
      },
      orderBy: [{ datePublication: "asc" }],
    }),
    collection
      ? Promise.resolve([])
      : prisma.methodologyGuide.findMany({
          where: q ? { title: { contains: q, mode: "insensitive" } } : {},
          select: { id: true, type: true, title: true, subtitle: true },
        }),
  ]);

  const known = new Set(SHELVES.map((s) => s.matiere));
  const shelves = [
    ...SHELVES.map((s) => ({ ...s, items: texts.filter((t) => t.matiere === s.matiere) })),
    { matiere: "Autres textes", color: FALLBACK_COLOR, items: texts.filter((t) => !known.has(t.matiere)) },
  ].filter((s) => s.items.length > 0);

  // Les maquettes de licence ne relèvent d'aucune collection juridique.
  const programmes = collection
    ? []
    : PROGRAMMES.filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()));

  const total = texts.length + guides.length + programmes.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Bibliothèque</h1>
      <p className="mt-1 max-w-2xl text-foreground/60">
        Tous les ouvrages de SiraLex réunis au même endroit : codes, Constitution et actes uniformes
        OHADA en texte intégral, avec leur PDF d&apos;origine, ainsi que les guides de méthodologie.
      </p>

      <form className="mt-6 flex flex-wrap gap-3 text-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un ouvrage…"
          className="w-64 rounded border border-black/15 px-3 py-2"
        />
        <select name="collection" defaultValue={collection ?? ""} className="rounded border border-black/15 px-3 py-2">
          <option value="">Toutes les collections</option>
          {COLLECTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
          Rechercher
        </button>
        {(q || collection) && (
          <Link href="/bibliotheque" className="self-center text-brand hover:underline">
            Tout afficher
          </Link>
        )}
      </form>

      <p className="mt-4 text-sm text-foreground/50">
        {total} ouvrage{total > 1 ? "s" : ""}
      </p>

      <div className="mt-6 space-y-10">
        {shelves.map((shelf) => (
          <section key={shelf.matiere}>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-dark">
              <span className="inline-block h-4 w-1.5 rounded-sm" style={{ backgroundColor: shelf.color }} />
              {shelf.matiere}
              <span className="text-sm font-normal text-foreground/40">({shelf.items.length})</span>
            </h2>
            <div className="mt-3 grid gap-4 border-b-4 border-brand-dark/15 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {shelf.items.map((t) => (
                <div
                  key={t.id}
                  className="card-lift flex overflow-hidden rounded-md border border-black/10 bg-white shadow-sm"
                >
                  <div className="w-3 shrink-0" style={{ backgroundColor: shelf.color }} aria-hidden />
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                      {TEXT_TYPE_LABELS[t.type]} · {t.juridiction}
                    </span>
                    <h3 className="mt-1 font-serif font-semibold leading-snug text-brand-dark">{t.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{t.reference}</p>
                    {!t.fiable && (
                      <span className="mt-2 self-start rounded bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
                        Extrait par OCR — à vérifier
                      </span>
                    )}
                    <div className="mt-auto flex flex-wrap gap-2 pt-4 text-sm">
                      <Link
                        href={`/documentation/textes/${t.id}`}
                        className="rounded bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-dark"
                      >
                        Lire
                      </Link>
                      {t.sourcePdfUrl && (
                        <a
                          href={t.sourcePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded border border-black/15 px-3 py-1.5 text-foreground/70 hover:bg-black/5"
                        >
                          PDF original
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {guides.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-dark">
              <span className="inline-block h-4 w-1.5 rounded-sm bg-brand" />
              Guides de méthodologie
              <span className="text-sm font-normal text-foreground/40">({guides.length})</span>
            </h2>
            <div className="mt-3 grid gap-4 border-b-4 border-brand-dark/15 pb-4 sm:grid-cols-2 lg:grid-cols-4">
              {guides.map((g) => (
                <Link
                  key={g.id}
                  href={`/methodologie/${METHODOLOGY_SLUGS[g.type]}`}
                  className="card-lift flex overflow-hidden rounded-md border border-black/10 bg-white shadow-sm hover:border-brand"
                >
                  <div className="w-3 shrink-0 bg-brand" aria-hidden />
                  <div className="p-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">Méthodologie</span>
                    <h3 className="mt-1 font-serif font-semibold leading-snug text-brand-dark">{g.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{g.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {programmes.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-dark">
              <span className="inline-block h-4 w-1.5 rounded-sm bg-gold" />
              Programmes de licence
              <span className="text-sm font-normal text-foreground/40">({programmes.length})</span>
            </h2>
            <div className="mt-3 grid gap-4 border-b-4 border-brand-dark/15 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {programmes.map((p) => (
                <div
                  key={p.slug}
                  className="card-lift flex overflow-hidden rounded-md border border-black/10 bg-white shadow-sm"
                >
                  <div className="w-3 shrink-0 bg-gold" aria-hidden />
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                      Maquette · {p.modules.length} modules
                    </span>
                    <h3 className="mt-1 font-serif font-semibold leading-snug text-brand-dark">{p.title}</h3>
                    <div className="mt-auto flex flex-wrap gap-2 pt-4 text-sm">
                      <Link
                        href={`/formation/programmes/${p.slug}`}
                        className="rounded bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-dark"
                      >
                        Voir les modules
                      </Link>
                      {p.sources.map((s) => (
                        <a
                          key={s.href}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded border border-black/15 px-3 py-1.5 text-foreground/70 hover:bg-black/5"
                        >
                          {s.label.replace("Maquette ", "")}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {total === 0 && <p className="text-foreground/60">Aucun ouvrage ne correspond à cette recherche.</p>}
      </div>
    </div>
  );
}
