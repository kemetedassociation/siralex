import type { TypeMethodo } from "@prisma/client";

export const METHODOLOGY_SLUGS: Record<TypeMethodo, string> = {
  DISSERTATION: "dissertation",
  COMMENTAIRE_ARTICLE: "commentaire-article",
  COMMENTAIRE_ARRET: "commentaire-arret",
  CAS_PRATIQUE: "cas-pratique",
};

export const METHODOLOGY_TYPES_BY_SLUG: Record<string, TypeMethodo> = Object.fromEntries(
  Object.entries(METHODOLOGY_SLUGS).map(([type, slug]) => [slug, type as TypeMethodo])
);

export type GuideBlock = { type: "p"; text: string } | { type: "list"; items: string[] };
export type GuideSection = { heading: string; level: 1 | 2; blocks: GuideBlock[] };
export type GuideContent = {
  sections: GuideSection[];
  faire: string[];
  nePasFaire: string[];
};

export function parseGuideContent(json: string): GuideContent {
  return JSON.parse(json) as GuideContent;
}
