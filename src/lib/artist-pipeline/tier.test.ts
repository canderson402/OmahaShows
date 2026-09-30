import { describe, expect, test } from "vitest";
import { confidenceTier } from "./tier";
import type { EventClassification, LineupEntry, LinkProposal } from "./types";

const event = (category_confidence = 0.95): EventClassification => ({ category: "music", category_confidence, event_genres: [], reason: "" });
const link: LinkProposal = { external_id: "4eN6auE38LEQDQ1ntJkCtT", url: "u", display_name: "X", evidence: [], confidence: 0.8, raw_score: 0.8, name_similarity: 1, reason: "" };
const newAct = (chosen: LinkProposal | null): LineupEntry => ({
  kind: "new", billed_as: "X", clean_name: "X", role: "headliner", billing_order: 1, hometown: null, genres: [], confidence: 0.8,
  spotify: { chosen, alternatives: [] }, youtube: { chosen: null, alternatives: [], deferred: "youtube_disabled" },
});
const existing: LineupEntry = { kind: "existing", billed_as: "Y", artist_id: "a", role: "supporting", billing_order: 2, confidence: 1 };

describe("confidenceTier", () => {
  test("every act matched or returning, clear category: high", () => {
    expect(confidenceTier({ event: event(), artists: [newAct(link), existing] })).toBe("high");
  });
  test("a clear non-artist (DJ) alongside matched acts is still high", () => {
    expect(confidenceTier({ event: event(), artists: [newAct(link), { kind: "not_an_artist", billed_as: "DJ", category: "dj", reason: "", confidence: 0.95 }] })).toBe("high");
  });
  test.each([
    ["an artist with no match", [newAct(null)], 0.95],
    ["an unsure act", [newAct(link), { kind: "not_an_artist", billed_as: "?", category: "other", reason: "", confidence: 0.5, unsure: true } as LineupEntry], 0.95],
    ["a returning artist missing a proposed link", [{ ...existing, new_links: { spotify: { chosen: null, alternatives: [] } } } as LineupEntry], 0.95],
    ["an unclear category", [newAct(link)], 0.75],
    ["no artists at all", [], 0.95],
  ])("%s: needs review", (_n, artists, cat) => {
    expect(confidenceTier({ event: event(cat as number), artists: artists as LineupEntry[] })).toBe("review");
  });
});
