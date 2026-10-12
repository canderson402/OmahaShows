// app/api/admin/spotify-genres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../src/lib/admin-auth";
import { parseSpotifyArtistId } from "../../../../src/lib/artist-pipeline/accept";
import { spotifyGenresFromEnv } from "../../../../src/lib/artist-pipeline/clients/spotify";
import { mapToGenres } from "../../../../src/lib/artist-pipeline/genre-map";

// GET ?artist=<Spotify artist link or id>: Spotify's genre tags, mapped onto our genre list
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = parseSpotifyArtistId(request.nextUrl.searchParams.get("artist") ?? "");
  if (!id) return NextResponse.json({ error: "Not a Spotify artist link" }, { status: 400 });

  try {
    const tags = await spotifyGenresFromEnv(id);
    return NextResponse.json({ tags, genres: mapToGenres(tags, 5) });
  } catch (e) {
    console.error("Spotify genres lookup failed:", e);
    return NextResponse.json({ error: "Couldn't reach Spotify, try again" }, { status: 502 });
  }
}
