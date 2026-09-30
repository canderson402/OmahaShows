import { nameSimilarity } from "../similarity";
import { spotifyArtistUrl, type SpotifyClient } from "../clients/spotify";
import { youtubeChannelUrl, type YouTubeClient } from "../clients/youtube";
import type { Candidate } from "../types";

type SpotifyArtist = Awaited<ReturnType<SpotifyClient["searchArtists"]>>[number];
type YouTubeChannel = Awaited<ReturnType<YouTubeClient["searchChannels"]>>[number];

export function toSpotifyCandidate(cleanName: string, a: SpotifyArtist): Candidate {
  return {
    platform: "spotify", external_id: a.id, url: spotifyArtistUrl(a.id), display_name: a.name,
    name_similarity: nameSimilarity(cleanName, a.name), genres: a.genres,
    details: a.genres.length ? [`genres: ${a.genres.join(", ")}`] : [], official: false, description: "",
  };
}

export function toYouTubeCandidate(cleanName: string, ch: YouTubeChannel): Candidate {
  const official = / - Topic$/.test(ch.title);
  const bare = ch.title.replace(/ - Topic$/, "");
  const details = [
    ch.subscriberCount != null ? `subscribers: ${ch.subscriberCount}` : "subscribers: hidden",
    ...(ch.customUrl ? [`handle: ${ch.customUrl}`] : []),
    ...(ch.description ? [`description: ${ch.description.slice(0, 300)}`] : []),
  ];
  return {
    platform: "youtube", external_id: ch.id, url: youtubeChannelUrl(ch.id), display_name: ch.title,
    name_similarity: nameSimilarity(cleanName, bare), genres: [], details, official, description: ch.description,
  };
}

export async function gatherSpotifyCandidates(
  act: { clean_name: string; billed_as: string }, spotify: SpotifyClient, rejected: Set<string>,
): Promise<Candidate[]> {
  const queries = [...new Set([act.clean_name, `artist:"${act.clean_name}"`, act.billed_as])];
  const seen = new Map<string, Candidate>();
  for (const q of queries) {
    for (const a of await spotify.searchArtists(q)) {
      if (rejected.has(a.id) || seen.has(a.id)) continue;
      seen.set(a.id, toSpotifyCandidate(act.clean_name, a));
    }
  }
  const top = [...seen.values()].sort((x, y) => y.name_similarity - x.name_similarity).slice(0, 8);
  const albumsByName = new Map<string, string[]>();
  for (const c of top.slice(0, 3)) {
    if (!albumsByName.has(c.display_name)) albumsByName.set(c.display_name, await spotify.albumTitles(c.display_name));
    const albums = albumsByName.get(c.display_name)!;
    if (albums.length) c.details.push(`albums found for name "${c.display_name}" (may include same-name artists): ${albums.join("; ")}`);
  }
  return top;
}

export async function gatherYouTubeCandidates(
  act: { clean_name: string }, youtube: YouTubeClient, rejected: Set<string>,
): Promise<Candidate[]> {
  const channels = await youtube.searchChannels(act.clean_name);
  return channels
    .filter((ch) => !rejected.has(ch.id))
    .map((ch) => toYouTubeCandidate(act.clean_name, ch));
}
