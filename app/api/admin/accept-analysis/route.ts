// app/api/admin/accept-analysis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, requireAdmin } from "../../../../src/lib/admin-auth";
import { acceptAnalysis, AcceptError, type AcceptDecision } from "../../../../src/lib/artist-pipeline/accept";
import { createSupabaseAcceptStore } from "../../../../src/lib/artist-pipeline/accept-store";
import type { EventCategory } from "../../../../src/lib/artist-pipeline/types";
import {
  findArtistByName,
  createArtist,
  updateArtist,
  linkArtistToEvent,
  updateEventGenres,
} from "../../../../src/lib/artists";

const CATEGORIES: EventCategory[] = ["music", "comedy", "theater", "sports", "other"];

/** v2: body { analysisId, decisions?, category? }. The proposal is re-read from the DB, never trusted from the client. */
async function acceptV2(body: { analysisId: unknown; decisions?: unknown; category?: unknown }) {
  if (typeof body.analysisId !== "string") return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  const decisions = Array.isArray(body.decisions) ? (body.decisions as AcceptDecision[]) : [];
  const category = CATEGORIES.includes(body.category as EventCategory) ? (body.category as EventCategory) : undefined;
  const sb = adminSupabase();
  const { data: row, error } = await sb.from("pending_artist_analyses")
    .select("id, event_id, artists, event, schema_version, status").eq("id", body.analysisId).maybeSingle();
  if (error) throw error;
  if (!row || row.status !== "pending") return NextResponse.json({ error: "Analysis not found or already handled" }, { status: 404 });
  if (row.schema_version !== 2) return NextResponse.json({ error: "Old-format analysis: re-run Analyze on this show" }, { status: 409 });
  try {
    const result = await acceptAnalysis({ analysis: row, decisions, category }, createSupabaseAcceptStore(sb));
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    if (e instanceof AcceptError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

interface ArtistInput {
  name: string;
  role: "headliner" | "supporting" | "co-headliner";
  genres: string[];
  spotify_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const supabase = adminSupabase();
  try {
    const body = await request.json();
    if (body && typeof body === "object" && "analysisId" in body) return await acceptV2(body);
    const { eventId, artists } = body as {
      eventId: string;
      artists: ArtistInput[];
    };

    if (!eventId || !artists || !Array.isArray(artists)) {
      return NextResponse.json(
        { error: "eventId and artists array are required" },
        { status: 400 }
      );
    }

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

    for (let i = 0; i < artists.length; i++) {
      const artistInput = artists[i];

      let artist = await findArtistByName(artistInput.name);

      if (artist) {
        artist = await updateArtist(artist.id, {
          genres: artistInput.genres.length > 0 ? artistInput.genres : undefined,
          spotify_url: artistInput.spotify_url,
          instagram_url: artistInput.instagram_url,
          website_url: artistInput.website_url,
        });
        artistsUpdated++;
      } else {
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
