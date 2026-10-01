/**
 * Nightly: after the scrape, run artist matching on shows that run found (new, or lineup changed)
 * and put the results in the admin Pending queue. Nothing is approved here.
 *
 *   SCRAPE_STARTED_AT=<iso> npx tsx scripts/analyze-new-shows.ts
 */
import { appendFileSync } from "node:fs";
import { createServerPipelineDeps, saveProposalOrSkip } from "../src/lib/artist-pipeline/server-deps";
import { serviceClient, todayChicago } from "../src/lib/artist-pipeline/repo";
import { selectEventIds } from "../src/lib/artist-pipeline/gate";
import { analyzeEvent, RetryableError } from "../src/lib/artist-pipeline/pipeline";
import { headlinerConfidence } from "../src/lib/artist-pipeline/confidence";
import { dropPastEvents } from "../src/lib/artist-pipeline/run-summary";

async function main() {
  const since = process.env.SCRAPE_STARTED_AT;
  if (!since) { console.error("SCRAPE_STARTED_AT is required"); process.exitCode = 1; return; }

  const sb = serviceClient();
  const { deps, meter, repo } = createServerPipelineDeps(sb);

  const runs = await repo.runsSince(since);
  const candidateIds = runs.flatMap((r) => [...(r.new_event_ids ?? []), ...(r.changed_event_ids ?? [])]);
  const { ids, trigger } = selectEventIds(runs, await repo.changesSince(since, candidateIds));
  const queued = await repo.pendingAnalysisEventIds(ids);
  const events = dropPastEvents(await repo.loadEvents(ids.filter((id) => !queued.has(id))), todayChicago());

  const lines: string[] = [];
  let toReview = 0, noArtists = 0, failed = 0;
  for (const ev of events) {
    try {
      const proposal = await analyzeEvent(ev, deps);
      const id = await saveProposalOrSkip(sb, proposal, trigger.get(ev.id) === "changed" ? "changed" : "new");
      const c = headlinerConfidence(proposal.artists);
      if (id) toReview++; else noArtists++;
      lines.push(`- ${ev.title} (${ev.venueName}): ${id ? `queued, ${c != null ? Math.round(c * 100) : "?"}%` : "no artists, marked analyzed"}`);
    } catch (e) {
      failed++;
      const kind = e instanceof RetryableError ? "temporary, will retry next run" : "error";
      lines.push(`- ${ev.title}: FAILED (${kind}): ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const summary = [
    "## Artist matching",
    events.length === 0
      ? "No new or lineup-changed shows to analyze."
      : `${events.length} show(s): ${toReview} sent to the Pending queue, ${noArtists} with no artists, ${failed} failed. Cost $${meter.totals().costUsd.toFixed(3)}.`,
    ...lines,
  ].join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
