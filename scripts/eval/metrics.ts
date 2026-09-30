import { createHash } from "node:crypto";
import { normalizeArtistName } from "../../src/lib/artist-pipeline/normalize";
import type { EventCategory, Platform, Role } from "../../src/lib/artist-pipeline/types";
import type { Genre } from "../../src/lib/genres";

export interface Labels {
  artists: { name: string; event_id: string; spotify_id: string | null; youtube_channel_id: string | null; genres: Genre[] }[];
  events: { event_id: string; category: EventCategory; acts: { name: string; role: Role; kind: "original_artist" | "not_an_artist" }[]; genres: Genre[] }[];
}

export interface LinkOutcome { platform: Platform; confidence: number; rawScore: number; correct: boolean }

/** precision is null when there is no high-confidence evidence (n = 0). */
export function highConfidencePrecision(o: LinkOutcome[], threshold = 0.9): { precision: number | null; n: number } {
  const hi = o.filter((x) => x.confidence >= threshold);
  return { precision: hi.length ? hi.filter((x) => x.correct).length / hi.length : null, n: hi.length };
}

export interface PredEntry { kind: string; billed_as: string; clean_name?: string; unsure?: boolean }

/**
 * Score labeled non-artist acts against pipeline entries. An act is matched by normalized
 * billed_as or clean_name. Unmatched and unsure acts are reported separately and excluded from
 * the rejection denominator (an unsure prediction is not a correct rejection).
 */
export function nonArtistRejection(goldNames: string[], entries: PredEntry[]): { correct: number; matched: number; unmatched: number; unsure: number } {
  let correct = 0, matched = 0, unmatched = 0, unsure = 0;
  for (const name of goldNames) {
    const n = normalizeArtistName(name);
    const m = entries.find((e) => normalizeArtistName(e.billed_as) === n || (e.clean_name !== undefined && normalizeArtistName(e.clean_name) === n));
    if (!m) { unmatched++; continue; }
    if (m.unsure) { unsure++; continue; }
    matched++;
    if (m.kind === "not_an_artist") correct++;
  }
  return { correct, matched, unmatched, unsure };
}

/** Reduce a pasted Spotify/YouTube profile URL to its bare id; other text is returned unchanged. */
export function extractProfileId(text: string): string {
  const m = text.match(/(?:open\.spotify\.com\/artist|youtube\.com\/channel)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : text;
}

export function coverage(o: LinkOutcome[], labeledWithProfile: number, threshold = 0.9): number {
  return labeledWithProfile ? o.filter((x) => x.confidence >= threshold && x.correct).length / labeledWithProfile : 0;
}

export function calibrationTable(o: { confidence: number; correct: boolean }[], edges = [0, 0.3, 0.6, 0.8, 0.9, 1.0001]) {
  const out: { bucket: string; n: number; stated: number; observed: number }[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const inB = o.filter((x) => x.confidence >= edges[i] && x.confidence < edges[i + 1]);
    const label = `${edges[i].toFixed(2)}-${Math.min(1, edges[i + 1]).toFixed(2)}`;
    out.push({
      bucket: label, n: inB.length,
      stated: inB.length ? inB.reduce((s, x) => s + x.confidence, 0) / inB.length : 0,
      observed: inB.length ? inB.filter((x) => x.correct).length / inB.length : 0,
    });
  }
  return out;
}

export function lineupCorrect(pred: { name: string; role: Role; kind: string; unsure?: boolean }[], gold: Labels["events"][number]["acts"]): boolean {
  if (pred.length !== gold.length) return false;
  return gold.every((g, i) =>
    !pred[i].unsure &&
    normalizeArtistName(g.name) === normalizeArtistName(pred[i].name) &&
    (g.kind === "not_an_artist" ? pred[i].kind !== "original_artist" : pred[i].kind === "original_artist" && g.role === pred[i].role));
}

export function twoFold<T>(items: T[], key: (t: T) => string): [T[], T[]] {
  const a: T[] = [], b: T[] = [];
  for (const it of items) (createHash("sha1").update(key(it)).digest()[0] % 2 === 0 ? a : b).push(it);
  return [a, b];
}
