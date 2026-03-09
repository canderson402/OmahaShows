# Event Deduplication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deduplicate events between official venue scrapers and aggregators by fuzzy-matching venue names and checking for existing events.

**Architecture:** Add venue aliases to database, create a VenueMatcher module for fuzzy matching, integrate into OmahaUnderground scraper, and update admin UI to manage aliases and show "other" venue details.

**Tech Stack:** Python (difflib for fuzzy matching), Supabase (PostgreSQL), React/TypeScript (admin UI)

---

## Task 1: Database Migration - Add aliases column

**Files:**
- Create: `web/supabase/migrations/004_add_venue_aliases.sql`

**Step 1: Write the migration SQL**

```sql
-- Add aliases column to venues table for fuzzy matching
ALTER TABLE venues ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}';

-- Add comment explaining usage
COMMENT ON COLUMN venues.aliases IS 'Alternative names for venue matching, e.g. ["waiting room", "the waiting room"]';
```

**Step 2: Apply migration to Supabase**

Run in Supabase SQL Editor or via CLI:
```bash
# If using Supabase CLI
supabase db push
```

**Step 3: Verify column exists**

Run: `SELECT id, name, aliases FROM venues LIMIT 5;`
Expected: All venues show `aliases` column with empty array `{}`

**Step 4: Commit**

```bash
git add web/supabase/migrations/004_add_venue_aliases.sql
git commit -m "feat(db): add aliases column to venues table for fuzzy matching"
```

---

## Task 2: VenueMatcher Module - Write failing tests

**Files:**
- Create: `web/scraper/tests/test_venue_matcher.py`

**Step 1: Write the failing tests**

```python
# scraper/tests/test_venue_matcher.py
import pytest
import sys
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent))

from venue_matcher import VenueMatcher, normalize_venue_name


class TestNormalizeVenueName:
    def test_lowercase(self):
        assert normalize_venue_name("The Waiting Room") == "waiting room"

    def test_strips_the_prefix(self):
        assert normalize_venue_name("The Slowdown") == "slowdown"

    def test_strips_whitespace(self):
        assert normalize_venue_name("  Reverb Lounge  ") == "reverb lounge"

    def test_handles_empty(self):
        assert normalize_venue_name("") == ""
        assert normalize_venue_name("   ") == ""


class TestVenueMatcher:
    @pytest.fixture
    def mock_venues(self):
        return [
            {"id": "waitingroom", "name": "Waiting Room Lounge", "aliases": ["waiting room", "the waiting room"]},
            {"id": "theslowdown", "name": "The Slowdown", "aliases": []},
            {"id": "reverblounge", "name": "Reverb Lounge", "aliases": ["reverb"]},
            {"id": "other", "name": "Other", "aliases": []},
        ]

    @pytest.fixture
    def matcher(self, mock_venues):
        mock_supabase = MagicMock()
        mock_supabase.table.return_value.select.return_value.neq.return_value.execute.return_value.data = mock_venues
        return VenueMatcher(mock_supabase)

    def test_exact_alias_match(self, matcher):
        result = matcher.match("waiting room")
        assert result is not None
        assert result[0] == "waitingroom"
        assert result[1] == "alias"

    def test_exact_alias_match_case_insensitive(self, matcher):
        result = matcher.match("WAITING ROOM")
        assert result is not None
        assert result[0] == "waitingroom"

    def test_exact_name_match(self, matcher):
        result = matcher.match("The Slowdown")
        assert result is not None
        assert result[0] == "theslowdown"
        assert result[1] == "name"

    def test_fuzzy_match_above_threshold(self, matcher):
        result = matcher.match("Waiting Room Loung")  # typo, should still match
        assert result is not None
        assert result[0] == "waitingroom"
        assert result[1].startswith("fuzzy:")

    def test_fuzzy_match_below_threshold_returns_none(self, matcher):
        result = matcher.match("Completely Different Venue")
        assert result is None

    def test_no_match_for_other_venue(self, matcher):
        # "other" venue should never be matched
        result = matcher.match("Other")
        assert result is None

    def test_prefers_alias_over_fuzzy(self, matcher):
        # "reverb" is an exact alias, should prefer over fuzzy
        result = matcher.match("reverb")
        assert result is not None
        assert result[0] == "reverblounge"
        assert result[1] == "alias"
```

**Step 2: Run test to verify it fails**

Run: `cd web/scraper && python -m pytest tests/test_venue_matcher.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'venue_matcher'"

**Step 3: Commit**

```bash
git add web/scraper/tests/test_venue_matcher.py
git commit -m "test: add failing tests for VenueMatcher"
```

---

## Task 3: VenueMatcher Module - Implementation

**Files:**
- Create: `web/scraper/venue_matcher.py`

**Step 1: Write minimal implementation**

```python
# scraper/venue_matcher.py
"""
Venue matching module for fuzzy-matching scraped venue names to official venues.

Match priority:
1. Exact match against venue aliases (case-insensitive)
2. Exact match against venue name (case-insensitive, normalized)
3. Fuzzy match against venue name (85% threshold)
"""
from difflib import SequenceMatcher
from typing import Optional


FUZZY_THRESHOLD = 0.85


def normalize_venue_name(name: str) -> str:
    """Normalize venue name for comparison."""
    if not name:
        return ""
    name = name.lower().strip()
    # Remove common prefixes
    if name.startswith("the "):
        name = name[4:]
    return name


class VenueMatcher:
    """Matches scraped venue names to official venue IDs."""

    def __init__(self, supabase_client):
        """Initialize with Supabase client and load venues."""
        self.supabase = supabase_client
        self._venues: list[dict] = []
        self._alias_map: dict[str, str] = {}  # normalized alias -> venue_id
        self._name_map: dict[str, str] = {}   # normalized name -> venue_id
        self._load_venues()

    def _load_venues(self):
        """Load venues from database."""
        result = self.supabase.table("venues").select("id, name, aliases").neq("id", "other").execute()
        self._venues = result.data or []

        # Build lookup maps
        for venue in self._venues:
            venue_id = venue["id"]
            # Map normalized name
            normalized_name = normalize_venue_name(venue["name"])
            self._name_map[normalized_name] = venue_id
            # Map all aliases
            for alias in venue.get("aliases") or []:
                normalized_alias = normalize_venue_name(alias)
                if normalized_alias:
                    self._alias_map[normalized_alias] = venue_id

    def match(self, venue_name: str) -> Optional[tuple[str, str]]:
        """
        Match a venue name to an official venue.

        Args:
            venue_name: Raw venue name from scraper

        Returns:
            Tuple of (venue_id, match_type) or None if no match.
            match_type is one of: "alias", "name", "fuzzy:0.XX"
        """
        if not venue_name:
            return None

        normalized = normalize_venue_name(venue_name)
        if not normalized:
            return None

        # Priority 1: Exact alias match
        if normalized in self._alias_map:
            return (self._alias_map[normalized], "alias")

        # Priority 2: Exact name match
        if normalized in self._name_map:
            return (self._name_map[normalized], "name")

        # Priority 3: Fuzzy match against venue names
        best_match: Optional[tuple[str, float]] = None
        for venue in self._venues:
            venue_normalized = normalize_venue_name(venue["name"])
            ratio = SequenceMatcher(None, normalized, venue_normalized).ratio()
            if ratio >= FUZZY_THRESHOLD:
                if best_match is None or ratio > best_match[1]:
                    best_match = (venue["id"], ratio)

        if best_match:
            return (best_match[0], f"fuzzy:{best_match[1]:.2f}")

        return None
```

**Step 2: Run tests to verify they pass**

Run: `cd web/scraper && python -m pytest tests/test_venue_matcher.py -v`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add web/scraper/venue_matcher.py
git commit -m "feat: add VenueMatcher module for fuzzy venue matching"
```

---

## Task 4: Integrate VenueMatcher into OmahaUnderground scraper

**Files:**
- Modify: `web/scraper/scrapers/omahaunderground.py`
- Modify: `web/scraper/run_scrape_supabase.py`

**Step 1: Update omahaunderground.py to use VenueMatcher**

Replace the `EXISTING_VENUES` set and add venue matching logic:

```python
# In omahaunderground.py - replace EXISTING_VENUES and update class

# REMOVE these lines (around line 12-20):
# EXISTING_VENUES = {
#     "the slowdown", "slowdown",
#     ...
# }

# ADD at top of file after imports:
from venue_matcher import VenueMatcher
from matching import find_existing_event

# Modify the class to accept a venue_matcher and supabase client:
class OtherVenuesScraper(BaseScraper):
    name = "Other"
    id = "other"
    url = "https://omahaunderground.net/shows/"

    def __init__(self, supabase_client=None, venue_matcher: VenueMatcher = None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.supabase = supabase_client
        self.venue_matcher = venue_matcher

    def scrape(self) -> list[Event]:
        """Override scrape to fetch detail pages for each show."""
        html = self.fetch_html()
        return self.parse_events(html)

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        for show_div in soup.select("div.show"):
            try:
                venue_link = show_div.select_one("h3 a[href*='/venues/']")
                if not venue_link:
                    continue
                venue_name = venue_link.get_text(strip=True)

                # Try to match to official venue
                matched_venue_id = None
                if self.venue_matcher:
                    match_result = self.venue_matcher.match(venue_name)
                    if match_result:
                        matched_venue_id = match_result[0]

                # Get detail page URL
                detail_link = show_div.select_one("a[href*='/shows/2']")
                if not detail_link:
                    continue
                detail_url = detail_link.get("href")
                if not detail_url.startswith("http"):
                    detail_url = f"https://omahaunderground.net{detail_url}"

                # Fetch detail page
                event = self._fetch_detail(detail_url, venue_name, matched_venue_id)
                if event:
                    events.append(event)

            except Exception:
                continue

        return events

    def _fetch_detail(self, url: str, venue_name: str, matched_venue_id: str | None) -> Event | None:
        """Fetch a show detail page and extract event info."""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            soup = self.get_soup(response.text)

            # Date parsing (unchanged)
            date_el = soup.select_one("h2.name")
            if not date_el:
                return None
            date_str = self._parse_date(date_el.get_text(strip=True))
            if not date_str:
                return None

            # Title
            title_el = soup.select_one("div.below-name h1")
            title = title_el.get_text(strip=True) if title_el else None
            if not title:
                return None

            # If matched to official venue, check for existing event
            if matched_venue_id and self.supabase:
                existing_events = self._get_events_for_venue_date(matched_venue_id, date_str)
                # Create a mock event object for matching
                class MockEvent:
                    pass
                mock = MockEvent()
                mock.title = title
                mock.date = date_str
                mock.venue_id = matched_venue_id

                if find_existing_event(mock, existing_events):
                    # Duplicate found - skip this event
                    return None

            # Image
            img_el = soup.select_one("div.below-name img")
            image_url = img_el.get("src") if img_el else None

            # Time and price
            time_str = None
            price = None
            info_el = soup.select_one("div.below-name h3")
            if info_el:
                info_text = info_el.get_text(separator=" ", strip=True)
                time_str = self._parse_time(info_text)
                price = self._parse_price(info_text)

            # Use matched venue_id if available, otherwise "other"
            final_venue_id = matched_venue_id or "other"

            # Generate ID
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            event_id = f"{final_venue_id}-{date_str}-{slug}"[:80]

            return Event(
                id=event_id,
                title=title,
                date=date_str,
                time=time_str,
                venue=venue_name if final_venue_id == "other" else "",
                eventUrl=url,
                ticketUrl=None,
                imageUrl=image_url,
                price=price,
                ageRestriction=None,
                supportingArtists=None,
                source=self.id
            )
        except Exception:
            return None

    def _get_events_for_venue_date(self, venue_id: str, date: str) -> list[dict]:
        """Query existing events for a venue on a date."""
        if not self.supabase:
            return []
        result = self.supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", date).execute()
        return result.data or []

    # Keep existing _parse_date, _parse_time, _parse_price methods unchanged
```

**Step 2: Update run_scrape_supabase.py to initialize VenueMatcher**

Add VenueMatcher initialization and pass to OtherVenuesScraper:

```python
# In run_scrape_supabase.py, after supabase client creation:

from venue_matcher import VenueMatcher

# After line 24 (after supabase client is created):
venue_matcher = VenueMatcher(supabase)

# Modify SCRAPERS import in config.py or create scrapers with matcher inline
```

**Step 3: Update config.py to support parameterized scrapers**

```python
# scraper/config.py
import sys
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.theslowdown import SlowdownScraper
from scrapers.waitingroom import WaitingRoomScraper
from scrapers.reverblounge import ReverbLoungeScraper
from scrapers.bourbontheatre import BourbonTheatreScraper
from scrapers.admiral import AdmiralScraper
from scrapers.astrotheater import AstroTheaterScraper
from scrapers.steelhouse import SteelHouseScraper
from scrapers.omahaunderground import OtherVenuesScraper

def get_scrapers(supabase_client=None, venue_matcher=None):
    """Get list of scrapers, optionally with Supabase client for dedup."""
    return [
        SlowdownScraper(),
        WaitingRoomScraper(),
        ReverbLoungeScraper(),
        BourbonTheatreScraper(),
        AdmiralScraper(),
        AstroTheaterScraper(),
        SteelHouseScraper(),
        OtherVenuesScraper(supabase_client=supabase_client, venue_matcher=venue_matcher),
    ]

# Keep SCRAPERS for backwards compatibility
SCRAPERS = get_scrapers()
```

**Step 4: Update run_scrape_supabase.py to use get_scrapers**

```python
# In run_scrape_supabase.py, replace:
# from config import SCRAPERS

# With:
from config import get_scrapers
from venue_matcher import VenueMatcher

# In run() function, after supabase client creation:
venue_matcher = VenueMatcher(supabase)
scrapers = get_scrapers(supabase_client=supabase, venue_matcher=venue_matcher)

# Replace SCRAPERS with scrapers in the loop
```

**Step 5: Run scraper locally to test**

Run: `cd web/scraper && python run_scrape_supabase.py`
Expected: OmahaUnderground scraper skips events that already exist at official venues

**Step 6: Commit**

```bash
git add web/scraper/scrapers/omahaunderground.py web/scraper/config.py web/scraper/run_scrape_supabase.py
git commit -m "feat: integrate VenueMatcher into OmahaUnderground scraper for deduplication"
```

---

## Task 5: Admin UI - Add aliases field to VenueManagement

**Files:**
- Modify: `web/src/components/VenueManagement.tsx`

**Step 1: Update Venue interface and form**

Add `aliases` to the types:

```typescript
// Around line 39, add to Venue interface:
interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  website_url: string | null;
  color_bg: string | null;
  color_text: string | null;
  color_border: string | null;
  active: boolean;
  aliases: string[] | null;  // ADD THIS
}

// Around line 55, add to VenueForm interface:
interface VenueForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  website_url: string;
  hexColor: string;
  active: boolean;
  aliases: string[];  // ADD THIS
}

// Around line 65, add to DEFAULT_FORM:
const DEFAULT_FORM: VenueForm = {
  name: "",
  description: "",
  address: "",
  city: "Omaha",
  state: "NE",
  website_url: "",
  hexColor: "#6b7280",
  active: true,
  aliases: [],  // ADD THIS
};
```

**Step 2: Update openEditModal to load aliases**

```typescript
// Around line 151, update openEditModal:
const openEditModal = (venue: Venue) => {
  setEditingVenue(venue);
  setForm({
    name: venue.name,
    description: venue.description || "",
    address: venue.address || "",
    city: venue.city,
    state: venue.state,
    website_url: venue.website_url || "",
    hexColor: extractHexFromTailwind(venue.color_text),
    active: venue.active,
    aliases: venue.aliases || [],  // ADD THIS
  });
  setError(null);
  setModalOpen(true);
};
```

**Step 3: Update handleSave to include aliases**

```typescript
// Around line 195, update venueData:
const venueData = {
  id: venueId,
  name: form.name.trim(),
  description: form.description.trim() || null,
  address: form.address.trim() || null,
  city: form.city.trim(),
  state: form.state.trim(),
  website_url: form.website_url.trim() || null,
  color_bg: `bg-[${hex}]/20`,
  color_text: `text-[${hex}]`,
  color_border: `border-[${hex}]`,
  active: form.active,
  aliases: form.aliases.length > 0 ? form.aliases : null,  // ADD THIS
};

// Around line 215, add aliases to update:
const { error } = await supabase
  .from("venues")
  .update({
    name: venueData.name,
    description: venueData.description,
    address: venueData.address,
    city: venueData.city,
    state: venueData.state,
    website_url: venueData.website_url,
    color_bg: venueData.color_bg,
    color_text: venueData.color_text,
    color_border: venueData.color_border,
    active: venueData.active,
    aliases: venueData.aliases,  // ADD THIS
  })
  .eq("id", editingVenue.id);
```

**Step 4: Add aliases UI in the modal form**

Add after the Website URL field (around line 448):

```tsx
{/* Aliases */}
<div>
  <label className="block text-sm text-gray-400 mb-1">
    Aliases (for venue matching)
  </label>
  <p className="text-xs text-gray-500 mb-2">
    Alternative names that should match this venue (e.g., "waiting room", "the waiting room")
  </p>

  {/* Current aliases */}
  <div className="flex flex-wrap gap-2 mb-2">
    {form.aliases.map((alias, index) => (
      <div
        key={index}
        className="flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-sm"
      >
        <input
          type="text"
          value={alias}
          onChange={(e) => {
            const newAliases = [...form.aliases];
            newAliases[index] = e.target.value;
            updateForm("aliases", newAliases);
          }}
          className="bg-transparent text-white outline-none w-32"
        />
        <button
          type="button"
          onClick={() => {
            const newAliases = form.aliases.filter((_, i) => i !== index);
            updateForm("aliases", newAliases);
          }}
          className="text-gray-500 hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ))}
  </div>

  {/* Add new alias */}
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Add alias..."
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
          e.preventDefault();
          updateForm("aliases", [...form.aliases, e.currentTarget.value.trim().toLowerCase()]);
          e.currentTarget.value = "";
        }
      }}
      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
    />
    <button
      type="button"
      onClick={(e) => {
        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
        if (input.value.trim()) {
          updateForm("aliases", [...form.aliases, input.value.trim().toLowerCase()]);
          input.value = "";
        }
      }}
      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
    >
      + Add
    </button>
  </div>
</div>
```

**Step 5: Fix updateForm to handle string arrays**

```typescript
// Around line 176, update updateForm signature:
const updateForm = (field: keyof VenueForm, value: string | boolean | string[]) => {
  setForm((prev) => ({ ...prev, [field]: value }));
};
```

**Step 6: Test in browser**

Run: `cd web && npm run dev`
Navigate to: `/admin` → Venues tab → Edit a venue
Expected: Aliases section appears, can add/edit/delete aliases

**Step 7: Commit**

```bash
git add web/src/components/VenueManagement.tsx
git commit -m "feat(admin): add venue aliases management UI"
```

---

## Task 6: Admin UI - Show venue details for "other" events in pending queue

**Files:**
- Modify: `web/src/components/AdminDashboard.tsx`

**Step 1: Update DbEvent interface**

Add the missing venue fields (around line 24):

```typescript
interface DbEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  venue_id: string;
  venue_name: string | null;           // ADD THIS
  other_venue_website: string | null;  // ADD THIS if not present
  other_venue_address: string | null;  // ADD THIS if not present
  event_url: string | null;
  ticket_url: string | null;
  image_url: string | null;
  price: string | null;
  age_restriction: string | null;
  supporting_artists: string[] | null;
  source: string;
  status: string;
  category: string | null;
  created_at: string;
}
```

**Step 2: Update pending event card to show "other" venue details**

Find the pending event rendering section (around line 556-720) and update the venue display:

Replace the venue name display logic:

```tsx
// In the pending event card, find where venueName is displayed (around line 595, 680)
// Replace:
// <span className={colors.text}>{venueName}</span>

// With:
{event.venue_id === 'other' ? (
  <span className="text-emerald-400">
    {event.venue_name || 'Unknown Venue'}
    {event.other_venue_address && (
      <span className="text-gray-500 text-xs ml-1">
        ({event.other_venue_address})
      </span>
    )}
  </span>
) : (
  <span className={colors.text}>{venueName}</span>
)}
```

**Step 3: Add "other" venue info section for pending events**

Add after the meta info section (around line 616 for mobile, 703 for desktop):

```tsx
{/* Other venue details */}
{event.venue_id === 'other' && event.venue_name && (
  <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
    <p className="text-xs text-emerald-400 font-medium mb-1">External Venue</p>
    <p className="text-sm text-white">{event.venue_name}</p>
    {event.other_venue_address && (
      <p className="text-xs text-gray-400 mt-0.5">{event.other_venue_address}</p>
    )}
    {event.other_venue_website && (
      <a
        href={event.other_venue_website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
      >
        Venue Website
      </a>
    )}
  </div>
)}
```

**Step 4: Test in browser**

Run: `cd web && npm run dev`
Navigate to: `/admin` → Pending tab
Expected: Events with venue_id="other" show venue name and details in a highlighted box

**Step 5: Commit**

```bash
git add web/src/components/AdminDashboard.tsx
git commit -m "feat(admin): show venue details for 'other' events in pending queue"
```

---

## Task 7: End-to-end test

**Step 1: Add a test alias to Waiting Room**

1. Go to Admin → Venues → Waiting Room Lounge
2. Add alias: "waiting room"
3. Save

**Step 2: Run the scraper**

```bash
cd web/scraper
SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key python run_scrape_supabase.py
```

**Step 3: Verify deduplication**

Check logs for OmahaUnderground scraper:
- Should see reduced event count (duplicates skipped)
- Events at "Waiting Room" should be matched to "waitingroom" venue

**Step 4: Verify "other" events display correctly**

1. Go to Admin → Pending
2. If any "other" events exist, verify venue_name is displayed

**Step 5: Final commit with all changes**

```bash
git add -A
git commit -m "feat: complete event deduplication implementation

- Add aliases column to venues table
- Add VenueMatcher module for fuzzy venue matching
- Integrate VenueMatcher into OmahaUnderground scraper
- Add admin UI for managing venue aliases
- Show 'other' venue details in pending queue"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Database migration | `migrations/004_add_venue_aliases.sql` |
| 2 | VenueMatcher tests | `tests/test_venue_matcher.py` |
| 3 | VenueMatcher implementation | `venue_matcher.py` |
| 4 | Scraper integration | `omahaunderground.py`, `config.py`, `run_scrape_supabase.py` |
| 5 | Admin aliases UI | `VenueManagement.tsx` |
| 6 | Pending venue details | `AdminDashboard.tsx` |
| 7 | End-to-end test | N/A |
