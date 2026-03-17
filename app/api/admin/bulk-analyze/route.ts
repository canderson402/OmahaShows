// app/api/admin/bulk-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeEvent } from "../../../../src/lib/ai";
import { searchArtist } from "../../../../src/lib/spotify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { batchSize = 10, onlyNew = false } = await request.json();

    // Get today's date for filtering
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Build query for unanalyzed events
    let query = supabase
      .from("events")
      .select("id, title, date, venue_id, created_at, venues(name)")
      .eq("status", "approved")
      .is("analyzed_at", null)
      .gte("date", todayStr);

    // If onlyNew flag is set, only get events created today (for automated workflow)
    if (onlyNew) {
      query = query.gte("created_at", todayStr);
    }

    const { data: eventsToAnalyze, error: eventsError } = await query
      .order("date", { ascending: true })
      .limit(batchSize);

    if (eventsError) throw eventsError;

    const batch = eventsToAnalyze || [];

    // Filter out events that already have pending analyses
    const { data: existingPending } = await supabase
      .from("pending_artist_analyses")
      .select("event_id")
      .eq("status", "pending")
      .in("event_id", batch.map(e => e.id));

    const pendingEventIds = new Set(existingPending?.map(p => p.event_id) || []);
    const eventsToProcess = batch.filter(e => !pendingEventIds.has(e.id));

    const results: { eventId: string; title: string; success: boolean; error?: string; artistName?: string; pending?: boolean }[] = [];

    for (const event of eventsToProcess) {
      try {
        // Get venue name
        type EventWithVenue = typeof event & { venues?: { name: string } | null };
        const eventWithVenue = event as EventWithVenue;
        const venueName = eventWithVenue.venues?.name || "Unknown Venue";

        // Analyze with AI
        const analysis = await analyzeEvent(event.title, venueName, event.date, []);

        if (analysis.artists.length === 0) {
          // Mark as analyzed even if no artist found (no need for approval)
          await supabase
            .from("events")
            .update({ analyzed_at: new Date().toISOString() })
            .eq("id", event.id);
          results.push({ eventId: event.id, title: event.title, success: true, artistFound: false });
          continue;
        }

        // Enrich with Spotify data
        for (const artistInput of analysis.artists) {
          const spotifyData = await searchArtist(artistInput.name);
          if (spotifyData) {
            artistInput.spotify_url = spotifyData.spotify_url;
          }
        }

        // Save to pending_artist_analyses instead of auto-accepting
        const { error: insertError } = await supabase
          .from("pending_artist_analyses")
          .insert({
            event_id: event.id,
            artists: analysis.artists,
            status: "pending",
          });

        if (insertError) {
          console.error("Failed to insert pending analysis:", insertError);
          throw new Error(`Failed to save pending analysis: ${insertError.message}`);
        }

        const headliner = analysis.artists.find(a => a.role === "headliner");
        results.push({
          eventId: event.id,
          title: event.title,
          success: true,
          artistFound: true,
          artistName: headliner?.name || analysis.artists[0]?.name,
          pending: true,
        });
      } catch (err) {
        results.push({
          eventId: event.id,
          title: event.title,
          success: false,
          error: err instanceof Error ? err.message : "Analysis failed",
        });
      }

      // Small delay between events to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      processed: results.length,
      remaining: eventsToAnalyze ? eventsToAnalyze.length - eventsToProcess.length : 0,
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
  try {
    const { searchParams } = new URL(request.url);
    const onlyNew = searchParams.get("onlyNew") === "true";

    // Get today's date for filtering
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Get events that already have pending analyses
    const { data: pendingAnalyses } = await supabase
      .from("pending_artist_analyses")
      .select("event_id")
      .eq("status", "pending");
    const pendingEventIds = pendingAnalyses?.map(p => p.event_id) || [];

    // Get all events based on filters
    let eventsQuery = supabase
      .from("events")
      .select("id, analyzed_at")
      .eq("status", "approved")
      .gte("date", todayStr);

    if (onlyNew) {
      eventsQuery = eventsQuery.gte("created_at", todayStr);
    }

    const { data: events } = await eventsQuery;

    const total = events?.length || 0;
    const analyzed = events?.filter(e => e.analyzed_at !== null).length || 0;
    // Events need analysis if: not analyzed AND not already in pending
    const needsAnalysis = events?.filter(e =>
      e.analyzed_at === null && !pendingEventIds.includes(e.id)
    ).length || 0;

    return NextResponse.json({
      total,
      analyzed,
      needsAnalysis,
    });
  } catch (error) {
    console.error("Bulk analyze status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    );
  }
}
