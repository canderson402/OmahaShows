import { describe, expect, test } from "vitest";
import { acceptAnalysis, AcceptError, parseSpotifyArtistId, type AcceptStore, type PendingAnalysisV2 } from "./accept";
import type { LinkProposal } from "./types";

const ID_A = "4eN6auE38LEQDQ1ntJkCtT";
const ID_B = "0rpMdBzQXf7aYRnu5fDBJy";
const ID_C = "3grvcGPaLhfrD5CYsecr4j";

const link = (id: string, conf = 0.85): LinkProposal => ({
  external_id: id, url: `https://open.spotify.com/artist/${id}`, display_name: "X", evidence: [], confidence: conf,
  raw_score: conf, name_similarity: 1, reason: "exact",
});

function memStore() {
  const artists = new Map<string, { id: string; name: string; genres: string[]; spotify_id: string | null }>();
  const aliases = new Map<string, string>();
  const links: { artist_id: string; external_id: string; status: string; source?: string }[] = [];
  const log: string[] = [];
  let n = 0;
  artists.set("old1", { id: "old1", name: "Surfer Girl", genres: ["indie"], spotify_id: null });
  aliases.set("surfer girl", "old1");
  const store: AcceptStore = {
    async findArtistByAlias(a) { const id = aliases.get(a); return id ? { id, genres: artists.get(id)!.genres } : null; },
    async findArtistByName(name) { const a = [...artists.values()].find((x) => x.name === name); return a ? { id: a.id, genres: a.genres } : null; },
    async createArtist(a) { const id = `new${++n}`; artists.set(id, { id, name: a.name, genres: a.genres, spotify_id: null }); return { id, genres: a.genres }; },
    async addAlias(alias, id) { if (!aliases.has(alias)) aliases.set(alias, id); },
    async getArtistGenres(id) { return artists.get(id)?.genres ?? []; },
    async artistIdBySpotifyId(sid) { return [...artists.values()].find((a) => a.spotify_id === sid)?.id ?? null; },
    async setVerifiedSpotify(id, l) {
      for (const x of links) if (x.artist_id === id && x.status === "verified") x.status = "rejected";
      const ex = links.find((x) => x.artist_id === id && x.external_id === l.external_id);
      if (ex) { ex.status = "verified"; ex.source = l.source; } else links.push({ artist_id: id, external_id: l.external_id, status: "verified", source: l.source });
      artists.get(id)!.spotify_id = l.external_id;
    },
    async rejectSpotify(id, l) { if (!links.find((x) => x.artist_id === id && x.external_id === l.external_id)) links.push({ artist_id: id, external_id: l.external_id, status: "rejected" }); },
    async replaceEventArtists(ev, rows) { log.push(`lineup ${ev}: ${rows.map((r) => `${r.artist_id}/${r.role}/${r.billing_order}`).join(", ")}`); },
    async updateEvent(ev, p) { log.push(`event ${ev}: ${p.category} [${p.genres.join(",")}]`); },
    async markAnalysis(id, s) { log.push(`analysis ${id}: ${s}`); },
  };
  return { store, artists, aliases, links, log };
}

const analysis = (): PendingAnalysisV2 => ({
  id: "pa1", event_id: "ev1",
  event: { category: "music", category_confidence: 0.95, event_genres: ["rock"], reason: "" },
  artists: [
    { kind: "existing", billed_as: "Surfer Girl", artist_id: "old1", role: "headliner", billing_order: 1, confidence: 1 },
    { kind: "new", billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 2, hometown: "Omaha, NE", genres: ["punk"], confidence: 0.85,
      spotify: { chosen: link(ID_A), alternatives: [link(ID_B, 0)] }, youtube: { chosen: null, alternatives: [], deferred: "youtube_disabled" } },
    { kind: "not_an_artist", billed_as: "Catsclaw", category: "other", reason: "unsure", confidence: 0.5, unsure: true },
    { kind: "not_an_artist", billed_as: "DJ Crab", category: "dj", reason: "DJ", confidence: 0.95 },
  ],
});

describe("acceptAnalysis", () => {
  test("no decisions = accept proposals: creates new artist + alias, verifies proposed link, skips non-artists", async () => {
    const m = memStore();
    const r = await acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store, () => "T");
    expect(r).toEqual({ artistsCreated: 1, linksVerified: 1, lineup: 2 });
    expect(m.aliases.get("joby")).toBe("new1");
    expect(m.artists.get("new1")!.spotify_id).toBe(ID_A);
    expect(m.links).toEqual([{ artist_id: "new1", external_id: ID_A, status: "verified", source: "auto" }]);
    expect(m.log).toEqual(["lineup ev1: old1/headliner/1, new1/supporting/2", "event ev1: music [indie,punk]", "analysis pa1: approved"]);
  });

  test("picking an alternative verifies it and remembers the overridden proposal as rejected", async () => {
    const m = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "alternative", external_id: ID_B } }] }, m.store);
    expect(m.artists.get("new1")!.spotify_id).toBe(ID_B);
    expect(m.links).toContainEqual({ artist_id: "new1", external_id: ID_A, status: "rejected" });
    expect(m.links).toContainEqual({ artist_id: "new1", external_id: ID_B, status: "verified", source: "manual" });
  });

  test("an alternative that was never a candidate is refused (no arbitrary ids through that path)", async () => {
    const m = memStore();
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "alternative", external_id: ID_C } }] }, m.store))
      .rejects.toBeInstanceOf(AcceptError);
  });

  test("pasted link is parsed; 'none' leaves the artist unlinked and rejects the proposal", async () => {
    const m = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "manual", value: `https://open.spotify.com/intl-de/artist/${ID_C}?si=abc` } }] }, m.store);
    expect(m.artists.get("new1")!.spotify_id).toBe(ID_C);

    const m2 = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "none" } }] }, m2.store);
    expect(m2.artists.get("new1")!.spotify_id).toBeNull();
    expect(m2.links).toEqual([{ artist_id: "new1", external_id: ID_A, status: "rejected" }]);
  });

  test("garbage pasted link is refused", async () => {
    const m = memStore();
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "manual", value: "https://evil.example/x" } }] }, m.store))
      .rejects.toThrow(/not a Spotify artist link/);
  });

  test("a dropped act marked real joins the lineup (optionally with a pasted link); category override applies", async () => {
    const m = memStore();
    const r = await acceptAnalysis({
      analysis: analysis(), category: "other",
      decisions: [{ index: 2, realArtist: true, spotify: { action: "manual", value: ID_C } }],
    }, m.store);
    expect(r.lineup).toBe(3);
    expect(m.aliases.get("catsclaw")).toBeDefined();
    expect(m.artists.get(m.aliases.get("catsclaw")!)!.spotify_id).toBe(ID_C);
    expect(m.log[1]).toBe("event ev1: other [indie,punk]");
  });

  test("excluded act is left out of the lineup", async () => {
    const m = memStore();
    const r = await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, exclude: true }] }, m.store);
    expect(r.lineup).toBe(1);
    expect(m.links).toEqual([]);
  });

  test("a Spotify profile already owned by another artist is refused with 409", async () => {
    const m = memStore();
    m.artists.get("old1")!.spotify_id = ID_A;
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store)).rejects.toMatchObject({ status: 409 });
  });

  test("idempotent: approving twice gives the same state", async () => {
    const m = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store);
    const r2 = await acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store);
    expect(r2.artistsCreated).toBe(0);
    expect(m.links.filter((l) => l.status === "verified")).toHaveLength(1);
  });
});

test("parseSpotifyArtistId", () => {
  expect(parseSpotifyArtistId(ID_A)).toBe(ID_A);
  expect(parseSpotifyArtistId(` https://open.spotify.com/artist/${ID_A}?si=1 `)).toBe(ID_A);
  expect(parseSpotifyArtistId("spotify:artist:short")).toBeNull();
  expect(parseSpotifyArtistId("https://open.spotify.com/album/" + ID_A)).toBeNull();
});
