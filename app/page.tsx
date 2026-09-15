import Link from "next/link";

const PILIERS = [
  {
    title: "Formation",
    desc: "Cours structurés par niveau, matière et filière, validés par le comité scientifique avant publication.",
    href: "/formation",
  },
  {
    title: "Documentation",
    desc: "Textes juridiques et jurisprudence indexés, avec alertes de veille et export des références.",
    href: "/documentation",
  },
  {
    title: "Examens",
    desc: "QCM, cas pratiques et annales en conditions réelles, corrigés par des enseignants habilités.",
    href: "/examens",
  },
  {
    title: "Communauté",
    desc: "Fils de discussion par matière et promotion, modérés par l'équipe SiraLex.",
    href: "/communaute",
  },
  {
    title: "Professionnalisation",
    desc: "Offres de stage, d'emploi et de mentorat entre étudiants et professionnels.",
    href: "/carrieres",
  },
];

export default function Home() {
  return (
    <div>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="mb-3 animate-fade-in-up text-sm uppercase tracking-wide text-gold">
            LegalTech — Sénégal &amp; espace OHADA
          </p>
          <h1 className="max-w-2xl animate-fade-in-up font-serif text-4xl font-semibold leading-tight sm:text-5xl [animation-delay:80ms]">
            La voie du droit en Afrique francophone
          </h1>
          <p className="mt-5 max-w-xl animate-fade-in-up text-white/85 [animation-delay:160ms]">
            SiraLex rassemble en un seul environnement les ressources pédagogiques, les textes
            juridiques, la jurisprudence et les outils dont ont besoin étudiants, enseignants et
            professionnels du droit.
          </p>
          <div className="mt-8 flex animate-fade-in-up flex-wrap gap-3 [animation-delay:240ms]">
            <Link
              href="/inscription"
              className="rounded bg-gold px-5 py-2.5 font-medium text-brand-dark hover:-translate-y-0.5 hover:brightness-95"
            >
              Créer un compte
            </Link>
            <Link
              href="/tarifs"
              className="rounded border border-white/30 px-5 py-2.5 font-medium hover:-translate-y-0.5 hover:bg-white/10"
            >
              Voir les formules
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-2xl font-semibold text-brand-dark">Cinq piliers</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PILIERS.map((p, i) => (
            <Link
              key={p.title}
              href={p.href}
              style={{ animationDelay: `${i * 60}ms` }}
              className="card-lift animate-fade-in-up rounded-lg border border-black/10 bg-white p-5 hover:border-brand"
            >
              <h3 className="font-semibold text-brand-dark">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-black/10 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-2xl font-semibold text-brand-dark">Déploiement par phases</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { phase: "Phase 1", zone: "Sénégal", desc: "Lancement et validation du modèle" },
              { phase: "Phase 2", zone: "Sénégal", desc: "Partenariats universitaires" },
              { phase: "Phase 3", zone: "Espace OHADA", desc: "Extension aux pays membres" },
              { phase: "Phase 4", zone: "Afrique francophone", desc: "Déploiement à grande échelle" },
            ].map((p) => (
              <div key={p.phase} className="card-lift rounded-lg bg-background p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold">{p.phase}</p>
                <p className="mt-1 font-semibold text-brand-dark">{p.zone}</p>
                <p className="mt-1 text-sm text-foreground/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
