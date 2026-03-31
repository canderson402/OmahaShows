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

    // Get today's date for filtering future events
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
      // Get ALL unanalyzed upcoming approved events
      const { data: eventsToAnalyze, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date, venue_id, venues(name)")
        .eq("status", "approved")
        .is("analyzed_at", null)
        .gte("date", todayStr)
        .order("date", { ascending: true })
        .limit(batchSize);

      if (eventsError) throw eventsError;
      batch = eventsToAnalyze || [];
    }

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
