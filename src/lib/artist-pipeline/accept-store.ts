import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcceptStore, StoredArtistRef } from "./accept";
import { lookupSpotifyArtistName } from "./clients/spotify";

function check<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

/** Escape LIKE wildcards so ilike is an exact, case-insensitive match. */
const likeExact = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

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
      const rows = check(await sb.from("artists").select("id, genres").ilike("name", likeExact(name)).limit(1));
      const row = rows?.[0];
      return row ? { id: row.id as string, genres: (row.genres as string[]) ?? [] } : null;
    },
    async artistExists(artistId) {
      const row = check(await sb.from("artists").select("id").eq("id", artistId).maybeSingle());
      return !!row;
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
      // Ids are validated [A-Za-z0-9]{22} before reaching here, so they are safe inside a filter string.
      const byArtist = check(await sb.from("artists").select("id")
        .or(`spotify_id.eq.${spotifyId},spotify_url.ilike.%${spotifyId}%`).limit(1));
      if (byArtist?.[0]) return byArtist[0].id as string;
      const byLink = check(await sb.from("artist_links").select("artist_id")
        .eq("platform", "spotify").eq("external_id", spotifyId).eq("status", "verified").limit(1));
      return (byLink?.[0]?.artist_id as string | undefined) ?? null;
    },
    async lookupSpotifyArtist(spotifyId) {
      return lookupSpotifyArtistName(spotifyId);
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
      // If the public site shows this link for the artist (new column or legacy URL), take it down.
      check(await sb.from("artists").update({ spotify_id: null, spotify_url: null }).eq("id", artistId)
        .or(`spotify_id.eq.${link.external_id},spotify_url.ilike.%${link.external_id}%`));
    },
    async replaceEventArtists(eventId, rows) {
      const seen = new Set<string>();
      const unique = rows.filter((r) => (seen.has(r.artist_id) ? false : (seen.add(r.artist_id), true)));
      // Write the new lineup first; only then remove rows that are no longer in it. A failure part-way
      // leaves the old lineup (plus possibly some new rows) visible, never an empty one.
      if (unique.length) {
        check(await sb.from("event_artists").upsert(unique.map((r) => ({ event_id: eventId, ...r })), { onConflict: "event_id,artist_id" }));
        check(await sb.from("event_artists").delete().eq("event_id", eventId).not("artist_id", "in", `(${unique.map((r) => r.artist_id).join(",")})`));
      } else {
        check(await sb.from("event_artists").delete().eq("event_id", eventId));
      }
    },
    async updateEvent(eventId, patch) {
      check(await sb.from("events").update(patch).eq("id", eventId));
    },
    async markAnalysis(id, status, review) {
      const withReview = await sb.from("pending_artist_analyses")
        .update({ status, confidence_tier: review.tier, review_changed: review.changed, reviewed_at: now() }).eq("id", id);
      if (!withReview.error) return;
      // Migration 009 not applied yet: still record the approval itself.
      if (/confidence_tier|review_changed|reviewed_at/.test(withReview.error.message)) {
        check(await sb.from("pending_artist_analyses").update({ status }).eq("id", id));
        return;
      }
      throw new Error(withReview.error.message);
    },
  };
}
