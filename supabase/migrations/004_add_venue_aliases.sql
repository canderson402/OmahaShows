-- Add aliases column to venues table for fuzzy matching
ALTER TABLE venues ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}';

-- Add comment explaining usage
COMMENT ON COLUMN venues.aliases IS 'Alternative names for venue matching, e.g. ["waiting room", "the waiting room"]';
