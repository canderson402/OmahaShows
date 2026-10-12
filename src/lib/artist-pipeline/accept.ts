import { normalizeArtistName } from "./normalize";
import { spotifyArtistUrl } from "./clients/spotify";
import { GENRES } from "../genres";
import { mapToGenres } from "./genre-map";
import type { EventCategory, EventClassification, LineupEntry, LinkDecision, Role } from "./types";

/** Admin edits to a new artist before it is created. Existing artists are never edited from the queue. */
export interface ArtistEdits {
  name?: string;
  genres?: string[];
  hometown?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
  youtube_url?: string | null;
  notes?: string | null;
}

/** What the admin decided for one lineup entry (by index). Missing decision = accept the proposal as shown. */
export interface AcceptDecision {
  index: number;
  /** For a not_an_artist entry: the admin says it is a real artist after all. */
  realArtist?: boolean;
  /** Drop this act from the lineup. */
  exclude?: boolean;
  /** This act's billing on this show. */
  role?: Role;
  /** Only for acts that will become new artists. */
  edits?: ArtistEdits;
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
  /** Case-insensitive exact name match. */
  findArtistByName(name: string): Promise<StoredArtistRef | null>;
  artistExists(artistId: string): Promise<boolean>;
  createArtist(a: {
    name: string; normalized_name: string; genres: string[]; hometown: string | null;
    instagram_url: string | null; website_url: string | null; youtube_url: string | null; notes: string | null;
  }): Promise<StoredArtistRef>;
  /** Insert alias → artist; no-op if the alias already exists. */
  addAlias(alias: string, artistId: string): Promise<void>;
  getArtistGenres(artistId: string): Promise<string[]>;
  /** Another artist already showing this Spotify profile (via spotify_id, spotify_url, or a verified link). */
  artistIdBySpotifyId(spotifyId: string): Promise<string | null>;
  /** Spotify's genre tags for an artist; [] when it has none or Spotify can't be reached. */
  spotifyGenres(spotifyId: string): Promise<string[]>;
  /** Returns Spotify's display name for an artist id, or null if Spotify has no such artist. */
  lookupSpotifyArtist(spotifyId: string): Promise<string | null>;
  /** Make this the artist's single verified Spotify link (demoting any other) and set artists.spotify_id/url. */
  setVerifiedSpotify(artistId: string, link: { external_id: string; url: string; confidence: number | null; reason: string; source: "auto" | "manual" }): Promise<void>;
  /** Remember a link as wrong; if the artist currently shows it publicly, clear artists.spotify_id/url too. */
  rejectSpotify(artistId: string, link: { external_id: string; url: string; reason: string }): Promise<void>;
  /** Set the event's lineup to exactly these rows (new rows written before stale rows are removed). */
  replaceEventArtists(eventId: string, rows: { artist_id: string; role: string; billing_order: number }[]): Promise<void>;
  updateEvent(eventId: string, patch: { genres: string[]; category: EventCategory; analyzed_at: string }): Promise<void>;
  markAnalysis(id: string, status: "approved"): Promise<void>;
}

export class AcceptError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const ROLES: Role[] = ["headliner", "co-headliner", "supporting"];
const LINK_FIELDS = ["instagram_url", "website_url", "youtube_url"] as const;
const SPOTIFY_ARTIST_URL = /^(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z-]+\/)?artist\/([A-Za-z0-9]{22})(?![A-Za-z0-9])/i;

/** Accepts an open.spotify.com artist URL (any locale path) or a bare 22-char id. */
export function parseSpotifyArtistId(value: string): string | null {
  const v = value.trim();
  const m = v.match(SPOTIFY_ARTIST_URL);
  if (m) return m[1];
  return SPOTIFY_ID.test(v) ? v : null;
}

/** Rejects anything that is not a well-formed decision list for this analysis. Runs before any write. */
export function validateDecisions(raw: unknown, analysis: PendingAnalysisV2): AcceptDecision[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new AcceptError("decisions must be a list");
  const seen = new Set<number>();
  return raw.map((d, k) => {
    if (!d || typeof d !== "object") throw new AcceptError(`decision ${k} is not an object`);
    const o = d as Record<string, unknown>;
    if (!Number.isInteger(o.index) || (o.index as number) < 0 || (o.index as number) >= analysis.artists.length) {
      throw new AcceptError(`decision ${k}: index out of range`);
    }
    const index = o.index as number;
    if (seen.has(index)) throw new AcceptError(`decision ${k}: duplicate index ${index}`);
    seen.add(index);
    for (const flag of ["realArtist", "exclude"] as const) {
      if (o[flag] !== undefined && typeof o[flag] !== "boolean") throw new AcceptError(`decision ${k}: ${flag} must be true/false`);
    }
    const out: AcceptDecision = { index, ...(o.realArtist !== undefined ? { realArtist: o.realArtist as boolean } : {}), ...(o.exclude !== undefined ? { exclude: o.exclude as boolean } : {}) };
    if (o.role !== undefined) {
      if (!ROLES.includes(o.role as Role)) throw new AcceptError(`decision ${k}: unknown role`);
      out.role = o.role as Role;
    }
    if (o.edits !== undefined) {
      const entry = analysis.artists[index];
      if (entry.kind === "existing") throw new AcceptError(`decision ${k}: ${entry.billed_as} is already in your artists and can't be edited here`);
      out.edits = validateEdits(o.edits, `decision ${k}`);
    }
    if (o.spotify !== undefined) {
      const s = o.spotify as Record<string, unknown> | null;
      if (!s || typeof s !== "object") throw new AcceptError(`decision ${k}: spotify must be an object`);
      if (s.action === "proposed" || s.action === "none") out.spotify = { action: s.action };
      else if (s.action === "alternative" && typeof s.external_id === "string") out.spotify = { action: "alternative", external_id: s.external_id };
      else if (s.action === "manual" && typeof s.value === "string") out.spotify = { action: "manual", value: s.value };
      else throw new AcceptError(`decision ${k}: unknown spotify choice`);
    }
    return out;
  });
}

/** Optional text: trimmed, "" -> null, capped in length. */
function optionalText(v: unknown, field: string, label: string, max: number): string | null {
  if (v === null) return null;
  if (typeof v !== "string") throw new AcceptError(`${label}: ${field} must be text`);
  const t = v.trim();
  if (t.length > max) throw new AcceptError(`${label}: ${field} is too long`);
  return t || null;
}

function validateEdits(raw: unknown, label: string): ArtistEdits {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new AcceptError(`${label}: edits must be an object`);
  const o = raw as Record<string, unknown>;
  const out: ArtistEdits = {};
  if (o.name !== undefined) {
    const name = optionalText(o.name, "name", label, 200);
    if (!name) throw new AcceptError(`${label}: name can't be empty`);
    out.name = name;
  }
  if (o.genres !== undefined) {
    if (!Array.isArray(o.genres) || o.genres.some((g) => !(GENRES as readonly string[]).includes(g as string))) {
      throw new AcceptError(`${label}: genres must come from the genre list`);
    }
    out.genres = [...new Set(o.genres as string[])];
  }
  if (o.hometown !== undefined) out.hometown = optionalText(o.hometown, "hometown", label, 100);
  if (o.notes !== undefined) out.notes = optionalText(o.notes, "notes", label, 2000);
  for (const f of LINK_FIELDS) {
    if (o[f] === undefined) continue;
    const url = optionalText(o[f], f, label, 500);
    if (url && !/^https?:\/\/\S+$/i.test(url)) throw new AcceptError(`${label}: ${f.replace("_url", "")} link must start with http:// or https://`);
    out[f] = url;
  }
  return out;
}

type Chosen = { external_id: string; confidence: number | null; reason: string; source: "auto" | "manual" } | null;
interface Resolved { chosen: Chosen; overridden: string | null }

function resolveSpotify(d: LinkDecision | undefined, decision: AcceptDecision["spotify"], label: string): Resolved {
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
  if (!id) throw new AcceptError(`${label}: not a Spotify artist link (expected open.spotify.com/artist/…)`);
  return { chosen: { external_id: id, confidence: null, reason: "entered by admin", source: "manual" }, overridden: proposed && proposed.external_id !== id ? proposed.external_id : null };
}

interface PlannedAct {
  kind: "existing" | "new";
  name: string;
  /** Name the pipeline proposed, kept as an alias when the admin renamed the artist */
  proposedName: string;
  links: Pick<ArtistEdits, "instagram_url" | "website_url" | "youtube_url" | "notes">;
  artistId: string | null;      // known up front for existing artists, or when an alias already matches
  role: string;
  genres: string[];
  /** The admin picked genres by hand, so Spotify's don't replace them */
  genresEdited: boolean;
  hometown: string | null;
  spotify: Resolved | null;     // null = no Spotify decision to apply for this act
}

/**
 * Applies an admin-approved analysis. Everything that can be refused (malformed decisions, bad or
 * nonexistent Spotify links, a profile owned by another artist, a vanished artist) is checked before
 * the first write. Writes are idempotent, so re-running after a partial failure converges.
 */
export async function acceptAnalysis(
  input: { analysis: PendingAnalysisV2; decisions: unknown; category?: EventCategory },
  store: AcceptStore,
  now: () => string = () => new Date().toISOString(),
): Promise<{ artistsCreated: number; linksVerified: number; lineup: number }> {
  const { analysis } = input;
  const decisions = validateDecisions(input.decisions, analysis);
  const byIndex = new Map(decisions.map((d) => [d.index, d]));

  // ---- Phase 1: plan and validate (no writes) ----
  const plan: PlannedAct[] = [];
  for (let i = 0; i < analysis.artists.length; i++) {
    const entry = analysis.artists[i];
    const decision = byIndex.get(i);
    if (decision?.exclude) continue;
    if (entry.kind === "not_an_artist") {
      if (!decision?.realArtist) continue;
      const spotify = decision.spotify && decision.spotify.action !== "proposed" ? resolveSpotify(undefined, decision.spotify, entry.billed_as) : null;
      const e = decision.edits ?? {};
      plan.push({
        kind: "new", name: e.name ?? entry.billed_as, proposedName: entry.billed_as, artistId: null,
        role: decision.role ?? "supporting", genres: e.genres ?? [], genresEdited: e.genres !== undefined,
        hometown: e.hometown ?? null, links: e, spotify,
      });
    } else if (entry.kind === "existing") {
      if (!(await store.artistExists(entry.artist_id))) {
        throw new AcceptError(`${entry.billed_as}: this artist no longer exists (merged or deleted). Re-run Analyze on this show.`, 409);
      }
      const spotify = entry.new_links?.spotify ? resolveSpotify(entry.new_links.spotify, decision?.spotify, entry.billed_as) : null;
      plan.push({
        kind: "existing", name: entry.billed_as, proposedName: entry.billed_as, artistId: entry.artist_id,
        role: decision?.role ?? entry.role, genres: [], genresEdited: false, hometown: null, links: {}, spotify,
      });
    } else {
      const e = decision?.edits ?? {};
      plan.push({
        kind: "new", name: e.name ?? entry.clean_name, proposedName: entry.clean_name, artistId: null,
        role: decision?.role ?? entry.role,
        genres: e.genres ?? entry.genres,
        genresEdited: e.genres !== undefined,
        hometown: e.hometown !== undefined ? e.hometown : entry.hometown,
        links: e,
        spotify: resolveSpotify(entry.spotify, decision?.spotify, entry.clean_name),
      });
    }
  }

  for (const act of plan) {
    if (act.kind === "new") {
      const match = (await store.findArtistByAlias(normalizeArtistName(act.name))) ?? (await store.findArtistByName(act.name));
      act.artistId = match?.id ?? null;
    }
    const chosen = act.spotify?.chosen;
    if (!chosen) continue;
    if (chosen.source === "manual" && !(await store.lookupSpotifyArtist(chosen.external_id))) {
      throw new AcceptError(`${act.name}: Spotify has no artist with that link. Check it opens an artist page.`);
    }
    const owner = await store.artistIdBySpotifyId(chosen.external_id);
    if (owner && owner !== act.artistId) {
      throw new AcceptError(`${act.name}: that Spotify profile is already linked to another artist`, 409);
    }
  }

  // New artists take their genres from their Spotify profile when it has any
  for (const act of plan) {
    const chosen = act.spotify?.chosen;
    if (act.kind !== "new" || act.artistId || act.genresEdited || !chosen) continue;
    const fromSpotify = mapToGenres(await store.spotifyGenres(chosen.external_id));
    if (fromSpotify.length) act.genres = fromSpotify;
  }

  // ---- Phase 2: write ----
  let artistsCreated = 0;
  let linksVerified = 0;
  const lineup: { artist_id: string; role: string; billing_order: number }[] = [];
  const genres: string[] = [];
  const addGenres = (gs: string[]) => { for (const g of gs) if (!genres.includes(g) && genres.length < 5) genres.push(g); };

  for (const act of plan) {
    let artistId = act.artistId;
    let artistGenres = act.genres;
    if (act.kind === "new") {
      const alias = normalizeArtistName(act.name);
      if (!artistId) {
        const created = await store.createArtist({
          name: act.name, normalized_name: alias, genres: act.genres, hometown: act.hometown,
          instagram_url: act.links.instagram_url ?? null, website_url: act.links.website_url ?? null,
          youtube_url: act.links.youtube_url ?? null, notes: act.links.notes ?? null,
        });
        artistId = created.id;
        artistsCreated++;
      } else if (!artistGenres.length) {
        artistGenres = await store.getArtistGenres(artistId);
      }
      await store.addAlias(alias, artistId);
      // Renamed by the admin: the proposed name should still find this artist next time
      const proposedAlias = normalizeArtistName(act.proposedName);
      if (proposedAlias !== alias) await store.addAlias(proposedAlias, artistId);
    } else {
      artistGenres = await store.getArtistGenres(artistId!);
    }

    if (act.spotify?.overridden) {
      const ext = act.spotify.overridden;
      await store.rejectSpotify(artistId!, { external_id: ext, url: spotifyArtistUrl(ext), reason: "admin overrode this proposal" });
    }
    if (act.spotify?.chosen) {
      await store.setVerifiedSpotify(artistId!, { ...act.spotify.chosen, url: spotifyArtistUrl(act.spotify.chosen.external_id) });
      linksVerified++;
    }
    lineup.push({ artist_id: artistId!, role: act.role, billing_order: lineup.length + 1 });
    addGenres(artistGenres);
  }

  if (genres.length === 0) addGenres(analysis.event?.event_genres ?? []);
  const category = input.category ?? analysis.event?.category ?? "music";

  await store.replaceEventArtists(analysis.event_id, lineup);
  await store.updateEvent(analysis.event_id, { genres, category, analyzed_at: now() });
  await store.markAnalysis(analysis.id, "approved");
  return { artistsCreated, linksVerified, lineup: lineup.length };
}
