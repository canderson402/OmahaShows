-- Add venue_name field for events from venues not in the venues table
-- Used by "other" scraper for venues like The Sydney, Barnato, etc.
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name TEXT;
