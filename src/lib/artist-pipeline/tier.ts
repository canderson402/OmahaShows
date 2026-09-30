import type { EventClassification, LineupEntry } from "./types";

export type ConfidenceTier = "high" | "review";

/** Category confidence at or above this counts as clear (the extractor rated it "high"). */
export const HIGH_CATEGORY_CONFIDENCE = 0.9;

/**
 * "high" = the proposal could be approved exactly as shown:
 *  - every act is either a returning artist that needs nothing, or has a clear-cut Spotify match
 *    (the pipeline only proposes a match when it is exact, rated high, and the only artist with that name),
 *  - no act was marked unsure,
 *  - the category is clear,
 *  - there is at least one artist.
 * Everything else needs a human decision.
 */
export function confidenceTier(p: { artists: LineupEntry[]; event: EventClassification | null }): ConfidenceTier {
  if ((p.event?.category_confidence ?? 0) < HIGH_CATEGORY_CONFIDENCE) return "review";
  let artists = 0;
  for (const a of p.artists) {
    if (a.kind === "not_an_artist") {
      if (a.unsure) return "review";
      continue;
    }
    artists++;
    if (a.kind === "new" && !a.spotify.chosen) return "review";
    if (a.kind === "existing" && a.new_links?.spotify && !a.new_links.spotify.chosen) return "review";
  }
  return artists > 0 ? "high" : "review";
}
