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

// Essai gratuit : pendant les 14 jours qui suivent l'inscription, un compte
// en formule Gratuite bénéficie de l'accès intégral (formule Professionnel).
export const TRIAL_DAYS = 14;

type SubscriptionLike = { plan: string; startedAt: Date } | null | undefined;

export function trialEndDate(sub: SubscriptionLike): Date | null {
  if (!sub || sub.plan !== "GRATUITE") return null;
  const end = new Date(sub.startedAt);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end > new Date() ? end : null;
}

export function trialDaysLeft(end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
}

/** Formule réellement appliquée pour l'accès aux contenus (essai inclus). */
export function effectivePlan(sub: SubscriptionLike): FormuleKey {
  if (trialEndDate(sub)) return "PROFESSIONNEL";
  return (sub?.plan ?? "GRATUITE") as FormuleKey;
}
