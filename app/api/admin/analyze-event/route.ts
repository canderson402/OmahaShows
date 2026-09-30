// app/api/admin/analyze-event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, requireAdmin } from "../../../../src/lib/admin-auth";
import { analyzeEvent, RetryableError } from "../../../../src/lib/artist-pipeline/pipeline";
import { createServerPipelineDeps, savePendingProposal } from "../../../../src/lib/artist-pipeline/server-deps";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { eventId } = await request.json();
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const sb = adminSupabase();
    const { deps, meter, repo } = createServerPipelineDeps(sb);
    const [event] = await repo.loadEvents([eventId]);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const proposal = await analyzeEvent(event, deps);
    const analysisId = await savePendingProposal(sb, proposal, "manual");
    return NextResponse.json({ analysisId, proposal, costUsd: meter.totals().costUsd });
  } catch (error) {
    console.error("Analyze event error:", error);
    if (error instanceof RetryableError) {
      return NextResponse.json({ error: `Temporary failure, try again: ${error.message}` }, { status: 503 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
