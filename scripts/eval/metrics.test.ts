import { expect, test } from "vitest";
import { calibrationTable, coverage, extractProfileId, highConfidencePrecision, lineupCorrect, nonArtistRejection, twoFold } from "./metrics";

const o = (confidence: number, correct: boolean) => ({ platform: "spotify" as const, confidence, rawScore: confidence, correct });

test("precision only counts links at/above threshold", () => {
  expect(highConfidencePrecision([o(0.95, true), o(0.92, false), o(0.5, false)])).toEqual({ precision: 0.5, n: 2 });
  expect(highConfidencePrecision([o(0.5, false)])).toEqual({ precision: null, n: 0 });
});

test("non-artist rejection matches on billed_as or clean_name and reports unmatched separately", () => {
  const entries = [
    { kind: "not_an_artist", billed_as: "Trivia Night" },
    { kind: "new", billed_as: "Bad Dudes Tribute", clean_name: "Bad Dudes" },
    { kind: "new", billed_as: "Joby", clean_name: "Joby" },
  ];
  expect(nonArtistRejection(["trivia night", "Bad Dudes", "Joby", "Ghost Act"], entries))
    .toEqual({ correct: 1, matched: 3, unmatched: 1 });
});

test("extractProfileId reduces profile URLs to ids and keeps other text", () => {
  expect(extractProfileId("https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb?si=abc")).toBe("4Z8W4fKeB5YxbusRsdQVPb");
  expect(extractProfileId("https://www.youtube.com/channel/UCabc_123-x/videos")).toBe("UCabc_123-x");
  expect(extractProfileId("rawid123")).toBe("rawid123");
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
