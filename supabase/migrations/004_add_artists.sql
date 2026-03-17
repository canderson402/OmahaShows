-- Migration: Add artists table and event_artists junction table

-- Artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  normalized_name TEXT NOT NULL,
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

-- Event-Artist junction table
CREATE TABLE event_artists (
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('headliner', 'supporting', 'co-headliner')),
  billing_order INT DEFAULT 0,
  PRIMARY KEY (event_id, artist_id)
);

CREATE INDEX idx_event_artists_artist ON event_artists(artist_id);
CREATE INDEX idx_event_artists_event ON event_artists(event_id);

-- Add genres column to events for fast filtering
ALTER TABLE events
ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_events_genres ON events USING GIN (genres);

-- RLS Policies for artists
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view artists"
  ON artists FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage artists"
  ON artists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access artists"
  ON artists FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for event_artists
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view event_artists"
  ON event_artists FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage event_artists"
  ON event_artists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access event_artists"
  ON event_artists FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
