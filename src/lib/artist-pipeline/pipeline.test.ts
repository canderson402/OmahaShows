import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, test } from "vitest";
import { analyzeEvent, RetryableError, type PipelineDeps } from "./pipeline";
import { finalLinkConfidence, loadCalibration } from "./scoring";
import { QuotaExceededError } from "./clients/youtube";
import { SpotifyError } from "./clients/spotify";
import { LLMError } from "./clients/llm";
import type { PipelineEvent, StoredArtist } from "./types";

const event: PipelineEvent = { id: "e1", title: "Surfer Girl", date: "2026-10-12", venueName: "The Slowdown", eventUrl: null, supportingArtists: ["JOBY!", "DJ Crab"] };
const surfer: StoredArtist = { id: "a1", name: "Surfer Girl", genres: ["indie"], spotify_id: "sp1", youtube_channel_id: "UC1", hometown: null };

const extraction = {
  category: "music", category_rating: "high", event_genres: [], lineup_rating: "high", reason: "",
  acts: [
    { billed_as: "Surfer Girl", clean_name: "Surfer Girl", role: "headliner", billing_order: 1, kind: "original_artist", non_artist_category: null, genres: ["indie"], hometown: null, reason: "" },
    { billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 2, kind: "original_artist", non_artist_category: null, genres: ["rock"], hometown: null, reason: "" },
    { billed_as: "DJ Crab", clean_name: "DJ Crab", role: "supporting", billing_order: 3, kind: "not_an_artist", non_artist_category: "dj", genres: [], hometown: null, reason: "DJ" },
  ],
};
const judge = {
  spotify: { external_id: "s-joby", rating: "high", reason: "exact", evidence: [] },
  youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
  genres: ["rock"], hometown: null,
};

function deps(over: Partial<PipelineDeps> = {}): PipelineDeps {
  return {
    llm: { async parse({ schema }) { return (schema as any).shape?.acts ? extraction : judge; } } as any,
    messages: { messages: { async create() { throw new Error("escalation should not run"); } } },
    spotify: { async searchArtists() { return [{ id: "s-joby", name: "Joby", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } },
    youtube: { unitsUsed: () => 0, async searchChannels() { return []; } },
    fetchPage: async () => null,
    repo: { async findByAlias(n) { return n === "surfer girl" ? surfer : null; }, async rejectedExternalIds() { return new Set(); } },
    models: { extract: "m", judge: "m", escalate: "m" },
    calibration: loadCalibration(null),
    escalationBudget: { remaining: 0 },
    ...over,
  };
}

describe("analyzeEvent", () => {
  test("returning artist, new artist and non-artist in one proposal", async () => {
    const p = await analyzeEvent(event, deps());
    expect(p.schema_version).toBe(2);
    expect(p.artists.map((a) => a.kind)).toEqual(["existing", "new", "not_an_artist"]);
    const joby = p.artists[1] as Extract<typeof p.artists[number], { kind: "new" }>;
    expect(joby.spotify.chosen?.url).toBe("https://open.spotify.com/artist/s-joby");
    expect(joby.youtube.chosen).toBeNull();
    expect(p.overall_confidence).toBeGreaterThan(0);
    expect(p.overall_confidence).toBeLessThanOrEqual(1);
  });

  test("spotify outage is retryable, not an empty match", async () => {
    const d = deps({ spotify: { async searchArtists() { throw new SpotifyError("down", 503); }, async albumTitles() { return []; } } });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("LLM refusal / max_tokens is retryable, never a silent empty result", async () => {
    const d = deps({ llm: { async parse() { throw new LLMError("refusal"); } } as any });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("youtube quota exhaustion defers youtube but keeps going", async () => {
    const d = deps({ youtube: { unitsUsed: () => 0, async searchChannels() { throw new QuotaExceededError("q"); } } });
    const p = await analyzeEvent(event, d);
    const joby = p.artists[1] as any;
    expect(joby.youtube).toMatchObject({ chosen: null, deferred: "youtube_quota" });
    expect(joby.spotify.chosen).not.toBeNull();
  });
});

describe("escalation", () => {
  const oneAct = (name: string) => ({ ...extraction, acts: [{ ...extraction.acts[1], billed_as: name, clean_name: name, billing_order: 1 }] });
  const noPick = { ...judge, spotify: { external_id: null, rating: "low", reason: "unsure", evidence: [] } };
  const llmFor = (ex: unknown, j: unknown) => ({ async parse({ schema }: any) { return schema.shape?.acts ? ex : j; } }) as any;
  const msg = (content: any[], stop_reason = "tool_use") => ({ id: "m", type: "message", role: "assistant", model: "x", content, stop_reason, stop_sequence: null, usage: {} }) as any;
  const submit = (spotifyId: string, citations: string[]) => ({
    type: "tool_use", id: "s", name: "submit_decision",
    input: {
      spotify: { external_id: spotifyId, rating: "high", reason: "bandcamp links it", evidence: [] },
      youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
      genres: ["rock"], hometown: null, citations,
    },
  });

  test("runs when budget > 0 and judge gave no candidate; citations land in evidence; budget decrements", async () => {
    const budget = { remaining: 1 };
    const url = "https://joby.bandcamp.com";
    const responses = [msg([
      { type: "web_search_tool_result", tool_use_id: "w", content: [{ type: "web_search_result", url, title: "x" }] },
      submit("s-joby", [`${url} (Omaha)`]),
    ])];
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), noPick),
      messages: { messages: { async create() { return responses.shift(); } } },
      escalationBudget: budget, escalation: true,
    });
    const p = await analyzeEvent(event, d);
    const joby = p.artists[0] as any;
    expect(budget.remaining).toBe(0);
    expect(joby.spotify.chosen?.external_id).toBe("s-joby");
    expect(joby.spotify.chosen.evidence).toContain(`cited: ${url} (Omaha)`);
  });

  test("budget exhausted: needed escalation is deferred, pick without candidate is never chosen", async () => {
    const p = await analyzeEvent(event, deps({ llm: llmFor(oneAct("JOBY!"), noPick), escalation: true }));
    const a = p.artists[0] as any;
    expect(a.spotify.chosen).toBeNull();
    expect(a.spotify.deferred).toBe("escalation_budget");
    expect(a.youtube.deferred).toBe("escalation_budget");
  });

  test("youtube_quota deferral is kept over escalation_budget", async () => {
    const d = deps({ escalation: true,
      llm: llmFor(oneAct("JOBY!"), noPick),
      youtube: { unitsUsed: () => 0, async searchChannels() { throw new QuotaExceededError("q"); } },
    });
    const a = (await analyzeEvent(event, d)).artists[0] as any;
    expect(a.youtube.deferred).toBe("youtube_quota");
    expect(a.spotify.deferred).toBe("escalation_budget");
  });

  test("escalation with no candidate keeps the judge's pick for that platform", async () => {
    const responses = [msg([submit("made-up", [])])];
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), { ...judge, youtube: { external_id: null, rating: "low", reason: "", evidence: [] } }),
      messages: { messages: { async create() { return responses.shift(); } } },
      escalationBudget: { remaining: 1 }, escalation: true,
    });
    const a = (await analyzeEvent(event, d)).artists[0] as any;
    expect(a.spotify.chosen?.external_id).toBe("s-joby");
    expect(a.spotify.chosen.evidence.some((e: string) => e.startsWith("cited:"))).toBe(false);
  });

  test("escalation returning empty genres/null hometown falls back to the judge's values", async () => {
    const responses = [msg([{
      type: "tool_use", id: "s", name: "submit_decision",
      input: {
        spotify: { external_id: "s-joby", rating: "high", reason: "r", evidence: [] },
        youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
        genres: [], hometown: null, citations: [],
      },
    }])];
    const budget = { remaining: 1 };
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), { ...judge, genres: ["punk"], hometown: "Lincoln, NE" }),
      messages: { messages: { async create() { return responses.shift(); } } },
      escalationBudget: budget, escalation: true,
    });
    const a = (await analyzeEvent(event, d)).artists[0] as any;
    expect(budget.remaining).toBe(0);
    expect(responses).toHaveLength(0);
    expect(a.genres).toEqual(["punk"]);
    expect(a.hometown).toBe("Lincoln, NE");
  });

  test("overall_confidence = lineup x category x act factors, no-match factor 0.5", async () => {
    const p = await analyzeEvent(event, deps({ llm: llmFor(oneAct("JOBY!"), judge) }));
    const a = p.artists[0] as any;
    // Features the fixture yields: exact-name Spotify candidate, judge "high", nothing else.
    const spConf = finalLinkConfidence(
      { judge_rating: "high", name_similarity: 1, corroborated: false, location_evidence: false, web_citation: false, same_name_count: 1, official_channel: false },
      loadCalibration(null).link,
    );
    expect(spConf).toBeCloseTo(0.8, 10); // 0.7 (high) + 0.1 (exact name)
    expect(a.spotify.chosen.confidence).toBeCloseTo(spConf, 10);
    expect(a.youtube.chosen).toBeNull();
    expect(a.confidence).toBeCloseTo(spConf * 0.5, 10);
    expect(p.overall_confidence).toBeCloseTo(0.95 * 0.95 * spConf * 0.5, 10);
  });

  test("QuotaExceededError never escapes raw", async () => {
    const d = deps({ fetchPage: async () => { throw new QuotaExceededError("q"); } });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("Anthropic.APIError from escalation is retryable", async () => {
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), noPick),
      messages: { messages: { async create() { throw new Anthropic.APIError(529, undefined, "overloaded", undefined); } } },
      escalationBudget: { remaining: 1 }, escalation: true,
    });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("non-retryable Anthropic.APIError (400) from escalation is rethrown raw", async () => {
    const err = new Anthropic.APIError(400, undefined, "bad request", undefined);
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), noPick),
      messages: { messages: { async create() { throw err; } } },
      escalationBudget: { remaining: 1 }, escalation: true,
    });
    const e = await analyzeEvent(event, d).catch((x) => x);
    expect(e).toBe(err);
    expect(e).not.toBeInstanceOf(RetryableError);
  });

  test("YouTube quota hit during escalation is kept when escalation yields no decision", async () => {
    let calls = 0;
    const responses = [msg([{ type: "tool_use", id: "y", name: "youtube_search", input: { query: "q" } }]), msg([{ type: "text", text: "give up" }], "end_turn")];
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), noPick),
      youtube: { unitsUsed: () => 0, async searchChannels() { if (calls++ === 0) return []; throw new QuotaExceededError("q"); } },
      messages: { messages: { async create() { return responses.shift(); } } },
      escalationBudget: { remaining: 1 }, escalation: true,
    });
    const a = (await analyzeEvent(event, d)).artists[0] as any;
    expect(a.youtube).toMatchObject({ chosen: null, deferred: "youtube_quota" });
  });

  test("unknown act becomes an explicit unsure not_an_artist entry", async () => {
    const ex = { ...extraction, acts: [{ ...extraction.acts[1], kind: "unknown", reason: "cannot tell" }] };
    const p = await analyzeEvent(event, deps({ llm: llmFor(ex, judge) }));
    expect(p.artists[0]).toMatchObject({ kind: "not_an_artist", unsure: true });
    const dj = await analyzeEvent(event, deps());
    expect((dj.artists[2] as any).unsure).toBeUndefined();
  });

  test("rejected ids for an existing artist reach escalation and are not chosen", async () => {
    const partial: StoredArtist = { ...surfer, spotify_id: null };
    const seenRejected: string[] = [];
    const responses = [msg([
      { type: "tool_use", id: "t", name: "spotify_search", input: { query: "Surfer Girl" } },
      submit("s-bad", ["https://x.example"]),
    ])];
    const budget = { remaining: 1 };
    const d = deps({
      llm: llmFor(oneAct("Surfer Girl"), noPick),
      spotify: { async searchArtists() { return [{ id: "s-bad", name: "Surfer Girl", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } },
      repo: {
        async findByAlias() { return partial; },
        async rejectedExternalIds(_id, platform) { seenRejected.push(platform); return platform === "spotify" ? new Set(["s-bad"]) : new Set(); },
      },
      messages: { messages: { async create() { return responses.shift(); } } },
      escalationBudget: budget, escalation: true,
    });
    const p = await analyzeEvent(event, d);
    expect(budget.remaining).toBe(0); // escalation actually ran
    expect(responses).toHaveLength(0);
    const entry = p.artists[0] as any;
    expect(entry.kind).toBe("existing");
    expect(entry.new_links.spotify.chosen).toBeNull();
    expect(seenRejected.sort()).toEqual(["spotify", "youtube"]);
  });
});

describe("YouTube disabled (youtube: null)", () => {
  test("youtube is never searched or scored; decision marked youtube_disabled; confidence uses spotify only", async () => {
    const p = await analyzeEvent(event, deps({ youtube: null }));
    const joby = p.artists[1] as Extract<typeof p.artists[number], { kind: "new" }>;
    expect(joby.youtube).toEqual({ chosen: null, alternatives: [], deferred: "youtube_disabled" });
    expect(joby.spotify.chosen?.external_id).toBe("s-joby");
    expect(joby.confidence).toBeCloseTo(joby.spotify.chosen!.confidence, 10); // no 0.5 no-match factor for youtube
  });

  test("returning artist with spotify linked but no youtube counts as fully linked", async () => {
    const noYt: StoredArtist = { ...surfer, youtube_channel_id: null };
    const p = await analyzeEvent(event, deps({
      youtube: null,
      repo: { async findByAlias(n) { return n === "surfer girl" ? noYt : null; }, async rejectedExternalIds() { return new Set(); } },
    }));
    expect(p.artists[0]).toMatchObject({ kind: "existing", artist_id: "a1", confidence: 1 });
    expect((p.artists[0] as any).new_links).toBeUndefined();
  });
});


describe("clear-cut rule (escalation off by default)", () => {
  const withJudge = (sp: object) => deps({ llm: { async parse({ schema }: any) { return schema.shape?.acts ? extraction : { ...judge, spotify: { ...judge.spotify, ...sp } }; } } as any });
  test("exact name + high rating + unique name is proposed", async () => {
    const p = await analyzeEvent(event, withJudge({}));
    expect((p.artists[1] as any).spotify.chosen?.external_id).toBe("s-joby");
  });
  test("a medium-rated pick is left blank but kept as an alternative", async () => {
    const p = await analyzeEvent(event, withJudge({ rating: "medium" }));
    const sp = (p.artists[1] as any).spotify;
    expect(sp.chosen).toBeNull();
    expect(sp.alternatives.map((a: any) => a.external_id)).toContain("s-joby");
  });
  test("two Spotify artists with the same name: left blank", async () => {
    const d = deps({ spotify: { async searchArtists() { return [{ id: "s-joby", name: "Joby", genres: [], imageUrl: null }, { id: "s-joby2", name: "JOBY", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } } });
    const p = await analyzeEvent(event, d);
    expect((p.artists[1] as any).spotify.chosen).toBeNull();
  });
  test("escalation never runs unless enabled, and nothing is marked deferred", async () => {
    const p = await analyzeEvent(event, withJudge({ external_id: null, rating: "low" }));
    expect((p.artists[1] as any).spotify.deferred).toBeUndefined();
  });
});


describe("needsReview", () => {
  const base = { event_id: "e", schema_version: 2 as const, lineup_confidence: 0.95, overall_confidence: 0.9,
    event: { category: "other" as const, category_confidence: 0.95, event_genres: [], reason: "" } };
  test("karaoke / event-name only shows skip the queue", async () => {
    const { needsReview } = await import("./pipeline");
    expect(needsReview({ ...base, artists: [{ kind: "not_an_artist", billed_as: "Karaoke with Taylor!", category: "other", reason: "karaoke", confidence: 0.95 }] })).toBe(false);
    expect(needsReview({ ...base, artists: [] })).toBe(false);
  });
  test("any unsure act or any artist goes to review", async () => {
    const { needsReview } = await import("./pipeline");
    expect(needsReview({ ...base, artists: [{ kind: "not_an_artist", billed_as: "Loud Pack Ent", category: "other", reason: "unsure", confidence: 0.5, unsure: true }] })).toBe(true);
    expect(needsReview({ ...base, artists: [{ kind: "existing", billed_as: "X", artist_id: "a", role: "headliner", billing_order: 1, confidence: 1 }] })).toBe(true);
  });
});
