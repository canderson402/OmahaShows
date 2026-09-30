import { describe, expect, test } from "vitest";
import { buildExtractionPrompt, extractLineup } from "./extract";
import type { StructuredLLM } from "../clients/llm";
import type { PipelineEvent } from "../types";

const event: PipelineEvent = {
  id: "slowdown-1", title: "Surfer Girl", date: "2026-10-12", venueName: "The Slowdown",
  eventUrl: "https://x", supportingArtists: ["South Summit", "JOBY!"],
};

function fakeLLM(output: unknown): StructuredLLM & { calls: any[] } {
  const calls: any[] = [];
  return { calls, async parse(args) { calls.push(args); return output as any; } };
}

describe("buildExtractionPrompt", () => {
  test("includes title, supporting artists, venue, date and page text", () => {
    const { user } = buildExtractionPrompt(event, "Doors 7pm. South Summit is from Omaha.");
    expect(user).toContain("Surfer Girl");
    expect(user).toContain("South Summit");
    expect(user).toContain("JOBY!");
    expect(user).toContain("The Slowdown");
    expect(user).toContain("2026-10-12");
    expect(user).toContain("South Summit is from Omaha");
  });
  test("says so when no page text", () => {
    expect(buildExtractionPrompt(event, null).user).toContain("(venue page unavailable)");
  });
});

describe("extractLineup", () => {
  test("filters off-list genres and renumbers billing order", async () => {
    const llm = fakeLLM({
      category: "music", category_rating: "high", event_genres: ["indie", "nebraska indie"],
      lineup_rating: "high", reason: "concert",
      acts: [
        { billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 7, kind: "original_artist",
          non_artist_category: null, genres: ["rock", "space rock"], hometown: null, reason: "" },
        { billed_as: "Surfer Girl", clean_name: "Surfer Girl", role: "headliner", billing_order: 1, kind: "original_artist",
          non_artist_category: null, genres: ["indie"], hometown: "Omaha, NE", reason: "" },
        { billed_as: " ", clean_name: " ", role: "supporting", billing_order: 3, kind: "unknown",
          non_artist_category: null, genres: [], hometown: null, reason: "" },
      ],
    });
    const res = await extractLineup(event, null, llm, "m");
    expect(res.event_genres).toEqual(["indie"]);
    expect(res.acts.map((a) => [a.clean_name, a.billing_order])).toEqual([["Surfer Girl", 1], ["JOBY!", 2]]);
    expect(res.acts[1].genres).toEqual(["rock"]);
    expect(llm.calls[0].model).toBe("m");
  });
});
