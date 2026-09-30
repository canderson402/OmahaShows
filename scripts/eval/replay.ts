import { readFileSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { createStructuredLLM, MODELS } from "../../src/lib/artist-pipeline/clients/llm";
import { createSpotifyClient } from "../../src/lib/artist-pipeline/clients/spotify";
import { createYouTubeClient } from "../../src/lib/artist-pipeline/clients/youtube";
import { fetchEventPageText } from "../../src/lib/artist-pipeline/clients/event-page";
import { createSupabaseRepo, serviceClient } from "../../src/lib/artist-pipeline/repo";
import { analyzeEvent, RetryableError, type PipelineDeps } from "../../src/lib/artist-pipeline/pipeline";
import { fitIsotonic, loadCalibration } from "../../src/lib/artist-pipeline/scoring";
import { normalizeArtistName } from "../../src/lib/artist-pipeline/normalize";
import type { LineupEntry, Proposal } from "../../src/lib/artist-pipeline/types";
import { calibrationTable, coverage, highConfidencePrecision, lineupCorrect, twoFold, type Labels, type LinkOutcome } from "./metrics";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

const fit = process.argv.includes("--fit");
const labels: Labels = JSON.parse(readFileSync("scripts/eval/labels.json", "utf8"));
const sbRepo = createSupabaseRepo(serviceClient());
const youtube = createYouTubeClient({ apiKey: env("YOUTUBE_API_KEY") });

const deps: PipelineDeps = {
  llm: createStructuredLLM(),
  messages: new Anthropic(),
  spotify: createSpotifyClient({ clientId: env("SPOTIFY_CLIENT_ID"), clientSecret: env("SPOTIFY_CLIENT_SECRET") }),
  youtube,
  fetchPage: (u) => fetchEventPageText(u),
  // Empty artist repo: every act is treated as new, so link matching is actually tested.
  repo: { async findByAlias() { return null; }, async rejectedExternalIds() { return new Set<string>(); } },
  models: MODELS,
  calibration: loadCalibration(null), // raw scores; calibrated below
  escalationBudget: { remaining: Number(process.env.ARTIST_MAX_ESCALATIONS ?? 1000) },
};

const eventIds = [...new Set([...labels.events.map((e) => e.event_id), ...labels.artists.map((a) => a.event_id)])];
const events = await sbRepo.loadEvents(eventIds);
const proposals = new Map<string, Proposal>();
const t0 = Date.now();
for (const ev of events) {
  try { proposals.set(ev.id, await analyzeEvent(ev, deps)); process.stdout.write("."); }
  catch (e) { if (e instanceof RetryableError) process.stdout.write("x"); else throw e; }
}
console.log(`\n${proposals.size}/${events.length} events analyzed in ${Math.round((Date.now() - t0) / 1000)}s, YouTube units ${youtube.unitsUsed()}`);

// Link outcomes: with identity calibration, confidence == raw score (after the similarity cap).
const outcomes: (LinkOutcome & { key: string })[] = [];
let withProfile = 0;
for (const a of labels.artists) {
  const p = proposals.get(a.event_id);
  const entry = p?.artists.find((x): x is Extract<LineupEntry, { kind: "new" }> =>
    x.kind === "new" && normalizeArtistName(x.clean_name) === normalizeArtistName(a.name));
  for (const [platform, gold] of [["spotify", a.spotify_id], ["youtube", a.youtube_channel_id]] as const) {
    if (gold) withProfile++;
    const chosen = entry?.[platform].chosen;
    if (!chosen) continue;
    outcomes.push({ key: `${a.name}:${platform}`, platform, confidence: chosen.confidence, rawScore: chosen.confidence, correct: chosen.external_id === gold });
  }
}

// Out-of-sample calibration: fit on one fold, apply to the other.
const [f1, f2] = twoFold(outcomes, (o) => o.key);
const cal1 = fitIsotonic(f1.map((o) => ({ score: o.rawScore, correct: o.correct })));
const cal2 = fitIsotonic(f2.map((o) => ({ score: o.rawScore, correct: o.correct })));
const calibrated = [...f1.map((o) => ({ ...o, confidence: cal2.apply(o.rawScore) })), ...f2.map((o) => ({ ...o, confidence: cal1.apply(o.rawScore) }))];

// Event-level metrics
let lineupOk = 0, catOk = 0, genreOk = 0, genreN = 0, nonArtistOk = 0, nonArtistN = 0;
const lineupSamples: { score: number; correct: boolean }[] = [];
const catSamples: { score: number; correct: boolean }[] = [];
for (const g of labels.events) {
  const p = proposals.get(g.event_id);
  if (!p) continue;
  const pred = p.artists.map((x) => ({
    name: x.kind === "new" ? x.clean_name : x.billed_as,
    role: x.kind === "not_an_artist" ? "supporting" as const : x.role,
    kind: x.kind === "not_an_artist" ? "not_an_artist" : "original_artist",
  }));
  const ok = lineupCorrect(pred, g.acts);
  lineupOk += ok ? 1 : 0;
  lineupSamples.push({ score: p.lineup_confidence, correct: ok });
  const cOk = p.event.category === g.category;
  catOk += cOk ? 1 : 0;
  catSamples.push({ score: p.event.category_confidence, correct: cOk });
  for (const act of g.acts.filter((a) => a.kind === "not_an_artist")) {
    nonArtistN++;
    const m = p.artists.find((x) => normalizeArtistName(x.billed_as) === normalizeArtistName(act.name));
    if (!m || m.kind === "not_an_artist") nonArtistOk++;
  }
}
for (const a of labels.artists.filter((a) => a.genres.length)) {
  const e = proposals.get(a.event_id)?.artists.find((x) => x.kind === "new" && normalizeArtistName(x.clean_name) === normalizeArtistName(a.name));
  if (e && e.kind === "new") { genreN++; if (a.genres.includes(e.genres[0])) genreOk++; }
}

const hp = highConfidencePrecision(calibrated);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
console.log(`
models: ${JSON.stringify(MODELS)}
high-confidence link precision: ${pct(hp.precision)} (n=${hp.n})   target >= 98%
coverage (correct high-conf / labeled profiles): ${pct(coverage(calibrated, withProfile))}
non-artist rejection: ${pct(nonArtistN ? nonArtistOk / nonArtistN : 1)} (n=${nonArtistN})   target >= 95%
lineup fully correct: ${pct(lineupOk / labels.events.length)}   target >= 95%
category: ${pct(catOk / labels.events.length)}   target >= 97%
genre top-1: ${pct(genreN ? genreOk / genreN : 0)} (n=${genreN})   target >= 85% (not a blocker)
calibration (out-of-sample):`);
console.table(calibrationTable(calibrated));
console.log("wrong high-confidence links:");
for (const o of calibrated.filter((o) => o.confidence >= 0.9 && !o.correct)) console.log("  x", o.key, pct(o.confidence));

if (fit) {
  const all = outcomes.map((o) => ({ score: o.rawScore, correct: o.correct }));
  writeFileSync("scripts/eval/calibration.json", JSON.stringify({
    link: fitIsotonic(all).toJSON(),
    lineup: fitIsotonic(lineupSamples).toJSON(),
    category: fitIsotonic(catSamples).toJSON(),
  }, null, 2));
  console.log("wrote scripts/eval/calibration.json");
}
