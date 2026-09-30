import { expect, test } from "vitest";
import { SpotifyError } from "../clients/spotify";
import { QuotaExceededError } from "../clients/youtube";
import { escalateAct, type MessagesClient } from "./escalate";
import type { JudgeContext } from "./judge";

const ctx = (): JudgeContext => ({
  act: { billed_as: "Slumbering Sun", clean_name: "Slumbering Sun", role: "supporting", billing_order: 2, kind: "original_artist",
         non_artist_category: null, genres: ["rock"], hometown: null, reason: "" },
  event: { id: "e", title: "X", date: "2026-10-12", venueName: "Reverb Lounge", eventUrl: null, supportingArtists: [] },
  pageText: null, otherActs: [], spotify: [], youtube: [],
});

const spotify = { async searchArtists() { return [{ id: "sp9", name: "Slumbering Sun", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } };
const youtube = { unitsUsed: () => 0, async searchChannels() { return []; } };

function scripted(responses: any[]): MessagesClient & { calls: any[] } {
  const calls: any[] = [];
  return { calls, messages: { async create(p) { calls.push(structuredClone(p)); return responses.shift(); } } };
}

const msg = (content: any[], stop_reason: string) => ({ id: "m", type: "message", role: "assistant", model: "x", content, stop_reason, stop_sequence: null, usage: {} });

test("tool call adds candidates; submit_decision with cited URL is guarded and returned", async () => {
  const client = scripted([
    msg([{ type: "tool_use", id: "t1", name: "spotify_search", input: { query: "Slumbering Sun" } },
         { type: "web_search_tool_result", tool_use_id: "w1", content: [{ type: "web_search_result", url: "https://slumberingsun.bandcamp.com", title: "x" }] }], "tool_use"),
    msg([{ type: "tool_use", id: "t2", name: "submit_decision", input: {
      spotify: { external_id: "sp9", rating: "high", reason: "bandcamp says Omaha", evidence: ["bandcamp"] },
      youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
      genres: ["rock"], hometown: "Omaha, NE", citations: ["https://slumberingsun.bandcamp.com (Omaha, Nebraska)"],
    } }], "tool_use"),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.candidate?.external_id).toBe("sp9");
  expect(r?.spotify.features).toMatchObject({ web_citation: true, location_evidence: false });
  expect(r?.citations).toHaveLength(1);
  expect(r?.youtubeDeferred).toBe(false);
  expect(client.calls[0].tools.map((t: any) => t.name)).toEqual(["web_search", "spotify_search", "youtube_search", "submit_decision"]);
});

test("submitted id that no tool ever returned is rejected by the guardrail", async () => {
  const client = scripted([
    msg([{ type: "tool_use", id: "t2", name: "submit_decision", input: {
      spotify: { external_id: "made-up", rating: "high", reason: "", evidence: [] },
      youtube: { external_id: null, rating: "low", reason: "", evidence: [] },
      genres: [], hometown: null, citations: ["https://x"],
    } }], "tool_use"),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.candidate).toBeNull();
});

test("pause_turn is resumed; no submission within maxTurns returns null", async () => {
  const client = scripted([msg([{ type: "text", text: "..." }], "pause_turn"), msg([{ type: "text", text: "done" }], "end_turn")]);
  expect(await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5", maxTurns: 2 })).toBeNull();
  expect(client.calls).toHaveLength(2);
});

const submitSp = (id: string, citations: string[]) => msg([{ type: "tool_use", id: "s", name: "submit_decision", input: {
  spotify: { external_id: id, rating: "high", reason: "", evidence: [] },
  youtube: { external_id: null, rating: "low", reason: "", evidence: [] },
  genres: [], hometown: null, citations,
} }], "tool_use");
const searchSp = msg([{ type: "tool_use", id: "t1", name: "spotify_search", input: { query: "q" } }], "tool_use");

test("citation whose URL never appeared in a search result is not counted", async () => {
  const client = scripted([searchSp, submitSp("sp9", ["https://invented.example (Omaha)"])]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.features).toMatchObject({ web_citation: false, location_evidence: false });
  expect(r?.citations).toEqual([]);
});

test("citation from the venue's own domain is not verified; error-shaped search results are skipped", async () => {
  const c = ctx(); c.event.eventUrl = "https://www.reverblounge.com/e/1";
  const client = scripted([
    msg([{ type: "tool_use", id: "t1", name: "spotify_search", input: { query: "q" } },
         { type: "web_search_tool_result", tool_use_id: "w0", content: { type: "web_search_tool_result_error", error_code: "unavailable" } },
         { type: "web_search_tool_result", tool_use_id: "w1", content: [{ type: "web_search_result", url: "https://www.reverblounge.com/e/1", title: "v" }] }], "tool_use"),
    submitSp("sp9", ["https://www.reverblounge.com/e/1"]),
  ]);
  const r = await escalateAct(c, { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.features?.web_citation).toBe(false);
});

test("rejected spotify id returned by a tool never enters the pool", async () => {
  const client = scripted([searchSp, submitSp("sp9", [])]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5",
    rejected: { spotify: new Set(["sp9"]), youtube: new Set() } });
  expect(r?.spotify.candidate).toBeNull();
});

test("SpotifyError from a tool call is rethrown", async () => {
  const bad = { ...spotify, async searchArtists(): Promise<never> { throw new SpotifyError("boom", 500); } };
  const client = scripted([searchSp]);
  await expect(escalateAct(ctx(), { client, spotify: bad as any, youtube, model: "claude-sonnet-5-5" })).rejects.toBeInstanceOf(SpotifyError);
});

test("YouTube quota exhaustion becomes an error tool result and sets youtubeDeferred", async () => {
  const quota = { unitsUsed: () => 0, async searchChannels(): Promise<never> { throw new QuotaExceededError("q"); } };
  const client = scripted([
    msg([{ type: "tool_use", id: "y1", name: "youtube_search", input: { query: "q" } }], "tool_use"),
    submitSp("x", []),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube: quota as any, model: "claude-sonnet-5-5" });
  expect(r?.youtubeDeferred).toBe(true);
  expect(client.calls[1].messages.at(-1).content[0]).toMatchObject({ is_error: true, content: expect.stringContaining("quota") });
});

test("unknown tool gets an is_error result; submit in a mixed turn runs other calls first", async () => {
  const client = scripted([
    msg([{ type: "tool_use", id: "u1", name: "nope", input: {} }], "tool_use"),
    msg([{ type: "tool_use", id: "s", name: "submit_decision", input: {
      spotify: { external_id: "sp9", rating: "high", reason: "", evidence: [] },
      youtube: { external_id: null, rating: "low", reason: "", evidence: [] }, genres: [], hometown: null, citations: [] } },
      { type: "tool_use", id: "t1", name: "spotify_search", input: { query: "q" } }], "tool_use"),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(client.calls[1].messages.at(-1).content[0]).toMatchObject({ is_error: true, content: "unknown tool" });
  expect(r?.spotify.candidate?.external_id).toBe("sp9");
});
