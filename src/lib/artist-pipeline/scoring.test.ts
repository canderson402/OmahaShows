import { describe, expect, test } from "vitest";
import { Calibrator, finalLinkConfidence, fitIsotonic, loadCalibration, product, rawLinkScore } from "./scoring";
import type { LinkFeatures } from "./types";

const f = (p: Partial<LinkFeatures> = {}): LinkFeatures => ({
  judge_rating: "high", name_similarity: 1, corroborated: false, location_evidence: false,
  web_citation: false, same_name_count: 1, official_channel: false, ...p,
});

describe("rawLinkScore", () => {
  test("evidence raises, ambiguity lowers, bounded 0..1", () => {
    expect(rawLinkScore(f({ corroborated: true, location_evidence: true }))).toBeGreaterThan(rawLinkScore(f()));
    expect(rawLinkScore(f({ same_name_count: 3 }))).toBeLessThan(rawLinkScore(f()));
    expect(rawLinkScore(f({ corroborated: true, location_evidence: true, web_citation: true, official_channel: true }))).toBeLessThanOrEqual(1);
    expect(rawLinkScore(f({ judge_rating: "low", name_similarity: 0.3, same_name_count: 5 }))).toBeGreaterThanOrEqual(0);
  });
});

describe("rawLinkScore rounding", () => {
  test("exact + high + corroborated is exactly 0.9", () => {
    expect(rawLinkScore(f({ corroborated: true }))).toBe(0.9);
  });
});

describe("loadCalibration sanitizing", () => {
  test("sorts by x, clamps y to [0,1] and enforces non-decreasing y", () => {
    const cal = loadCalibration({ link: [{ x: 0.9, y: 0.6 }, { x: 0.1, y: -0.2 }, { x: 0.5, y: 0.8 }, { x: 1, y: 1.5 }] });
    expect(cal.link.toJSON()).toEqual([{ x: 0.1, y: 0 }, { x: 0.5, y: 0.8 }, { x: 0.9, y: 0.8 }, { x: 1, y: 1 }]);
  });
});

describe("finalLinkConfidence", () => {
  test("low similarity can never reach the high band, even if calibration says so", () => {
    const generous = new Calibrator([{ x: 0, y: 0.99 }, { x: 1, y: 0.99 }]);
    expect(finalLinkConfidence(f({ name_similarity: 0.85 }), generous)).toBeLessThan(0.9);
    expect(finalLinkConfidence(f({ name_similarity: 1 }), generous)).toBeCloseTo(0.99);
  });
});

describe("isotonic calibration", () => {
  test("identity when no points", () => expect(new Calibrator().apply(0.42)).toBeCloseTo(0.42));
  test("fit is monotone and matches bucket accuracy", () => {
    const samples = [
      ...Array.from({ length: 10 }, (_, i) => ({ score: 0.2, correct: i < 2 })),
      ...Array.from({ length: 10 }, (_, i) => ({ score: 0.9, correct: i < 9 })),
    ];
    const cal = fitIsotonic(samples);
    expect(cal.apply(0.2)).toBeCloseTo(0.2);
    expect(cal.apply(0.9)).toBeCloseTo(0.9);
    expect(cal.apply(0.55)).toBeGreaterThanOrEqual(cal.apply(0.2));
    expect(cal.apply(0.55)).toBeLessThanOrEqual(cal.apply(0.9));
  });
  test("violators are pooled", () => {
    const cal = fitIsotonic([{ score: 0.1, correct: true }, { score: 0.2, correct: false }]);
    expect(cal.apply(0.1)).toBeCloseTo(0.5);
    expect(cal.apply(0.2)).toBeCloseTo(0.5);
  });
  test("round-trips through JSON", () => {
    const set = loadCalibration({ link: [{ x: 0, y: 0.1 }, { x: 1, y: 0.8 }], lineup: [], category: [] });
    expect(set.link.apply(0.5)).toBeCloseTo(0.45);
    expect(set.lineup.apply(0.5)).toBeCloseTo(0.5);
  });
});

test("product", () => expect(product([0.9, 0.5, 1])).toBeCloseTo(0.45));
