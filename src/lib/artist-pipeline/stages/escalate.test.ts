import { expect, test } from "vitest";
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
    msg([{ type: "tool_use", id: "t1", name: "spotify_search", input: { query: "Slumbering Sun" } }], "tool_use"),
    msg([{ type: "tool_use", id: "t2", name: "submit_decision", input: {
      spotify: { external_id: "sp9", rating: "high", reason: "bandcamp says Omaha", evidence: ["bandcamp"] },
      youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
      genres: ["rock"], hometown: "Omaha, NE", citations: ["https://slumberingsun.bandcamp.com (Omaha, Nebraska)"],
    } }], "tool_use"),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.candidate?.external_id).toBe("sp9");
  expect(r?.spotify.features).toMatchObject({ web_citation: true, location_evidence: true });
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
