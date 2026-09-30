import { expect, test } from "vitest";
import { calibrationTable, coverage, highConfidencePrecision, lineupCorrect, twoFold } from "./metrics";

const o = (confidence: number, correct: boolean) => ({ platform: "spotify" as const, confidence, rawScore: confidence, correct });

test("precision only counts links at/above threshold", () => {
  expect(highConfidencePrecision([o(0.95, true), o(0.92, false), o(0.5, false)])).toEqual({ precision: 0.5, n: 2 });
  expect(highConfidencePrecision([o(0.5, false)])).toEqual({ precision: 1, n: 0 });
});

test("coverage = correct high-confidence links / labeled artists that have a profile", () => {
  expect(coverage([o(0.95, true), o(0.95, false), o(0.4, true)], 4)).toBeCloseTo(0.25);
});

test("calibration buckets", () => {
  const t = calibrationTable([
    { confidence: 0.95, correct: true }, { confidence: 0.91, correct: false }, { confidence: 0.3, correct: false },
  ], [0, 0.6, 0.9, 1.0001]);
  expect(t.find((b) => b.bucket === "0.90-1.00")).toMatchObject({ n: 2, observed: 0.5 });
});

test("lineup match is order-sensitive and ignores case/punctuation", () => {
  const gold = [{ name: "Surfer Girl", role: "headliner" as const, kind: "original_artist" as const }, { name: "JOBY!", role: "supporting" as const, kind: "original_artist" as const }];
  expect(lineupCorrect([{ name: "surfer girl", role: "headliner", kind: "original_artist" }, { name: "Joby", role: "supporting", kind: "original_artist" }], gold)).toBe(true);
  expect(lineupCorrect([{ name: "Joby", role: "supporting", kind: "original_artist" }, { name: "Surfer Girl", role: "headliner", kind: "original_artist" }], gold)).toBe(false);
});

test("twoFold is deterministic and complete", () => {
  const items = ["a", "b", "c", "d", "e"];
  const [x, y] = twoFold(items, (s) => s);
  expect([...x, ...y].sort()).toEqual(items);
  expect(twoFold(items, (s) => s)).toEqual([x, y]);
});
