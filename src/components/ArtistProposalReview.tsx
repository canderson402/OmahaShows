"use client";

import { useState } from "react";
import type { EventCategory, EventClassification, LineupEntry, LinkDecision } from "../lib/artist-pipeline/types";
import type { AcceptDecision } from "../lib/artist-pipeline/accept";

export interface ProposalV2 {
  id: string;
  artists: LineupEntry[];
  event: EventClassification | null;
  overall_confidence: number | null;
}

type SpotifyChoice = NonNullable<AcceptDecision["spotify"]>;
type Choice = { spotify?: SpotifyChoice; realArtist?: boolean; exclude?: boolean };

const CATEGORIES: EventCategory[] = ["music", "comedy", "theater", "sports", "other"];
const pct = (n: number | null | undefined) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const tone = (n: number | null | undefined) =>
  n == null ? "text-gray-400 border-gray-600" : n >= 0.9 ? "text-green-400 border-green-600" : n >= 0.6 ? "text-amber-400 border-amber-600" : "text-red-400 border-red-600";
const isHttp = (u: string) => /^https?:\/\//i.test(u);

function SpotifyPicker({ decision, choice, onChange, name }: {
  decision: LinkDecision | undefined; choice: SpotifyChoice | undefined; onChange: (c: SpotifyChoice) => void; name: string;
}) {
  const proposed = decision?.chosen ?? null;
  const current = choice ?? (proposed ? { action: "proposed" as const } : { action: "none" as const });
  const radio = (value: string) =>
    current.action === "proposed" ? value === "proposed"
      : current.action === "alternative" ? value === `alt:${current.external_id}`
      : current.action === "none" ? value === "none" : value === "manual";
  const set = (value: string) => {
    if (value === "proposed") onChange({ action: "proposed" });
    else if (value === "none") onChange({ action: "none" });
    else if (value === "manual") onChange({ action: "manual", value: current.action === "manual" ? current.value : "" });
    else onChange({ action: "alternative", external_id: value.slice(4) });
  };
  return (
    <div className="mt-2 space-y-1.5 text-sm">
      {proposed ? (
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="radio" name={name} checked={radio("proposed")} onChange={() => set("proposed")} className="mt-1" />
          <span className="min-w-0">
            <span className="text-gray-300">Proposed: </span>
            {isHttp(proposed.url) ? (
              <a href={proposed.url} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{proposed.display_name}</a>
            ) : <span className="text-green-400">{proposed.display_name}</span>}
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded border ${tone(proposed.confidence)}`}>{pct(proposed.confidence)}</span>
            <span className="block text-xs text-gray-500 mt-0.5">{proposed.reason}</span>
          </span>
        </label>
      ) : (
        <p className="text-xs text-gray-500 italic">
          No clear-cut Spotify match{decision?.deferred === "escalation_budget" ? " (search limit reached)" : ""}. Pick one below or paste a link if you know it.
        </p>
      )}
      {decision?.alternatives.map((a) => (
        <label key={a.external_id} className="flex items-center gap-2 cursor-pointer text-xs">
          <input type="radio" name={name} checked={radio(`alt:${a.external_id}`)} onChange={() => set(`alt:${a.external_id}`)} />
          <span className="text-gray-400">other:</span>
          {isHttp(a.url) ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:underline truncate">{a.display_name}</a> : <span>{a.display_name}</span>}
        </label>
      ))}
      <label className="flex items-center gap-2 cursor-pointer text-xs">
        <input type="radio" name={name} checked={radio("none")} onChange={() => set("none")} />
        <span className="text-gray-400">no Spotify link</span>
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input type="radio" name={name} checked={radio("manual")} onChange={() => set("manual")} />
        <input
          type="text"
          placeholder={`paste Spotify link for ${name.split("|")[1] ?? "artist"}`}
          value={current.action === "manual" ? current.value : ""}
          onFocus={() => current.action !== "manual" && set("manual")}
          onChange={(e) => onChange({ action: "manual", value: e.target.value })}
          className="flex-1 min-w-0 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200"
        />
      </label>
    </div>
  );
}

export function ArtistProposalReview({ proposal, busy, onApprove, onReject }: {
  proposal: ProposalV2;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-400">All correct:</span>
        <span className={`px-2 py-0.5 rounded border font-medium ${tone(proposal.overall_confidence)}`}>{pct(proposal.overall_confidence)}</span>
        <span className="text-gray-400">Category:</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        {proposal.event?.event_genres?.length ? <span className="text-xs text-gray-500">genres: {proposal.event.event_genres.join(", ")}</span> : null}
      </div>
      {proposal.event?.reason && <p className="text-xs text-gray-500">{proposal.event.reason}</p>}

      <ol className="space-y-3">
        {proposal.artists.map((a, i) => {
          const c = choices[i] ?? {};
          const key = `sp-${proposal.id}-${i}|${a.kind === "new" ? a.clean_name : a.billed_as}`;
          if (a.kind === "not_an_artist") {
            return (
              <li key={i} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${a.unsure ? "bg-amber-900/40 text-amber-300" : "bg-red-900/40 text-red-300"}`}>
                    {a.unsure ? "unsure" : "not an artist"} · {a.category}
                  </span>
                  <span className={c.realArtist ? "text-white" : "text-gray-400 line-through"}>{a.billed_as}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{a.reason}</p>
                <label className="flex items-center gap-2 mt-2 text-xs text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={!!c.realArtist} onChange={(e) => update(i, { realArtist: e.target.checked })} />
                  This is a real artist, include them
                </label>
                {c.realArtist && (
                  <SpotifyPicker decision={undefined} choice={c.spotify ?? { action: "none" }} onChange={(s) => update(i, { spotify: s })} name={key} />
                )}
              </li>
            );
          }
          const excluded = !!c.exclude;
          return (
            <li key={i} className={`bg-gray-800 rounded-lg p-3 ${excluded ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 ${a.kind === "existing" ? "bg-blue-900/40 text-blue-300" : "bg-green-900/40 text-green-300"}`}>
                    {a.kind === "existing" ? "returning" : "new"}
                  </span>
                  <span className="text-white font-medium">{a.kind === "new" ? a.clean_name : a.billed_as}</span>
                  <span className="ml-2 text-xs text-gray-500">{a.role}</span>
                  {a.kind === "new" && a.genres.length > 0 && <span className="ml-2 text-xs text-purple-300">{a.genres.join(", ")}</span>}
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={excluded} onChange={(e) => update(i, { exclude: e.target.checked })} /> not in lineup
                </label>
              </div>
              {!excluded && a.kind === "new" && (
                <SpotifyPicker decision={a.spotify} choice={c.spotify} onChange={(s) => update(i, { spotify: s })} name={key} />
              )}
              {!excluded && a.kind === "existing" && a.new_links?.spotify && (
                <SpotifyPicker decision={a.new_links.spotify} choice={c.spotify} onChange={(s) => update(i, { spotify: s })} name={key} />
              )}
              {!excluded && a.kind === "existing" && !a.new_links?.spotify && (
                <p className="text-xs text-gray-500 mt-1">Already in your artist list with its links.</p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex gap-3 pt-2">
        <button onClick={onReject} disabled={busy} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50">Reject</button>
        <button onClick={approve} disabled={busy} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50">
          {busy ? "Saving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
