import { describe, expect, test } from "vitest";
import { acceptAnalysis, AcceptError, parseSpotifyArtistId, validateDecisions, type AcceptStore, type PendingAnalysisV2 } from "./accept";
import type { LinkProposal } from "./types";

const ID_A = "4eN6auE38LEQDQ1ntJkCtT";
const ID_B = "0rpMdBzQXf7aYRnu5fDBJy";
const ID_C = "3grvcGPaLhfrD5CYsecr4j";
const ID_FAKE = "zzzzzzzzzzzzzzzzzzzzzz";

const link = (id: string, conf = 0.85): LinkProposal => ({
  external_id: id, url: `https://open.spotify.com/artist/${id}`, display_name: "X", evidence: [], confidence: conf,
  raw_score: conf, name_similarity: 1, reason: "exact",
});

function memStore() {
  const artists = new Map<string, { id: string; name: string; genres: string[]; spotify_id: string | null; spotify_url: string | null }>();
  const aliases = new Map<string, string>();
  const links: { artist_id: string; external_id: string; status: string; source?: string }[] = [];
  const writes: string[] = [];
  let n = 0;
  artists.set("old1", { id: "old1", name: "Surfer Girl", genres: ["indie"], spotify_id: null, spotify_url: null });
  aliases.set("surfer girl", "old1");
  const store: AcceptStore = {
    async findArtistByAlias(a) { const id = aliases.get(a); return id ? { id, genres: artists.get(id)!.genres } : null; },
    async findArtistByName(name) { const a = [...artists.values()].find((x) => x.name.toLowerCase() === name.toLowerCase()); return a ? { id: a.id, genres: a.genres } : null; },
    async artistExists(id) { return artists.has(id); },
    async createArtist(a) { writes.push("createArtist"); const id = `new${++n}`; artists.set(id, { id, name: a.name, genres: a.genres, spotify_id: null, spotify_url: null }); return { id, genres: a.genres }; },
    async addAlias(alias, id) { writes.push("addAlias"); if (!aliases.has(alias)) aliases.set(alias, id); },
    async getArtistGenres(id) { return artists.get(id)?.genres ?? []; },
    async artistIdBySpotifyId(sid) { return [...artists.values()].find((a) => a.spotify_id === sid || a.spotify_url?.includes(sid))?.id ?? null; },
    async lookupSpotifyArtist(sid) { return sid === ID_FAKE ? null : "Some Artist"; },
    async setVerifiedSpotify(id, l) {
      writes.push("setVerified");
      for (const x of links) if (x.artist_id === id && x.status === "verified") x.status = "rejected";
      const ex = links.find((x) => x.artist_id === id && x.external_id === l.external_id);
      if (ex) { ex.status = "verified"; ex.source = l.source; } else links.push({ artist_id: id, external_id: l.external_id, status: "verified", source: l.source });
      const a = artists.get(id)!; a.spotify_id = l.external_id; a.spotify_url = l.url;
    },
    async rejectSpotify(id, l) {
      writes.push("reject");
      const ex = links.find((x) => x.artist_id === id && x.external_id === l.external_id);
      if (ex) ex.status = "rejected"; else links.push({ artist_id: id, external_id: l.external_id, status: "rejected" });
      const a = artists.get(id)!;
      if (a.spotify_id === l.external_id || a.spotify_url?.includes(l.external_id)) { a.spotify_id = null; a.spotify_url = null; }
    },
    async replaceEventArtists(ev, rows) { writes.push(`lineup ${ev}: ${rows.map((r) => `${r.artist_id}/${r.role}/${r.billing_order}`).join(", ")}`); },
    async updateEvent(ev, p) { writes.push(`event ${ev}: ${p.category} [${p.genres.join(",")}]`); },
    async markAnalysis(id, s) { writes.push(`analysis ${id}: ${s}`); },
  };
  return { store, artists, aliases, links, writes };
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
    expect(m.writes.slice(-3)).toEqual(["lineup ev1: old1/headliner/1, new1/supporting/2", "event ev1: music [indie,punk]", "analysis pa1: approved"]);
  });

  test("picking an alternative verifies it and remembers the overridden proposal as rejected", async () => {
    const m = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "alternative", external_id: ID_B } }] }, m.store);
    expect(m.artists.get("new1")!.spotify_id).toBe(ID_B);
    expect(m.links).toContainEqual({ artist_id: "new1", external_id: ID_A, status: "rejected" });
    expect(m.links).toContainEqual({ artist_id: "new1", external_id: ID_B, status: "verified", source: "manual" });
  });

  test("an alternative that was never a candidate is refused, before any write", async () => {
    const m = memStore();
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "alternative", external_id: ID_C } }] }, m.store))
      .rejects.toBeInstanceOf(AcceptError);
    expect(m.writes).toEqual([]);
  });

  test("pasted link is parsed and confirmed with Spotify; a link Spotify doesn't know is refused before any write", async () => {
    const m = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "manual", value: `https://open.spotify.com/intl-de/artist/${ID_C}?si=abc` } }] }, m.store);
    expect(m.artists.get("new1")!.spotify_id).toBe(ID_C);

    const m2 = memStore();
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "manual", value: ID_FAKE } }] }, m2.store))
      .rejects.toThrow(/Spotify has no artist/);
    expect(m2.writes).toEqual([]);
  });

  test("'none' on a link the artist already shows publicly clears it from the artist (legacy spotify_url too)", async () => {
    const m = memStore();
    m.artists.get("old1")!.spotify_url = `https://open.spotify.com/artist/${ID_A}`;
    const a = analysis();
    a.artists[0] = { kind: "existing", billed_as: "Surfer Girl", artist_id: "old1", role: "headliner", billing_order: 1, confidence: 0.85,
      new_links: { spotify: { chosen: link(ID_A), alternatives: [] } } };
    await acceptAnalysis({ analysis: a, decisions: [{ index: 0, spotify: { action: "none" } }, { index: 1, exclude: true }] }, m.store);
    expect(m.artists.get("old1")!.spotify_url).toBeNull();
    expect(m.artists.get("old1")!.spotify_id).toBeNull();
    expect(m.links).toContainEqual({ artist_id: "old1", external_id: ID_A, status: "rejected" });
  });

  test("garbage pasted link is refused", async () => {
    const m = memStore();
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, spotify: { action: "manual", value: "https://evil.example/artist/" + ID_A } }] }, m.store))
      .rejects.toThrow(/not a Spotify artist link/);
  });

  test("a dropped act marked real joins the lineup (optionally with a pasted link); category override applies", async () => {
    const m = memStore();
    const r = await acceptAnalysis({
      analysis: analysis(), category: "other",
      decisions: [{ index: 2, realArtist: true, spotify: { action: "manual", value: ID_C } }],
    }, m.store);
    expect(r.lineup).toBe(3);
    expect(m.artists.get(m.aliases.get("catsclaw")!)!.spotify_id).toBe(ID_C);
    expect(m.writes.at(-2)).toBe("event ev1: other [indie,punk]");
  });

  test("excluded act is left out of the lineup", async () => {
    const m = memStore();
    const r = await acceptAnalysis({ analysis: analysis(), decisions: [{ index: 1, exclude: true }] }, m.store);
    expect(r.lineup).toBe(1);
    expect(m.links).toEqual([]);
  });

  test("a Spotify profile shown by another artist is refused with 409 before any write", async () => {
    const m = memStore();
    m.artists.get("old1")!.spotify_url = `https://open.spotify.com/artist/${ID_A}`;
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store)).rejects.toMatchObject({ status: 409 });
    expect(m.writes).toEqual([]);
  });

  test("a returning artist that was deleted since Analyze: 409 before any write (lineup untouched)", async () => {
    const m = memStore();
    m.artists.delete("old1");
    await expect(acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store)).rejects.toMatchObject({ status: 409 });
    expect(m.writes).toEqual([]);
  });

  test("case-insensitive name match reuses an existing artist instead of creating a duplicate", async () => {
    const m = memStore();
    m.artists.set("j1", { id: "j1", name: "Joby!", genres: [], spotify_id: null, spotify_url: null });
    const r = await acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store);
    expect(r.artistsCreated).toBe(0);
    expect(m.artists.get("j1")!.spotify_id).toBe(ID_A);
  });

  test("idempotent: approving twice gives the same state", async () => {
    const m = memStore();
    await acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store);
    const r2 = await acceptAnalysis({ analysis: analysis(), decisions: [] }, m.store);
    expect(r2.artistsCreated).toBe(0);
    expect(m.links.filter((l) => l.status === "verified")).toHaveLength(1);
  });
});

describe("validateDecisions", () => {
  const a = analysis();
  test.each([
    ["not a list", { index: 0 }],
    ["null element", [null]],
    ["string index", [{ index: "0" }]],
    ["out of range", [{ index: 9 }]],
    ["duplicate index", [{ index: 1 }, { index: 1 }]],
    ["bad flag", [{ index: 1, exclude: "yes" }]],
    ["unknown action", [{ index: 1, spotify: { action: "steal" } }]],
    ["manual without string", [{ index: 1, spotify: { action: "manual", value: 5 } }]],
  ])("rejects %s", (_n, raw) => {
    expect(() => validateDecisions(raw, a)).toThrow(AcceptError);
  });
  test("accepts well-formed input and drops unknown fields", () => {
    expect(validateDecisions([{ index: 1, extra: 1, spotify: { action: "none", junk: true } }], a)).toEqual([{ index: 1, spotify: { action: "none" } }]);
    expect(validateDecisions(undefined, a)).toEqual([]);
  });
});

test("parseSpotifyArtistId", () => {
  expect(parseSpotifyArtistId(ID_A)).toBe(ID_A);
  expect(parseSpotifyArtistId(` https://open.spotify.com/artist/${ID_A}?si=1 `)).toBe(ID_A);
  expect(parseSpotifyArtistId(`open.spotify.com/artist/${ID_A}`)).toBe(ID_A);
  expect(parseSpotifyArtistId(`https://open.spotify.com/artist/${ID_A}X`)).toBeNull();          // 23 chars: typo, not truncated
  expect(parseSpotifyArtistId(`https://evil.example/open.spotify.com/artist/${ID_A}`)).toBeNull(); // host anchored
  expect(parseSpotifyArtistId("spotify:artist:short")).toBeNull();
  expect(parseSpotifyArtistId("https://open.spotify.com/album/" + ID_A)).toBeNull();
});
