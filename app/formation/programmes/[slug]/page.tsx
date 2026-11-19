import Link from "next/link";
import { notFound } from "next/navigation";
import { NIVEAU_LABELS } from "@/lib/labels";
import { getProgramme } from "@/lib/programmes";

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = getProgramme(slug);
  if (!programme) notFound();

  const semestres = ([1, 2] as const)
    .map((s) => ({ semestre: s, modules: programme.modules.filter((m) => m.semestre === s) }))
    .filter((s) => s.modules.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/formation/programmes" className="text-sm text-brand hover:underline">
        ← Tous les programmes
      </Link>

      <span className="mt-4 inline-block rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
        {NIVEAU_LABELS[programme.niveau]}
      </span>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-dark">{programme.title}</h1>
      <p className="mt-1 max-w-3xl text-foreground/60">{programme.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {programme.parcours.map((p) => (
          <span key={p} className="rounded-full border border-gold/50 bg-gold/10 px-3 py-1 font-medium text-brand-dark">
            Parcours {p}
          </span>
        ))}
      </div>

      {semestres.map(({ semestre, modules }) => (
        <section key={semestre} className="mt-10">
          <h2 className="border-b border-gold/60 pb-2 font-serif text-xl font-semibold text-brand-dark">
            Semestre {semestre}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {modules.map((m) => (
              <div key={m.title} className="rounded-lg border border-black/10 bg-white p-5">
                <h3 className="font-semibold text-brand-dark">{m.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {m.matieres.map((matiere) => (
                    <li key={matiere}>
                      <Link
                        href={`/formation?niveau=${programme.niveau}&q=${encodeURIComponent(matiere)}`}
                        className="text-foreground/80 hover:text-brand hover:underline"
                      >
                        – {matiere}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-10 rounded-lg border border-black/10 bg-white p-5 text-sm">
        <h2 className="font-semibold text-brand-dark">Documents sources</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {programme.sources.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-black/15 px-3 py-1.5 text-foreground/70 hover:bg-black/5"
            >
              {s.label}
            </a>
          ))}
        </div>
        {programme.note && <p className="mt-3 text-xs text-foreground/50">{programme.note}</p>}
      </div>
    </div>
  );
}
