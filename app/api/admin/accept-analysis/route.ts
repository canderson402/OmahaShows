// app/api/admin/accept-analysis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  findArtistByName,
  createArtist,
  updateArtist,
  linkArtistToEvent,
  updateEventGenres,
} from "../../../../src/lib/artists";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ArtistInput {
  name: string;
  role: "headliner" | "supporting" | "co-headliner";
  genres: string[];
  spotify_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, artists } = (await request.json()) as {
      eventId: string;
      artists: ArtistInput[];
    };

    if (!eventId || !artists || !Array.isArray(artists)) {
      return NextResponse.json(
        { error: "eventId and artists array are required" },
        { status: 400 }
      );
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let artistsCreated = 0;
    let artistsUpdated = 0;
    let headlinerGenres: string[] = [];

    // Process each artist
    for (let i = 0; i < artists.length; i++) {
      const artistInput = artists[i];

      // Check if artist exists
      let artist = await findArtistByName(artistInput.name);

      if (artist) {
        // Update existing artist with new data (don't overwrite with nulls)
        artist = await updateArtist(artist.id, {
          genres: artistInput.genres.length > 0 ? artistInput.genres : undefined,
          spotify_url: artistInput.spotify_url,
          instagram_url: artistInput.instagram_url,
          website_url: artistInput.website_url,
        });
        artistsUpdated++;
      } else {
        // Create new artist
        artist = await createArtist({
          name: artistInput.name,
          genres: artistInput.genres,
          spotify_url: artistInput.spotify_url,
          instagram_url: artistInput.instagram_url,
          website_url: artistInput.website_url,
        });
        artistsCreated++;
      }

      // Link artist to event
      await linkArtistToEvent(eventId, artist.id, artistInput.role, i + 1);

      // Capture headliner genres for event
      if (artistInput.role === "headliner" && artistInput.genres.length > 0) {
        headlinerGenres = artistInput.genres;
      }
    }

    // Update event genres from headliner
    if (headlinerGenres.length > 0) {
      await updateEventGenres(eventId, headlinerGenres);
    }

    // Mark event as analyzed
    await supabase
      .from("events")
      .update({ analyzed_at: new Date().toISOString() })
      .eq("id", eventId);

    // Remove from pending_artist_analyses if it exists
    await supabase
      .from("pending_artist_analyses")
      .delete()
      .eq("event_id", eventId);

    // Clean up any event_changes entries for this event
    await supabase
      .from("event_changes")
      .delete()
      .eq("event_id", eventId);

    return NextResponse.json({
      success: true,
      artistsCreated,
      artistsUpdated,
      eventUpdated: headlinerGenres.length > 0,
    });
  } catch (error) {
    console.error("Accept analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save analysis" },
      { status: 500 }
    );
  }
}
