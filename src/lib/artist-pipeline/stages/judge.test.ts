import { describe, expect, test } from "vitest";
import { applyGuardrails, type JudgeContext } from "./judge";
import type { Candidate } from "../types";

const cand = (p: Partial<Candidate>): Candidate => ({
  platform: "spotify", external_id: "s1", url: "https://open.spotify.com/artist/s1", display_name: "Joby",
  name_similarity: 1, genres: [], details: [], official: false, description: "", ...p,
});

const ctx = (spotify: Candidate[], youtube: Candidate[] = []): JudgeContext => ({
  act: { billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 2, kind: "original_artist",
         non_artist_category: null, genres: ["rock"], hometown: null, reason: "" },
  event: { id: "e", title: "Surfer Girl", date: "2026-10-12", venueName: "The Slowdown", eventUrl: null, supportingArtists: [] },
  pageText: null, otherActs: ["Surfer Girl"], spotify, youtube,
});

const pick = (external_id: string | null, rating: "high" | "medium" | "low" = "high") =>
  ({ external_id, rating, reason: "r", evidence: [] });

describe("applyGuardrails", () => {
  test("id not in candidate list becomes null (no fabricated links)", () => {
    const r = applyGuardrails({ spotify: pick("invented"), youtube: pick(null), genres: [], hometown: null }, ctx([cand({})]));
    expect(r.spotify.candidate).toBeNull();
    expect(r.spotify.features).toBeNull();
  });
  test("valid pick yields features incl. ambiguity count", () => {
    const r = applyGuardrails(
      { spotify: pick("s1"), youtube: pick(null), genres: ["rock", "space rock"], hometown: null },
      ctx([cand({}), cand({ external_id: "s2", display_name: "JOBY" })]),
    );
    expect(r.spotify.candidate?.external_id).toBe("s1");
    expect(r.spotify.features).toMatchObject({ judge_rating: "high", name_similarity: 1, same_name_count: 2, corroborated: false });
    expect(r.genres).toEqual(["rock"]);
  });
  test("youtube description linking the chosen spotify id marks both corroborated", () => {
    const yt = cand({ platform: "youtube", external_id: "UC1", url: "u", description: "open.spotify.com/artist/s1" });
    const r = applyGuardrails({ spotify: pick("s1"), youtube: pick("UC1"), genres: [], hometown: null }, ctx([cand({})], [yt]));
    expect(r.spotify.features?.corroborated).toBe(true);
    expect(r.youtube.features?.corroborated).toBe(true);
  });
  test("location evidence from page text or description", () => {
    const c = ctx([cand({})]);
    c.pageText = "JOBY! (Omaha)";
    const r = applyGuardrails({ spotify: pick("s1"), youtube: pick(null), genres: [], hometown: null }, c);
    expect(r.spotify.features?.location_evidence).toBe(true);
  });
});
