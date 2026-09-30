import { createHash } from "node:crypto";
import { normalizeArtistName } from "../../src/lib/artist-pipeline/normalize";
import type { EventCategory, Platform, Role } from "../../src/lib/artist-pipeline/types";
import type { Genre } from "../../src/lib/genres";

export interface Labels {
  artists: { name: string; event_id: string; spotify_id: string | null; youtube_channel_id: string | null; genres: Genre[] }[];
  events: { event_id: string; category: EventCategory; acts: { name: string; role: Role; kind: "original_artist" | "not_an_artist" }[]; genres: Genre[] }[];
}

export interface LinkOutcome { platform: Platform; confidence: number; rawScore: number; correct: boolean }

export function highConfidencePrecision(o: LinkOutcome[], threshold = 0.9) {
  const hi = o.filter((x) => x.confidence >= threshold);
  return { precision: hi.length ? hi.filter((x) => x.correct).length / hi.length : 1, n: hi.length };
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

export function lineupCorrect(pred: { name: string; role: Role; kind: string }[], gold: Labels["events"][number]["acts"]): boolean {
  if (pred.length !== gold.length) return false;
  return gold.every((g, i) =>
    normalizeArtistName(g.name) === normalizeArtistName(pred[i].name) &&
    (g.kind === "not_an_artist" ? pred[i].kind !== "original_artist" : pred[i].kind === "original_artist" && g.role === pred[i].role));
}

export function twoFold<T>(items: T[], key: (t: T) => string): [T[], T[]] {
  const a: T[] = [], b: T[] = [];
  for (const it of items) (createHash("sha1").update(key(it)).digest()[0] % 2 === 0 ? a : b).push(it);
  return [a, b];
}
