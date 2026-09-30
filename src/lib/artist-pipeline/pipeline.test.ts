import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, test } from "vitest";
import { analyzeEvent, RetryableError, type PipelineDeps } from "./pipeline";
import { loadCalibration } from "./scoring";
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
      escalationBudget: budget,
    });
    const p = await analyzeEvent(event, d);
    const joby = p.artists[0] as any;
    expect(budget.remaining).toBe(0);
    expect(joby.spotify.chosen?.external_id).toBe("s-joby");
    expect(joby.spotify.chosen.evidence).toContain(`cited: ${url} (Omaha)`);
  });

  test("no escalation when budget is 0 and a pick without candidate is never chosen", async () => {
    const p = await analyzeEvent(event, deps({ llm: llmFor(oneAct("JOBY!"), noPick) }));
    expect((p.artists[0] as any).spotify.chosen).toBeNull();
  });

  test("Anthropic.APIError from escalation is retryable", async () => {
    const d = deps({
      llm: llmFor(oneAct("JOBY!"), noPick),
      messages: { messages: { async create() { throw new Anthropic.APIError(529, undefined, "overloaded", undefined); } } },
      escalationBudget: { remaining: 1 },
    });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("rejected ids for an existing artist reach escalation and are not chosen", async () => {
    const partial: StoredArtist = { ...surfer, spotify_id: null };
    const seenRejected: string[] = [];
    const responses = [msg([
      { type: "tool_use", id: "t", name: "spotify_search", input: { query: "Surfer Girl" } },
      submit("s-bad", ["https://x.example"]),
    ])];
    const d = deps({
      llm: llmFor(oneAct("Surfer Girl"), noPick),
      spotify: { async searchArtists() { return [{ id: "s-bad", name: "Surfer Girl", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } },
      repo: {
        async findByAlias() { return partial; },
        async rejectedExternalIds(_id, platform) { seenRejected.push(platform); return platform === "spotify" ? new Set(["s-bad"]) : new Set(); },
      },
      messages: { messages: { async create() { return responses.shift(); } } },
      escalationBudget: { remaining: 1 },
    });
    const p = await analyzeEvent(event, d);
    const entry = p.artists[0] as any;
    expect(entry.kind).toBe("existing");
    expect(entry.new_links.spotify.chosen).toBeNull();
    expect(seenRejected.sort()).toEqual(["spotify", "youtube"]);
  });
});
