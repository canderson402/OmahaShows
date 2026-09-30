-- 008: Artist profiles, verified links, aliases, appearance history

-- artists: identity + profile fields
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS spotify_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS hometown TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- One row per candidate link; rejections are remembered
CREATE TABLE IF NOT EXISTS artist_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'youtube')),
  external_id TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('suggested', 'verified', 'rejected')),
  confidence NUMERIC(4,3),
  reason TEXT,
  source TEXT NOT NULL CHECK (source IN ('auto', 'manual')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artist_id, platform, external_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_links_one_verified
  ON artist_links (artist_id, platform) WHERE status = 'verified';
CREATE INDEX IF NOT EXISTS idx_artist_links_external ON artist_links (platform, external_id);

-- Aliases: normalized spelling -> artist
CREATE TABLE IF NOT EXISTS artist_aliases (
  alias_normalized TEXT PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_artist_aliases_artist ON artist_aliases (artist_id);

-- Event category gains 'other' (karaoke, bingo, trivia...)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events ADD CONSTRAINT events_category_check
  CHECK (category IN ('music', 'sports', 'theater', 'comedy', 'other'));

-- Queue: typed, versioned proposals
ALTER TABLE pending_artist_analyses
  ADD COLUMN IF NOT EXISTS schema_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS run_id TEXT,
  ADD COLUMN IF NOT EXISTS overall_confidence NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS trigger TEXT CHECK (trigger IN ('new', 'changed', 'backfill', 'manual')),
  ADD COLUMN IF NOT EXISTS event JSONB;

-- Queue is admin-only
DROP POLICY IF EXISTS "Anon read access" ON pending_artist_analyses;

-- Appearance history
CREATE OR REPLACE VIEW artist_appearances AS
SELECT ea.artist_id, e.id AS event_id, e.date, e.venue_id, v.name AS venue_name,
       ea.role, ea.billing_order
FROM event_artists ea
JOIN events e ON e.id = ea.event_id
LEFT JOIN venues v ON v.id = e.venue_id
WHERE e.status = 'approved';

-- RLS
ALTER TABLE artist_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access artist_links" ON artist_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access artist_links" ON artist_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access artist_aliases" ON artist_aliases
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access artist_aliases" ON artist_aliases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
