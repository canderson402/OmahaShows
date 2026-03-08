-- Performance Indexes for Omaha Shows
-- Run this in Supabase SQL Editor

-- =============================================================================
-- COMPOUND INDEXES FOR COMMON QUERY PATTERNS
-- =============================================================================

-- Upcoming events: WHERE status = 'approved' AND date >= today ORDER BY date ASC
CREATE INDEX IF NOT EXISTS idx_events_approved_upcoming
ON events(date ASC)
WHERE status = 'approved';

-- History events: WHERE status = 'approved' AND date < today ORDER BY date DESC
CREATE INDEX IF NOT EXISTS idx_events_approved_history
ON events(date DESC)
WHERE status = 'approved';

-- Recently added filter
CREATE INDEX IF NOT EXISTS idx_events_added_at
ON events(added_at DESC)
WHERE status = 'approved';

-- Admin pending events
CREATE INDEX IF NOT EXISTS idx_events_pending
ON events(created_at DESC)
WHERE status = 'pending';

-- Events by venue
CREATE INDEX IF NOT EXISTS idx_events_venue_date
ON events(venue_id, date DESC)
WHERE status = 'approved';

-- Scraper runs by scraper_id
CREATE INDEX IF NOT EXISTS idx_scraper_runs_by_scraper
ON scraper_runs(scraper_id, started_at DESC);

-- =============================================================================
-- FULL-TEXT SEARCH
-- =============================================================================

-- Immutable wrapper for array_to_string (required for generated columns)
CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text AS $$
  SELECT array_to_string($1, $2);
$$ LANGUAGE sql IMMUTABLE;

-- Generated text column for ilike search on supporting_artists array
ALTER TABLE events ADD COLUMN IF NOT EXISTS supporting_artists_text TEXT
GENERATED ALWAYS AS (immutable_array_to_string(supporting_artists, ' ')) STORED;

-- Add search vector column (will error if already exists - that's OK)
ALTER TABLE events ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(venue_name, '')), 'B')
) STORED;

-- Create GIN index on the search vector for fast lookups
CREATE INDEX IF NOT EXISTS idx_events_search
ON events USING gin(search_vector);

-- =============================================================================
-- UPDATE STATISTICS
-- =============================================================================

ANALYZE events;
ANALYZE venues;
ANALYZE scraper_runs;
