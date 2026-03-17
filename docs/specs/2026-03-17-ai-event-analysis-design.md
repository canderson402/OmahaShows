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
- URL validation (checking if Spotify links actually exist)

## Data Model

### New Table: `artists`

```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT NOT NULL,  -- lowercase, stripped "the", for matching
  genres TEXT[] DEFAULT '{}',
  spotify_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artists_normalized ON artists(normalized_name);

-- Auto-update updated_at timestamp
CREATE TRIGGER artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

Note: Removed `apple_music_url`, `bandcamp_url`, and `bio` columns - can add later if needed.

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

-- GIN index for efficient array queries
CREATE INDEX idx_events_genres ON events USING GIN (genres);
```

## Authorization Model

The current system has two roles:
- `anon` - unauthenticated public users
- `authenticated` - logged-in users (currently only admins have accounts)

Since only admins can log in, `authenticated` effectively means admin. If non-admin users are added later, we'd need to add role-based checks.

## User Interface

### Location

Admin Dashboard → Events tab → each event row

### Analyze Button

Add "Analyze" button to each event card/row in the admin events list.

### Loading State

When "Analyze" is clicked:
1. Button shows spinner/loading state
2. Disable button to prevent double-clicks
3. Show "Analyzing..." text
4. After 2-5 seconds, modal appears with results

### Analysis Modal - Success

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

### Analysis Modal - Duplicate Found

```
┌─────────────────────────────────────────────────┐
│  AI Analysis                               [X]  │
├─────────────────────────────────────────────────┤
│  Event: "THE FAINT"                             │
│                                                 │
│  ⚠️  POTENTIAL DUPLICATE                        │
│  ┌─────────────────────────────────────────┐    │
│  │ This appears to match:                  │    │
│  │ "The Faint w/ Nitzer Ebb"               │    │
│  │ March 15, 2026 at The Slowdown          │    │
│  │ Confidence: HIGH                        │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ARTISTS (if not duplicate)                     │
│  ... artist info still shown ...                │
│                                                 │
│    [Accept Anyway]  [Skip (Duplicate)]          │
└─────────────────────────────────────────────────┘
```

### Accept Flow

When user clicks "Accept All":

1. Wrap all operations in a transaction
2. For each artist in the response:
   - Normalize name (lowercase, strip "the ")
   - Check if artist exists by `normalized_name`
   - If exists: update with any new metadata (don't overwrite existing data with nulls)
   - If new: create artist record
3. Create `event_artists` records linking event to each artist with role
4. Copy headliner's genres to `events.genres` for filtering
5. If any step fails, rollback entire transaction
6. Show success toast
7. Close modal

### Reject Flow

Close modal, no changes made.

## API Design

### POST `/api/admin/analyze-event`

Analyzes an event using Claude AI.

**Authentication:** Requires valid Supabase session (authenticated user)

**Request:**
```json
{
  "eventId": "slowdown-2026-03-15-the-faint"
}
```

**Validation:**
- `eventId` is required and must be a non-empty string
- Event must exist in database
- Returns 404 if event not found

**Response (success):**
```json
{
  "artists": [
    {
      "name": "The Faint",
      "role": "headliner",
      "genres": ["synth-pop", "electronic", "indie"],
      "spotify_url": "https://open.spotify.com/artist/abc123",
      "instagram_url": "https://instagram.com/thefaint",
      "website_url": "https://thefaint.com"
    },
    {
      "name": "Nitzer Ebb",
      "role": "supporting",
      "genres": ["industrial", "EBM", "electronic"],
      "spotify_url": "https://open.spotify.com/artist/def456",
      "instagram_url": null,
      "website_url": null
    }
  ],
  "duplicate_of": null,
  "duplicate_confidence": null
}
```

**Response (duplicate found):**
```json
{
  "artists": [...],
  "duplicate_of": "slowdown-2026-03-15-the-faint",
  "duplicate_confidence": "high"
}
```

**Error responses:**
- `400` - Invalid request (missing eventId)
- `401` - Not authenticated
- `404` - Event not found
- `500` - AI API error (include error message)
- `503` - AI service unavailable

**Implementation:**
1. Verify authentication
2. Fetch event from Supabase by ID (return 404 if not found)
3. Fetch existing events (±1 day, same venue) for duplicate check
4. Build prompt with event data + existing events
5. Call Claude Haiku API
6. Parse JSON response (handle malformed JSON gracefully)
7. Return to frontend

### POST `/api/admin/accept-analysis`

Accepts AI analysis and creates/updates records.

**Authentication:** Requires valid Supabase session (authenticated user)

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
      "instagram_url": "https://instagram.com/thefaint",
      "website_url": "https://thefaint.com"
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

**Error handling:**
- All database operations wrapped in transaction
- On any failure, rollback and return error
- Return list of which artists succeeded/failed if partial

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
   - Spotify URL (if you know it with confidence, otherwise null)
   - Instagram URL (if you know it with confidence, otherwise null)
   - Website URL (if you know it with confidence, otherwise null)

Also check if this is a duplicate of any existing event:

Existing events (same venue, ±1 day):
{existing_events_list}

Return valid JSON only, no markdown formatting:
{
  "artists": [
    {
      "name": "Artist Name",
      "role": "headliner",
      "genres": ["genre1", "genre2"],
      "spotify_url": "https://..." | null,
      "instagram_url": "https://..." | null,
      "website_url": "https://..." | null
    }
  ],
  "duplicate_of": "event-id" | null,
  "duplicate_confidence": "high" | "medium" | "low" | null
}
```

## Environment Variables

Add to Vercel (server-side only, no `NEXT_PUBLIC_` prefix):
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

-- Only authenticated (admin) can modify
CREATE POLICY "Authenticated can manage artists"
  ON artists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role for scrapers
CREATE POLICY "Service role full access artists"
  ON artists FOR ALL
  TO service_role
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

-- Only authenticated (admin) can modify
CREATE POLICY "Authenticated can manage event_artists"
  ON event_artists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role for scrapers
CREATE POLICY "Service role full access event_artists"
  ON event_artists FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| AI API failure | Show error toast with message, enable retry button |
| Invalid JSON from AI | Show error toast "AI returned invalid response", enable retry |
| Artist already linked to event | Skip silently (idempotent) |
| Network timeout | Show "Request timed out" with retry button |
| Partial transaction failure | Rollback all changes, show which operation failed |
| Event not found | Show 404 error in modal |
| Rate limit exceeded | Show "Too many requests, try again later" |

## Testing Plan

### Unit Tests
1. Artist name normalization ("The Faint" → "faint")
2. AI response JSON parsing
3. Duplicate detection logic

### Integration Tests
1. Full analyze → accept flow with real AI call
2. Duplicate detection with existing events
3. Transaction rollback on failure

### Manual Tests
1. Test with well-known artists (verify genre accuracy)
2. Test with local/unknown bands (verify graceful handling)
3. Test with malformed event titles ("TBA", "Various Artists")
4. Test duplicate detection UI
5. Verify RLS policies (logged out user cannot modify)
6. Test error states (disconnect network mid-request)
