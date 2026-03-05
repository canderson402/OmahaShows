-- Migration: Add event_changes table for tracking proposed changes

CREATE TABLE event_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('update', 'new')),
    proposed_data JSONB NOT NULL,
    original_data JSONB,
    changed_fields TEXT[],
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

-- Indexes for common queries
CREATE INDEX idx_event_changes_event_id ON event_changes(event_id);
CREATE INDEX idx_event_changes_status ON event_changes(status);
CREATE INDEX idx_event_changes_created ON event_changes(created_at DESC);

-- RLS Policies
ALTER TABLE event_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view event_changes"
    ON event_changes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can manage event_changes"
    ON event_changes FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
