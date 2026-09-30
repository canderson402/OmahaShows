import { nameSimilarity } from "../similarity";
import { spotifyArtistUrl, type SpotifyClient } from "../clients/spotify";
import { youtubeChannelUrl, type YouTubeClient } from "../clients/youtube";
import type { Candidate } from "../types";

export async function gatherSpotifyCandidates(
  act: { clean_name: string; billed_as: string }, spotify: SpotifyClient, rejected: Set<string>,
): Promise<Candidate[]> {
  const queries = [...new Set([act.clean_name, `artist:"${act.clean_name}"`, act.billed_as])];
  const seen = new Map<string, Candidate>();
  for (const q of queries) {
    for (const a of await spotify.searchArtists(q)) {
      if (rejected.has(a.id) || seen.has(a.id)) continue;
      seen.set(a.id, {
        platform: "spotify", external_id: a.id, url: spotifyArtistUrl(a.id), display_name: a.name,
        name_similarity: nameSimilarity(act.clean_name, a.name), genres: a.genres,
        details: a.genres.length ? [`genres: ${a.genres.join(", ")}`] : [], official: false, description: "",
      });
    }
  }
  const top = [...seen.values()].sort((x, y) => y.name_similarity - x.name_similarity).slice(0, 8);
  for (const c of top.slice(0, 3)) {
    const albums = await spotify.albumTitles(c.display_name);
    if (albums.length) c.details.push(`albums: ${albums.join("; ")}`);
  }
  return top;
}

export async function gatherYouTubeCandidates(
  act: { clean_name: string }, youtube: YouTubeClient, rejected: Set<string>,
): Promise<Candidate[]> {
  const channels = await youtube.searchChannels(act.clean_name);
  return channels
    .filter((ch) => !rejected.has(ch.id))
    .map((ch) => {
      const official = / - Topic$/.test(ch.title);
      const bare = ch.title.replace(/ - Topic$/, "");
      const details = [
        ch.subscriberCount != null ? `subscribers: ${ch.subscriberCount}` : "subscribers: hidden",
        ...(ch.customUrl ? [`handle: ${ch.customUrl}`] : []),
        ...(ch.description ? [`description: ${ch.description.slice(0, 300)}`] : []),
      ];
      return {
        platform: "youtube" as const, external_id: ch.id, url: youtubeChannelUrl(ch.id), display_name: ch.title,
        name_similarity: nameSimilarity(act.clean_name, bare), genres: [], details, official, description: ch.description,
      };
    });
}
