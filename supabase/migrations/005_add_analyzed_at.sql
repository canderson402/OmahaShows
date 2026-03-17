-- Add analyzed_at column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ DEFAULT NULL;
