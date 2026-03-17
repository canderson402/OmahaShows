// app/api/admin/analyze-event/route.ts
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
    const { eventId } = await request.json();

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    // Fetch the event with venue info
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*, venues(name)")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get venue name - handle the joined data
    type EventWithVenue = typeof event & { venues?: { name: string } | null };
    const eventWithVenue = event as EventWithVenue;
    const venueName = eventWithVenue.venues?.name || event.venue_name || "Unknown Venue";

    // Fetch existing events for duplicate check (±1 day, same venue)
    const eventDate = new Date(event.date);
    const dayBefore = new Date(eventDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayAfter = new Date(eventDate);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const { data: existingEvents } = await supabase
      .from("events")
      .select("id, title, date")
      .eq("venue_id", event.venue_id)
      .gte("date", dayBefore.toISOString().split("T")[0])
      .lte("date", dayAfter.toISOString().split("T")[0])
      .neq("id", eventId);

    // Call AI
    const result = await analyzeEvent(
      event.title,
      venueName,
      event.date,
      existingEvents || []
    );

    // Enrich with Spotify data (only Spotify, not Instagram/website)
    for (const artist of result.artists) {
      const spotifyData = await searchArtist(artist.name);
      if (spotifyData) {
        artist.spotify_url = spotifyData.spotify_url;
      }
    }

    // Delete any existing pending analysis for this event
    await supabase
      .from("pending_artist_analyses")
      .delete()
      .eq("event_id", eventId);

    // Save to pending_artist_analyses table
    const { error: insertError } = await supabase
      .from("pending_artist_analyses")
      .insert({
        event_id: eventId,
        artists: result.artists,
        status: "pending",
      });

    if (insertError) {
      console.error("Failed to save pending analysis:", insertError);
      // Still return the result even if save fails
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze event error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
