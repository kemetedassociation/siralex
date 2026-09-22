// Charge les quatre fiches méthodologiques (dissertation, commentaire
// d'article, commentaire d'arrêt, cas pratique) et un sujet d'entraînement
// par fiche. Idempotent : peut être relancé sans dupliquer les données.
import { PrismaClient, type TypeMethodo } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const GUIDE_FILES: { type: TypeMethodo; file: string }[] = [
  { type: "DISSERTATION", file: "dissertation.json" },
  { type: "COMMENTAIRE_ARTICLE", file: "commentaire-article.json" },
  { type: "COMMENTAIRE_ARRET", file: "commentaire-arret.json" },
  { type: "CAS_PRATIQUE", file: "cas-pratique.json" },
];

const ARRET_SUPPORT = `Décision reproduite à des fins pédagogiques uniquement — elle ne constitue pas une jurisprudence réelle et ne peut être citée comme telle.

Cour d'appel de Dakar, chambre civile, 2 novembre 2021

LA COUR,

Vu les dispositions du Code des obligations civiles et commerciales relatives à la responsabilité contractuelle ;

Attendu que suivant contrat du 3 mars 2021, la société Sénégal Bâtiment s'est engagée envers M. Moussa Fall à réaliser des travaux de plomberie dans un délai de trente jours, sous peine d'une clause pénale de 5 000 francs CFA par jour de retard ; que les travaux n'ont été achevés qu'avec quarante-cinq jours de retard ;

Attendu que M. Fall a assigné la société Sénégal Bâtiment devant le tribunal régional de Dakar en paiement de la clause pénale ; que par jugement du 14 juin 2021, le tribunal a condamné la société au paiement de la somme de 225 000 francs CFA ;

Attendu que la société Sénégal Bâtiment, appelante, soutient que cette somme est manifestement excessive au regard du préjudice réellement subi par M. Fall, intimé, et sollicite sa réduction par la cour ;

Mais attendu que le juge ne peut modérer ou augmenter la peine convenue par les parties que si celle-ci est manifestement excessive ou dérisoire ; que la cour, après avoir examiné les éléments du dossier, relève que le montant de la clause pénale n'est pas disproportionné au regard du préjudice subi par le créancier du fait du retard constaté ;

Qu'il suit de là que le moyen tiré du caractère excessif de la clause pénale n'est pas fondé ;

PAR CES MOTIFS,

CONFIRME le jugement entrepris en toutes ses dispositions ;

Condamne la société Sénégal Bâtiment aux dépens.`;

const EXERCISES: Record<string, { title: string; niveau?: "L1" | "L2" | "L3" | "M1" | "M2"; prompt: string; support?: string }> = {
  DISSERTATION: {
    title: "La distinction entre obligation de moyens et obligation de résultat",
    niveau: "L2",
    prompt:
      "« La distinction entre obligation de moyens et obligation de résultat en droit sénégalais des obligations. »\n\nTraitez ce sujet de dissertation juridique en respectant strictement la méthode enseignée : introduction selon la technique des trois entonnoirs, développement en deux parties et deux sous-parties, sans conclusion.",
  },
  COMMENTAIRE_ARTICLE: {
    title: "Commentez l'article 3 du COCC — la classification des obligations",
    niveau: "L1",
    prompt:
      "Commentez l'article 3 du Code des Obligations Civiles et Commerciales (COCC) du Sénégal, reproduit ci-contre. Vous suivrez la méthode du commentaire d'article : identification du texte, glose et analyse grammaticale des termes employés, puis appréciation de la disposition avant son adoption, au moment de son adoption et après son adoption.",
    support: "Article 3 COCC — Classification\n\n« L'obligation a pour objet de donner, de faire ou de ne pas faire quelque chose. »",
  },
  COMMENTAIRE_ARRET: {
    title: "Clause pénale et pouvoir de révision du juge",
    niveau: "L2",
    prompt:
      "Commentez la décision reproduite ci-contre. Vous rédigerez d'abord une fiche d'arrêt (faits, procédure, prétentions des parties, problème juridique, solution), puis un commentaire structuré en deux parties et deux sous-parties combinant analyse et appréciation.",
    support: ARRET_SUPPORT,
  },
  CAS_PRATIQUE: {
    title: "La vente conclue par un mineur non émancipé",
    niveau: "L1",
    prompt:
      "Amadou, âgé de 17 ans, achète seul un ordinateur portable d'occasion à Moussa, commerçant informatique établi à Dakar, pour un prix de 250 000 francs CFA payé comptant. Trois semaines plus tard, les parents d'Amadou découvrent l'achat et s'opposent à la vente, estimant que leur fils ne pouvait pas s'engager seul. Moussa refuse de reprendre l'ordinateur, affirmant que la vente est ferme et définitive puisqu'elle a été librement consentie et immédiatement exécutée.\n\n1. Amadou pouvait-il valablement conclure seul ce contrat de vente ?\n2. Quelles conséquences juridiques les parents d'Amadou peuvent-ils tirer de la situation ?",
  },
};

async function main() {
  const dir = path.join(__dirname, "methodology");

  for (const { type, file } of GUIDE_FILES) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const content = JSON.stringify({
      sections: raw.sections,
      faire: raw.faire,
      nePasFaire: raw.nePasFaire,
    });

    const guide = await prisma.methodologyGuide.upsert({
      where: { type },
      update: { title: raw.title, subtitle: raw.subtitle, content },
      create: { type, title: raw.title, subtitle: raw.subtitle, content },
    });

    const ex = EXERCISES[type];
    const existingExercise = await prisma.methodologyExercise.findFirst({
      where: { guideId: guide.id, title: ex.title },
    });
    if (!existingExercise) {
      await prisma.methodologyExercise.create({
        data: {
          guideId: guide.id,
          title: ex.title,
          niveau: ex.niveau,
          prompt: ex.prompt,
          support: ex.support ?? null,
        },
      });
      console.log(`Créé: exercice "${ex.title}"`);
    } else {
      await prisma.methodologyExercise.update({
        where: { id: existingExercise.id },
        data: { prompt: ex.prompt, support: ex.support ?? null, niveau: ex.niveau },
      });
      console.log(`Mis à jour: exercice "${ex.title}"`);
    }

    console.log(`Fiche méthodologique: ${raw.title}`);
  }

  console.log("\nTerminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
