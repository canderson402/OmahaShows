import { GENRES, type Genre } from "../genres";

const GENRE_SET = new Set<string>(GENRES);

// Checked in order; first match wins for a tag.
const KEYWORDS: [RegExp, Genre][] = [
  [/\bhip[ -]?hop\b|\brap\b/, "hip-hop"],
  [/\br&b\b|\brnb\b/, "r&b"],
  [/\bbluegrass\b/, "americana"],
  [/\bedm\b|\belectronica\b|\bsynth/, "electronic"],
  [/\bdrum and bass\b|\bdnb\b/, "drum-and-bass"],
  [/\bsinger[- ]songwriter\b/, "singer-songwriter"],
  [/\bpost[- ]hardcore\b|\bmetalcore\b/, "hardcore"],
  [/\bshoegaze\b|\bdream pop\b/, "indie"],
  [/\bstand[- ]up\b/, "comedy"],
  [/\bworship\b|\bccm\b/, "christian"],
];

export function filterGenres(values: string[]): Genre[] {
  const out: Genre[] = [];
  for (const v of values) {
    const g = v.trim().toLowerCase();
    if (GENRE_SET.has(g) && !out.includes(g as Genre)) out.push(g as Genre);
  }
  return out;
}

export function mapToGenres(tags: string[], max = 3): Genre[] {
  const out: Genre[] = [];
  const add = (g: Genre) => { if (!out.includes(g) && out.length < max) out.push(g); };
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (GENRE_SET.has(tag)) { add(tag as Genre); continue; }
    const kw = KEYWORDS.find(([re]) => re.test(tag));
    if (kw) { add(kw[1]); continue; }
    // Compound tags ("pop punk", "nebraska indie"): the last recognized word is the head genre.
    const words = tag.split(/\s+/);
    for (let i = words.length - 1; i >= 0; i--) {
      if (GENRE_SET.has(words[i])) { add(words[i] as Genre); break; }
    }
  }
  return out;
}
