// src/lib/artists.ts
import { createClient } from "@supabase/supabase-js";

// Use service key for server-side operations if available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/i, "")
    .trim();
}

export interface Artist {
  id: string;
  name: string;
  normalized_name: string;
  genres: string[];
  spotify_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  image_url: string | null;
}

export async function findArtistByName(name: string): Promise<Artist | null> {
  const normalized = normalizeArtistName(name);
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("normalized_name", normalized)
    .single();

  if (error || !data) return null;
  return data as Artist;
}

export async function createArtist(artist: {
  name: string;
  genres: string[];
  spotify_url?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
}): Promise<Artist> {
  const normalized = normalizeArtistName(artist.name);

  const { data, error } = await supabase
    .from("artists")
    .insert({
      name: artist.name,
      normalized_name: normalized,
      genres: artist.genres,
      spotify_url: artist.spotify_url || null,
      instagram_url: artist.instagram_url || null,
      website_url: artist.website_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Artist;
}

export async function updateArtist(
  id: string,
  updates: Partial<Omit<Artist, "id" | "normalized_name" | "created_at" | "updated_at">>
): Promise<Artist> {
  // Filter out null values - don't overwrite existing data with nulls
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== null && v !== undefined)
  );

  if (Object.keys(filteredUpdates).length === 0) {
    // Nothing to update, just fetch and return
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Artist;
  }

  const { data, error } = await supabase
    .from("artists")
    .update(filteredUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Artist;
}

export async function linkArtistToEvent(
  eventId: string,
  artistId: string,
  role: "headliner" | "supporting" | "co-headliner",
  billingOrder: number
): Promise<void> {
  const { error } = await supabase.from("event_artists").upsert(
    {
      event_id: eventId,
      artist_id: artistId,
      role,
      billing_order: billingOrder,
    },
    { onConflict: "event_id,artist_id" }
  );

  if (error) throw error;
}

export async function updateEventGenres(eventId: string, genres: string[]): Promise<void> {
  const { error } = await supabase
    .from("events")
    .update({ genres })
    .eq("id", eventId);

  if (error) throw error;
}
