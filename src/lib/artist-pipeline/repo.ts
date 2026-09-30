import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArtistRepo } from "./stages/resolve";
import type { ChangeRow, RunRow } from "./gate";
import type { PipelineEvent, Platform, StoredArtist } from "./types";

export function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** A PostgREST embedded relation may come back as an object or a single-element array. */
function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

interface EventRow {
  id: string; title: string; date: string; event_url: string | null;
  supporting_artists: string[] | null; venue_name: string | null;
  venues: { name: string | null } | { name: string | null }[] | null;
}

export function todayChicago(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

export function createSupabaseRepo(sb: SupabaseClient) {
  return {
    async findByAlias(alias: string): Promise<StoredArtist | null> {
      const { data, error } = await sb.from("artist_aliases")
        .select("artists(id, name, genres, spotify_id, youtube_channel_id, hometown)")
        .eq("alias_normalized", alias).maybeSingle();
      if (error) throw error;
      const row = data as { artists: StoredArtist | StoredArtist[] | null } | null;
      return one(row?.artists);
    },
    async rejectedExternalIds(artistId: string, platform: Platform): Promise<Set<string>> {
      const { data, error } = await sb.from("artist_links").select("external_id")
        .eq("artist_id", artistId).eq("platform", platform).eq("status", "rejected");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.external_id as string));
    },
    async loadEvents(ids: string[]): Promise<PipelineEvent[]> {
      if (!ids.length) return [];
      const { data, error } = await sb.from("events")
        .select("id, title, date, event_url, supporting_artists, venue_name, venues(name)").in("id", ids);
      if (error) throw error;
      return ((data ?? []) as unknown as EventRow[]).map((e) => ({
        id: e.id, title: e.title, date: e.date, eventUrl: e.event_url ?? null,
        supportingArtists: e.supporting_artists ?? [],
        venueName: one(e.venues)?.name ?? e.venue_name ?? "Unknown venue",
      }));
    },
    async runsSince(iso: string): Promise<RunRow[]> {
      const { data, error } = await sb.from("scraper_runs").select("new_event_ids, changed_event_ids").gte("started_at", iso);
      if (error) throw error;
      return (data ?? []) as RunRow[];
    },
    async changesSince(iso: string, ids: string[]): Promise<ChangeRow[]> {
      if (!ids.length) return [];
      const { data, error } = await sb.from("event_changes").select("event_id, change_type, changed_fields")
        .gte("created_at", iso).in("event_id", ids);
      if (error) throw error;
      return (data ?? []) as ChangeRow[];
    },
    async upcomingEventIds(limit: number, offset = 0): Promise<string[]> {
      const { data, error } = await sb.from("events").select("id").eq("status", "approved").gte("date", todayChicago())
        .order("date").order("id").range(offset, offset + limit - 1);
      if (error) throw error;
      return (data ?? []).map((r) => r.id as string);
    },
    /** Event ids that already have a pending artist analysis awaiting review. */
    async pendingAnalysisEventIds(ids: string[]): Promise<Set<string>> {
      if (!ids.length) return new Set();
      const { data, error } = await sb.from("pending_artist_analyses").select("event_id")
        .eq("status", "pending").in("event_id", ids);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.event_id as string));
    },
  };
}

// Compile-time check that the repo fulfils the pipeline's interface.
const _repoCheck: (sb: SupabaseClient) => ArtistRepo = createSupabaseRepo;
void _repoCheck;
