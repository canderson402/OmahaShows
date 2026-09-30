import { expect, test } from "vitest";
import { gatherSpotifyCandidates, gatherYouTubeCandidates } from "./candidates";
import type { SpotifyClient } from "../clients/spotify";
import type { YouTubeClient } from "../clients/youtube";

const spotify: SpotifyClient = {
  async searchArtists(q) {
    return [
      { id: "s1", name: "Joby", genres: ["nebraska indie"], imageUrl: null },
      { id: "s2", name: "Joby Talbot", genres: ["soundtrack"], imageUrl: null },
      { id: "s1", name: "Joby", genres: [], imageUrl: null }, // duplicate across queries
      { id: "bad", name: "Joby", genres: [], imageUrl: null },
    ].filter(() => q.length > 0);
  },
  async albumTitles() { return ["Tape One (2024)"]; },
};

test("spotify: dedupes, drops rejected, sorts by similarity, adds album evidence", async () => {
  const c = await gatherSpotifyCandidates({ clean_name: "JOBY!", billed_as: "JOBY!" }, spotify, new Set(["bad"]));
  expect(c.map((x) => x.external_id)).toEqual(["s1", "s2"]);
  expect(c[0].name_similarity).toBe(1);
  expect(c[0].url).toBe("https://open.spotify.com/artist/s1");
  expect(c[0].details).toContain("albums: Tape One (2024)");
});

const youtube: YouTubeClient = {
  unitsUsed: () => 0,
  async searchChannels() {
    return [{ id: "UC1", title: "JOBY! - Topic", description: "", customUrl: null, subscriberCount: 40 }];
  },
};

test("youtube: marks Topic channels official and compares name without the suffix", async () => {
  const c = await gatherYouTubeCandidates({ clean_name: "JOBY!" }, youtube, new Set());
  expect(c[0]).toMatchObject({ external_id: "UC1", official: true, name_similarity: 1 });
  expect(c[0].url).toBe("https://www.youtube.com/channel/UC1");
});
