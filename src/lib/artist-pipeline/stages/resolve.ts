import { normalizeArtistName } from "../normalize";
import type { Platform, StoredArtist } from "../types";

export interface ArtistRepo {
  findByAlias(aliasNormalized: string): Promise<StoredArtist | null>;
  rejectedExternalIds(artistId: string, platform: Platform): Promise<Set<string>>;
}

export interface Resolution { artist: StoredArtist | null; missing: Platform[] }

export async function resolveAct(cleanName: string, repo: ArtistRepo): Promise<Resolution> {
  const artist = await repo.findByAlias(normalizeArtistName(cleanName));
  if (!artist) return { artist: null, missing: ["spotify", "youtube"] };
  const missing: Platform[] = [];
  if (!artist.spotify_id) missing.push("spotify");
  if (!artist.youtube_channel_id) missing.push("youtube");
  return { artist, missing };
}
