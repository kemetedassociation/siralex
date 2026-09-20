import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { TEXT_TYPE_LABELS } from "@/lib/labels";

const MATIERE_ORDER = [
  "Droit civil et des affaires",
  "Droit pénal",
  "Droit social",
  "Fiscalité et affaires",
  "Droit public et administratif",
  "Droit OHADA",
];

export default async function DocumentationPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string; q?: string; type?: string; matiere?: string }>;
}) {
  const { onglet = "textes", q, type, matiere } = await searchParams;
  const session = await getSession();

  const texts =
    onglet === "textes"
      ? await prisma.legalText.findMany({
          where: {
            ...(type ? { type: type as never } : {}),
            ...(matiere ? { matiere } : {}),
            ...(q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {}),
          },
          orderBy: [{ matiere: "asc" }, { datePublication: "asc" }],
          include: { favorites: session?.user ? { where: { userId: session.user.id } } : false },
        })
      : [];

  const isFiltered = Boolean(q || type || matiere);
  const groupedTexts = isFiltered
    ? null
    : MATIERE_ORDER.map((m) => ({ matiere: m, items: texts.filter((t) => t.matiere === m) }))
        .filter((g) => g.items.length > 0)
        .concat(
          (() => {
            const known = new Set(MATIERE_ORDER);
            const rest = texts.filter((t) => !known.has(t.matiere));
            return rest.length > 0 ? [{ matiere: "Autres", items: rest }] : [];
          })()
        );

  const decisions =
    onglet === "jurisprudence"
      ? await prisma.jurisprudence.findMany({
          where: {
            ...(matiere ? { matiere } : {}),
            ...(q
              ? {
                  OR: [
                    { title: { contains: q } },
                    { summary: { contains: q } },
                    { keywords: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { date: "desc" },
          include: { favorites: session?.user ? { where: { userId: session.user.id } } : false },
        })
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Documentation juridique</h1>
      <p className="mt-1 text-foreground/60">
        Textes officiels et jurisprudence — Sénégal &amp; espace OHADA.
      </p>

      <div className="mt-6 flex gap-2 text-sm">
        <Link
          href="/documentation?onglet=textes"
          className={`rounded px-3 py-1.5 ${onglet !== "jurisprudence" ? "bg-brand text-white" : "bg-white text-foreground/70 border border-black/10"}`}
        >
          Textes
        </Link>
        <Link
          href="/documentation?onglet=jurisprudence"
          className={`rounded px-3 py-1.5 ${onglet === "jurisprudence" ? "bg-brand text-white" : "bg-white text-foreground/70 border border-black/10"}`}
        >
          Jurisprudence
        </Link>
      </div>

      <form className="mt-4 flex flex-wrap gap-3 text-sm">
        <input type="hidden" name="onglet" value={onglet} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Mot-clé, référence…"
          className="w-64 rounded border border-black/15 px-3 py-2"
        />
        {onglet !== "jurisprudence" && (
          <select name="type" defaultValue={type ?? ""} className="rounded border border-black/15 px-3 py-2">
            <option value="">Tous types</option>
            {Object.entries(TEXT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        )}
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
          Rechercher
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {onglet !== "jurisprudence" && groupedTexts && (
          <>
            {groupedTexts.map((group) => (
              <section key={group.matiere}>
                <h2 className="font-serif text-lg font-semibold text-brand-dark">{group.matiere}</h2>
                <div className="mt-3 space-y-3">
                  {group.items.map((t) => (
                    <TextCard key={t.id} t={t} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {onglet !== "jurisprudence" &&
          !groupedTexts &&
          texts.map((t) => <TextCard key={t.id} t={t} />)}

        {onglet === "jurisprudence" &&
          decisions.map((d) => (
            <Link
              key={d.id}
              href={`/documentation/jurisprudence/${d.id}`}
              className="card-lift block rounded-lg border border-black/10 bg-white p-4 hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand">{d.juridiction}</span>
                <span className="text-xs text-foreground/50">{d.date.toLocaleDateString("fr-FR")}</span>
              </div>
              <h3 className="mt-1 font-semibold text-brand-dark">{d.title}</h3>
              <p className="mt-1 text-sm text-foreground/60">{d.matiere}</p>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{d.summary}</p>
            </Link>
          ))}

        {onglet !== "jurisprudence" && texts.length === 0 && (
          <p className="text-foreground/60">Aucun texte ne correspond à cette recherche.</p>
        )}
        {onglet === "jurisprudence" && decisions.length === 0 && (
          <p className="text-foreground/60">Aucune décision ne correspond à cette recherche.</p>
        )}
      </div>
    </div>
  );
}

type LegalTextRow = Awaited<ReturnType<typeof prisma.legalText.findMany>>[number];

function TextCard({ t }: { t: LegalTextRow }) {
  return (
    <Link
      href={`/documentation/textes/${t.id}`}
      className="card-lift block rounded-lg border border-black/10 bg-white p-4 hover:border-brand"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand">{TEXT_TYPE_LABELS[t.type]}</span>
        <span className="text-xs text-foreground/50">
          Mis à jour le {t.dateMajRecente.toLocaleDateString("fr-FR")}
        </span>
      </div>
      <h3 className="mt-1 font-semibold text-brand-dark">{t.title}</h3>
      <p className="mt-1 text-sm text-foreground/60">
        {t.matiere} · {t.juridiction} · réf. {t.reference}
      </p>
      {t.fiable ? (
        <span className="mt-2 inline-block rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          Contenu validé
        </span>
      ) : (
        <span className="mt-2 inline-block rounded bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
          Extrait par OCR — à vérifier
        </span>
      )}
    </Link>
  );
}
