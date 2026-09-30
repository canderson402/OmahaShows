"use client";

import { useState } from "react";
import type { EventCategory, EventClassification, LineupEntry, LinkDecision, LinkProposal } from "../lib/artist-pipeline/types";
import type { AcceptDecision } from "../lib/artist-pipeline/accept";

export interface ProposalV2 {
  id: string;
  artists: LineupEntry[];
  event: EventClassification | null;
  overall_confidence: number | null;
}

/** The show as the venue listed it, so the admin can check the proposal against the source. */
export interface ListingInfo {
  title: string;
  date: string | null;       // YYYY-MM-DD
  time: string | null;       // HH:MM[:SS]
  venue: string;
  venueColor?: string;
  imageUrl: string | null;
  eventUrl: string | null;
  ticketUrl: string | null;
  supportingArtists: string[] | null;
  price: string | null;
  ageRestriction: string | null;
}

type SpotifyChoice = NonNullable<AcceptDecision["spotify"]>;
type Choice = { spotify?: SpotifyChoice; realArtist?: boolean; exclude?: boolean };

const CATEGORIES: EventCategory[] = ["music", "comedy", "theater", "sports", "other"];
const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const isHttp = (u: string | null | undefined): u is string => !!u && /^https?:\/\//i.test(u);
const pct = (n: number) => `${Math.round(n * 100)}%`;

function confidenceStyle(n: number) {
  if (n >= 0.9) return "text-green-300 bg-green-900/30 border-green-700/60";
  if (n >= 0.6) return "text-amber-300 bg-amber-900/25 border-amber-700/60";
  return "text-red-300 bg-red-900/25 border-red-700/60";
}

function formatWhen(date: string | null, time: string | null) {
  if (!date) return "";
  const d = new Date(`${date}T${time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : "12:00"}:00`);
  const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const clock = time ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;
  return clock ? `${day}, ${clock}` : day;
}

/** Spotify's own artist player: photo, name, top tracks. Only real 22-char ids are embedded. */
function SpotifyPlayer({ id, title }: { id: string; title: string }) {
  if (!SPOTIFY_ID.test(id)) return null;
  return (
    <iframe
      title={`Spotify: ${title}`}
      src={`https://open.spotify.com/embed/artist/${id}?utm_source=generator&theme=0`}
      width="100%"
      height="152"
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      className="rounded-xl border-0 block"
    />
  );
}

/** One short line that helps tell same-named artists apart: genres and albums Spotify reports. */
function profileHint(p: LinkProposal): string | null {
  const bits: string[] = [];
  for (const e of p.evidence) {
    const g = e.match(/^genres: (.+)$/);
    if (g) bits.push(g[1]);
    const a = e.match(/^albums found for name "[^"]*" \(may include same-name artists\): (.+)$/) ?? e.match(/^albums: (.+)$/);
    if (a) bits.push(`releases: ${a[1]}`);
  }
  return bits.length ? bits.join(" · ") : null;
}

const sameName = (a: string, b: string) => a.toLowerCase().replace(/[^a-z0-9]+/g, "") === b.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Spotify often has several profiles with the exact same name (stray duplicates, empty pages).
 * Keep only the first (Spotify's top-ranked) of each name, and none that share the proposed match's name.
 */
function withoutDuplicates(alts: LinkProposal[], proposed: LinkProposal | null): LinkProposal[] {
  const kept: LinkProposal[] = [];
  for (const a of alts) {
    if (proposed && sameName(a.display_name, proposed.display_name)) continue;
    if (kept.some((k) => sameName(k.display_name, a.display_name))) continue;
    kept.push(a);
  }
  return kept;
}

/** Keep only candidates whose name plausibly matches; drop unrelated search noise. */
function plausible(alts: LinkProposal[]) {
  return alts.filter((a) => (a.name_similarity ?? 1) >= 0.5);
}

function ArtistCheck({ name, decision, choice, onChange }: {
  name: string; decision: LinkDecision | undefined; choice: SpotifyChoice | undefined; onChange: (c: SpotifyChoice) => void;
}) {
  const proposed = decision?.chosen ?? null;
  const alternatives = withoutDuplicates(plausible(decision?.alternatives ?? []), proposed);
  const current: SpotifyChoice = choice ?? (proposed ? { action: "proposed" } : { action: "none" });
  const [mode, setMode] = useState<"right" | "wrong" | "none">(
    current.action === "proposed" ? "right" : current.action === "none" && proposed ? "none" : "wrong",
  );
  const showOthers = !proposed || mode === "wrong";
  const [expanded, setExpanded] = useState(false);
  // Spotify's own ranking puts the most likely profile first; show that one and tuck the rest away.
  const selectedIdx = alternatives.findIndex((a) => current.action === "alternative" && current.external_id === a.external_id);
  const visible = expanded ? alternatives : alternatives.filter((_, n) => n === 0 || n === selectedIdx);
  const hidden = alternatives.length - visible.length;
  // A hint identical on every option (name-level album search) can't tell them apart, so drop it.
  const hints = alternatives.map(profileHint);
  const hintsDiffer = new Set(hints).size > 1;
  const btn = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-lg border transition-colors ${active ? "bg-white text-gray-900 border-white" : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500"}`;

  return (
    <div className="mt-3 space-y-3">
      {proposed ? (
        <>
          <SpotifyPlayer id={proposed.external_id} title={proposed.display_name} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${confidenceStyle(proposed.confidence)}`}>
              {pct(proposed.confidence)} match confidence
            </span>
            <span className="text-gray-400">{proposed.reason}</span>
            {profileHint(proposed) && <span className="basis-full text-xs text-gray-500">{profileHint(proposed)}</span>}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Is this ${name}?`}>
            <button type="button" className={btn(mode === "right")} onClick={() => { setMode("right"); onChange({ action: "proposed" }); }}>
              Right artist
            </button>
            <button type="button" className={btn(mode === "wrong")} onClick={() => { setMode("wrong"); onChange({ action: "none" }); }}>
              Wrong artist
            </button>
            <button type="button" className={btn(mode === "none")} onClick={() => { setMode("none"); onChange({ action: "none" }); }}>
              Not on Spotify
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">
          No clear Spotify match, so this artist will be saved without a link unless you pick one below.
        </p>
      )}

      {showOthers && (
        <div className="rounded-lg border border-gray-700 bg-gray-950/40 p-3 space-y-2">
          <p className="text-xs text-gray-400">
            {alternatives.length > 0 ? "Play it to check. If it's them, press This is them; otherwise paste the right link, or leave it and the artist is saved with no Spotify link." : "Paste the right link, or leave it empty to save the artist with no Spotify link."}
          </p>
          {visible.map((a) => {
            const n = alternatives.indexOf(a);
            const selected = current.action === "alternative" && current.external_id === a.external_id;
            const hint = hintsDiffer ? hints[n] : null;
            return (
              <div key={a.external_id} className={`rounded-lg border p-2 space-y-2 ${selected ? "border-green-500 bg-green-950/20" : "border-gray-700"}`}>
                <SpotifyPlayer id={a.external_id} title={a.display_name} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-gray-400 min-w-0">
                    {n === 0 ? `Top Spotify result: ${a.display_name}` : a.display_name}{hint ? ` (${hint})` : ""}
                  </span>
                  <button type="button" className={btn(selected)} onClick={() => onChange(selected ? { action: "none" } : { action: "alternative", external_id: a.external_id })}>
                    {selected ? "Selected" : "This is them"}
                  </button>
                </div>
              </div>
            );
          })}
          {hidden > 0 && (
            <button type="button" className="text-xs text-gray-300 hover:text-white underline" onClick={() => setExpanded(true)}>
              {hidden === 1 ? "1 other Spotify artist with a similar name" : `${hidden} other Spotify artists with similar names`}
            </button>
          )}
          {expanded && alternatives.length > 1 && (
            <button type="button" className="text-xs text-gray-400 hover:text-white underline" onClick={() => setExpanded(false)}>
              Show only the top result
            </button>
          )}
          <label className="block text-xs text-gray-400 pt-1">
            Or paste the right Spotify artist link
            <input
              type="text"
              placeholder="https://open.spotify.com/artist/…"
              value={current.action === "manual" ? current.value : ""}
              onChange={(e) => onChange(e.target.value.trim() ? { action: "manual", value: e.target.value } : proposed ? { action: "proposed" } : { action: "none" })}
              className="mt-1 w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200"
            />
          </label>
          {current.action === "manual" && SPOTIFY_ID.test(current.value.match(/artist\/([A-Za-z0-9]{22})/)?.[1] ?? current.value.trim()) && (
            <SpotifyPlayer id={current.value.match(/artist\/([A-Za-z0-9]{22})/)?.[1] ?? current.value.trim()} title="Pasted artist" />
          )}
          {current.action !== "none" && (
            <button type="button" className="text-xs text-gray-400 hover:text-white underline" onClick={() => onChange({ action: "none" })}>
              Clear, save with no Spotify link
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ArtistProposalReview({ proposal, listing, busy, onApprove, onReject }: {
  proposal: ProposalV2;
  listing: ListingInfo;
  busy: boolean;
  onApprove: (decisions: AcceptDecision[], category: EventCategory) => void;
  onReject: () => void;
}) {
  const [choices, setChoices] = useState<Record<number, Choice>>({});
  const [category, setCategory] = useState<EventCategory>(proposal.event?.category ?? "music");
  const update = (i: number, patch: Choice) => setChoices((c) => ({ ...c, [i]: { ...c[i], ...patch } }));

  const approve = () => {
    const decisions: AcceptDecision[] = Object.entries(choices).map(([i, c]) => ({
      index: Number(i),
      ...(c.realArtist !== undefined ? { realArtist: c.realArtist } : {}),
      ...(c.exclude ? { exclude: true } : {}),
      ...(c.spotify ? { spotify: c.spotify } : {}),
    }));
    onApprove(decisions, category);
  };

  const billed = [listing.title, ...(listing.supportingArtists ?? [])];
  const acts = proposal.artists.filter((a) => a.kind !== "not_an_artist").length;
  const dropped = proposal.artists.filter((a) => a.kind === "not_an_artist");

  return (
    <div className="space-y-5">
      {/* The listing, as the venue published it */}
      <section className="flex gap-4">
        {isHttp(listing.imageUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt="" className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg object-cover flex-shrink-0 bg-gray-800" />
        ) : (
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg bg-gray-800 flex-shrink-0" />
        )}
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-xl font-semibold text-white leading-snug">{listing.title}</h3>
          <p className="text-sm text-gray-300">{formatWhen(listing.date, listing.time)}</p>
          <p className="text-sm" style={{ color: listing.venueColor ?? "#d1d5db" }}>{listing.venue}</p>
          {(listing.price || listing.ageRestriction) && (
            <p className="text-sm text-gray-400">{[listing.price, listing.ageRestriction].filter(Boolean).join(", ")}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            {isHttp(listing.eventUrl) && <a href={listing.eventUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Venue listing</a>}
            {isHttp(listing.ticketUrl) && listing.ticketUrl !== listing.eventUrl && <a href={listing.ticketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Tickets</a>}
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-gray-800/60 px-4 py-3 text-sm space-y-2">
        <p className="text-gray-300"><span className="text-gray-500">Billed as:</span> {billed.join(", ")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-500">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-gray-200">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {proposal.event?.event_genres?.length ? <span className="text-gray-400">{proposal.event.event_genres.join(", ")}</span> : null}
        </div>
      </section>

      {/* Each artist found, with Spotify's player so you can hear it's them */}
      <section className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">
          {acts === 0 ? "No artists found" : acts === 1 ? "1 artist to check" : `${acts} artists to check`}
        </h4>
        {proposal.artists.map((a, i) => {
          if (a.kind === "not_an_artist") return null;
          const c = choices[i] ?? {};
          const name = a.kind === "new" ? a.clean_name : a.billed_as;
          const excluded = !!c.exclude;
          return (
            <article key={i} className={`rounded-xl border border-gray-700 bg-gray-900 p-4 ${excluded ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-medium text-white">{name}</p>
                  <p className="text-xs text-gray-400">
                    {a.role === "headliner" ? "Headliner" : a.role === "co-headliner" ? "Co-headliner" : "Opener"}
                    {a.kind === "existing" ? ", already in your artists" : ", new artist"}
                    {a.kind === "new" && a.genres.length ? `, ${a.genres.join(", ")}` : ""}
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={excluded} onChange={(e) => update(i, { exclude: e.target.checked })} />
                  Not playing this show
                </label>
              </div>
              {!excluded && a.kind === "new" && (
                <ArtistCheck name={name} decision={a.spotify} choice={c.spotify} onChange={(s) => update(i, { spotify: s })} />
              )}
              {!excluded && a.kind === "existing" && a.new_links?.spotify && (
                <ArtistCheck name={name} decision={a.new_links.spotify} choice={c.spotify} onChange={(s) => update(i, { spotify: s })} />
              )}
              {!excluded && a.kind === "existing" && !a.new_links?.spotify && (
                <p className="mt-2 text-sm text-gray-400">Already linked. Approving adds this show to their history.</p>
              )}
            </article>
          );
        })}
      </section>

      {dropped.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Left out as not an artist</h4>
          {proposal.artists.map((a, i) => {
            if (a.kind !== "not_an_artist") return null;
            const c = choices[i] ?? {};
            return (
              <div key={i} className="rounded-lg border border-gray-800 px-3 py-2">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={!!c.realArtist} onChange={(e) => update(i, { realArtist: e.target.checked })} />
                  <span>
                    <span className="text-gray-200">{a.billed_as}</span>
                    <span className="text-gray-500"> ({a.unsure ? "unsure" : a.category}): {a.reason}</span>
                    <span className="block text-xs text-gray-400">Tick to add them as an artist</span>
                  </span>
                </label>
                {c.realArtist && (
                  <ArtistCheck name={a.billed_as} decision={undefined} choice={c.spotify ?? { action: "none" }} onChange={(s) => update(i, { spotify: s })} />
                )}
              </div>
            );
          })}
        </section>
      )}

      <div className="flex gap-3 pt-1 sticky bottom-0 bg-gray-900 pb-1">
        <button onClick={onReject} disabled={busy} className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50">
          Reject
        </button>
        <button onClick={approve} disabled={busy} className="flex-[2] px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50">
          {busy ? "Saving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
