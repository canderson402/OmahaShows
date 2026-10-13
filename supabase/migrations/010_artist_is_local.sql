-- Whether an artist is a local band: true = local, false = not local, null = not tagged yet
ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_local boolean;
