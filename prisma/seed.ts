import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@siralex.sn" },
    update: {},
    create: {
      name: "Fatou Ndiaye",
      email: "admin@siralex.sn",
      passwordHash: password,
      role: "ADMIN",
      subscription: { create: { plan: "PROFESSIONNEL", status: "ACTIF" } },
    },
  });

  const enseignant = await prisma.user.upsert({
    where: { email: "enseignant@siralex.sn" },
    update: {},
    create: {
      name: "Pr. Moussa Sarr",
      email: "enseignant@siralex.sn",
      passwordHash: password,
      role: "ENSEIGNANT",
      universite: "Université Cheikh Anta Diop (UCAD)",
      matiere: "Droit des obligations",
      verified: true,
      subscription: { create: { plan: "PROFESSIONNEL", status: "ACTIF" } },
    },
  });

  const etudiant = await prisma.user.upsert({
    where: { email: "etudiant@siralex.sn" },
    update: {},
    create: {
      name: "Aïssatou Diallo",
      email: "etudiant@siralex.sn",
      passwordHash: password,
      role: "ETUDIANT",
      niveau: "L2",
      universite: "UCAD",
      subscription: { create: { plan: "LICENCE", status: "ACTIF" } },
    },
  });

  await prisma.user.upsert({
    where: { email: "professionnel@siralex.sn" },
    update: {},
    create: {
      name: "Me Cheikh Ba",
      email: "professionnel@siralex.sn",
      passwordHash: password,
      role: "PROFESSIONNEL",
      universite: "Cabinet Ba & Associés",
      verified: true,
      subscription: { create: { plan: "PROFESSIONNEL", status: "ACTIF" } },
    },
  });

  // ---------------------------------------------------------------------
  // Cours
  // ---------------------------------------------------------------------

  const coursesData = [
    {
      title: "Introduction au droit des obligations",
      slug: "introduction-droit-obligations",
      niveau: "L2" as const,
      matiere: "Droit des obligations",
      summary: "Les sources des obligations, la distinction entre obligations contractuelles et délictuelles.",
      content: `## Notion d'obligation\nL'obligation est un lien de droit par lequel une personne, le débiteur, est tenue envers une autre, le créancier, d'une prestation.\n\n## Les sources des obligations\nOn distingue traditionnellement les obligations qui naissent d'un acte juridique (le contrat) et celles qui naissent d'un fait juridique (la responsabilité délictuelle, le quasi-contrat).\n\n## Application au Sénégal\nLe droit sénégalais des obligations s'appuie notamment sur le Code des obligations civiles et commerciales (COCC), largement inspiré du droit français tout en comportant des spécificités locales.\n\n## À retenir\n- L'obligation crée un lien de droit entre deux personnes déterminées.\n- Les sources principales sont le contrat, le délit, le quasi-délit, le quasi-contrat et la loi.\n- Le COCC encadre la matière au Sénégal.`,
      durationMin: 25,
      status: "PUBLIE" as const,
    },
    {
      title: "La formation du contrat",
      slug: "formation-du-contrat",
      niveau: "L2" as const,
      matiere: "Droit des obligations",
      summary: "Les conditions de validité du contrat : consentement, capacité, objet et cause.",
      content: `## Les conditions de validité\nPour qu'un contrat soit valablement formé, quatre conditions sont classiquement exigées : le consentement des parties, leur capacité à contracter, un objet certain et une cause licite.\n\n## Le consentement\nLe consentement doit être libre et éclairé. Les vices du consentement — erreur, dol, violence — peuvent entraîner la nullité du contrat.\n\n## La capacité\nToute personne peut contracter si elle n'en est pas déclarée incapable par la loi (mineurs non émancipés, majeurs protégés).\n\n## Objet et cause\nL'objet doit être déterminé ou déterminable, possible et licite. La cause doit exister et être licite.`,
      durationMin: 30,
      status: "PUBLIE" as const,
    },
    {
      title: "Les actes uniformes OHADA : présentation générale",
      slug: "actes-uniformes-ohada-presentation",
      niveau: "L3" as const,
      matiere: "Droit OHADA",
      summary: "Panorama des actes uniformes et de leur portée dans les États membres de l'OHADA.",
      content: `## Qu'est-ce que l'OHADA ?\nL'Organisation pour l'Harmonisation en Afrique du Droit des Affaires (OHADA) regroupe 17 États membres, dont le Sénégal, autour d'un droit des affaires unifié.\n\n## Les actes uniformes\nLes actes uniformes couvrent notamment le droit commercial général, le droit des sociétés commerciales, les sûretés, les procédures collectives et l'arbitrage.\n\n## Primauté et application directe\nLes actes uniformes sont directement applicables dans les États parties et priment sur le droit national antérieur ou postérieur contraire.\n\n## La CCJA\nLa Cour Commune de Justice et d'Arbitrage (CCJA) assure l'interprétation et l'application uniforme du droit OHADA.`,
      durationMin: 35,
      status: "PUBLIE" as const,
    },
    {
      title: "Le droit des sociétés commerciales OHADA",
      slug: "droit-societes-commerciales-ohada",
      niveau: "M1" as const,
      matiere: "Droit OHADA",
      summary: "Les formes sociales, la constitution et le fonctionnement des sociétés dans l'espace OHADA.",
      content: `## Les formes sociales\nL'Acte uniforme relatif au droit des sociétés commerciales et du GIE régit notamment la SARL, la SA et la société par actions simplifiée (SAS).\n\n## Constitution\nLa constitution d'une société suppose la rédaction de statuts, la réalisation d'apports et l'immatriculation au Registre du Commerce et du Crédit Mobilier (RCCM).\n\n## Organes sociaux\nSelon la forme choisie, la société est administrée par un gérant, un conseil d'administration ou un président, avec un contrôle exercé par les associés et, le cas échéant, un commissaire aux comptes.`,
      durationMin: 40,
      status: "PUBLIE" as const,
    },
    {
      title: "Méthodologie du cas pratique en droit",
      slug: "methodologie-cas-pratique",
      niveau: "L1" as const,
      matiere: "Méthodologie juridique",
      summary: "Qualification des faits, identification du problème de droit, syllogisme juridique.",
      content: `## Les étapes du cas pratique\n1. Résumer et qualifier juridiquement les faits.\n2. Dégager le ou les problèmes de droit posés.\n3. Rechercher la règle de droit applicable (majeure).\n4. Appliquer la règle aux faits de l'espèce (mineure).\n5. Conclure en répondant à la question posée.\n\n## Le syllogisme juridique\nLe raisonnement juridique classique associe une règle générale (la majeure), les faits de l'espèce (la mineure) et une conclusion qui en découle logiquement.\n\n## Conseils pratiques\nÉvitez le récit des faits sans qualification, structurez votre copie en I/A/B et citez systématiquement vos sources (texte, jurisprudence).`,
      durationMin: 20,
      status: "PUBLIE" as const,
    },
    {
      title: "Le régime des sûretés en droit OHADA (en relecture)",
      slug: "regime-suretes-ohada",
      niveau: "M2" as const,
      matiere: "Droit OHADA",
      summary: "Sûretés personnelles et réelles selon l'Acte uniforme portant organisation des sûretés.",
      content: `## Les sûretés personnelles\nLe cautionnement et la garantie autonome permettent à un tiers de garantir l'exécution d'une obligation.\n\n## Les sûretés réelles\nLe gage, le nantissement et l'hypothèque portent sur un bien affecté à la garantie d'une créance.\n\n## Réforme de 2010\nL'Acte uniforme portant organisation des sûretés, révisé en 2010, a modernisé le régime applicable dans l'espace OHADA.`,
      durationMin: 30,
      status: "EN_RELECTURE" as const,
    },
  ];

  for (const c of coursesData) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        authorId: enseignant.id,
        validatorId: c.status === "PUBLIE" ? admin.id : null,
        publishedAt: c.status === "PUBLIE" ? new Date() : null,
        versions: { create: { content: c.content, editedById: enseignant.id } },
      },
    });
  }

  // ---------------------------------------------------------------------
  // Documentation juridique
  // ---------------------------------------------------------------------

  const textsData = [
    {
      title: "Constitution du Sénégal",
      type: "CONSTITUTION" as const,
      matiere: "Droit constitutionnel",
      juridiction: "Sénégal",
      reference: "Constitution du 22 janvier 2001 (révisée)",
      datePublication: new Date("2001-01-22"),
      content:
        "Résumé illustratif : la Constitution sénégalaise organise la séparation des pouvoirs entre l'exécutif, le législatif et le judiciaire, garantit les droits et libertés fondamentaux, et fixe les règles relatives à l'élection du Président de la République et de l'Assemblée nationale. Contenu fourni à titre d'exemple pédagogique — se référer au Journal officiel pour le texte consolidé.",
    },
    {
      title: "Code des obligations civiles et commerciales (COCC)",
      type: "CODE" as const,
      matiere: "Droit des obligations",
      juridiction: "Sénégal",
      reference: "Loi n°63-62 du 10 juillet 1963",
      datePublication: new Date("1963-07-10"),
      content:
        "Résumé illustratif : le COCC régit la formation, l'exécution et l'extinction des obligations contractuelles et délictuelles au Sénégal, ainsi que le régime général des contrats spéciaux (vente, bail, mandat). Contenu fourni à titre d'exemple pédagogique.",
    },
    {
      title: "Acte uniforme relatif au droit commercial général",
      type: "ACTE_UNIFORME" as const,
      matiere: "Droit OHADA",
      juridiction: "OHADA",
      reference: "Acte uniforme révisé du 15 décembre 2010",
      datePublication: new Date("2010-12-15"),
      content:
        "Résumé illustratif : cet acte uniforme fixe le statut du commerçant, les règles relatives au Registre du Commerce et du Crédit Mobilier (RCCM), au bail commercial et au fonds de commerce dans les États membres de l'OHADA. Contenu fourni à titre d'exemple pédagogique.",
    },
    {
      title: "Acte uniforme relatif au droit des sociétés commerciales et du GIE",
      type: "ACTE_UNIFORME" as const,
      matiere: "Droit OHADA",
      juridiction: "OHADA",
      reference: "Acte uniforme révisé du 30 janvier 2014",
      datePublication: new Date("2014-01-30"),
      content:
        "Résumé illustratif : cet acte uniforme organise la constitution, le fonctionnement et la dissolution des sociétés commerciales et des groupements d'intérêt économique dans l'espace OHADA, y compris la société par actions simplifiée (SAS). Contenu fourni à titre d'exemple pédagogique.",
    },
    {
      title: "Loi sur la protection des données à caractère personnel",
      type: "LOI" as const,
      matiere: "Droit du numérique",
      juridiction: "Sénégal",
      reference: "Loi n°2008-12 du 25 janvier 2008",
      datePublication: new Date("2008-01-25"),
      content:
        "Résumé illustratif : cette loi encadre la collecte, le traitement et la conservation des données à caractère personnel au Sénégal et institue la Commission de protection des données personnelles (CDP). Contenu fourni à titre d'exemple pédagogique.",
    },
  ];

  const legalTexts = [];
  for (const t of textsData) {
    const existing = await prisma.legalText.findFirst({ where: { title: t.title } });
    legalTexts.push(
      existing ??
        (await prisma.legalText.create({
          data: t,
        }))
    );
  }

  const jurisprudenceData = [
    {
      title: "Cour Commune de Justice et d'Arbitrage — pourvoi en cassation, droit des sociétés",
      juridiction: "CCJA",
      matiere: "Droit OHADA",
      date: new Date("2022-03-14"),
      keywords: "société commerciale, révocation, gérant, SARL",
      summary:
        "Illustration pédagogique : la CCJA rappelle les conditions de révocation d'un gérant de SARL pour juste motif conformément à l'Acte uniforme relatif au droit des sociétés commerciales.",
      content:
        "Contenu illustratif à des fins pédagogiques, ne constituant pas une décision réelle opposable. Il rappelle notamment que la révocation du gérant doit être motivée et que l'assemblée des associés statue à la majorité prévue par les statuts ou, à défaut, par l'acte uniforme.",
    },
    {
      title: "Cour d'appel de Dakar — responsabilité contractuelle",
      juridiction: "Cour d'appel de Dakar",
      matiere: "Droit des obligations",
      date: new Date("2021-11-02"),
      keywords: "inexécution, dommages-intérêts, clause pénale",
      summary:
        "Illustration pédagogique : application d'une clause pénale en cas d'inexécution partielle d'un contrat de prestation de services.",
      content:
        "Contenu illustratif à des fins pédagogiques. La juridiction rappelle que le juge ne peut réviser une clause pénale manifestement excessive ou dérisoire que dans les conditions prévues par la loi.",
    },
  ];

  for (const j of jurisprudenceData) {
    const existing = await prisma.jurisprudence.findFirst({ where: { title: j.title } });
    if (!existing) await prisma.jurisprudence.create({ data: j });
  }

  // ---------------------------------------------------------------------
  // Examens
  // ---------------------------------------------------------------------

  const existingQcm = await prisma.exam.findFirst({ where: { title: "QCM — Droit des obligations (L2)" } });
  const qcm =
    existingQcm ??
    (await prisma.exam.create({
      data: {
        title: "QCM — Droit des obligations (L2)",
        matiere: "Droit des obligations",
        niveau: "L2",
        type: "QCM",
        instructions: "Répondez aux questions suivantes. Une seule réponse est attendue par question.",
        durationMin: 15,
        bareme: "Note sur 20, un point par question",
        status: "PUBLIE",
        authorId: enseignant.id,
        validatorId: admin.id,
        openAt: new Date(),
        questions: {
          create: [
            {
              question: "Quelles sont les sources classiques des obligations ?",
              options: JSON.stringify([
                "Le contrat et le délit uniquement",
                "Le contrat, le délit, le quasi-délit, le quasi-contrat et la loi",
                "Uniquement la loi",
                "Le contrat et la coutume",
              ]),
              correctIndex: 1,
              order: 0,
            },
            {
              question: "Le consentement doit être :",
              options: JSON.stringify(["Libre et éclairé", "Tacite uniquement", "Donné par un tiers", "Non requis"]),
              correctIndex: 0,
              order: 1,
            },
            {
              question: "Le COCC désigne :",
              options: JSON.stringify([
                "Le Code des obligations civiles et commerciales",
                "Le Conseil des opérations commerciales du Sénégal",
                "Une juridiction sénégalaise",
                "Un acte uniforme OHADA",
              ]),
              correctIndex: 0,
              order: 2,
            },
          ],
        },
      },
    }));

  const existingCasPratique = await prisma.exam.findFirst({ where: { title: "Cas pratique — Formation du contrat" } });
  if (!existingCasPratique) {
    await prisma.exam.create({
      data: {
        title: "Cas pratique — Formation du contrat",
        matiere: "Droit des obligations",
        niveau: "L2",
        type: "CAS_PRATIQUE",
        instructions:
          "Amadou propose par écrit à Binta de lui vendre son véhicule pour 3 000 000 FCFA, offre valable 10 jours. Binta accepte au 12e jour. Qu'en pensez-vous ? Analysez la formation du contrat.",
        durationMin: 60,
        bareme: "Note sur 20",
        status: "PUBLIE",
        authorId: enseignant.id,
        validatorId: admin.id,
        openAt: new Date(),
      },
    });
  }

  // ---------------------------------------------------------------------
  // Communauté
  // ---------------------------------------------------------------------

  const existingThread = await prisma.forumThread.findFirst({ where: { title: "Comment réviser le cas pratique efficacement ?" } });
  if (!existingThread) {
    await prisma.forumThread.create({
      data: {
        title: "Comment réviser le cas pratique efficacement ?",
        matiere: "Méthodologie juridique",
        promotion: "L1 2026",
        authorId: etudiant.id,
        posts: {
          create: [
            { authorId: etudiant.id, content: "Bonjour à tous, avez-vous des conseils pour structurer un cas pratique rapidement le jour de l'examen ?" },
            { authorId: enseignant.id, content: "Commencez toujours par qualifier juridiquement les faits avant de chercher la règle applicable — cela évite le hors-sujet." },
          ],
        },
      },
    });
  }

  // ---------------------------------------------------------------------
  // Carrières
  // ---------------------------------------------------------------------

  const existingOffer = await prisma.careerOffer.findFirst({ where: { title: "Stage juridique — Cabinet Ba & Associés" } });
  if (!existingOffer) {
    await prisma.careerOffer.create({
      data: {
        title: "Stage juridique — Cabinet Ba & Associés",
        type: "STAGE",
        organisation: "Cabinet Ba & Associés",
        description:
          "Stage de 3 mois au sein du pôle contentieux commercial. Profil recherché : étudiant en L3/M1 droit, rigueur rédactionnelle, intérêt pour le droit OHADA.",
        status: "VALIDEE",
        authorId: admin.id,
        validatorId: admin.id,
      },
    });
  }

  console.log("Seed terminé.");
  console.log({ admin: admin.email, enseignant: enseignant.email, etudiant: etudiant.email, qcmId: qcm.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
