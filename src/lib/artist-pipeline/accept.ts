import { normalizeArtistName } from "./normalize";
import { spotifyArtistUrl } from "./clients/spotify";
import type { EventCategory, EventClassification, LineupEntry, LinkDecision } from "./types";

/** What the admin decided for one lineup entry (by index). Missing decision = accept the proposal as shown. */
export interface AcceptDecision {
  index: number;
  /** For a not_an_artist entry: the admin says it is a real artist after all. */
  realArtist?: boolean;
  /** For a not_an_artist entry the admin marked real, or any act: drop it from the lineup. */
  exclude?: boolean;
  spotify?:
    | { action: "proposed" }
    | { action: "alternative"; external_id: string }
    | { action: "manual"; value: string }
    | { action: "none" };
}

export interface PendingAnalysisV2 {
  id: string;
  event_id: string;
  artists: LineupEntry[];
  event: EventClassification | null;
}

export interface StoredArtistRef { id: string; genres: string[] }

export interface AcceptStore {
  findArtistByAlias(alias: string): Promise<StoredArtistRef | null>;
  findArtistByName(name: string): Promise<StoredArtistRef | null>;
  createArtist(a: { name: string; normalized_name: string; genres: string[]; hometown: string | null }): Promise<StoredArtistRef>;
  /** Insert alias → artist; no-op if the alias already exists. */
  addAlias(alias: string, artistId: string): Promise<void>;
  getArtistGenres(artistId: string): Promise<string[]>;
  artistIdBySpotifyId(spotifyId: string): Promise<string | null>;
  /** Make this the artist's single verified Spotify link (demoting any other) and set artists.spotify_id/url. */
  setVerifiedSpotify(artistId: string, link: { external_id: string; url: string; confidence: number | null; reason: string; source: "auto" | "manual" }): Promise<void>;
  /** Remember a proposed link the admin overrode, so it is never proposed again. */
  rejectSpotify(artistId: string, link: { external_id: string; url: string; reason: string }): Promise<void>;
  replaceEventArtists(eventId: string, rows: { artist_id: string; role: string; billing_order: number }[]): Promise<void>;
  updateEvent(eventId: string, patch: { genres: string[]; category: EventCategory; analyzed_at: string }): Promise<void>;
  markAnalysis(id: string, status: "approved"): Promise<void>;
}

export class AcceptError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;

/** Accepts a Spotify artist URL (any locale path) or a bare 22-char id. */
export function parseSpotifyArtistId(value: string): string | null {
  const v = value.trim();
  const m = v.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?artist\/([A-Za-z0-9]{22})/i);
  if (m) return m[1];
  return SPOTIFY_ID.test(v) ? v : null;
}

type Chosen = { external_id: string; confidence: number | null; reason: string; source: "auto" | "manual" } | null;

function resolveSpotify(d: LinkDecision | undefined, decision: AcceptDecision["spotify"], label: string): { chosen: Chosen; overridden: string | null } {
  const proposed = d?.chosen ?? null;
  const action = decision?.action ?? "proposed";
  if (action === "none") return { chosen: null, overridden: proposed?.external_id ?? null };
  if (action === "proposed") {
    return { chosen: proposed ? { external_id: proposed.external_id, confidence: proposed.confidence, reason: proposed.reason, source: "auto" } : null, overridden: null };
  }
  if (action === "alternative") {
    const id = (decision as { external_id: string }).external_id;
    const alt = d?.alternatives.find((a) => a.external_id === id);
    if (!alt) throw new AcceptError(`${label}: that Spotify option is not one of the listed candidates`);
    return { chosen: { external_id: alt.external_id, confidence: null, reason: "chosen by admin from candidates", source: "manual" }, overridden: proposed && proposed.external_id !== id ? proposed.external_id : null };
  }
  const id = parseSpotifyArtistId((decision as { value: string }).value);
  if (!id) throw new AcceptError(`${label}: not a Spotify artist link or id`);
  return { chosen: { external_id: id, confidence: null, reason: "entered by admin", source: "manual" }, overridden: proposed && proposed.external_id !== id ? proposed.external_id : null };
}

/**
 * Applies an admin-approved analysis. Every write is idempotent (alias no-op if present, link upsert,
 * event lineup replaced), so re-running after a partial failure converges to the same result.
 */
export async function acceptAnalysis(
  input: { analysis: PendingAnalysisV2; decisions: AcceptDecision[]; category?: EventCategory },
  store: AcceptStore,
  now: () => string = () => new Date().toISOString(),
): Promise<{ artistsCreated: number; linksVerified: number; lineup: number }> {
  const { analysis } = input;
  const byIndex = new Map(input.decisions.map((d) => [d.index, d]));
  let artistsCreated = 0;
  let linksVerified = 0;
  const lineup: { artist_id: string; role: string; billing_order: number }[] = [];
  const genres: string[] = [];
  const addGenres = (gs: string[]) => { for (const g of gs) if (!genres.includes(g) && genres.length < 5) genres.push(g); };

  async function findOrCreate(name: string, g: string[], hometown: string | null): Promise<StoredArtistRef> {
    const alias = normalizeArtistName(name);
    let artist = (await store.findArtistByAlias(alias)) ?? (await store.findArtistByName(name));
    if (!artist) {
      artist = await store.createArtist({ name, normalized_name: alias, genres: g, hometown });
      artistsCreated++;
    }
    await store.addAlias(alias, artist.id);
    return artist;
  }

  async function applySpotify(artistId: string, d: LinkDecision | undefined, decision: AcceptDecision["spotify"], label: string) {
    const { chosen, overridden } = resolveSpotify(d, decision, label);
    if (overridden) {
      await store.rejectSpotify(artistId, { external_id: overridden, url: spotifyArtistUrl(overridden), reason: "admin overrode this proposal" });
    }
    if (!chosen) return;
    const owner = await store.artistIdBySpotifyId(chosen.external_id);
    if (owner && owner !== artistId) throw new AcceptError(`${label}: that Spotify profile is already linked to another artist`, 409);
    await store.setVerifiedSpotify(artistId, { ...chosen, url: spotifyArtistUrl(chosen.external_id) });
    linksVerified++;
  }

  for (let i = 0; i < analysis.artists.length; i++) {
    const entry = analysis.artists[i];
    const decision = byIndex.get(i);
    if (decision?.exclude) continue;
    const order = lineup.length + 1;

    if (entry.kind === "not_an_artist") {
      if (!decision?.realArtist) continue;
      const artist = await findOrCreate(entry.billed_as, [], null);
      if (decision.spotify && decision.spotify.action !== "proposed") await applySpotify(artist.id, undefined, decision.spotify, entry.billed_as);
      lineup.push({ artist_id: artist.id, role: "supporting", billing_order: order });
      addGenres(artist.genres);
      continue;
    }

    if (entry.kind === "existing") {
      if (entry.new_links?.spotify) await applySpotify(entry.artist_id, entry.new_links.spotify, decision?.spotify, entry.billed_as);
      lineup.push({ artist_id: entry.artist_id, role: entry.role, billing_order: order });
      addGenres(await store.getArtistGenres(entry.artist_id));
      continue;
    }

    const artist = await findOrCreate(entry.clean_name, entry.genres, entry.hometown);
    if (artist.genres.length === 0 && entry.genres.length) artist.genres = entry.genres;
    await applySpotify(artist.id, entry.spotify, decision?.spotify, entry.clean_name);
    lineup.push({ artist_id: artist.id, role: entry.role, billing_order: order });
    addGenres(entry.genres.length ? entry.genres : artist.genres);
  }

  if (genres.length === 0) addGenres(analysis.event?.event_genres ?? []);
  const category = input.category ?? analysis.event?.category ?? "music";

  await store.replaceEventArtists(analysis.event_id, lineup);
  await store.updateEvent(analysis.event_id, { genres, category, analyzed_at: now() });
  await store.markAnalysis(analysis.id, "approved");
  return { artistsCreated, linksVerified, lineup: lineup.length };
}
