import { expect, test } from "vitest";
import { hasLocationEvidence, spotifyIdInText } from "./evidence";

test("detects Omaha/Nebraska mentions", () => {
  expect(hasLocationEvidence(["Indie rock from Omaha, NE"])).toBe(true);
  expect(hasLocationEvidence(["Lincoln, Nebraska band"])).toBe(true);
  expect(hasLocationEvidence(["Based in Council Bluffs"])).toBe(true);
  expect(hasLocationEvidence(["From Austin, TX"])).toBe(false);
});
test("finds a Spotify artist id in a description", () => {
  const d = "Listen: https://open.spotify.com/artist/4eN6auE38LEQDQ1ntJkCtT?si=x";
  expect(spotifyIdInText("4eN6auE38LEQDQ1ntJkCtT", d)).toBe(true);
  expect(spotifyIdInText("0000000000000000000000", d)).toBe(false);
});
