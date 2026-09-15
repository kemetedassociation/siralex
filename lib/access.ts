import type { Niveau } from "@prisma/client";

export const NIVEAUX: Niveau[] = ["L1", "L2", "L3", "M1", "M2"];

export const PLANS = {
  GRATUITE: {
    label: "Gratuite",
    price: 0,
    description: "Accès de base aux textes juridiques et à une sélection de contenus pédagogiques.",
  },
  LICENCE: {
    label: "Licence",
    price: 3000,
    description: "Accès complet aux cours L1 à L3, toutes matières confondues.",
  },
  MASTER: {
    label: "Master",
    price: 5000,
    description: "Accès aux cours Licence et Master (M1-M2), pour revenir sur les fondamentaux.",
  },
  PROFESSIONNEL: {
    label: "Professionnel",
    price: 15000,
    description: "Catalogue intégral, formation continue, veille juridique et export illimité.",
  },
  INSTITUTIONNELLE: {
    label: "Institutionnelle",
    price: 0,
    description: "Accès pour un groupe d'utilisateurs via licence d'établissement.",
  },
} as const;

export type FormuleKey = keyof typeof PLANS;

/** Renvoie les niveaux de cours accessibles pour une formule donnée, ou "ALL". */
export function accessibleNiveaux(plan: FormuleKey): Niveau[] | "ALL" {
  switch (plan) {
    case "LICENCE":
      return ["L1", "L2", "L3"];
    case "MASTER":
      return ["L1", "L2", "L3", "M1", "M2"];
    case "PROFESSIONNEL":
    case "INSTITUTIONNELLE":
      return "ALL";
    case "GRATUITE":
    default:
      return [];
  }
}

export function canAccessCourse(plan: FormuleKey, niveau: Niveau): boolean {
  const allowed = accessibleNiveaux(plan);
  if (allowed === "ALL") return true;
  return allowed.includes(niveau);
}
