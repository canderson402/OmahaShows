import Anthropic from "@anthropic-ai/sdk";
import type { Genre } from "../genres";
import { LLMError, type StructuredLLM } from "./clients/llm";
import { SpotifyError, type SpotifyClient } from "./clients/spotify";
import { QuotaExceededError, YouTubeError, type YouTubeClient } from "./clients/youtube";
import { extractLineup } from "./stages/extract";
import { resolveAct, type ArtistRepo } from "./stages/resolve";
import { gatherSpotifyCandidates, gatherYouTubeCandidates } from "./stages/candidates";
import { judgeAct, type GuardedPick, type JudgeContext, type JudgeResult } from "./stages/judge";
import { escalateAct, type MessagesClient } from "./stages/escalate";
import { finalLinkConfidence, product, rawRatingScore, type CalibrationSet } from "./scoring";
import type { Candidate, ExtractedAct, LineupEntry, LinkDecision, LinkProposal, Platform, PipelineEvent, Proposal } from "./types";

export const HIGH_CONFIDENCE = 0.9;

export interface PipelineDeps {
  llm: StructuredLLM; messages: MessagesClient; spotify: SpotifyClient; youtube: YouTubeClient;
  fetchPage: (url: string | null) => Promise<string | null>; repo: ArtistRepo;
  models: { extract: string; judge: string; escalate: string };
  calibration: CalibrationSet; escalationBudget: { remaining: number };
}

export class RetryableError extends Error {
  constructor(message: string, public cause: unknown) { super(message); }
}

function proposal(c: Candidate, conf: number, reason: string, evidence: string[]): LinkProposal {
  return { external_id: c.external_id, url: c.url, display_name: c.display_name, evidence: [...evidence, ...c.details], confidence: conf, reason };
}

function decision(pick: GuardedPick, pool: Candidate[], cal: CalibrationSet, citations: string[] = []): LinkDecision {
  const chosen = pick.candidate && pick.features
    ? proposal(pick.candidate, finalLinkConfidence(pick.features, cal.link), pick.reason, [...pick.evidence, ...citations.map((c) => `cited: ${c}`)])
    : null;
  const alternatives = pool
    .filter((c) => c.external_id !== chosen?.external_id)
    .slice(0, 3)
    .map((c) => proposal(c, 0, "alternative candidate", []));
  return { chosen, alternatives };
}

function needsEscalation(r: JudgeResult, cal: CalibrationSet, want: Platform[]): boolean {
  return want.some((p) => {
    const pick = r[p];
    return !pick.candidate || !pick.features || finalLinkConfidence(pick.features, cal.link) < 0.6;
  });
}

async function gather(act: ExtractedAct, want: Platform[], rejected: { spotify: Set<string>; youtube: Set<string> }, deps: PipelineDeps) {
  const spotify = want.includes("spotify") ? await gatherSpotifyCandidates(act, deps.spotify, rejected.spotify) : [];
  let youtube: Candidate[] = [];
  let ytDeferred = false;
  if (want.includes("youtube")) {
    try { youtube = await gatherYouTubeCandidates(act, deps.youtube, rejected.youtube); }
    catch (e) { if (e instanceof QuotaExceededError) ytDeferred = true; else throw e; }
  }
  return { spotify, youtube, ytDeferred };
}

export async function analyzeAct(
  act: ExtractedAct, event: PipelineEvent, pageText: string | null, otherActs: string[], deps: PipelineDeps,
): Promise<LineupEntry> {
  if (act.kind !== "original_artist") {
    return {
      kind: "not_an_artist", billed_as: act.billed_as,
      category: act.kind === "unknown" ? "other" : (act.non_artist_category ?? "other"),
      reason: act.kind === "unknown" ? `unsure: ${act.reason}` : act.reason,
      confidence: act.kind === "unknown" ? 0.5 : 0.95,
    };
  }

  const { artist, missing } = await resolveAct(act.clean_name, deps.repo);
  if (artist && missing.length === 0) {
    return { kind: "existing", billed_as: act.billed_as, artist_id: artist.id, role: act.role, billing_order: act.billing_order, confidence: 1 };
  }

  const want = missing;
  const rejected = {
    spotify: artist ? await deps.repo.rejectedExternalIds(artist.id, "spotify") : new Set<string>(),
    youtube: artist ? await deps.repo.rejectedExternalIds(artist.id, "youtube") : new Set<string>(),
  };
  const { spotify, youtube, ytDeferred } = await gather(act, want, rejected, deps);
  const ctx: JudgeContext = { act, event, pageText, otherActs, spotify, youtube };
  let result: JudgeResult = await judgeAct(ctx, deps.llm, deps.models.judge);
  let citations: string[] = [];
  let ytQuota = ytDeferred;

  // When YouTube search is already out of quota, it cannot justify spending an escalation.
  const escWant = ytDeferred ? want.filter((p) => p !== "youtube") : want;
  if (escWant.length && needsEscalation(result, deps.calibration, escWant) && deps.escalationBudget.remaining > 0) {
    deps.escalationBudget.remaining--;
    try {
      const escalated = await escalateAct(ctx, { client: deps.messages, spotify: deps.spotify, youtube: deps.youtube, model: deps.models.escalate, rejected });
      if (escalated) {
        result = escalated;
        citations = escalated.citations;
        if (escalated.youtubeDeferred) ytQuota = true;
      }
    } catch (e) {
      if (e instanceof QuotaExceededError) ytQuota = true; else throw e;
    }
  }

  const sp = decision(result.spotify, spotify, deps.calibration, citations);
  const ytDecision = decision(result.youtube, youtube, deps.calibration, citations);
  const yt: LinkDecision = ytQuota && !ytDecision.chosen ? { chosen: null, alternatives: [], deferred: "youtube_quota" } : ytDecision;
  const linkConfs = [
    ...(want.includes("spotify") && sp.chosen ? [sp.chosen.confidence] : []),
    ...(want.includes("youtube") && yt.chosen ? [yt.chosen.confidence] : []),
  ];

  if (artist) {
    return {
      kind: "existing", billed_as: act.billed_as, artist_id: artist.id, role: act.role, billing_order: act.billing_order,
      confidence: product(linkConfs),
      new_links: { ...(want.includes("spotify") ? { spotify: sp } : {}), ...(want.includes("youtube") ? { youtube: yt } : {}) },
    };
  }
  const genres: Genre[] = result.genres.length ? result.genres : act.genres;
  return {
    kind: "new", billed_as: act.billed_as, clean_name: act.clean_name, role: act.role, billing_order: act.billing_order,
    hometown: result.hometown ?? act.hometown, genres, confidence: product(linkConfs), spotify: sp, youtube: yt,
  };
}

export async function analyzeEvent(event: PipelineEvent, deps: PipelineDeps): Promise<Proposal> {
  try {
    const pageText = await deps.fetchPage(event.eventUrl);
    const ex = await extractLineup(event, pageText, deps.llm, deps.models.extract);
    const artists: LineupEntry[] = [];
    for (const act of ex.acts) {
      const others = ex.acts.filter((a) => a !== act).map((a) => a.clean_name);
      artists.push(await analyzeAct(act, event, pageText, others, deps));
    }
    const category_confidence = deps.calibration.category.apply(rawRatingScore(ex.category_rating));
    const lineup_confidence = deps.calibration.lineup.apply(rawRatingScore(ex.lineup_rating));
    return {
      event_id: event.id,
      schema_version: 2,
      event: { category: ex.category, category_confidence, event_genres: ex.event_genres, reason: ex.reason },
      artists,
      lineup_confidence,
      overall_confidence: product([lineup_confidence, category_confidence, ...artists.map((a) => a.confidence)]),
    };
  } catch (e) {
    if (e instanceof SpotifyError || e instanceof YouTubeError || e instanceof LLMError || e instanceof Anthropic.APIError) {
      throw new RetryableError(`${event.id}: ${(e as Error).message}`, e);
    }
    throw e;
  }
}
