import type { Niveau } from "@prisma/client";

// Maquettes pédagogiques de licence, découpées en modules (unités
// d'enseignement). Source : documents fournis par l'équipe SiraLex
// (public/programmes/*.pdf), à confirmer avec les maquettes officielles.

export type Module = {
  title: string;
  semestre: 1 | 2;
  matieres: string[];
};

export type Programme = {
  slug: string;
  niveau: Niveau;
  title: string;
  subtitle: string;
  parcours: string[];
  modules: Module[];
  sources: { label: string; href: string }[];
  note?: string;
};

export const PROGRAMMES: Programme[] = [
  {
    slug: "licence-1",
    niveau: "L1",
    title: "Licence 1 Sciences juridiques",
    subtitle:
      "Première année commune Droit privé A / Droit public A, telle qu'enseignée dans les établissements publics.",
    parcours: ["Droit privé A", "Droit public A"],
    modules: [
      {
        title: "Droit public 1",
        semestre: 1,
        matieres: ["Droit constitutionnel", "Institutions internationales", "Travaux dirigés"],
      },
      {
        title: "Droit privé 1",
        semestre: 1,
        matieres: ["Introduction au droit", "Institutions judiciaires", "Travaux dirigés"],
      },
      {
        title: "Histoire 1",
        semestre: 1,
        matieres: ["Histoire des institutions publiques 1", "Histoire des institutions judiciaires"],
      },
      { title: "Outils de base", semestre: 1, matieres: ["Méthodologie juridique"] },
      {
        title: "Droit public 2",
        semestre: 2,
        matieres: ["Droit constitutionnel 2", "Système politique sénégalais", "Travaux dirigés"],
      },
      {
        title: "Droit privé 2",
        semestre: 2,
        matieres: ["Droit des personnes et de la famille", "Introduction au droit OHADA", "Travaux dirigés"],
      },
      {
        title: "Histoire et science politique 2",
        semestre: 2,
        matieres: ["Histoire des institutions publiques 2", "Introduction à la science politique"],
      },
    ],
    sources: [{ label: "Maquette L1 (PDF)", href: "/programmes/licence-1.pdf" }],
    note: "Reconstitué à partir d'un relevé de notes : à confirmer avec la maquette officielle de la faculté.",
  },
  {
    slug: "licence-3",
    niveau: "L3",
    title: "Licence 3 Droit privé / Droit public A",
    subtitle:
      "Tronc commun de troisième année, selon les emplois du temps de cours magistraux 2025-2026. Tous les modules sont ouverts aux deux parcours.",
    parcours: ["Droit privé", "Droit public A"],
    modules: [
      {
        title: "Droit social et langues",
        semestre: 1,
        matieres: ["Droit du travail", "Relations individuelles de travail", "Protection sociale", "Anglais juridique"],
      },
      {
        title: "Carrières des affaires",
        semestre: 1,
        matieres: ["Droit des sûretés", "Entreprise individuelle", "Droit judiciaire privé", "Voies d'exécution"],
      },
      {
        title: "Droit public et science politique",
        semestre: 1,
        matieres: [
          "Droit international public I",
          "Droit administratif III",
          "Contentieux constitutionnel",
          "Systèmes politiques africains",
        ],
      },
      {
        title: "Carrières judiciaires",
        semestre: 2,
        matieres: [
          "Droit des groupements d'affaires",
          "Relations collectives de travail",
          "Droit spécial des contrats",
          "Droit pénal spécial",
          "Politique criminelle",
          "Contentieux administratif",
          "Droit musulman",
          "Histoire du droit privé",
        ],
      },
    ],
    sources: [
      { label: "Maquette L3 Droit privé (PDF)", href: "/programmes/licence-3-droit-prive.pdf" },
      { label: "Maquette L3 Droit public A (PDF)", href: "/programmes/licence-3-droit-public.pdf" },
    ],
  },
];

export function getProgramme(slug: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.slug === slug);
}
