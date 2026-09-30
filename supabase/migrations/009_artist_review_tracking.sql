-- 009: Record how each artist-match proposal was reviewed: which tab it was in
-- (high confidence / needs review) and whether the admin changed anything before approving.
-- Nothing is approved automatically; this only measures how accurate the high-confidence tab is.

ALTER TABLE pending_artist_analyses
  ADD COLUMN IF NOT EXISTS confidence_tier TEXT CHECK (confidence_tier IN ('high', 'review')),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_changed BOOLEAN;

CREATE INDEX IF NOT EXISTS idx_pending_artist_analyses_reviewed
  ON pending_artist_analyses (confidence_tier, reviewed_at DESC)
  WHERE reviewed_at IS NOT NULL;
