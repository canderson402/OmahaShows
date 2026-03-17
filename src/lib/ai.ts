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

  const prompt = `Analyze this concert event and extract artist information.

Event title: "${title}"
Venue: ${venueName} (Omaha, NE)
Date: ${date}

Tasks:
1. Extract all artists from the event title (headliner first, then supporting acts)
2. For each artist, provide:
   - Name (properly capitalized)
   - Role (headliner, supporting, or co-headliner)
   - Genres: Pick 1-3 from ONLY this list: ${genreList}

3. Check if this is a duplicate of existing events listed below.

Existing events (same venue, ±1 day):
${existingList}

IMPORTANT:
- Use ONLY genres from the provided list above
- Do NOT try to find URLs - we will look those up separately

Return ONLY valid JSON, nothing else. No markdown, no explanations, no notes, no commentary before or after the JSON:
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
