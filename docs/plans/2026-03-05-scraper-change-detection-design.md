# Scraper Change Detection Fix - Design Document

## Problem Statement

The current scraper system has several issues:
1. **False positives**: Almost every event reports as "changed" due to inconsistent normalization
2. **Missed updates**: Title changes create new event IDs, so updates appear as new events
3. **No review process**: Changes go directly to "approved" status without admin oversight

### Example Issue
"Leila's Rose" at Reverb was renamed to "Leila's Rose - Moved to Waiting Room". Because the event ID includes a title slug, this created a new event instead of updating the existing one. Result: 3 events in the database (original, renamed, and the actual Waiting Room show) instead of 2.

## Goals

1. Reliably detect when a scraped event matches an existing event (even with title changes)
2. Distinguish between truly new events and updates to existing events
3. Send all new/changed events to pending status for admin review
4. Track change history for auditing and potential rollback

## Solution Design

### 1. Multi-Signal Fuzzy Matching

Instead of relying solely on event ID, use multiple signals to match events:

**Matching Criteria (same venue + same date):**
- **Signal 1: First word match** - Artist name usually comes first, if first word matches (and length > 3), likely same event
- **Signal 2: 50%+ word overlap** - If more than half the words match, likely same event
- **Signal 3: Title containment** - If one title contains the other, likely same event

```python
def find_existing_event(new_event, db_events_same_date_venue):
    """Find existing event using multi-signal matching."""
    for existing in db_events_same_date_venue:
        new_normalized = normalize(new_event.title)
        old_normalized = normalize(existing.title)

        # Signal 1: First word match (artist name)
        new_first = new_normalized.split()[0] if new_normalized.split() else ""
        old_first = old_normalized.split()[0] if old_normalized.split() else ""
        if new_first and old_first and new_first == old_first and len(new_first) > 3:
            return existing

        # Signal 2: 50%+ word overlap
        new_words = set(new_normalized.split())
        old_words = set(old_normalized.split())
        if new_words and old_words:
            overlap = len(new_words & old_words) / min(len(new_words), len(old_words))
            if overlap > 0.5:
                return existing

        # Signal 3: Title containment
        if new_normalized in old_normalized or old_normalized in new_normalized:
            return existing

    return None  # Truly new event

def normalize(text):
    """Normalize text for comparison."""
    import re
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()
```

### 2. Event Changes Table

New table to track proposed changes separately from events:

```sql
CREATE TABLE event_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL REFERENCES events(id),
    change_type TEXT NOT NULL CHECK (change_type IN ('update', 'new')),
    proposed_data JSONB NOT NULL,  -- The new field values
    original_data JSONB,           -- Original values (for updates)
    changed_fields TEXT[],         -- List of fields that changed
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT  -- Admin who approved/rejected
);

CREATE INDEX idx_event_changes_event_id ON event_changes(event_id);
CREATE INDEX idx_event_changes_status ON event_changes(status);
```

**Relationship**: One-way (event_changes → events). The change log knows the event, not the other way around. This keeps the events table clean.

### 3. Scraper Flow Changes

**Current flow:**
```
Scraper → Compare by ID → Insert/Update directly (status=approved)
```

**New flow:**
```
Scraper → Fuzzy match (venue + date + title signals)
       → Found match?
           YES → Compare fields
                 Has real changes? → Insert to event_changes (status=pending)
                 No changes? → Skip (no action)
           NO  → Insert new event (status=pending)
```

### 4. Admin UI Changes

**Pending Events Tab:**
- Shows all events with `status = 'pending'`
- New "Type" column: "New" or "Changed"
- For new events: Standard approve/reject buttons
- For changed events: "View Changes" button

**View Changes Modal:**
```
┌─────────────────────────────────────────────────┐
│ Proposed Changes for "Event Title"              │
├─────────────────────────────────────────────────┤
│ Field          │ Current        │ Proposed      │
│ ───────────────┼────────────────┼───────────────│
│ title          │ Leila's Rose   │ Leila's Rose  │
│                │                │ - Moved to WR │
│ time           │ 8:00 PM        │ 7:30 PM       │
│ price          │ $15            │ $20           │
├─────────────────────────────────────────────────┤
│ [Apply Changes]  [Reject]  [Dismiss]            │
└─────────────────────────────────────────────────┘
```

- **Apply Changes**: Updates event with proposed data, marks change as approved
- **Reject**: Discards proposed change, event stays as-is, marks change as rejected
- **Dismiss**: Close modal without action (change stays pending)

### 5. Normalization Fix

The existing `run_single_scraper.py` has a bug - it doesn't normalize values before comparison:

```python
# Current (buggy):
has_changes = any(old.get(f) != data.get(f) for f in COMPARE_FIELDS)

# Fixed:
def normalize_value(val):
    if val is None:
        return None
    if isinstance(val, str):
        val = val.strip()
        return val if val else None
    return val

has_changes = any(
    normalize_value(old.get(f)) != normalize_value(data.get(f))
    for f in COMPARE_FIELDS
)
```

This prevents false positives from `""` vs `None` comparisons.

## Files to Modify

1. **`scraper/run_scrape_supabase.py`** - Add fuzzy matching, change detection, pending status
2. **`scraper/run_single_scraper.py`** - Add fuzzy matching, change detection, pending status
3. **`scraper/run_ohmyomaha.py`** - Already uses pending status, add change detection
4. **`src/components/AdminDashboard.tsx`** - Add change type column, View Changes modal
5. **`supabase/schema.sql`** - Add event_changes table (or run migration)

## Data Retention

The `event_changes` table can be periodically cleaned (e.g., every 6 months) as historical changes lose value over time. Approved/rejected changes older than 6 months can be safely deleted.

## Testing Strategy

1. Unit tests for fuzzy matching logic
2. Test cases for normalization edge cases
3. Manual testing with real scraper runs over 2-week period
4. Monitor pending queue to catch any remaining issues
