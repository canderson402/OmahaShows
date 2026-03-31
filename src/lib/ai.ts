// src/lib/ai.ts
import Anthropic from "@anthropic-ai/sdk";
import { GENRES } from "./genres";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ArtistAnalysis {
  name: string;
  role: "headliner" | "supporting" | "co-headliner";
  genres: string[];
  spotify_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
}

export interface AnalysisResult {
  artists: ArtistAnalysis[];
  duplicate_of: string | null;
  duplicate_confidence: "high" | "medium" | "low" | null;
}

const genreList = GENRES.join(", ");

export async function analyzeEvent(
  title: string,
  venueName: string,
  date: string,
  existingEvents: { id: string; title: string; date: string }[]
): Promise<AnalysisResult> {
  const existingList =
    existingEvents.length > 0
      ? existingEvents.map((e) => `- "${e.title}" on ${e.date} (id: ${e.id})`).join("\n")
      : "None";

  const prompt = `Analyze this event and determine if it's a MUSIC event with real musical artists.

Event title: "${title}"
Venue: ${venueName} (Omaha, NE)
Date: ${date}

First, determine if this is a MUSIC event featuring real musical artists/bands.

NOT music events (return empty artists array):
- Comedy shows (stand-up comedians like Dusty Slay, etc.)
- Movie screenings ("in Concert" films like Ghostbusters in Concert)
- Theatrical productions, plays, musicals
- Talent shows, variety shows, burlesque
- Sports events, wrestling, UFC
- Podcast recordings, speaking events
- DJ-only events with no featured artists

IS a music event (extract artists):
- Concerts with named bands/artists
- Music festivals
- Album release shows
- Tribute bands playing music

Tasks:
1. If NOT a music event, return empty artists array
2. If IS a music event, extract artists from the title (headliner first, then supporting)
3. For each artist, provide:
   - Name (properly capitalized, the actual artist/band name)
   - Role (headliner, supporting, or co-headliner)
   - Genres: Pick 1-3 from ONLY this list: ${genreList}
4. Check for duplicates in existing events below

Existing events (same venue, ±1 day):
${existingList}

IMPORTANT:
- If unsure whether it's a music event, return empty artists array
- Use ONLY genres from the provided list above
- Do NOT try to find URLs - we will look those up separately
- Comedians are NOT artists, even if performing at a music venue

Return ONLY valid JSON, nothing else:
{
  "artists": [
    {
      "name": "Artist Name",
      "role": "headliner",
      "genres": ["rock", "indie"],
      "spotify_url": null,
      "instagram_url": null,
      "website_url": null
    }
  ],
  "duplicate_of": "event-id" | null,
  "duplicate_confidence": "high" | "medium" | "low" | null
}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  // Find the text content in the response
  const textContent = response.content.find(c => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  try {
    let jsonText = textContent.text.trim();
    // Strip markdown code blocks if present
    if (jsonText.startsWith("```")) {
      // Extract just the content between ``` markers
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonText = match[1].trim();
      }
    }
    // If there's extra text after the JSON, extract just the JSON object
    const jsonMatch = jsonText.match(/^\s*(\{[\s\S]*\})\s*/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    const result = JSON.parse(jsonText) as AnalysisResult;

    // Validate genres are from our list
    for (const artist of result.artists) {
      artist.genres = artist.genres.filter(g =>
        GENRES.includes(g.toLowerCase() as typeof GENRES[number])
      ).map(g => g.toLowerCase());
    }

    return result;
  } catch {
    throw new Error(`Failed to parse AI response: ${textContent.text}`);
  }
}
