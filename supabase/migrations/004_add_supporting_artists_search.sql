-- Immutable wrapper for array_to_string (required for generated columns)
CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text AS $$
  SELECT array_to_string($1, $2);
$$ LANGUAGE sql IMMUTABLE;

-- Add a generated text column from supporting_artists array for ilike search
ALTER TABLE events ADD COLUMN IF NOT EXISTS supporting_artists_text TEXT
GENERATED ALWAYS AS (immutable_array_to_string(supporting_artists, ' ')) STORED;
