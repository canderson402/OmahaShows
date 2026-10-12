-- Shows a venue takes off its site are hidden with status 'removed' by the scrapers,
-- and come back automatically if the venue lists them again
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'removed'));
