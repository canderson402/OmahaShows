# Scraper Change Detection Fix - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix scraper change detection to reliably catch updates (even with title changes), send all new/changed events to pending status for admin review, and track change history.

**Architecture:** Add multi-signal fuzzy matching to find existing events by venue+date+title similarity. Create `event_changes` table to track proposed changes. Modify admin UI to show change type (New/Changed) and allow viewing/applying proposed changes.

**Tech Stack:** Python (scrapers), TypeScript/React (admin UI), PostgreSQL/Supabase (database)

---

## Task 1: Create event_changes Table Migration

**Files:**
- Create: `supabase/migrations/003_add_event_changes.sql`

**Step 1: Write the migration SQL**

```sql
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
```

**Step 2: Run migration in Supabase**

Go to Supabase Dashboard → SQL Editor → New Query → Paste and run the SQL.

**Step 3: Verify table exists**

```sql
SELECT * FROM event_changes LIMIT 1;
```

Expected: Empty result set (no errors)

**Step 4: Commit**

```bash
git add supabase/migrations/003_add_event_changes.sql
git commit -m "feat: add event_changes table for tracking proposed changes"
```

---

## Task 2: Create Fuzzy Matching Module

**Files:**
- Create: `scraper/matching.py`
- Test: `scraper/tests/test_matching.py`

**Step 1: Write the test file**

```python
# scraper/tests/test_matching.py
import pytest
from matching import normalize_text, find_existing_event

class MockEvent:
    def __init__(self, id, title, date, venue_id):
        self.id = id
        self.title = title
        self.date = date
        self.venue_id = venue_id

def test_normalize_text_removes_special_chars():
    assert normalize_text("Leila's Rose!") == "leilas rose"
    assert normalize_text("Band-Name (Live)") == "bandname live"

def test_normalize_text_handles_empty():
    assert normalize_text("") == ""
    assert normalize_text("   ") == ""

def test_find_existing_exact_match():
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose", "2026-03-10", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"

def test_find_existing_title_changed():
    """Event renamed with suffix should still match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose - Moved to Waiting Room", "2026-03-10", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"

def test_find_existing_first_word_match():
    """First word match (artist name) should match."""
    db_events = [
        {"id": "e1", "title": "Metallica World Tour", "date": "2026-03-10", "venue_id": "steelhouse"}
    ]
    new_event = MockEvent("e2", "Metallica - Final Show", "2026-03-10", "steelhouse")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"

def test_find_existing_word_overlap():
    """50%+ word overlap should match."""
    db_events = [
        {"id": "e1", "title": "Summer Rock Festival 2026", "date": "2026-06-15", "venue_id": "steelhouse"}
    ]
    new_event = MockEvent("e2", "Summer Rock Festival", "2026-06-15", "steelhouse")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"

def test_find_existing_no_match_different_venue():
    """Same title but different venue should NOT match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose", "2026-03-10", "waitingroom")
    match = find_existing_event(new_event, db_events)
    assert match is None

def test_find_existing_no_match_different_date():
    """Same title but different date should NOT match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose", "2026-03-15", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is None

def test_find_existing_no_match_completely_different():
    """Completely different title should NOT match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Heavy Metal Thunder", "2026-03-10", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is None

def test_find_existing_containment():
    """One title contains the other should match."""
    db_events = [
        {"id": "e1", "title": "Band Name", "date": "2026-03-10", "venue_id": "admiral"}
    ]
    new_event = MockEvent("e2", "Band Name with Special Guest", "2026-03-10", "admiral")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"
```

**Step 2: Run the test to verify it fails**

```bash
cd /Users/codyanderson/Dev/ShowCal/web/scraper
python -m pytest tests/test_matching.py -v
```

Expected: FAIL (ModuleNotFoundError: No module named 'matching')

**Step 3: Write the matching module**

```python
# scraper/matching.py
"""
Fuzzy matching module for finding existing events.

Uses multiple signals to match events even when titles change:
1. First word match (artist name usually comes first)
2. 50%+ word overlap
3. Title containment (one title contains the other)
"""
import re


def normalize_text(text: str) -> str:
    """Normalize text for comparison - lowercase, remove special chars."""
    if not text:
        return ""
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()


def find_existing_event(new_event, db_events: list[dict]) -> dict | None:
    """
    Find an existing event that matches the new event.

    Args:
        new_event: Event object with title, date, venue_id attributes
        db_events: List of dicts from database (same venue + same date)

    Returns:
        Matching event dict or None if no match found
    """
    new_normalized = normalize_text(new_event.title)
    if not new_normalized:
        return None

    new_words = set(new_normalized.split())
    new_first = new_normalized.split()[0] if new_normalized.split() else ""

    for existing in db_events:
        old_normalized = normalize_text(existing.get("title", ""))
        if not old_normalized:
            continue

        old_words = set(old_normalized.split())
        old_first = old_normalized.split()[0] if old_normalized.split() else ""

        # Signal 1: First word match (artist name)
        # Only if first word is substantial (> 3 chars)
        if new_first and old_first and new_first == old_first and len(new_first) > 3:
            return existing

        # Signal 2: Title containment
        if new_normalized in old_normalized or old_normalized in new_normalized:
            return existing

        # Signal 3: 50%+ word overlap
        if new_words and old_words:
            common = new_words & old_words
            min_len = min(len(new_words), len(old_words))
            if min_len > 0 and len(common) / min_len > 0.5:
                return existing

    return None
```

**Step 4: Run the tests to verify they pass**

```bash
cd /Users/codyanderson/Dev/ShowCal/web/scraper
python -m pytest tests/test_matching.py -v
```

Expected: All tests PASS

**Step 5: Commit**

```bash
git add scraper/matching.py scraper/tests/test_matching.py
git commit -m "feat: add fuzzy matching module for event detection"
```

---

## Task 3: Update run_scrape_supabase.py with Fuzzy Matching and Pending Status

**Files:**
- Modify: `scraper/run_scrape_supabase.py`

**Step 1: Add imports and fetch function at top (after line 13)**

Add after the existing imports:

```python
from matching import find_existing_event
```

**Step 2: Add function to fetch events by venue and date (after normalize_value function, around line 45)**

```python
def get_events_by_venue_date(venue_id: str, event_date: str) -> list[dict]:
    """Fetch all events for a venue on a specific date."""
    result = supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
    return result.data or []


def log_event_change(event_id: str, change_type: str, proposed_data: dict, original_data: dict | None, changed_fields: list[str] | None):
    """Log a proposed change to the event_changes table."""
    supabase.table("event_changes").insert({
        "event_id": event_id,
        "change_type": change_type,
        "proposed_data": proposed_data,
        "original_data": original_data,
        "changed_fields": changed_fields,
        "status": "pending",
    }).execute()
```

**Step 3: Rewrite upsert_events function (replace lines 47-110)**

Replace the entire `upsert_events` function with:

```python
def upsert_events(events: list[Event], scraper_id: str) -> tuple[list[str], list[str]]:
    """Upsert events to Supabase using fuzzy matching.

    - New events: inserted with status='pending'
    - Changed events: NOT updated directly, change logged to event_changes
    - Unchanged events: skipped

    Returns tuple of (new_event_ids, changed_event_ids).
    """
    if not events:
        return [], []

    now = datetime.now(timezone.utc).isoformat()
    new_ids: list[str] = []
    changed_ids: list[str] = []

    # Fields to compare for changes (excluding metadata fields)
    compare_fields = [
        "title", "date", "time", "event_url", "ticket_url",
        "image_url", "price", "age_restriction", "supporting_artists"
    ]

    for event in events:
        # Get all events for this venue + date for fuzzy matching
        db_events = get_events_by_venue_date(scraper_id, event.date)

        # Try fuzzy match first
        existing = find_existing_event(event, db_events)

        # Build event data
        event_data = {
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": scraper_id,
            "venue_name": event.venue if scraper_id == 'other' else None,
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": scraper_id,
        }

        if existing:
            # Found a match - check if anything actually changed
            changed_fields = []
            for field in compare_fields:
                old_val = normalize_value(existing.get(field))
                new_val = normalize_value(event_data.get(field))
                if old_val != new_val:
                    changed_fields.append(field)

            if changed_fields:
                # Log the proposed change (don't update event directly)
                log_event_change(
                    event_id=existing["id"],
                    change_type="update",
                    proposed_data=event_data,
                    original_data={f: existing.get(f) for f in compare_fields},
                    changed_fields=changed_fields,
                )
                changed_ids.append(existing["id"])
        else:
            # No match found - this is a new event
            event_data["status"] = "pending"
            event_data["added_at"] = now
            event_data["updated_at"] = now
            supabase.table("events").insert(event_data).execute()

            # Log new event for tracking
            log_event_change(
                event_id=event.id,
                change_type="new",
                proposed_data=event_data,
                original_data=None,
                changed_fields=None,
            )
            new_ids.append(event.id)

    return new_ids, changed_ids
```

**Step 4: Test by running a dry scrape (manual verification)**

```bash
cd /Users/codyanderson/Dev/ShowCal/web/scraper
# Set env vars and run
SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key python -c "
from run_scrape_supabase import get_events_by_venue_date, normalize_value
print('Module imports OK')
"
```

Expected: "Module imports OK" (no errors)

**Step 5: Commit**

```bash
git add scraper/run_scrape_supabase.py
git commit -m "feat: use fuzzy matching and pending status for new/changed events"
```

---

## Task 4: Update run_single_scraper.py with Same Logic

**Files:**
- Modify: `scraper/run_single_scraper.py`

**Step 1: Add imports at top (after line 6)**

```python
from matching import find_existing_event
```

**Step 2: Add helper functions (after line 9)**

```python
def normalize_value(val):
    """Normalize a value for comparison."""
    if val is None:
        return None
    if isinstance(val, str):
        val = val.strip()
        return val if val else None
    if isinstance(val, list):
        return val if val else None
    return val


def get_events_by_venue_date(supabase, venue_id: str, event_date: str) -> list[dict]:
    """Fetch all events for a venue on a specific date."""
    result = supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
    return result.data or []


def log_event_change(supabase, event_id: str, change_type: str, proposed_data: dict, original_data: dict | None, changed_fields: list[str] | None):
    """Log a proposed change to the event_changes table."""
    supabase.table("event_changes").insert({
        "event_id": event_id,
        "change_type": change_type,
        "proposed_data": proposed_data,
        "original_data": original_data,
        "changed_fields": changed_fields,
        "status": "pending",
    }).execute()
```

**Step 3: Rewrite the main function event processing loop (replace lines 41-74)**

Replace the event processing section with:

```python
        new_ids, changed_ids = [], []
        for e in future_events:
            # Get all events for this venue + date for fuzzy matching
            db_events = get_events_by_venue_date(supabase, scraper.id, e.date)

            # Try fuzzy match
            existing = find_existing_event(e, db_events)

            data = {
                'id': e.id,
                'title': e.title,
                'date': e.date,
                'time': e.time,
                'venue_id': scraper.id,
                'venue_name': e.venue if scraper.id == 'other' else None,
                'event_url': e.eventUrl,
                'ticket_url': e.ticketUrl,
                'image_url': e.imageUrl,
                'price': e.price,
                'age_restriction': e.ageRestriction,
                'supporting_artists': e.supportingArtists,
                'source': scraper.id,
            }

            if existing:
                # Check for actual changes
                changed_fields = []
                for f in COMPARE_FIELDS:
                    if normalize_value(existing.get(f)) != normalize_value(data.get(f)):
                        changed_fields.append(f)

                if changed_fields:
                    # Log proposed change
                    log_event_change(
                        supabase,
                        event_id=existing['id'],
                        change_type='update',
                        proposed_data=data,
                        original_data={f: existing.get(f) for f in COMPARE_FIELDS},
                        changed_fields=changed_fields,
                    )
                    changed_ids.append(existing['id'])
            else:
                # New event - insert as pending
                data['status'] = 'pending'
                data['added_at'] = now
                data['updated_at'] = now
                supabase.table('events').insert(data).execute()

                log_event_change(
                    supabase,
                    event_id=e.id,
                    change_type='new',
                    proposed_data=data,
                    original_data=None,
                    changed_fields=None,
                )
                new_ids.append(e.id)
```

**Step 4: Commit**

```bash
git add scraper/run_single_scraper.py
git commit -m "feat: update single scraper with fuzzy matching and pending status"
```

---

## Task 5: Add TypeScript Types for Event Changes

**Files:**
- Modify: `src/components/AdminDashboard.tsx` (add interface around line 43)

**Step 1: Add EventChange interface after DbEvent interface**

```typescript
interface EventChange {
  id: string;
  event_id: string;
  change_type: 'update' | 'new';
  proposed_data: Partial<DbEvent>;
  original_data: Partial<DbEvent> | null;
  changed_fields: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}
```

**Step 2: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: add EventChange TypeScript interface"
```

---

## Task 6: Add Fetch and State for Event Changes in Admin

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

**Step 1: Add state variable (after line 69)**

```typescript
const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
const [viewingChange, setViewingChange] = useState<EventChange | null>(null);
```

**Step 2: Add fetch function (after fetchVenues around line 156)**

```typescript
const fetchEventChanges = useCallback(async () => {
  const { data, error } = await supabase
    .from("event_changes")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (!error && data) {
    setEventChanges(data);
  }
}, []);
```

**Step 3: Add to initial load (modify line 161)**

Change:
```typescript
await Promise.all([fetchPending(), fetchCurrentEvents(), fetchVenues()]);
```
To:
```typescript
await Promise.all([fetchPending(), fetchCurrentEvents(), fetchVenues(), fetchEventChanges()]);
```

**Step 4: Add to pending tab refresh (modify line 178)**

Change:
```typescript
fetchPending();
```
To:
```typescript
fetchPending();
fetchEventChanges();
```

**Step 5: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: fetch event changes in admin dashboard"
```

---

## Task 7: Add Change Type Badge to Pending Events

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

**Step 1: Create helper function to get change for event (after formatDate around line 307)**

```typescript
const getChangeForEvent = (eventId: string): EventChange | undefined => {
  return eventChanges.find(c => c.event_id === eventId);
};
```

**Step 2: Add change type badge in pending event card (around line 521, after the category badge)**

Find this section:
```typescript
{event.category ? (
  <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded capitalize">
    {event.category}
  </span>
) : (
```

Add BEFORE it:

```typescript
{(() => {
  const change = getChangeForEvent(event.id);
  return change ? (
    <span className={`px-2 py-0.5 text-xs rounded ${
      change.change_type === 'new'
        ? 'bg-green-600/30 text-green-400'
        : 'bg-blue-600/30 text-blue-400'
    }`}>
      {change.change_type === 'new' ? 'New' : 'Changed'}
    </span>
  ) : null;
})()}
```

**Step 3: Add "View Changes" button for changed events (around line 537, after Edit button)**

Find:
```typescript
<button
  onClick={() => openEditModal(event)}
  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
>
  Edit
</button>
```

Add AFTER it:

```typescript
{(() => {
  const change = getChangeForEvent(event.id);
  return change && change.change_type === 'update' ? (
    <button
      onClick={() => setViewingChange(change)}
      className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 border border-blue-600/30 rounded-lg hover:border-blue-500/50 transition-colors"
    >
      View Changes
    </button>
  ) : null;
})()}
```

**Step 4: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: show change type badge and View Changes button"
```

---

## Task 8: Add View Changes Modal

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

**Step 1: Add handler functions for applying/rejecting changes (after handleDeleteEvent around line 298)**

```typescript
const handleApplyChange = async (change: EventChange) => {
  setActionLoading(change.id);
  try {
    // Update the event with proposed data
    const { error: updateError } = await supabase
      .from("events")
      .update({
        ...change.proposed_data,
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", change.event_id);

    if (updateError) throw updateError;

    // Mark change as approved
    const { error: changeError } = await supabase
      .from("event_changes")
      .update({
        status: "approved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", change.id);

    if (changeError) throw changeError;

    // Refresh data
    await Promise.all([fetchPending(), fetchEventChanges()]);
    setViewingChange(null);
  } catch (err) {
    console.error("Failed to apply change:", err);
  } finally {
    setActionLoading(null);
  }
};

const handleRejectChange = async (change: EventChange) => {
  setActionLoading(change.id);
  try {
    // Mark change as rejected
    const { error } = await supabase
      .from("event_changes")
      .update({
        status: "rejected",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", change.id);

    if (error) throw error;

    await fetchEventChanges();
    setViewingChange(null);
  } catch (err) {
    console.error("Failed to reject change:", err);
  } finally {
    setActionLoading(null);
  }
};
```

**Step 2: Add the View Changes modal (after the Edit Event Modal, around line 843)**

Add before the closing `{testEmailResult && (`:

```typescript
{/* View Changes Modal */}
{viewingChange && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setViewingChange(null)}>
    <div
      className="w-full max-w-lg max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Proposed Changes</h3>
        <button
          onClick={() => setViewingChange(null)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Changes Table */}
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
        <p className="text-sm text-gray-400 mb-4">
          Event: <span className="text-white">{viewingChange.original_data?.title || viewingChange.proposed_data.title}</span>
        </p>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-800">
              <th className="pb-2 font-medium">Field</th>
              <th className="pb-2 font-medium">Current</th>
              <th className="pb-2 font-medium">Proposed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {viewingChange.changed_fields?.map((field) => (
              <tr key={field}>
                <td className="py-2 text-gray-400 capitalize">{field.replace(/_/g, ' ')}</td>
                <td className="py-2 text-red-400/70">
                  {String(viewingChange.original_data?.[field as keyof DbEvent] ?? '—')}
                </td>
                <td className="py-2 text-green-400">
                  {String(viewingChange.proposed_data[field as keyof DbEvent] ?? '—')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-800">
        <button
          onClick={() => setViewingChange(null)}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={() => handleRejectChange(viewingChange)}
          disabled={actionLoading === viewingChange.id}
          className="px-4 py-2 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          Reject
        </button>
        <button
          onClick={() => handleApplyChange(viewingChange)}
          disabled={actionLoading === viewingChange.id}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {actionLoading === viewingChange.id ? "Applying..." : "Apply Changes"}
        </button>
      </div>
    </div>
  </div>
)}
```

**Step 3: Build and verify no TypeScript errors**

```bash
cd /Users/codyanderson/Dev/ShowCal/web
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: add View Changes modal for reviewing proposed changes"
```

---

## Task 9: Update run_ohmyomaha.py for Consistency

**Files:**
- Modify: `scraper/run_ohmyomaha.py`

**Step 1: Add import at top (after line 15)**

```python
import re
```

Note: The `re` import is already used in the file but not imported. This fixes a bug.

**Step 2: Add log_event_change function (after line 29)**

```python
def log_event_change(event_id: str, change_type: str, proposed_data: dict, original_data: dict | None, changed_fields: list[str] | None):
    """Log a proposed change to the event_changes table."""
    supabase.table("event_changes").insert({
        "event_id": event_id,
        "change_type": change_type,
        "proposed_data": proposed_data,
        "original_data": original_data,
        "changed_fields": changed_fields,
        "status": "pending",
    }).execute()
```

**Step 3: Add logging call when inserting new events (after line 125, after the insert)**

After:
```python
supabase.table("events").insert(event_data).execute()
```

Add:
```python
# Log new event
log_event_change(
    event_id=event.id,
    change_type="new",
    proposed_data=event_data,
    original_data=None,
    changed_fields=None,
)
```

**Step 4: Commit**

```bash
git add scraper/run_ohmyomaha.py
git commit -m "feat: add change logging to ohmyomaha scraper"
```

---

## Task 10: End-to-End Testing

**Files:**
- No new files

**Step 1: Verify build passes**

```bash
cd /Users/codyanderson/Dev/ShowCal/web
npm run build
```

Expected: Build succeeds

**Step 2: Verify Python tests pass**

```bash
cd /Users/codyanderson/Dev/ShowCal/web/scraper
python -m pytest tests/test_matching.py -v
```

Expected: All tests pass

**Step 3: Manual testing checklist**

1. Run dev server: `npm run dev`
2. Go to `/admin` and log in
3. Check "Pending" tab loads without errors
4. Verify no TypeScript console errors
5. If any pending events exist with changes, verify "View Changes" button works

**Step 4: Final commit (if any cleanup needed)**

```bash
git status
# If clean, done. If changes needed:
git add -A
git commit -m "chore: final cleanup for scraper change detection"
```

---

## Task 11: Create Admin Notification Edge Function

**Files:**
- Create: `supabase/functions/notify-admin-pending/index.ts`

**Step 1: Create the edge function directory and file**

```typescript
// supabase/functions/notify-admin-pending/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_EMAIL = "canderson1192@gmail.com"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface NotifyRequest {
  type: "scraper_complete" | "user_submission"
  // For scraper_complete:
  scraperSummary?: {
    totalNew: number
    totalChanged: number
    scrapers: Array<{ name: string; newCount: number; changedCount: number }>
  }
  // For user_submission:
  submission?: {
    title: string
    date: string
    venue: string
    submitterEmail?: string
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured")
    }

    const { type, scraperSummary, submission }: NotifyRequest = await req.json()

    let subject: string
    let html: string

    if (type === "scraper_complete" && scraperSummary) {
      const { totalNew, totalChanged, scrapers } = scraperSummary

      // Don't send email if nothing pending
      if (totalNew === 0 && totalChanged === 0) {
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "No pending items" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      subject = `[Omaha Shows] ${totalNew} new, ${totalChanged} changed events pending`

      const scraperRows = scrapers
        .filter(s => s.newCount > 0 || s.changedCount > 0)
        .map(s => `<tr><td style="padding: 4px 8px;">${s.name}</td><td style="padding: 4px 8px;">${s.newCount}</td><td style="padding: 4px 8px;">${s.changedCount}</td></tr>`)
        .join("")

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 16px;">
          <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #111;">OMAHA SHOWS</h1>
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;">Scrapers completed with pending items for review.</p>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <strong style="font-size: 18px; color: #111;">${totalNew} new events</strong><br>
            <strong style="font-size: 18px; color: #111;">${totalChanged} changed events</strong>
          </div>

          ${scraperRows ? `
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
            <thead>
              <tr style="background: #eee;">
                <th style="padding: 4px 8px; text-align: left;">Scraper</th>
                <th style="padding: 4px 8px; text-align: left;">New</th>
                <th style="padding: 4px 8px; text-align: left;">Changed</th>
              </tr>
            </thead>
            <tbody>${scraperRows}</tbody>
          </table>
          ` : ""}

          <a href="https://omahashows.com/admin" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600;">Review Pending Events</a>
        </div>
      `
    } else if (type === "user_submission" && submission) {
      subject = `[Omaha Shows] New submission: ${submission.title}`

      const formattedDate = new Date(submission.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 16px;">
          <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #111;">OMAHA SHOWS</h1>
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;">A new event was submitted for review.</p>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <strong style="font-size: 16px; color: #111;">${submission.title}</strong><br>
            <span style="font-size: 14px; color: #666;">${submission.venue} · ${formattedDate}</span>
            ${submission.submitterEmail ? `<br><span style="font-size: 13px; color: #888;">From: ${submission.submitterEmail}</span>` : ""}
          </div>

          <a href="https://omahashows.com/admin" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600;">Review Submission</a>
        </div>
      `
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid request type or missing data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Omaha Shows <notifications@omahashows.com>",
        to: ADMIN_EMAIL,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await response.json()
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error sending notification:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
```

**Step 2: Deploy the edge function**

```bash
cd /Users/codyanderson/Dev/ShowCal/web
npx supabase functions deploy notify-admin-pending --project-ref YOUR_PROJECT_REF
```

Or deploy via Supabase Dashboard → Edge Functions → Deploy new function.

**Step 3: Commit**

```bash
git add supabase/functions/notify-admin-pending/index.ts
git commit -m "feat: add admin notification edge function for pending events"
```

---

## Task 12: Add Email Notification to Scraper Completion

**Files:**
- Modify: `scraper/run_scrape_supabase.py`

**Step 1: Add notification function (after log_scraper_run function, around line 139)**

```python
def notify_admin_pending(total_new: int, total_changed: int, scraper_results: list[dict]):
    """Send email notification to admin about pending items."""
    import requests

    # Get Supabase URL for edge function
    supabase_url = SUPABASE_URL.rstrip("/")
    function_url = f"{supabase_url}/functions/v1/notify-admin-pending"

    try:
        response = requests.post(
            function_url,
            json={
                "type": "scraper_complete",
                "scraperSummary": {
                    "totalNew": total_new,
                    "totalChanged": total_changed,
                    "scrapers": scraper_results,
                }
            },
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        if response.ok:
            print(f"✓ Admin notification sent")
        else:
            print(f"! Failed to send notification: {response.text}")
    except Exception as e:
        print(f"! Error sending notification: {e}")
```

**Step 2: Call notification at end of run() function (before the final print, around line 198)**

Find:
```python
    if failed_scrapers:
        print(f"\n{'!'*60}")
```

Add BEFORE it:

```python
    # Send admin notification if there are pending items
    if total_new > 0 or total_changed > 0:
        scraper_results = []
        for scraper in SCRAPERS:
            # We need to track results per scraper - modify the loop above to collect this
            pass
        notify_admin_pending(total_new, total_changed, scraper_results)

```

**Step 3: Modify the scraper loop to collect results (update the loop starting around line 154)**

Replace the entire loop section with:

```python
    # Run all scrapers and collect results
    scraper_results = []

    for scraper in SCRAPERS:
        print(f"Scraping {scraper.name}...", end=" ", flush=True)

        events, error = run_scraper(scraper)

        if error:
            print(f"FAILED: {error}")
            failed_scrapers.append((scraper.name, error))
            log_scraper_run(scraper.id, scraper.name, "error", 0, error=error)
            scraper_results.append({"name": scraper.name, "newCount": 0, "changedCount": 0})
        else:
            # Filter to future events only
            future_events = [e for e in events if e.date >= today]
            new_ids, changed_ids = upsert_events(future_events, scraper.id)
            total_events += len(future_events)
            total_new += len(new_ids)
            total_changed += len(changed_ids)
            print(f"OK - {len(future_events)} events ({len(new_ids)} new, {len(changed_ids)} changed)")
            successful_scrapers.append(scraper.name)
            log_scraper_run(
                scraper.id,
                scraper.name,
                "success",
                len(future_events),
                new_count=len(new_ids),
                changed_count=len(changed_ids),
                new_event_ids=new_ids,
                changed_event_ids=changed_ids,
            )
            scraper_results.append({"name": scraper.name, "newCount": len(new_ids), "changedCount": len(changed_ids)})

    # Send admin notification if there are pending items
    if total_new > 0 or total_changed > 0:
        notify_admin_pending(total_new, total_changed, scraper_results)
```

**Step 4: Add requests to requirements if not present**

```bash
# Check if requests is in requirements
grep -q "requests" scraper/requirements.txt || echo "requests" >> scraper/requirements.txt
```

**Step 5: Commit**

```bash
git add scraper/run_scrape_supabase.py scraper/requirements.txt
git commit -m "feat: send admin email notification after scraper completion"
```

---

## Task 13: Add Email Notification to User Submission

**Files:**
- Modify: `src/components/SubmitShowForm.tsx:326-328`

**Step 1: Add notification call after successful submission**

Find line 326-328 in handleSubmit function:
```typescript
      await submitEvent(data);

      setRecentSubmissions(prev => [title, ...prev.slice(0, 4)]);
```

Replace with:
```typescript
      await submitEvent(data);

      // Notify admin of new submission
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin-pending`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            type: "user_submission",
            submission: {
              title: title.trim(),
              date,
              venue: venueName,
              submitterEmail: submitterEmail || undefined,
            },
          }),
        });
      } catch (notifyError) {
        // Don't fail the submission if notification fails
        console.error("Failed to send admin notification:", notifyError);
      }

      setRecentSubmissions(prev => [title, ...prev.slice(0, 4)]);
```

**Step 3: Build and verify**

```bash
cd /Users/codyanderson/Dev/ShowCal/web
npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/SubmitShowForm.tsx
git commit -m "feat: notify admin when user submits event"
```

---

## Task 14: Final Testing and Verification

**Files:**
- No new files

**Step 1: Verify build passes**

```bash
cd /Users/codyanderson/Dev/ShowCal/web
npm run build
```

Expected: Build succeeds

**Step 2: Verify Python tests pass**

```bash
cd /Users/codyanderson/Dev/ShowCal/web/scraper
python -m pytest tests/test_matching.py -v
```

Expected: All tests pass

**Step 3: Manual testing checklist**

1. Run dev server: `npm run dev`
2. Go to `/admin` and log in
3. Check "Pending" tab loads without errors
4. Verify no TypeScript console errors
5. If any pending events exist with changes, verify "View Changes" button works
6. Test user submission flow - should receive email at canderson1192@gmail.com
7. (After deployment) Trigger a scraper run and verify admin email is received

**Step 4: Final commit (if any cleanup needed)**

```bash
git status
# If clean, done. If changes needed:
git add -A
git commit -m "chore: final cleanup for scraper change detection"
```

---

## Summary

After completing all tasks, you will have:

1. **event_changes table** - Tracks all proposed changes
2. **Fuzzy matching** - Finds existing events even when titles change
3. **Pending status** - All new events go to pending for review
4. **Change proposals** - Updates don't modify events directly, they create change records
5. **Admin UI** - Shows "New" vs "Changed" badges, View Changes modal for reviewing updates
6. **Email notifications** - Admin receives email when:
   - Scrapers complete with pending items (summary report)
   - User manually submits an event

The admin can now:
- See which pending events are new vs changed
- View proposed changes side-by-side
- Apply changes (updates event) or Reject (discards change)
- Monitor scraper behavior over time via change history
- Get notified via email when action is needed
