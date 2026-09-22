import Link from "next/link";
import type { TypeMethodo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { METHODOLOGY_SLUGS } from "@/lib/methodology-content";

const ORDER: TypeMethodo[] = ["DISSERTATION", "COMMENTAIRE_ARTICLE", "COMMENTAIRE_ARRET", "CAS_PRATIQUE"];

const ICONS: Record<TypeMethodo, string> = {
  DISSERTATION: "📝",
  COMMENTAIRE_ARTICLE: "📜",
  COMMENTAIRE_ARRET: "⚖️",
  CAS_PRATIQUE: "🧩",
};

export default async function MethodologiePage() {
  const guides = await prisma.methodologyGuide.findMany({
    include: { exercises: { select: { id: true } } },
  });
  const byType = new Map(guides.map((g) => [g.type, g]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Méthodologie juridique</h1>
      <p className="mt-2 max-w-2xl text-foreground/70">
        Les quatre exercices classiques du droit — dissertation, commentaire d&apos;article, commentaire
        d&apos;arrêt et cas pratique — avec leur méthode détaillée et un sujet d&apos;entraînement sur
        lequel rédiger, sauvegarder et faire vérifier votre réponse.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ORDER.map((type) => {
          const guide = byType.get(type);
          if (!guide) return null;
          return (
            <Link
              key={type}
              href={`/methodologie/${METHODOLOGY_SLUGS[type]}`}
              className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-brand/40 hover:shadow-sm"
            >
              <span className="text-2xl">{ICONS[type]}</span>
              <h2 className="mt-2 font-serif text-lg font-semibold text-brand-dark">{guide.title}</h2>
              <p className="mt-1 text-sm text-foreground/60">{guide.subtitle}</p>
              <p className="mt-3 text-sm font-medium text-brand">
                {guide.exercises.length > 0 ? "S'entraîner →" : "Voir la méthode →"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
