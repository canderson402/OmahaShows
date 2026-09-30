import { HIGH_SIMILARITY } from "./similarity";
import type { LinkFeatures, Rating } from "./types";

const RATING_BASE: Record<Rating, number> = { high: 0.7, medium: 0.45, low: 0.15 };

export function rawLinkScore(f: LinkFeatures): number {
  let s = RATING_BASE[f.judge_rating];
  s += f.name_similarity >= 0.999 ? 0.1 : f.name_similarity >= HIGH_SIMILARITY ? 0.05 : -0.1;
  if (f.corroborated) s += 0.1;
  if (f.location_evidence) s += 0.08;
  if (f.web_citation) s += 0.04;
  if (f.official_channel) s += 0.03;
  if (f.same_name_count >= 3) s -= 0.15;
  else if (f.same_name_count === 2) s -= 0.07;
  return Math.max(0, Math.min(1, s));
}

export function rawRatingScore(r: Rating): number {
  return { high: 0.95, medium: 0.75, low: 0.45 }[r];
}

export interface CalibrationPoint { x: number; y: number }

export class Calibrator {
  private pts: CalibrationPoint[];
  constructor(points: CalibrationPoint[] = []) { this.pts = [...points].sort((a, b) => a.x - b.x); }
  apply(x: number): number {
    const p = this.pts;
    if (p.length === 0) return x;
    if (x <= p[0].x) return p[0].y;
    if (x >= p[p.length - 1].x) return p[p.length - 1].y;
    for (let i = 1; i < p.length; i++) {
      if (x <= p[i].x) {
        const t = (x - p[i - 1].x) / (p[i].x - p[i - 1].x || 1);
        return p[i - 1].y + t * (p[i].y - p[i - 1].y);
      }
    }
    return x;
  }
  toJSON(): CalibrationPoint[] { return this.pts; }
}

// Pool-adjacent-violators over samples grouped by score.
export function fitIsotonic(samples: { score: number; correct: boolean }[]): Calibrator {
  const groups = new Map<number, { sum: number; n: number }>();
  for (const s of samples) {
    const g = groups.get(s.score) ?? { sum: 0, n: 0 };
    g.sum += s.correct ? 1 : 0; g.n += 1;
    groups.set(s.score, g);
  }
  const blocks = [...groups.entries()].sort((a, b) => a[0] - b[0])
    .map(([x, g]) => ({ xs: [x], sum: g.sum, n: g.n }));
  for (let i = 1; i < blocks.length; ) {
    if (blocks[i - 1].sum / blocks[i - 1].n > blocks[i].sum / blocks[i].n) {
      const merged = { xs: [...blocks[i - 1].xs, ...blocks[i].xs], sum: blocks[i - 1].sum + blocks[i].sum, n: blocks[i - 1].n + blocks[i].n };
      blocks.splice(i - 1, 2, merged);
      i = Math.max(1, i - 1);
    } else i++;
  }
  return new Calibrator(blocks.flatMap((b) => b.xs.map((x) => ({ x, y: b.sum / b.n }))));
}

export function finalLinkConfidence(f: LinkFeatures, cal: Calibrator): number {
  const c = cal.apply(rawLinkScore(f));
  return f.name_similarity < HIGH_SIMILARITY ? Math.min(c, 0.89) : c;
}

export function product(values: number[]): number {
  return values.reduce((a, b) => a * b, 1);
}

export interface CalibrationSet { link: Calibrator; lineup: Calibrator; category: Calibrator }

export function loadCalibration(json: unknown | null): CalibrationSet {
  const j = (json ?? {}) as Partial<Record<keyof CalibrationSet, CalibrationPoint[]>>;
  return { link: new Calibrator(j.link ?? []), lineup: new Calibrator(j.lineup ?? []), category: new Calibrator(j.category ?? []) };
}
