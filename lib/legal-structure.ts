// Analyse du texte intégral d'un texte juridique (déjà segmenté en alinéas
// par l'extraction — un bloc PDF = un paragraphe) pour :
//  1. détecter les titres structurels (Partie/Livre/Titre/Chapitre/Section)
//     et leur donner une ancre, pour un sommaire cliquable ;
//  2. détecter le début de chaque article et numéroter ses alinéas, pour un
//     rendu clair (article en gras, alinéas légendés en italique).

export type Heading = { id: string; level: number; label: string };

export type RenderBlock =
  | { type: "heading"; id: string; level: number; text: string }
  | { type: "article"; id: string; label: string; alineas: string[] }
  | { type: "prose"; text: string };

const HEADING_PATTERNS: { re: RegExp; level: number }[] = [
  { re: /^(PARTIE|LIVRE)\b/i, level: 1 },
  { re: /^TITRE\b/i, level: 2 },
  { re: /^CHAPITRE\b/i, level: 3 },
  { re: /^SECTION\b/i, level: 4 },
];

const NUMBERING_AFTER_KEYWORD =
  /^\S+\s+([IVXLCDM]+\b|\d+\b|PREMI[EÈ]RE?\b|DEUXI[EÈ]ME\b|TROISI[EÈ]ME\b|QUATRI[EÈ]ME\b|PR[EÉ]LIMINAIRE\b)/i;

function isMostlyUpper(s: string): boolean {
  const letters = s.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  const upper = letters.replace(/[^A-ZÀ-Þ]/g, "");
  return upper.length / letters.length > 0.7;
}

function matchHeading(paragraph: string): { level: number } | null {
  const firstLine = paragraph.split("\n")[0].trim();
  if (!firstLine || firstLine.length > 140) return null;
  for (const { re, level } of HEADING_PATTERNS) {
    if (re.test(firstLine) && (NUMBERING_AFTER_KEYWORD.test(firstLine) || isMostlyUpper(firstLine))) {
      return { level };
    }
  }
  return null;
}

// "Article 22", "Article premier", "Article L.55.-", "Article L. 243",
// "Art.153.-", "Article 8-1"...
const ARTICLE_START =
  /^(?:Article|Art\.)\s*((?:[A-Za-zÀ-ÿ]+\.?\s*)?\d+(?:[.\-]\d+)*|premier|préliminaire)\.?-?\s*/i;

// Un sommaire imprimé regroupe plusieurs entrées "........ N" ; on ignore les
// paragraphes qui en contiennent pour ne pas les détecter comme titres réels.
const DOTTED_LEADER_COUNT = (s: string) => (s.match(/\.{4,}\s*\d{1,4}/g) ?? []).length;
const TOC_SEARCH_WINDOW = 60;

// Le premier "alinéa" d'un article est parfois en réalité son intitulé
// (ex. "ARTICLE 3 Classification" suivi, dans un bloc PDF séparé, du
// vrai texte). On le distingue d'un véritable alinéa court : un intitulé
// est bref, ne se termine pas par une ponctuation de fin de phrase, et
// est suivi d'un contenu réel (pas d'un autre article/titre).
function looksLikeArticleTitle(rest: string): boolean {
  if (!rest || rest.length > 90) return false;
  if (/[.;:!?]\s*$/.test(rest)) return false;
  if (rest.split(/\s+/).length > 12) return false;
  return true;
}

function slugify(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return `${base || "section"}-${index}`;
}

export function parseLegalContent(content: string): RenderBlock[] {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  let bodyStart = 0;
  const window = Math.min(paragraphs.length, TOC_SEARCH_WINDOW);
  for (let i = 0; i < window; i++) {
    if (DOTTED_LEADER_COUNT(paragraphs[i]) >= 1) bodyStart = i + 1;
  }

  const blocks: RenderBlock[] = [];
  let idCounter = 0;
  let currentArticle: { id: string; label: string; alineas: string[] } | null = null;

  const flushArticle = () => {
    if (currentArticle) {
      blocks.push({ type: "article", ...currentArticle });
      currentArticle = null;
    }
  };

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];

    if (i < bodyStart) {
      // Sommaire imprimé / page de garde : affiché tel quel, hors structure.
      flushArticle();
      blocks.push({ type: "prose", text: paragraph });
      continue;
    }

    const heading = matchHeading(paragraph);
    if (heading) {
      flushArticle();
      let text = paragraph;
      // Un titre court est parfois coupé de son intitulé, réparti sur
      // plusieurs blocs PDF successifs (ex. "SECTION PREMIÈRE -" / "DES
      // ACTES" / "DE L'ETAT CIVIL"). On les rattache tant qu'ils ont l'air
      // de continuer le même titre (courts, en majuscules).
      let merges = 0;
      while (
        text.length < 60 &&
        merges < 3 &&
        i + 1 < paragraphs.length &&
        !matchHeading(paragraphs[i + 1]) &&
        !ARTICLE_START.test(paragraphs[i + 1]) &&
        isMostlyUpper(paragraphs[i + 1].split("\n")[0]) &&
        paragraphs[i + 1].length < 80
      ) {
        i++;
        merges++;
        text = `${text} ${paragraphs[i]}`.trim();
      }
      blocks.push({ type: "heading", id: slugify(text.split("\n")[0], idCounter++), level: heading.level, text });
      continue;
    }

    const articleMatch = paragraph.match(ARTICLE_START);
    if (articleMatch) {
      flushArticle();
      let label = `Article ${articleMatch[1].trim().replace(/\.$/, "")}`;
      const rest = paragraph.slice(articleMatch[0].length).trim();
      const nextParagraph = paragraphs[i + 1];
      const hasFollowingContent =
        !!nextParagraph && !ARTICLE_START.test(nextParagraph) && !matchHeading(nextParagraph);
      let alineas: string[];
      if (rest && looksLikeArticleTitle(rest) && hasFollowingContent) {
        label = `${label} — ${rest}`;
        alineas = [];
      } else {
        alineas = rest ? [rest] : [];
      }
      currentArticle = { id: `article-${slugify(label, idCounter++)}`, label, alineas };
      continue;
    }

    if (currentArticle) {
      currentArticle.alineas.push(paragraph);
    } else {
      blocks.push({ type: "prose", text: paragraph });
    }
  }
  flushArticle();

  return blocks;
}

export function getHeadings(blocks: RenderBlock[]): Heading[] {
  return blocks
    .filter((b): b is Extract<RenderBlock, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: b.id, level: b.level, label: b.text.split("\n")[0] }));
}
