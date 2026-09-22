// Vérification méthodologique automatique des réponses aux exercices
// juridiques (dissertation, commentaire d'article, commentaire d'arrêt, cas
// pratique). Cette analyse contrôle le respect des règles de méthode
// enseignées dans la fiche correspondante (structure, vocabulaire, éléments
// attendus) — elle ne juge pas l'exactitude juridique du fond, qui reste du
// ressort d'un correcteur.

export type ChecklistCheck = { key: string; label: string; passed: boolean };
export type MethodologyAnalysis = { score: number; checks: ChecklistCheck[] };

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countMatches(re: RegExp, text: string): number {
  return (text.match(re) ?? []).length;
}

// Segment placé avant le premier "I." / "I)" du développement — assimilé à
// l'introduction pour la recherche de la problématique.
function introPart(text: string): string {
  const m = text.match(/\bI[.)]/);
  return m ? text.slice(0, m.index) : text;
}

function hasPlanBinaire(text: string): boolean {
  const hasI = /\bI[.)]/.test(text);
  const hasII = /\bII[.)]/.test(text);
  const hasIII = /\bIII[.)]/.test(text);
  return hasI && hasII && !hasIII;
}

function hasSousParties(text: string): boolean {
  const countA = countMatches(/\bA[.)]/g, text);
  const countB = countMatches(/\bB[.)]/g, text);
  return countA >= 2 && countB >= 2;
}

function hasNoConclusionHeading(text: string): boolean {
  return !/^\s*conclusion\s*:?\s*$/im.test(text);
}

const STRUCTURE_CHECKS = [
  {
    key: "plan-binaire",
    label: "Plan en deux parties (I et II), sans troisième partie",
    test: hasPlanBinaire,
  },
  {
    key: "sous-parties",
    label: "Chaque partie subdivisée en deux sous-parties (A et B)",
    test: hasSousParties,
  },
  {
    key: "pas-de-conclusion",
    label: "Absence de conclusion distincte (le devoir s'arrête à la fin du II)",
    test: hasNoConclusionHeading,
  },
] as const;

function analyzeDissertation(text: string): ChecklistCheck[] {
  return [
    ...STRUCTURE_CHECKS.map((c) => ({ key: c.key, label: c.label, passed: c.test(text) })),
    {
      key: "problematique",
      label: "Une problématique est formulée (phrase interrogative) dans l'introduction",
      passed: /\?/.test(introPart(text)),
    },
    {
      key: "developpement",
      label: "Développement suffisamment argumenté (au moins 400 mots)",
      passed: wordCount(text) >= 400,
    },
  ];
}

function analyzeCommentaireArticle(text: string): ChecklistCheck[] {
  const glose =
    (/sens courant/i.test(text) && /sens juridique/i.test(text)) ||
    countMatches(/\b(signifie|désigne|définit)\b/gi, text) >= 2;
  const retourAuTexte = countMatches(/\barticle\b/gi, text) >= 3 || countMatches(/[«»"]/g, text) >= 2;
  return [
    ...STRUCTURE_CHECKS.map((c) => ({ key: c.key, label: c.label, passed: c.test(text) })),
    {
      key: "retour-au-texte",
      label: "Retour explicite au texte de l'article (citations ou renvois répétés)",
      passed: retourAuTexte,
    },
    {
      key: "glose",
      label: "Glose des termes : sens courant et sens juridique évoqués",
      passed: glose,
    },
    {
      key: "developpement",
      label: "Développement suffisamment détaillé (au moins 300 mots)",
      passed: wordCount(text) >= 300,
    },
  ];
}

function analyzeCommentaireArret(text: string): ChecklistCheck[] {
  const vocabTerms = [
    "visa",
    "attendu",
    "considérant",
    "dispositif",
    "pourvoi",
    "cassation",
    "rejette",
    "confirme",
    "appelant",
    "intimé",
  ];
  const vocabHits = vocabTerms.filter((t) => new RegExp(`\\b${t}`, "i").test(text)).length;
  const citation = /[«"][^»"]{15,}[»"]/.test(text);
  return [
    ...STRUCTURE_CHECKS.map((c) => ({ key: c.key, label: c.label, passed: c.test(text) })),
    {
      key: "vocabulaire-procedural",
      label: "Emploi du vocabulaire procédural attendu (visa, attendu, dispositif, pourvoi…)",
      passed: vocabHits >= 3,
    },
    {
      key: "citation-solution",
      label: "La solution ou l'attendu de principe est cité entre guillemets",
      passed: citation,
    },
    {
      key: "developpement",
      label: "Développement suffisamment détaillé (au moins 350 mots)",
      passed: wordCount(text) >= 350,
    },
  ];
}

function analyzeCasPratique(text: string): ChecklistCheck[] {
  return [
    {
      key: "syllogisme",
      label: "Le raisonnement mobilise le syllogisme juridique (majeure / mineure)",
      passed: /majeure/i.test(text) && /mineure/i.test(text),
    },
    {
      key: "probleme-question",
      label: "Le problème juridique est formulé sous une forme interrogative",
      passed: /\?/.test(text),
    },
    {
      key: "qualification",
      label: "Les faits sont qualifiés juridiquement (vocabulaire de qualification)",
      passed: /qualifi/i.test(text),
    },
    {
      key: "solution-justifiee",
      label: "La solution proposée est justifiée par des connecteurs logiques (donc, dès lors, par conséquent…)",
      passed: /(donc|dès lors|par conséquent|en conséquence|il en résulte)/i.test(text),
    },
    {
      key: "developpement",
      label: "Analyse suffisamment développée (au moins 250 mots)",
      passed: wordCount(text) >= 250,
    },
  ];
}

export function analyzeMethodologyResponse(type: string, content: string): MethodologyAnalysis {
  const checks =
    type === "DISSERTATION"
      ? analyzeDissertation(content)
      : type === "COMMENTAIRE_ARTICLE"
        ? analyzeCommentaireArticle(content)
        : type === "COMMENTAIRE_ARRET"
          ? analyzeCommentaireArret(content)
          : analyzeCasPratique(content);

  const score = Math.round((100 * checks.filter((c) => c.passed).length) / checks.length);
  return { score, checks };
}
