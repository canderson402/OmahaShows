// app/api/admin/bulk-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, requireAdmin } from "../../../../src/lib/admin-auth";
import { analyzeEvent, RetryableError } from "../../../../src/lib/artist-pipeline/pipeline";
import { createServerPipelineDeps, saveProposalOrSkip } from "../../../../src/lib/artist-pipeline/server-deps";
import { todayChicago } from "../../../../src/lib/artist-pipeline/repo";

// One show takes a few seconds (no web search by default); 300s covers a full nightly batch.
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const supabase = adminSupabase();
  try {
    const body = await request.json();
    const onlyNew = body.onlyNew === true;
    const batchSize = Math.min(Math.max(Number.isInteger(body.batchSize) ? body.batchSize : 10, 1), 25);
    const todayStr = todayChicago();

    // Shows already waiting in the review queue are skipped (they have an analysis to approve/reject).
    const { data: queued, error: queuedError } = await supabase
      .from("pending_artist_analyses").select("event_id").eq("status", "pending");
    if (queuedError) throw queuedError;
    const queuedIds = new Set((queued ?? []).map((q) => q.event_id as string));

    let batch: { id: string; title: string; date: string; venue_id: string; venues?: { name: string } | null }[] = [];

    if (onlyNew) {
      // Get ONLY events that were added TODAY via scraper
      // These are identified by event_changes with change_type='new' created today
      const { data: newEventChanges } = await supabase
        .from("event_changes")
        .select("event_id, created_at")
        .eq("status", "pending")
        .eq("change_type", "new")
        .gte("created_at", todayStr);

      const newEventIds = newEventChanges?.map(e => e.event_id) || [];

      if (newEventIds.length === 0) {
        // No new events today, nothing to analyze
        batch = [];
      } else {
        // Get the events that were added today (regardless of approval status)
        const { data: newEvents } = await supabase
          .from("events")
          .select("id, title, date, venue_id, venues(name)")
          .in("id", newEventIds)
          .gte("date", todayStr)
          .is("analyzed_at", null)
          .limit(batchSize);

        batch = newEvents || [];
      }
    } else {
      // Next N upcoming approved shows not yet analyzed (soonest first), not counting queued ones.
      const { data: eventsToAnalyze, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date, venue_id, venues(name)")
        .eq("status", "approved")
        .is("analyzed_at", null)
        .gte("date", todayStr)
        .order("date", { ascending: true })
        .order("id", { ascending: true })
        .limit(batchSize + queuedIds.size);

      if (eventsError) throw eventsError;
      batch = (eventsToAnalyze || []).filter((e) => !queuedIds.has(e.id)).slice(0, batchSize);
    }

    const eventsToProcess = batch.filter((e) => !queuedIds.has(e.id));

    const { deps, meter, repo } = createServerPipelineDeps(supabase);
    const pipelineEvents = await repo.loadEvents(eventsToProcess.map((e) => e.id));
    const results: { eventId: string; title: string; success: boolean; error?: string; artistName?: string; pending?: boolean }[] = [];

    for (const event of pipelineEvents) {
      try {
        const proposal = await analyzeEvent(event, deps);
        const queued = await saveProposalOrSkip(supabase, proposal, onlyNew ? "new" : "backfill");
        const first = proposal.artists.find((a) => a.kind !== "not_an_artist");
        results.push({
          eventId: event.id, title: event.title, success: true, pending: queued !== null,
          artistName: first ? (first.kind === "new" ? first.clean_name : first.billed_as) : undefined,
        });
      } catch (err) {
        results.push({
          eventId: event.id, title: event.title, success: false,
          error: err instanceof RetryableError ? `temporary: ${err.message}` : err instanceof Error ? err.message : "Analysis failed",
        });
      }
    }

    return NextResponse.json({
      costUsd: meter.totals().costUsd,
      processed: results.length,
      remaining: batch.length - eventsToProcess.length,
      results,
    });
  } catch (error) {
    console.error("Bulk analyze error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk analysis failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many events need analysis
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const supabase = adminSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const onlyNew = searchParams.get("onlyNew") === "true";

    // Get today's date for filtering
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Get events that already have pending artist analyses
    const { data: pendingAnalyses } = await supabase
      .from("pending_artist_analyses")
      .select("event_id")
      .eq("status", "pending");
    const pendingAnalysisEventIds = new Set(pendingAnalyses?.map(p => p.event_id) || []);

    if (onlyNew) {
      // Get ONLY events that were added TODAY via scraper
      // These are identified by event_changes with change_type='new' created today
      const { data: newEventChanges } = await supabase
        .from("event_changes")
        .select("event_id")
        .eq("status", "pending")
        .eq("change_type", "new")
        .gte("created_at", todayStr);

      const newEventIds = newEventChanges?.map(e => e.event_id) || [];

      if (newEventIds.length === 0) {
        return NextResponse.json({ total: 0, analyzed: 0, needsAnalysis: 0 });
      }

      // Get the events that were added today
      const { data: newEvents } = await supabase
        .from("events")
        .select("id, analyzed_at")
        .in("id", newEventIds)
        .gte("date", todayStr);

      const total = newEvents?.length || 0;
      const analyzed = newEvents?.filter(e => e.analyzed_at !== null).length || 0;
      const needsAnalysis = newEvents?.filter(e =>
        e.analyzed_at === null && !pendingAnalysisEventIds.has(e.id)
      ).length || 0;

      return NextResponse.json({ total, analyzed, needsAnalysis });
    } else {
      // Get ALL upcoming approved events
      const { data: events } = await supabase
        .from("events")
        .select("id, analyzed_at")
        .eq("status", "approved")
        .gte("date", todayStr);

      const total = events?.length || 0;
      const analyzed = events?.filter(e => e.analyzed_at !== null).length || 0;
      const needsAnalysis = events?.filter(e =>
        e.analyzed_at === null && !pendingAnalysisEventIds.has(e.id)
      ).length || 0;

      return NextResponse.json({ total, analyzed, needsAnalysis });
    }
  } catch (error) {
    console.error("Bulk analyze status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    );
  }
}
