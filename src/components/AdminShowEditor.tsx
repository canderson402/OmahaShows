"use client";

import { useEffect, useState } from "react";
import { getVenues } from "../lib/supabase";
import { loadShow, saveShow, searchArtists, artistFields, savedFields, emptyArtist, type LineupItem, type ShowFields } from "../lib/admin-show-edit";
import { ArtistFieldsEditor, inputCls } from "./ArtistFieldsEditor";
import type { Role } from "../lib/artist-pipeline/types";

const ROLE_LABELS: Record<Role, string> = { "headliner": "Headliner", "co-headliner": "Co-headliner", "supporting": "Opener" };
const CATEGORIES = ["music", "comedy", "theater", "sports", "other"];
const STATUSES = [
  { value: "approved", label: "Approved (live)" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected (hidden)" },
  { value: "removed", label: "Removed (hidden)" },
];

type Venue = Awaited<ReturnType<typeof getVenues>>[number];
type FoundArtist = Awaited<ReturnType<typeof searchArtists>>[number];

/** Admin-only editor for a show and every artist in it, opened from the main view. */
export function AdminShowEditor({ eventId, onClose, onSaved }: {
  eventId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [show, setShow] = useState<ShowFields | null>(null);
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<FoundArtist[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadShow(eventId), getVenues()])
      .then(([data, v]) => { setShow(data.show); setLineup(data.lineup); setVenues(v); })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load this show"));
  }, [eventId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchArtists(query).then(setFound).catch(() => setFound([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setField = (patch: Partial<ShowFields>) => setShow((s) => (s ? { ...s, ...patch } : s));
  const updateItem = (key: string, patch: Partial<LineupItem>) =>
    setLineup((l) => l.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const move = (index: number, by: number) =>
    setLineup((l) => {
      const next = [...l];
      const [item] = next.splice(index, 1);
      next.splice(Math.max(0, Math.min(next.length, index + by)), 0, item);
      return next;
    });

  const addExisting = (a: FoundArtist) => {
    if (lineup.some((i) => i.artistId === a.id)) return;
    setLineup((l) => [...l, { key: a.id, artistId: a.id, role: l.length ? "supporting" : "headliner", fields: artistFields(a), original: savedFields(a) }]);
    setQuery("");
  };
  const addNew = () => {
    const key = `new-${Date.now()}`;
    setLineup((l) => [...l, { key, artistId: null, role: l.length ? "supporting" : "headliner", fields: emptyArtist(query.trim()), original: null }]);
    setExpanded(key);
    setQuery("");
  };

  const save = async () => {
    if (!show) return;
    setSaving(true);
    setError(null);
    try {
      await saveShow(eventId, show, lineup);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  const text = (label: string, key: keyof ShowFields, type = "text", placeholder = "") => (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <input type={type} value={show?.[key] ?? ""} placeholder={placeholder} onChange={(e) => setField({ [key]: e.target.value })}
        className={`${inputCls} [color-scheme:dark]`} />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 p-0 sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto bg-gray-900 sm:rounded-xl border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Edit show">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Edit show</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">Close</button>
        </div>

        {!show ? (
          <p className="p-6 text-sm text-gray-400">{error ?? "Loading…"}</p>
        ) : (
          <div className="p-4 space-y-6">
            <section className="space-y-3">
              {text("Title", "title")}
              <div className="grid gap-3 grid-cols-2">
                {text("Date", "date", "date")}
                {text("Time", "time", "time")}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-xs text-gray-500 mb-1">Venue</span>
                  <select value={show.venue_id} onChange={(e) => setField({ venue_id: e.target.value })} className={inputCls}>
                    {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    {!venues.some((v) => v.id === "other") && <option value="other">Other</option>}
                  </select>
                </label>
                {show.venue_id === "other" && text("Venue name", "venue_name")}
                {text("Price", "price", "text", "From $15")}
                {text("Age", "age_restriction", "text", "21+")}
              </div>
              {text("Supporting acts (as listed)", "supporting_artists", "text", "Band A, Band B")}
              <div className="grid gap-3 sm:grid-cols-2">
                {text("Venue listing link", "event_url", "url")}
                {text("Ticket link", "ticket_url", "url")}
                {text("Image link", "image_url", "url")}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs text-gray-500 mb-1">Category</span>
                    <select value={show.category} onChange={(e) => setField({ category: e.target.value })} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-gray-500 mb-1">Status</span>
                    <select value={show.status} onChange={(e) => setField({ status: e.target.value })} className={inputCls}>
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-200">Lineup</h3>
                <p className="text-xs text-gray-500">Edits to an artist apply on every show they play. The show&apos;s genres follow the lineup.</p>
              </div>
              {lineup.length === 0 && <p className="text-sm text-gray-500">No artists linked to this show yet.</p>}
              {lineup.map((item, i) => {
                const open = expanded === item.key;
                return (
                  <article key={item.key} className="rounded-lg border border-gray-700 bg-gray-950/40">
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <button type="button" onClick={() => setExpanded(open ? null : item.key)} className="flex-1 min-w-0 text-left">
                        <span className="text-sm text-white">{item.fields.name || "New artist"}</span>
                        <span className="text-xs text-gray-500">
                          {!item.artistId ? " · new" : ""}
                          {item.fields.is_local ? " · local" : ""}
                          {item.fields.genres.length ? ` · ${item.fields.genres.join(", ")}` : ""}
                        </span>
                      </button>
                      <select value={item.role} onChange={(e) => updateItem(item.key, { role: e.target.value as Role })}
                        className="px-2 py-1 bg-gray-950 border border-gray-700 rounded text-xs text-gray-200">
                        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-gray-400 hover:text-white disabled:opacity-30" aria-label="Move up">↑</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === lineup.length - 1} className="px-1.5 text-gray-400 hover:text-white disabled:opacity-30" aria-label="Move down">↓</button>
                      <button type="button" onClick={() => setExpanded(open ? null : item.key)} className="px-2 text-xs text-blue-300 hover:underline">{open ? "Done" : "Edit"}</button>
                      <button type="button" onClick={() => setLineup((l) => l.filter((x) => x.key !== item.key))} className="px-2 text-xs text-red-300 hover:underline">Remove</button>
                    </div>
                    {open && (
                      <div className="border-t border-gray-800 p-3">
                        <ArtistFieldsEditor
                          value={item.fields}
                          spotifyArtist={item.fields.spotify_url}
                          onChange={(patch) => updateItem(item.key, { fields: { ...item.fields, ...patch } })}
                        />
                      </div>
                    )}
                  </article>
                );
              })}

              <div className="relative">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Add an artist: search by name…" className={inputCls} />
                {query.trim().length >= 2 && (
                  <div className="mt-1 rounded-lg border border-gray-700 bg-gray-950 divide-y divide-gray-800">
                    {found.filter((a) => !lineup.some((i) => i.artistId === a.id)).map((a) => (
                      <button key={a.id} type="button" onClick={() => addExisting(a)} className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-800">
                        {a.name}{a.hometown ? <span className="text-gray-500"> · {a.hometown}</span> : null}
                      </button>
                    ))}
                    <button type="button" onClick={addNew} className="block w-full text-left px-3 py-2 text-sm text-green-300 hover:bg-gray-800">
                      + New artist &ldquo;{query.trim()}&rdquo;
                    </button>
                  </div>
                )}
              </div>
            </section>

            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>
        )}

        <div className="sticky bottom-0 flex gap-3 px-4 py-3 bg-gray-900 border-t border-gray-800">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
          <button onClick={save} disabled={!show || saving} className="flex-[2] px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
