# Event Deduplication Design

**Date:** 2026-03-09
**Status:** Approved
**Problem:** Same events appear as duplicates when scraped from both official venue sites and aggregators (e.g., OmahaUnderground)

## Goals

1. Deduplicate events across official venue scrapers and aggregators
2. Always prefer official venue data over aggregator data
3. Allow aggregators to contribute events for official venues when no duplicate exists
4. Provide admin tools to manage venue aliases for improved matching

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data preference | Official venue wins | Aggregators may have incomplete/incorrect data |
| Venue matching | Fuzzy with alias fallback | Aliases for known cases, fuzzy catches variations |
| Matching threshold | 85% similarity (conservative) | Worst case is a duplicate, not a false merge |
| Deduplication timing | During scrape (filter before insert) | Duplicates never enter the system |

## Components

### 1. Database Change

Add `aliases` column to `venues` table:

```sql
ALTER TABLE venues ADD COLUMN aliases TEXT[] DEFAULT '{}';
```

Example usage:
- `waitingroom.aliases = ['waiting room', 'the waiting room', 'wr lounge']`

### 2. Venue Matcher Module

**File:** `scraper/venue_matcher.py`

**Class:** `VenueMatcher`

**Match priority (in order):**
1. Exact match against any venue's `aliases` array
2. Exact match against venue `name` (normalized)
3. Fuzzy match against venue `name` with 85% threshold
4. No match → return `None`

**Interface:**
```python
matcher = VenueMatcher(supabase_client)
result = matcher.match("Waiting Room")
# Returns ("waitingroom", "alias") or ("waitingroom", "fuzzy:0.91") or None
```

**Normalization:**
- Lowercase
- Strip whitespace
- Remove common prefixes like "the"

**Algorithm:** `difflib.SequenceMatcher` (stdlib, no new dependencies)

### 3. Scraper Integration

**Changes to `omahaunderground.py`:**

1. Remove hardcoded `EXISTING_VENUES` set
2. Initialize `VenueMatcher` at scraper startup
3. For each scraped event:

```
venue_name = scraped venue name
match_result = matcher.match(venue_name)

if match_result:
    venue_id, match_type = match_result
    existing_events = query events for (venue_id, date)
    duplicate = find_existing_event(new_event, existing_events)

    if duplicate:
        SKIP (official source has this event)
    else:
        CREATE event with venue_id (adds to official venue)
else:
    CREATE event with venue_id="other", venue_name=scraped name
```

**Reusability:** Same pattern applies to future aggregator scrapers (Oh My Omaha, etc.)

### 4. Admin Dashboard Updates

#### 4a. Venue Aliases Management

**Location:** Admin dashboard → Venues section

**Features:**
- List venues with current aliases
- Add new alias (text input)
- Edit existing alias (inline edit)
- Delete alias (x button)
- Save changes to Supabase

**UI Wireframe:**
```
┌─────────────────────────────────────────────────────────┐
│ Waiting Room Lounge                                     │
│ Aliases:                                                │
│   [waiting room ×] [the waiting room ✎ ×] [wr lounge ×] │
│                                                         │
│   ┌─────────────────────────┐ [+ Add Alias]             │
│   └─────────────────────────┘                           │
│                                                 [Save]  │
└─────────────────────────────────────────────────────────┘
```

#### 4b. "Other" Venue Details in Pending Queue

**Problem:** Pending events with `venue_id="other"` show no venue details

**Fix:** Display the `venue_name` field and event URL for verification

**Shown in pending event card:**
- Venue name (from `venue_name` field)
- Full event URL (links to source)

## Data Flow

```
OmahaUnderground scrapes event
         │
         ▼
    VenueMatcher.match(venue_name)
         │
    ┌────┴────┐
    │         │
 matched   not matched
    │         │
    ▼         ▼
query existing   create with
events for       venue_id="other"
venue+date       venue_name=name
    │
    ▼
find_existing_event()
    │
┌───┴───┐
│       │
found   not found
│       │
▼       ▼
SKIP    create with
        official venue_id
```

## Testing Strategy

1. Unit tests for `VenueMatcher`:
   - Exact alias match
   - Exact name match
   - Fuzzy match above threshold
   - Fuzzy match below threshold (no match)
   - Normalization edge cases

2. Integration tests for scraper:
   - Event exists from official source → skipped
   - Event doesn't exist → created with correct venue_id
   - No venue match → created as "other"

## Future Considerations

- Could add address/city matching as additional signal for fuzzy matching
- Could log match failures for admin review to suggest new aliases
- Could auto-suggest aliases based on common misses
