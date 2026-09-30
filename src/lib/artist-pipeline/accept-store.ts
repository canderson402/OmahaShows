import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcceptStore, StoredArtistRef } from "./accept";

function check<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

/** Supabase-backed AcceptStore (service-role client). */
export function createSupabaseAcceptStore(sb: SupabaseClient): AcceptStore {
  const now = () => new Date().toISOString();
  return {
    async findArtistByAlias(alias) {
      const row = check(await sb.from("artist_aliases").select("artists(id, genres)").eq("alias_normalized", alias).maybeSingle());
      const a = (row as { artists?: StoredArtistRef | StoredArtistRef[] | null } | null)?.artists;
      const one = Array.isArray(a) ? a[0] : a;
      return one ? { id: one.id, genres: one.genres ?? [] } : null;
    },
    async findArtistByName(name) {
      const row = check(await sb.from("artists").select("id, genres").eq("name", name).maybeSingle());
      return row ? { id: row.id as string, genres: (row.genres as string[]) ?? [] } : null;
    },
    async createArtist(a) {
      const row = check(await sb.from("artists").insert({ name: a.name, normalized_name: a.normalized_name, genres: a.genres, hometown: a.hometown }).select("id, genres").single());
      return { id: row.id as string, genres: (row.genres as string[]) ?? [] };
    },
    async addAlias(alias, artistId) {
      check(await sb.from("artist_aliases").upsert({ alias_normalized: alias, artist_id: artistId }, { onConflict: "alias_normalized", ignoreDuplicates: true }));
    },
    async getArtistGenres(artistId) {
      const row = check(await sb.from("artists").select("genres").eq("id", artistId).maybeSingle());
      return (row?.genres as string[] | undefined) ?? [];
    },
    async artistIdBySpotifyId(spotifyId) {
      const row = check(await sb.from("artists").select("id").eq("spotify_id", spotifyId).maybeSingle());
      return (row?.id as string | undefined) ?? null;
    },
    async setVerifiedSpotify(artistId, link) {
      // Demote any other verified Spotify link first (partial unique index allows one verified per platform).
      check(await sb.from("artist_links").update({ status: "rejected", reviewed_at: now() })
        .eq("artist_id", artistId).eq("platform", "spotify").eq("status", "verified").neq("external_id", link.external_id));
      check(await sb.from("artist_links").upsert({
        artist_id: artistId, platform: "spotify", external_id: link.external_id, url: link.url, status: "verified",
        confidence: link.confidence, reason: link.reason, source: link.source, reviewed_at: now(),
      }, { onConflict: "artist_id,platform,external_id" }));
      check(await sb.from("artists").update({ spotify_id: link.external_id, spotify_url: link.url }).eq("id", artistId));
    },
    async rejectSpotify(artistId, link) {
      check(await sb.from("artist_links").upsert({
        artist_id: artistId, platform: "spotify", external_id: link.external_id, url: link.url, status: "rejected",
        reason: link.reason, source: "auto", reviewed_at: now(),
      }, { onConflict: "artist_id,platform,external_id" }));
    },
    async replaceEventArtists(eventId, rows) {
      const seen = new Set<string>();
      const unique = rows.filter((r) => (seen.has(r.artist_id) ? false : (seen.add(r.artist_id), true)));
      check(await sb.from("event_artists").delete().eq("event_id", eventId));
      if (unique.length) check(await sb.from("event_artists").insert(unique.map((r) => ({ event_id: eventId, ...r }))));
    },
    async updateEvent(eventId, patch) {
      check(await sb.from("events").update(patch).eq("id", eventId));
    },
    async markAnalysis(id, status) {
      check(await sb.from("pending_artist_analyses").update({ status }).eq("id", id));
    },
  };
}
