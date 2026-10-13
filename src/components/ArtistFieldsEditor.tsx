"use client";

import { useState } from "react";
import { GENRES, GENRE_LABELS } from "../lib/genres";
import { adminFetch } from "../lib/admin-fetch";
import { localFromHometown } from "../lib/local";

/** Everything stored on an artist that an admin edits by hand. */
export interface ArtistFields {
  name: string;
  genres: string[];
  hometown: string | null;
  /** true = local, false = not local, null = not tagged */
  is_local?: boolean | null;
  instagram_url: string | null;
  website_url: string | null;
  youtube_url: string | null;
  spotify_url?: string | null;
  notes: string | null;
}

export const inputCls = "w-full px-2.5 py-1.5 bg-gray-950 border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-500";

/** Artist fields form. Pass `spotify_url` in `value` to show the Spotify link field. */
export function ArtistFieldsEditor({ value, onChange, spotifyArtist }: {
  value: ArtistFields;
  onChange: (patch: Partial<ArtistFields>) => void;
  /** Spotify artist link or id to fill genres from; the button hides without one */
  spotifyArtist?: string | null;
}) {
  const [genresOpen, setGenresOpen] = useState(false);
  const [filling, setFilling] = useState(false);
  const [fillNote, setFillNote] = useState<string | null>(null);
  const fillFromSpotify = async () => {
    if (!spotifyArtist) return;
    setFilling(true);
    setFillNote(null);
    try {
      const res = await adminFetch(`/api/admin/spotify-genres?artist=${encodeURIComponent(spotifyArtist)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't reach Spotify");
      if (body.genres.length) onChange({ genres: body.genres });
      else setFillNote(body.tags.length ? `Spotify's genres (${body.tags.join(", ")}) don't match the genre list` : "Spotify has no genres for this artist");
    } catch (e) {
      setFillNote(e instanceof Error ? e.message : "Couldn't reach Spotify");
    } finally {
      setFilling(false);
    }
  };
  const toggleGenre = (g: string) =>
    onChange({ genres: value.genres.includes(g) ? value.genres.filter((x) => x !== g) : [...value.genres, g] });
  const field = (label: string, key: "hometown" | "instagram_url" | "website_url" | "youtube_url" | "spotify_url", placeholder: string) => (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <input value={value[key] ?? ""} placeholder={placeholder} className={inputCls} onChange={(e) => {
        const v = e.target.value;
        // A local hometown fills in an unset Local tag
        onChange(key === "hometown" && value.is_local == null && localFromHometown(v) ? { hometown: v, is_local: true } : { [key]: v });
      }} />
    </label>
  );

  const localOptions: { label: string; v: boolean | null }[] = [
    { label: "Local", v: true }, { label: "Not local", v: false }, { label: "Unset", v: null },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[12rem]">
          <span className="block text-xs text-gray-500 mb-1">Name</span>
          <input value={value.name} onChange={(e) => onChange({ name: e.target.value })} className={inputCls} />
        </label>
        <div className="flex rounded overflow-hidden border border-gray-700" role="group" aria-label="Local band">
          {localOptions.map(({ label, v }) => {
            const on = (value.is_local ?? null) === v;
            return (
              <button key={label} type="button" onClick={() => onChange({ is_local: v })} aria-pressed={on}
                className={`px-2.5 py-1.5 text-xs transition-colors ${on
                  ? v === true ? "bg-green-600/40 text-green-100" : v === false ? "bg-gray-600 text-gray-100" : "bg-gray-800 text-gray-300"
                  : "bg-gray-950 text-gray-500 hover:text-gray-200"}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs text-gray-500">Genres{value.genres.length ? "" : " (none picked)"}</span>
          <div className="flex items-center gap-3">
            {spotifyArtist?.trim() && (
              <button type="button" onClick={fillFromSpotify} disabled={filling} className="text-xs text-green-300 hover:underline disabled:opacity-50">
                {filling ? "Asking Spotify…" : "Fill from Spotify"}
              </button>
            )}
            <button type="button" onClick={() => setGenresOpen((o) => !o)} className="text-xs text-blue-300 hover:underline">
              {genresOpen ? "Done" : "Edit genres"}
            </button>
          </div>
        </div>
        {fillNote && <p className="text-xs text-amber-300 mb-1.5">{fillNote}</p>}
        <div className="flex flex-wrap gap-1.5">
          {(genresOpen ? GENRES : GENRES.filter((g) => value.genres.includes(g))).map((g) => {
            const on = value.genres.includes(g);
            return (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${on ? "bg-blue-600/30 border-blue-500 text-blue-100" : "border-gray-700 text-gray-400 hover:text-gray-200"}`}>
                {GENRE_LABELS[g]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("Hometown", "hometown", "Omaha, NE")}
        {value.spotify_url !== undefined && field("Spotify", "spotify_url", "https://open.spotify.com/artist/…")}
        {field("Instagram", "instagram_url", "https://instagram.com/…")}
        {field("Website", "website_url", "https://…")}
        {field("YouTube", "youtube_url", "https://youtube.com/…")}
      </div>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Notes</span>
        <textarea value={value.notes ?? ""} rows={2} onChange={(e) => onChange({ notes: e.target.value })} className={inputCls} />
      </label>
    </div>
  );
}
