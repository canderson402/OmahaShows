// Load and save a show plus its lineup from the main view's admin editor.
// Writes go through the logged-in admin's session; the database only allows them for
// authenticated users, and public sign-up is disabled, so only admin accounts can save.
import { supabase, invalidateEventCaches } from "./supabase";
import { normalizeArtistName } from "./artist-pipeline/normalize";
import { parseSpotifyArtistId } from "./artist-pipeline/accept";
import type { ArtistFields } from "../components/ArtistFieldsEditor";
import type { Role } from "./artist-pipeline/types";

export interface ShowFields {
  title: string;
  date: string;
  time: string;              // HH:MM or ""
  venue_id: string;
  venue_name: string;        // only for venue_id "other"
  price: string;
  age_restriction: string;
  event_url: string;
  ticket_url: string;
  image_url: string;
  supporting_artists: string; // comma-separated
  category: string;
  status: string;
}

export interface LineupItem {
  key: string;
  artistId: string | null;   // null = new artist, created on save
  role: Role;
  fields: ArtistFields;
  original: ArtistFields | null;
}

const ARTIST_COLUMNS = "id, name, genres, hometown, spotify_url, instagram_url, website_url, youtube_url, notes";

type ArtistRow = {
  id: string; name: string; genres: string[] | null; hometown: string | null;
  spotify_url: string | null; instagram_url: string | null; website_url: string | null; youtube_url: string | null; notes: string | null;
};

export function artistFields(row: ArtistRow): ArtistFields {
  return {
    name: row.name,
    genres: row.genres ?? [],
    hometown: row.hometown,
    spotify_url: row.spotify_url ?? "",
    instagram_url: row.instagram_url,
    website_url: row.website_url,
    youtube_url: row.youtube_url,
    notes: row.notes,
  };
}

export const emptyArtist = (name: string): ArtistFields => ({
  name, genres: [], hometown: null, spotify_url: "",
  instagram_url: null, website_url: null, youtube_url: null, notes: null,
});

export async function loadShow(eventId: string): Promise<{ show: ShowFields; lineup: LineupItem[] }> {
  const { data: e, error } = await supabase.from("events").select("*").eq("id", eventId).single();
  if (error) throw error;

  const { data: rows, error: lineupError } = await supabase
    .from("event_artists")
    .select(`role, billing_order, artists(${ARTIST_COLUMNS})`)
    .eq("event_id", eventId)
    .order("billing_order", { ascending: true });
  if (lineupError) throw lineupError;

  const show: ShowFields = {
    title: e.title ?? "",
    date: e.date ?? "",
    time: e.time ? String(e.time).slice(0, 5) : "",
    venue_id: e.venue_id ?? "",
    venue_name: e.venue_name ?? "",
    price: e.price ?? "",
    age_restriction: e.age_restriction ?? "",
    event_url: e.event_url ?? "",
    ticket_url: e.ticket_url ?? "",
    image_url: e.image_url ?? "",
    supporting_artists: (e.supporting_artists ?? []).join(", "),
    category: e.category ?? "music",
    status: e.status ?? "approved",
  };

  const lineup: LineupItem[] = (rows ?? [])
    .map((r) => ({ role: r.role as Role, artist: r.artists as unknown as ArtistRow | null }))
    .filter((r): r is { role: Role; artist: ArtistRow } => !!r.artist)
    .map(({ role, artist }) => ({
      key: artist.id, artistId: artist.id, role, fields: artistFields(artist), original: artistFields(artist),
    }));

  return { show, lineup };
}

export async function searchArtists(query: string): Promise<ArtistRow[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const { data, error } = await supabase.from("artists").select(ARTIST_COLUMNS).ilike("name", `%${q}%`).order("name").limit(8);
  if (error) throw error;
  return (data ?? []) as ArtistRow[];
}

const blank = (v: string | null | undefined) => (v?.trim() ? v.trim() : null);

function checkUrl(v: string | null | undefined, label: string): string | null {
  const url = blank(v);
  if (url && !/^https?:\/\/\S+$/i.test(url)) throw new Error(`${label} must start with http:// or https://`);
  return url;
}

/** Artist columns to write, validated. */
function artistRow(f: ArtistFields) {
  const name = f.name.trim();
  if (!name) throw new Error("Every artist needs a name");
  const spotify = blank(f.spotify_url);
  const spotifyId = spotify ? parseSpotifyArtistId(spotify) : null;
  if (spotify && !spotifyId) throw new Error(`${name}: Spotify link should look like open.spotify.com/artist/…`);
  return {
    name,
    normalized_name: normalizeArtistName(name),
    genres: f.genres,
    hometown: blank(f.hometown),
    spotify_id: spotifyId,
    spotify_url: spotifyId ? `https://open.spotify.com/artist/${spotifyId}` : null,
    instagram_url: checkUrl(f.instagram_url, `${name}: Instagram link`),
    website_url: checkUrl(f.website_url, `${name}: website link`),
    youtube_url: checkUrl(f.youtube_url, `${name}: YouTube link`),
    notes: blank(f.notes),
  };
}

const sameFields = (a: ArtistFields, b: ArtistFields) => JSON.stringify(a) === JSON.stringify(b);

async function addAlias(name: string, artistId: string) {
  const { error } = await supabase.from("artist_aliases")
    .upsert({ alias_normalized: normalizeArtistName(name), artist_id: artistId }, { onConflict: "alias_normalized", ignoreDuplicates: true });
  if (error) throw error;
}

export async function saveShow(eventId: string, show: ShowFields, lineup: LineupItem[]): Promise<void> {
  // Validate everything before the first write
  if (!show.title.trim()) throw new Error("The show needs a title");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(show.date)) throw new Error("The show needs a date");
  const eventPatch = {
    title: show.title.trim(),
    date: show.date,
    time: show.time || null,
    venue_id: show.venue_id,
    venue_name: show.venue_id === "other" ? blank(show.venue_name) : null,
    price: blank(show.price),
    age_restriction: blank(show.age_restriction),
    event_url: checkUrl(show.event_url, "Event link"),
    ticket_url: checkUrl(show.ticket_url, "Ticket link"),
    image_url: checkUrl(show.image_url, "Image link"),
    supporting_artists: show.supporting_artists.split(",").map((s) => s.trim()).filter(Boolean),
    category: show.category,
    status: show.status,
    updated_at: new Date().toISOString(),
  };
  const rows = lineup.map((item) => ({ item, row: artistRow(item.fields) }));
  const ids = lineup.map((i) => i.artistId).filter(Boolean);
  if (new Set(ids).size !== ids.length) throw new Error("The same artist is in the lineup twice");

  const { error: eventError } = await supabase.from("events").update(eventPatch).eq("id", eventId);
  if (eventError) throw eventError;

  // Create new artists and apply edits to existing ones (edits apply on every show they play)
  const artistIds: string[] = [];
  for (const { item, row } of rows) {
    if (!item.artistId) {
      const { data, error } = await supabase.from("artists").insert(row).select("id").single();
      if (error) throw new Error(error.code === "23505" ? `${row.name}: that name or Spotify link already belongs to an artist. Search for them instead of adding a new one.` : error.message);
      artistIds.push(data.id);
      await addAlias(row.name, data.id);
    } else {
      if (!item.original || !sameFields(item.fields, item.original)) {
        const { error } = await supabase.from("artists").update(row).eq("id", item.artistId);
        if (error) throw new Error(error.code === "23505" ? `${row.name}: that name or Spotify link already belongs to another artist` : error.message);
        // A rename should still find this artist under the new name next time
        if (item.original && item.original.name !== row.name) await addAlias(row.name, item.artistId);
      }
      artistIds.push(item.artistId);
    }
  }

  // Set the lineup to exactly this list: write current rows first, then drop the rest
  if (artistIds.length) {
    const { error } = await supabase.from("event_artists").upsert(
      artistIds.map((artist_id, i) => ({ event_id: eventId, artist_id, role: lineup[i].role, billing_order: i + 1 })),
      { onConflict: "event_id,artist_id" },
    );
    if (error) throw error;
  }
  let drop = supabase.from("event_artists").delete().eq("event_id", eventId);
  if (artistIds.length) drop = drop.not("artist_id", "in", `(${artistIds.join(",")})`);
  const { error: dropError } = await drop;
  if (dropError) throw dropError;

  // Show genres follow the lineup's genres in billing order, like an approved analysis
  if (rows.length) {
    const genres: string[] = [];
    for (const { row } of rows) for (const g of row.genres) if (!genres.includes(g) && genres.length < 5) genres.push(g);
    const { error } = await supabase.from("events").update({ genres }).eq("id", eventId);
    if (error) throw error;
  }

  invalidateEventCaches();
}
