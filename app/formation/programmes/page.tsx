import Link from "next/link";
import { NIVEAU_LABELS } from "@/lib/labels";
import { PROGRAMMES } from "@/lib/programmes";

export default function ProgrammesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/formation" className="text-sm text-brand hover:underline">
        ← Retour au catalogue
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-brand-dark">Programmes de licence</h1>
      <p className="mt-1 max-w-2xl text-foreground/60">
        Les maquettes de licence découpées en modules : choisissez votre année pour retrouver les matières
        de chaque semestre et les cours SiraLex correspondants.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PROGRAMMES.map((p) => (
          <Link
            key={p.slug}
            href={`/formation/programmes/${p.slug}`}
            className="card-lift flex flex-col rounded-lg border border-black/10 bg-white p-5 hover:border-brand"
          >
            <span className="self-start rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
              {NIVEAU_LABELS[p.niveau]}
            </span>
            <h2 className="mt-3 font-serif text-lg font-semibold text-brand-dark">{p.title}</h2>
            <p className="mt-1 text-sm text-foreground/60">{p.subtitle}</p>
            <p className="mt-3 text-xs text-foreground/50">
              {p.modules.length} modules · Parcours {p.parcours.join(" et ")}
            </p>
            <p className="mt-3 text-sm font-medium text-brand">Voir les modules →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
