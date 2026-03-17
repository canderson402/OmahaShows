-- Table to store pending artist analysis results before admin approval
CREATE TABLE IF NOT EXISTS pending_artist_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artists JSONB NOT NULL, -- Array of artist objects with name, role, genres, spotify_url, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_pending_artist_analyses_status ON pending_artist_analyses(status);
CREATE INDEX IF NOT EXISTS idx_pending_artist_analyses_event_id ON pending_artist_analyses(event_id);

-- Add RLS policies
ALTER TABLE pending_artist_analyses ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON pending_artist_analyses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon read access
CREATE POLICY "Anon read access" ON pending_artist_analyses
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users full access
CREATE POLICY "Authenticated full access" ON pending_artist_analyses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
