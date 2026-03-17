# AI Event Analysis Feature

**Date:** 2026-03-17
**Status:** Approved

## Overview

Add AI-powered event analysis to the admin dashboard that extracts artist information, assigns genres, and detects duplicate events. Admins can review AI results and accept or reject them.

## Goals

1. **Extract artist data** - Parse headliner and supporting artists from event titles
2. **Categorize by genre** - Auto-tag events with genres for future filtering
3. **Build artist database** - Create reusable artist records with metadata (genres, Spotify, social links)
4. **Detect duplicates** - Identify if incoming events already exist in the database

## Non-Goals (Future Work)

- Batch analyze all existing events
- Auto-analyze during scraper pipeline
- Public-facing artist pages
- Genre filtering UI for end users

## Data Model

### New Table: `artists`

```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT NOT NULL,  -- lowercase, stripped "the", for matching
  genres TEXT[] DEFAULT '{}',
  spotify_url TEXT,
  apple_music_url TEXT,
  bandcamp_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  image_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artists_normalized ON artists(normalized_name);
```

### New Table: `event_artists`

Links events to artists with role information.

```sql
CREATE TABLE event_artists (
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('headliner', 'supporting', 'co-headliner')),
  billing_order INT DEFAULT 0,
  PRIMARY KEY (event_id, artist_id)
);

CREATE INDEX idx_event_artists_artist ON event_artists(artist_id);
CREATE INDEX idx_event_artists_event ON event_artists(event_id);
```

### Modify Table: `events`

Add denormalized genres for fast filtering.

```sql
ALTER TABLE events
ADD COLUMN genres TEXT[] DEFAULT '{}';
```

## User Interface

### Location

Admin Dashboard → Events tab → each event row

### Analyze Button

Add "Analyze" button to each event card/row in the admin events list.

### Analysis Modal

When clicked, shows a modal with:

```
┌─────────────────────────────────────────────────┐
│  AI Analysis                               [X]  │
├─────────────────────────────────────────────────┤
│  Event: "The Faint w/ Nitzer Ebb"               │
│                                                 │
│  ARTISTS                                        │
│  ┌─────────────────────────────────────────┐    │
│  │ 1. The Faint (headliner)                │    │
│  │    Genres: synth-pop, electronic        │    │
│  │    Spotify: open.spotify.com/artist/... │    │
│  ├─────────────────────────────────────────┤    │
│  │ 2. Nitzer Ebb (supporting)              │    │
│  │    Genres: industrial, EBM              │    │
│  │    Spotify: open.spotify.com/artist/... │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  DUPLICATE CHECK                                │
│  ✓ No duplicates found                          │
│                                                 │
│         [Accept All]  [Reject]                  │
└─────────────────────────────────────────────────┘
```

### Accept Flow

When user clicks "Accept All":

1. For each artist in the response:
   - Check if artist exists by `normalized_name`
   - If exists: update with any new metadata (don't overwrite existing data with nulls)
   - If new: create artist record
2. Create `event_artists` records linking event to each artist with role
3. Copy headliner's genres to `events.genres` for filtering
4. Show success toast
5. Close modal

### Reject Flow

Close modal, no changes made.

## API Design

### POST `/api/admin/analyze-event`

Analyzes an event using Claude AI.

**Request:**
```json
{
  "eventId": "slowdown-2026-03-15-the-faint"
}
```

**Response:**
```json
{
  "artists": [
    {
      "name": "The Faint",
      "role": "headliner",
      "genres": ["synth-pop", "electronic", "indie"],
      "spotify_url": "https://open.spotify.com/artist/abc123",
      "instagram": "thefaint",
      "website": "https://thefaint.com"
    },
    {
      "name": "Nitzer Ebb",
      "role": "supporting",
      "genres": ["industrial", "EBM", "electronic"],
      "spotify_url": "https://open.spotify.com/artist/def456",
      "instagram": null,
      "website": null
    }
  ],
  "duplicate_of": null,
  "duplicate_confidence": null
}
```

**Implementation:**
1. Fetch event from Supabase by ID
2. Fetch existing events (±1 day, same venue) for duplicate check
3. Build prompt with event data + existing events
4. Call Claude Haiku API
5. Parse JSON response
6. Return to frontend

### POST `/api/admin/accept-analysis`

Accepts AI analysis and creates/updates records.

**Request:**
```json
{
  "eventId": "slowdown-2026-03-15-the-faint",
  "artists": [
    {
      "name": "The Faint",
      "role": "headliner",
      "genres": ["synth-pop", "electronic"],
      "spotify_url": "https://open.spotify.com/artist/abc123",
      "instagram": "thefaint",
      "website": "https://thefaint.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "artistsCreated": 1,
  "artistsUpdated": 1,
  "eventUpdated": true
}
```

## AI Prompt

```
Analyze this concert event and extract artist information.

Event title: "{title}"
Venue: {venue_name} (Omaha, NE)
Date: {date}

Tasks:
1. Extract all artists (headliner first, then supporting acts in billing order)
2. For each artist, provide:
   - Name (properly capitalized)
   - Role (headliner, supporting, or co-headliner)
   - Genres (2-4 tags)
   - Spotify URL (if you know it, otherwise null)
   - Instagram handle (if you know it, otherwise null)
   - Website (if you know it, otherwise null)

Also check if this is a duplicate of any existing event:

Existing events (same venue, ±1 day):
{existing_events_list}

Return valid JSON only:
{
  "artists": [
    {
      "name": "Artist Name",
      "role": "headliner",
      "genres": ["genre1", "genre2"],
      "spotify_url": "https://..." | null,
      "instagram": "handle" | null,
      "website": "https://..." | null
    }
  ],
  "duplicate_of": "event-id" | null,
  "duplicate_confidence": "high" | "medium" | "low" | null
}
```

## Authentication

Both API routes require authenticated admin user. Use existing Supabase auth middleware.

## Environment Variables

Add to Vercel:
- `ANTHROPIC_API_KEY` - Claude API key for AI calls

## Cost Estimate

- Claude Haiku: ~$0.001 per analysis
- Expected usage: 10-50 manual analyses/month = ~$0.05/month

## RLS Policies

### artists table

```sql
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Public can read artists
CREATE POLICY "Public can view artists"
  ON artists FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated can modify
CREATE POLICY "Authenticated can manage artists"
  ON artists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### event_artists table

```sql
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;

-- Public can read links
CREATE POLICY "Public can view event_artists"
  ON event_artists FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated can modify
CREATE POLICY "Authenticated can manage event_artists"
  ON event_artists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

## Error Handling

- **AI API failure:** Show error toast, allow retry
- **Invalid JSON from AI:** Show error toast with details
- **Artist already linked:** Skip, don't duplicate
- **Network timeout:** Show retry button

## Testing Plan

1. Test with known artists (verify genre accuracy)
2. Test with local/unknown bands (verify graceful handling)
3. Test duplicate detection with existing events
4. Test with malformed event titles
5. Verify RLS policies work correctly
