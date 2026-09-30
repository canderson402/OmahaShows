import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { createStructuredLLM, MODELS } from "../src/lib/artist-pipeline/clients/llm";
import { createSpotifyClient } from "../src/lib/artist-pipeline/clients/spotify";
import { createYouTubeClient } from "../src/lib/artist-pipeline/clients/youtube";
import { fetchEventPageText } from "../src/lib/artist-pipeline/clients/event-page";
import { createSupabaseRepo, serviceClient, todayChicago } from "../src/lib/artist-pipeline/repo";
import { selectEventIds } from "../src/lib/artist-pipeline/gate";
import { analyzeEvent, HIGH_CONFIDENCE, RetryableError, type PipelineDeps } from "../src/lib/artist-pipeline/pipeline";
import { loadCalibration } from "../src/lib/artist-pipeline/scoring";
import { countFailures, dropPastEvents, exitCodeFor, type RunFailure } from "../src/lib/artist-pipeline/run-summary";
import type { PipelineEvent, Proposal } from "../src/lib/artist-pipeline/types";

function args() {
  const a = process.argv.slice(2);
  const all = (flag: string) => a.flatMap((v, i) => (v === flag ? [a[i + 1]] : []));
  const one = (flag: string) => all(flag)[0];
  return { events: all("--event"), since: one("--since"), upcoming: one("--upcoming"), offset: one("--offset") };
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

const opts = args();
const repo = createSupabaseRepo(serviceClient());

let ids: string[] = opts.events;
let events: PipelineEvent[];
if (opts.since) {
  // Stage-0 gate: new or lineup-changed events, still upcoming, not already awaiting review.
  const runs = await repo.runsSince(opts.since);
  const candidateIds = runs.flatMap((r) => [...(r.new_event_ids ?? []), ...(r.changed_event_ids ?? [])]);
  ids = selectEventIds(runs, await repo.changesSince(opts.since, candidateIds)).ids;
  const pending = await repo.pendingAnalysisEventIds(ids);
  events = dropPastEvents(await repo.loadEvents(ids.filter((id) => !pending.has(id))), todayChicago());
  if (events.length === 0) { console.log("No new or lineup-changed events since", opts.since, "- nothing to do."); process.exit(0); }
} else {
  if (opts.upcoming) ids = await repo.upcomingEventIds(Number(opts.upcoming), Number(opts.offset ?? 0));
  if (ids.length === 0) { console.error("Usage: --event <id> | --since <iso> | --upcoming <n> [--offset <n>]"); process.exit(1); }
  events = await repo.loadEvents(ids);
}

const youtube = createYouTubeClient({ apiKey: env("YOUTUBE_API_KEY") });
const calPath = "scripts/eval/calibration.json";
const deps: PipelineDeps = {
  llm: createStructuredLLM(),
  messages: new Anthropic(),
  spotify: createSpotifyClient({ clientId: env("SPOTIFY_CLIENT_ID"), clientSecret: env("SPOTIFY_CLIENT_SECRET") }),
  youtube,
  fetchPage: (url) => fetchEventPageText(url),
  repo,
  models: MODELS,
  calibration: loadCalibration(existsSync(calPath) ? JSON.parse(readFileSync(calPath, "utf8")) : null),
  escalationBudget: { remaining: Number(process.env.ARTIST_MAX_ESCALATIONS ?? 20) },
};

const proposals: Proposal[] = [];
const failures: RunFailure[] = [];
for (const ev of events) {
  try {
    proposals.push(await analyzeEvent(ev, deps));
    console.log(`✓ ${ev.id}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (e instanceof RetryableError) {
      failures.push({ event_id: ev.id, error: message, kind: "retry" });
      console.log(`↻ ${ev.id} (retry next run): ${message}`);
    } else {
      failures.push({ event_id: ev.id, error: message, kind: "unexpected" });
      console.log(`✗ ${ev.id} (unexpected): ${message}`);
    }
  }
}

mkdirSync("reports", { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const path = `reports/artist-run-${stamp}.json`;
writeFileSync(path, JSON.stringify({ models: MODELS, youtubeUnits: youtube.unitsUsed(), proposals, failures }, null, 2));

const counts = countFailures(failures);
const lines = [
  `## Artist analysis (dry run)`,
  `Events: ${events.length} · proposals: ${proposals.length} · retry: ${counts.retry} · unexpected failures: ${counts.unexpected} · YouTube units: ${youtube.unitsUsed()} · escalations left: ${deps.escalationBudget.remaining}`,
  ``,
  `| Event | All correct | Lineup |`,
  `|---|---|---|`,
  ...proposals.map((p) => {
    const ev = events.find((e) => e.id === p.event_id)!;
    const acts = p.artists.map((a) => {
      if (a.kind === "not_an_artist") return `~~${a.billed_as}~~ (${a.category})`;
      if (a.kind === "existing") return `${a.billed_as} ↺`;
      const sp = a.spotify.chosen ? `${Math.round(a.spotify.chosen.confidence * 100)}%${a.spotify.chosen.confidence >= HIGH_CONFIDENCE ? "✓" : ""}` : "—";
      return `${a.billed_as} [sp ${sp}]`;
    }).join(", ");
    return `| ${ev.title} (${p.event.category}) | ${Math.round(p.overall_confidence * 100)}% | ${acts} |`;
  }),
  ``,
  `Full report: \`${path}\``,
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
process.exit(exitCodeFor(failures));
