-- 009: Track how artist-match proposals were reviewed, to measure how often
-- high-confidence matches are approved without any changes (the bar for auto-approve).

ALTER TABLE pending_artist_analyses
  ADD COLUMN IF NOT EXISTS confidence_tier TEXT CHECK (confidence_tier IN ('high', 'review')),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_changed BOOLEAN;

CREATE INDEX IF NOT EXISTS idx_pending_artist_analyses_reviewed
  ON pending_artist_analyses (confidence_tier, reviewed_at DESC)
  WHERE reviewed_at IS NOT NULL;
