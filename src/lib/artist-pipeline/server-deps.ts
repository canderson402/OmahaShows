import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createStructuredLLM, MODELS } from "./clients/llm";
import { createSpotifyClient } from "./clients/spotify";
import { createYouTubeClient } from "./clients/youtube";
import { fetchEventPageText } from "./clients/event-page";
import { createUsageMeter, withUsageMeter, type UsageMeter } from "./clients/usage";
import { createSupabaseRepo } from "./repo";
import { loadCalibration } from "./scoring";
import { needsReview, type PipelineDeps } from "./pipeline";
import type { Proposal } from "./types";

/**
 * Pipeline dependencies for server routes (admin Analyze buttons). Same defaults as the CLI:
 * Haiku/Sonnet models, YouTube only if YOUTUBE_API_KEY is set, web-search escalation only if ARTIST_ESCALATION=on.
 */
export function createServerPipelineDeps(sb: SupabaseClient): { deps: PipelineDeps; meter: UsageMeter; repo: ReturnType<typeof createSupabaseRepo> } {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required");
  const meter = createUsageMeter();
  const anthropic = withUsageMeter(new Anthropic(), meter);
  const repo = createSupabaseRepo(sb);
  const calibration = process.env.ARTIST_CALIBRATION_JSON ? JSON.parse(process.env.ARTIST_CALIBRATION_JSON) : null;
  const deps: PipelineDeps = {
    llm: createStructuredLLM(anthropic),
    messages: anthropic,
    spotify: createSpotifyClient({ clientId, clientSecret }),
    youtube: process.env.YOUTUBE_API_KEY ? createYouTubeClient({ apiKey: process.env.YOUTUBE_API_KEY }) : null,
    fetchPage: (url) => fetchEventPageText(url),
    repo,
    models: MODELS,
    calibration: loadCalibration(calibration),
    escalationBudget: { remaining: Number(process.env.ARTIST_MAX_ESCALATIONS ?? 100) },
    escalation: process.env.ARTIST_ESCALATION === "on",
  };
  return { deps, meter, repo };
}

/** Replace any pending analysis for the event with this v2 proposal; returns the new row id. */
export async function savePendingProposal(sb: SupabaseClient, proposal: Proposal, trigger: "manual" | "new" | "changed" | "backfill"): Promise<string> {
  const del = await sb.from("pending_artist_analyses").delete().eq("event_id", proposal.event_id).eq("status", "pending");
  if (del.error) throw new Error(del.error.message);
  const ins = await sb.from("pending_artist_analyses").insert({
    event_id: proposal.event_id,
    artists: proposal.artists,
    event: proposal.event,
    overall_confidence: Math.round(proposal.overall_confidence * 1000) / 1000,
    schema_version: 2,
    trigger,
    run_id: trigger === "manual" ? "manual" : null,
    status: "pending",
  }).select("id").single();
  if (ins.error) throw new Error(ins.error.message);
  return ins.data.id as string;
}

/**
 * Queue the proposal for review, or, when there is nothing to review (no artists, nothing unsure),
 * just record the show as analyzed with its category/genres and clear any stale pending row.
 * Returns the pending row id, or null when nothing was queued.
 */
export async function saveProposalOrSkip(sb: SupabaseClient, proposal: Proposal, trigger: "manual" | "new" | "changed" | "backfill"): Promise<string | null> {
  if (needsReview(proposal)) return savePendingProposal(sb, proposal, trigger);
  const del = await sb.from("pending_artist_analyses").delete().eq("event_id", proposal.event_id).eq("status", "pending");
  if (del.error) throw new Error(del.error.message);
  const upd = await sb.from("events").update({
    analyzed_at: new Date().toISOString(),
    category: proposal.event.category,
    genres: proposal.event.event_genres,
  }).eq("id", proposal.event_id);
  if (upd.error) throw new Error(upd.error.message);
  return null;
}
