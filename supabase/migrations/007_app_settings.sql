-- Key/value table for app-wide settings that both the web app and scrapers can read.
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the auto-approve flag (off by default — preserves existing behavior).
INSERT INTO app_settings (key, value)
VALUES ('auto_approve_events', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON app_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon read access" ON app_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated full access" ON app_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
