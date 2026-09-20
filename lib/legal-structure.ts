// Détection des titres structurels (Partie/Livre/Titre/Chapitre/Section) dans
// le texte intégral d'un texte juridique, pour générer un sommaire cliquable
// avec ancres. Les textes stockés isolent déjà ces lignes (voir le script
// d'extraction), donc une détection ligne par ligne suffit — pas besoin de
// parser le sommaire imprimé lui-même, qui reste affiché tel quel plus haut.

export type Heading = { id: string; level: number; label: string; index: number };

const HEADING_PATTERNS: { re: RegExp; level: number }[] = [
  { re: /^(PARTIE|LIVRE)\b/i, level: 1 },
  { re: /^TITRE\b/i, level: 2 },
  { re: /^CHAPITRE\b/i, level: 3 },
  { re: /^SECTION\b/i, level: 4 },
];

// Fenêtre (en lignes) dans laquelle on cherche un sommaire imprimé à ignorer
// pour la détection des titres (évite les doublons avec le corps du texte).
const TOC_SEARCH_WINDOW = 500;
const DOTTED_LEADER = /\.{4,}\s*\d{1,4}\s*$/;

// Un mot comme "titre" ou "partie" apparaît aussi en prose ("à quel titre...").
// On ne retient la ligne comme titre structurel que si le mot-clé est suivi
// d'une numérotation, ou si la ligne est très majoritairement en majuscules.
const NUMBERING_AFTER_KEYWORD = /^\S+\s+([IVXLCDM]+\b|\d+\b|PREMI[EÈ]RE?\b|DEUXI[EÈ]ME\b|TROISI[EÈ]ME\b|QUATRI[EÈ]ME\b|PRELIMINAIRE\b)/i;

function isMostlyUpper(s: string): boolean {
  const letters = s.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (letters.length < 3) return false;
  const upper = letters.replace(/[^A-ZÀ-Þ]/g, "");
  return upper.length / letters.length > 0.7;
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

export function extractHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const window = Math.min(lines.length, TOC_SEARCH_WINDOW);

  let bodyStartLine = 0;
  for (let i = 0; i < window; i++) {
    if (DOTTED_LEADER.test(lines[i])) bodyStartLine = i + 1;
  }

  const lineStarts: number[] = [];
  let cursor = 0;
  for (const line of lines) {
    lineStarts.push(cursor);
    cursor += line.length + 1;
  }

  const headings: Heading[] = [];
  lines.forEach((line, i) => {
    if (i < bodyStartLine) return;
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 140) return;
    for (const { re, level } of HEADING_PATTERNS) {
      if (re.test(trimmed) && (NUMBERING_AFTER_KEYWORD.test(trimmed) || isMostlyUpper(trimmed))) {
        headings.push({ id: slugify(trimmed, headings.length), level, label: trimmed, index: lineStarts[i] });
        break;
      }
    }
  });

  return headings;
}

export type ContentSegment =
  | { type: "text"; text: string }
  | { type: "heading"; text: string; id: string; level: number };

export function segmentContent(content: string, headings: Heading[]): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let pos = 0;
  for (const h of headings) {
    if (h.index > pos) segments.push({ type: "text", text: content.slice(pos, h.index) });
    const nl = content.indexOf("\n", h.index);
    const end = nl === -1 ? content.length : nl;
    segments.push({ type: "heading", text: content.slice(h.index, end), id: h.id, level: h.level });
    pos = end;
  }
  if (pos < content.length) segments.push({ type: "text", text: content.slice(pos) });
  return segments;
}
