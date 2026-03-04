# Category & Venue Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add event categories, admin venue management, and ohmyomaha scraper for discovering new shows.

**Architecture:** Database-first approach. Add category column, then build admin Venues tab, update pending UI, and finally add the ohmyomaha scraper. All changes are additive and non-destructive.

**Tech Stack:** Supabase (PostgreSQL), React + TypeScript, Python (scrapers), Tailwind CSS

---

### Task 1: Add Category Column to Events Table

**Files:**
- Modify: `supabase/schema.sql` (for documentation)
- Run: SQL in Supabase dashboard

**Step 1: Run migration in Supabase SQL Editor**

```sql
ALTER TABLE events
ADD COLUMN category TEXT CHECK (category IN ('music', 'sports', 'theater', 'comedy'));
```

**Step 2: Verify column exists**

Run in SQL Editor:
```sql
SELECT id, title, category FROM events LIMIT 5;
```
Expected: Results show `category` column (all NULL)

**Step 3: Update schema.sql for documentation**

In `supabase/schema.sql`, update the events table definition to include:
```sql
category TEXT CHECK (category IN ('music', 'sports', 'theater', 'comedy')),
```

**Step 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add category column to events table"
```

---

### Task 2: Update TypeScript Types for Category

**Files:**
- Modify: `src/types.ts`
- Modify: `src/lib/supabase.ts`

**Step 1: Add Category type to types.ts**

Add after the Event interface:
```typescript
export type EventCategory = 'music' | 'sports' | 'theater' | 'comedy';
```

Add `category` to Event interface:
```typescript
export interface Event {
  // ... existing fields ...
  category?: EventCategory;
}
```

**Step 2: Update DbEvent interface in supabase.ts**

Add to DbEvent interface:
```typescript
category: string | null;
```

**Step 3: Update toAppEvent function in supabase.ts**

Add to the return object:
```typescript
category: dbEvent.category as EventCategory | undefined,
```

**Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 5: Commit**

```bash
git add src/types.ts src/lib/supabase.ts
git commit -m "feat: add category type to Event"
```

---

### Task 3: Create VenueManagement Component

**Files:**
- Create: `src/components/VenueManagement.tsx`

**Step 1: Create the component file**

```typescript
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  website_url: string | null;
  color_bg: string | null;
  color_text: string | null;
  color_border: string | null;
  active: boolean;
}

const COLOR_PRESETS = [
  { name: "Amber", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500" },
  { name: "Orange", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500" },
  { name: "Rose", bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500" },
  { name: "Pink", bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500" },
  { name: "Fuchsia", bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", border: "border-fuchsia-500" },
  { name: "Purple", bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500" },
  { name: "Cyan", bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500" },
  { name: "Teal", bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500" },
  { name: "Indigo", bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500" },
  { name: "Lime", bg: "bg-lime-500/20", text: "text-lime-400", border: "border-lime-500" },
  { name: "Emerald", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500" },
];

function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Venue>>({});

  const fetchVenues = useCallback(async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("name");

    if (!error && data) {
      setVenues(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  const openNewVenue = () => {
    setIsNew(true);
    setEditForm({
      name: "",
      address: "",
      city: "Omaha",
      state: "NE",
      website_url: "",
      color_bg: COLOR_PRESETS[0].bg,
      color_text: COLOR_PRESETS[0].text,
      color_border: COLOR_PRESETS[0].border,
      active: true,
    });
    setEditingVenue({} as Venue);
  };

  const openEditVenue = (venue: Venue) => {
    setIsNew(false);
    setEditForm({ ...venue });
    setEditingVenue(venue);
  };

  const handleSave = async () => {
    if (!editForm.name) return;
    setSaving(true);

    try {
      if (isNew) {
        const id = generateId(editForm.name);
        const { error } = await supabase.from("venues").insert({
          id,
          name: editForm.name,
          address: editForm.address || null,
          city: editForm.city || "Omaha",
          state: editForm.state || "NE",
          website_url: editForm.website_url || null,
          color_bg: editForm.color_bg,
          color_text: editForm.color_text,
          color_border: editForm.color_border,
          active: editForm.active ?? true,
        });
        if (error) throw error;
      } else if (editingVenue) {
        const { error } = await supabase
          .from("venues")
          .update({
            name: editForm.name,
            address: editForm.address || null,
            city: editForm.city || "Omaha",
            state: editForm.state || "NE",
            website_url: editForm.website_url || null,
            color_bg: editForm.color_bg,
            color_text: editForm.color_text,
            color_border: editForm.color_border,
            active: editForm.active,
          })
          .eq("id", editingVenue.id);
        if (error) throw error;
      }

      await fetchVenues();
      setEditingVenue(null);
    } catch (err) {
      console.error("Failed to save venue:", err);
    } finally {
      setSaving(false);
    }
  };

  const selectedColorIndex = COLOR_PRESETS.findIndex(
    c => c.bg === editForm.color_bg
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
        </div>
        <button
          onClick={openNewVenue}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
        >
          + Add Venue
        </button>
      </div>

      {/* Venues List */}
      <div className="space-y-2">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            onClick={() => openEditVenue(venue)}
            className="flex items-center gap-3 py-3 px-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
          >
            <span className={`text-xs px-2 py-0.5 rounded ${venue.color_bg} ${venue.color_text}`}>
              {venue.id}
            </span>
            <span className="text-white flex-1">{venue.name}</span>
            <span className="text-gray-500 text-sm">{venue.address || "No address"}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              venue.active
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
            }`}>
              {venue.active ? "Active" : "Inactive"}
            </span>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {search ? "No venues match your search." : "No venues found."}
        </div>
      )}

      {/* Edit/Add Modal */}
      {editingVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setEditingVenue(null)}>
          <div
            className="w-full max-w-lg max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {isNew ? "Add Venue" : "Edit Venue"}
              </h3>
              <button
                onClick={() => setEditingVenue(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              {isNew && editForm.name && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID (auto-generated)</label>
                  <input
                    type="text"
                    value={generateId(editForm.name)}
                    disabled
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500"
                  />
                </div>
              )}

              {!isNew && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID</label>
                  <input
                    type="text"
                    value={editingVenue.id}
                    disabled
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address || ""}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city || ""}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state || ""}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                <input
                  type="url"
                  value={editForm.website_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((color, i) => (
                    <button
                      key={color.name}
                      onClick={() => setEditForm({
                        ...editForm,
                        color_bg: color.bg,
                        color_text: color.text,
                        color_border: color.border,
                      })}
                      className={`px-3 py-1 rounded text-xs ${color.bg} ${color.text} ${
                        selectedColorIndex === i ? "ring-2 ring-white" : ""
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400">Active</label>
                <button
                  onClick={() => setEditForm({ ...editForm, active: !editForm.active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editForm.active ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      editForm.active ? "left-7" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-500">
                  {editForm.active ? "Shows in public filters" : "Hidden from public"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-800">
              <button
                onClick={() => setEditingVenue(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editForm.name}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/VenueManagement.tsx
git commit -m "feat: add VenueManagement component"
```

---

### Task 4: Add Venues Tab to AdminDashboard

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

**Step 1: Import VenueManagement**

Add to imports:
```typescript
import { VenueManagement } from "./VenueManagement";
```

**Step 2: Update AdminTab type**

Change:
```typescript
export type AdminTab = "pending" | "scrapers" | "events";
```
To:
```typescript
export type AdminTab = "pending" | "scrapers" | "events" | "venues";
```

**Step 3: Add Venues tab button**

After the Scrapers tab button, add:
```typescript
<button
  onClick={() => setTab("venues")}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    tab === "venues"
      ? "bg-white/10 text-white"
      : "text-gray-400 hover:text-white"
  }`}
>
  Venues
</button>
```

**Step 4: Add Venues tab content**

After the Scrapers tab content block, add:
```typescript
{/* Venues Tab */}
{tab === "venues" && <VenueManagement />}
```

**Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: add Venues tab to admin dashboard"
```

---

### Task 5: Add Category Dropdown to Pending Event Edit Modal

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

**Step 1: Add category to DbEvent interface**

Add to DbEvent interface:
```typescript
category: string | null;
```

**Step 2: Add category to editForm state in openEditModal**

In the `openEditModal` function, add to setEditForm:
```typescript
category: event.category || "",
```

**Step 3: Add category dropdown in edit modal form**

After the Status dropdown, add:
```typescript
<div>
  <label className="block text-sm text-gray-400 mb-1">Category</label>
  <select
    value={editForm.category || ""}
    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
  >
    <option value="">Select category</option>
    <option value="music">Music</option>
    <option value="sports">Sports</option>
    <option value="theater">Theater</option>
    <option value="comedy">Comedy</option>
  </select>
</div>
```

**Step 4: Include category in handleSaveEdit update**

Add to the update object:
```typescript
category: editForm.category || null,
```

**Step 5: Add category badge to pending list items**

In the pending event card, after the venue badge, add:
```typescript
{event.category && (
  <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
    event.category === 'music' ? 'bg-amber-500/20 text-amber-400' :
    event.category === 'sports' ? 'bg-green-500/20 text-green-400' :
    event.category === 'theater' ? 'bg-purple-500/20 text-purple-400' :
    'bg-pink-500/20 text-pink-400'
  }`}>
    {event.category}
  </span>
)}
```

**Step 6: Add validation for approve (optional - warn if no category)**

In handleApprove, before approving, you could add a check. For now, allow approve without category.

**Step 7: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 8: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: add category dropdown to pending event edit modal"
```

---

### Task 6: Create ohmyomaha Scraper

**Files:**
- Create: `scraper/scrapers/ohmyomaha_concerts.py`

**Step 1: Create the scraper file**

```python
# scraper/scrapers/ohmyomaha_concerts.py
"""Scraper for ohmyomaha.com concert listings."""
import re
import sys
from datetime import datetime
from pathlib import Path
from difflib import SequenceMatcher

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).parent.parent))
from models import Event

# Category detection
SPORTS_KEYWORDS = ['vs', 'vs.', 'omaha beef', 'supernovas', 'storm chasers',
                   'lancers', 'union omaha', 'mavericks', 'bluejays', 'huskers',
                   'guns & hoses', 'hockey', 'ignite']
THEATER_KEYWORDS = ['symphony', 'orchestra', 'ballet', 'opera', 'broadway',
                    'philharmonic', 'chamber music', 'playhouse', 'musical']
COMEDY_KEYWORDS = ['comedy', 'comedian', 'stand-up', 'standup', 'john mulaney',
                   'nate bargatze', 'bert kreischer']

# Venue name to ID mapping (fuzzy matched)
VENUE_MAPPING = {
    'slowdown': 'theslowdown',
    'the slowdown': 'theslowdown',
    'waiting room': 'waitingroom',
    'waiting room lounge': 'waitingroom',
    'reverb lounge': 'reverblounge',
    'reverb': 'reverblounge',
    'bourbon theatre': 'bourbontheatre',
    'bourbon theater': 'bourbontheatre',
    'the admiral': 'admiral',
    'admiral': 'admiral',
    'the astro': 'astrotheater',
    'astro theater': 'astrotheater',
    'astro theatre': 'astrotheater',
    'steelhouse omaha': 'steelhouse',
    'steelhouse': 'steelhouse',
    'holland center': 'holland',
    'holland performing arts': 'holland',
    'orpheum theater': 'orpheum',
    'orpheum theatre': 'orpheum',
    'barnato': 'barnato',
}


def categorize(title: str, venue: str) -> str:
    """Auto-categorize event based on title and venue keywords."""
    t = title.lower()

    for kw in COMEDY_KEYWORDS:
        if kw in t:
            return 'comedy'
    for kw in THEATER_KEYWORDS:
        if kw in t:
            return 'theater'
    for kw in SPORTS_KEYWORDS:
        if kw in t:
            return 'sports'

    return 'music'


def map_venue(venue_name: str) -> tuple[str, str | None]:
    """Map venue name to venue_id. Returns (venue_id, venue_name_for_other)."""
    v = venue_name.lower().strip()

    # Direct match
    if v in VENUE_MAPPING:
        return VENUE_MAPPING[v], None

    # Fuzzy match
    for name, venue_id in VENUE_MAPPING.items():
        if SequenceMatcher(None, v, name).ratio() > 0.8:
            return venue_id, None

    # Unknown venue -> "other"
    return 'other', venue_name


def parse_date(date_str: str) -> str | None:
    """Parse date string to YYYY-MM-DD format."""
    # Handle ranges like "March 5-8, 2026" - take first date
    date_match = re.search(r'([A-Za-z]+)\s+(\d+)(?:-\d+)?,?\s*(\d{4})', date_str)
    if not date_match:
        return None

    month, day, year = date_match.groups()
    try:
        dt = datetime.strptime(f"{month} {day} {year}", "%B %d %Y")
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        return None


def generate_id(venue_id: str, date: str, title: str) -> str:
    """Generate event ID in standard format."""
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:40]
    return f"{venue_id}-{date}-{slug}"


def scrape_ohmyomaha() -> list[Event]:
    """Scrape ohmyomaha.com for concert listings."""
    url = "https://ohmyomaha.com/biggest-concerts-omaha/"

    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    content = soup.find('div', class_='entry-content') or soup.find('article')

    events = []

    for el in content.find_all(['p', 'li']):
        text = el.get_text(strip=True)

        # Skip non-event entries
        if '|' not in text or '202' not in text:
            continue

        parts = text.split('|')
        if len(parts) < 3:
            continue

        title = parts[0].strip()
        date_str = parts[1].strip()
        venue_part = parts[2].strip()

        # Parse date
        date = parse_date(date_str)
        if not date:
            continue

        # Extract venue name (before parentheses)
        venue_match = re.match(r'^([^(]+)', venue_part)
        venue_name = venue_match.group(1).strip() if venue_match else venue_part

        # Get ticket link
        link = el.find('a')
        ticket_url = link.get('href') if link else None

        # Map venue and categorize
        venue_id, venue_name_for_other = map_venue(venue_name)
        category = categorize(title, venue_name)

        # Generate ID
        event_id = generate_id(venue_id, date, title)

        events.append(Event(
            id=event_id,
            title=title,
            date=date,
            time=None,
            venue=venue_name_for_other or venue_name,
            eventUrl=None,
            ticketUrl=ticket_url,
            imageUrl=None,
            price=None,
            ageRestriction=None,
            supportingArtists=None,
            source='ohmyomaha',
            category=category,
        ))

    return events


if __name__ == "__main__":
    events = scrape_ohmyomaha()
    print(f"Found {len(events)} events")
    for e in events[:10]:
        print(f"  {e.date} | {e.title[:40]} | {e.category}")
```

**Step 2: Update Event model to include category**

In `scraper/models.py`, add category field:
```python
@dataclass
class Event:
    id: str
    title: str
    date: str
    time: str | None
    venue: str
    eventUrl: str | None
    ticketUrl: str | None
    imageUrl: str | None
    price: str | None
    ageRestriction: str | None
    supportingArtists: list[str] | None
    source: str
    category: str | None = None
```

**Step 3: Test the scraper**

Run: `cd scraper && python scrapers/ohmyomaha_concerts.py`
Expected: Prints list of events with categories

**Step 4: Commit**

```bash
git add scraper/scrapers/ohmyomaha_concerts.py scraper/models.py
git commit -m "feat: add ohmyomaha concerts scraper"
```

---

### Task 7: Add ohmyomaha to Scraper Runner

**Files:**
- Modify: `scraper/run_scrape_supabase.py`

**Step 1: Update upsert_events to handle category and source separately**

In the `event_data` dict, add:
```python
"category": getattr(event, 'category', None),
```

Note: The `source` is already being set to `scraper_id`, but for ohmyomaha events, we want to preserve `event.source`. Update the logic:
```python
"source": event.source if hasattr(event, 'source') and event.source else scraper_id,
```

**Step 2: Create a separate function for ohmyomaha scraping**

Add to `run_scrape_supabase.py`:
```python
def run_ohmyomaha():
    """Run ohmyomaha scraper and add new events as pending."""
    from scrapers.ohmyomaha_concerts import scrape_ohmyomaha

    print("Scraping ohmyomaha.com...")
    events = scrape_ohmyomaha()
    print(f"Found {len(events)} events on ohmyomaha")

    new_count = 0
    skip_count = 0

    for event in events:
        # Check if event already exists
        existing = supabase.table("events").select("id").eq("id", event.id).execute()

        if existing.data:
            skip_count += 1
            continue

        # Insert as pending
        now = datetime.now(timezone.utc).isoformat()
        supabase.table("events").insert({
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": event.id.split('-')[0],  # Extract venue_id from event ID
            "venue_name": event.venue if event.id.startswith('other-') else None,
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": "ohmyomaha",
            "category": event.category,
            "status": "pending",
            "added_at": now,
            "updated_at": now,
        }).execute()
        new_count += 1

    print(f"Added {new_count} new pending events, skipped {skip_count} existing")
    return new_count, skip_count


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "ohmyomaha":
        run_ohmyomaha()
    else:
        run()
```

**Step 3: Test**

Run: `cd scraper && python run_scrape_supabase.py ohmyomaha`
Expected: Outputs count of new vs skipped events

**Step 4: Commit**

```bash
git add scraper/run_scrape_supabase.py
git commit -m "feat: add ohmyomaha scraper to runner"
```

---

### Task 8: Add ohmyomaha to ScraperDashboard UI

**Files:**
- Modify: `src/components/ScraperDashboard.tsx`

**Step 1: Add ohmyomaha to SCRAPERS array**

Add to the SCRAPERS array:
```typescript
{ id: "ohmyomaha", name: "Oh My Omaha", url: "https://ohmyomaha.com/biggest-concerts-omaha/" },
```

**Step 2: Update GitHub workflow input handling (if needed)**

The workflow should accept "ohmyomaha" as a valid scraper input.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/ScraperDashboard.tsx
git commit -m "feat: add ohmyomaha to scraper dashboard"
```

---

### Task 9: Final Testing and Cleanup

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Test locally**

Run: `npm run dev`
- Navigate to /admin
- Test Venues tab (add, edit, toggle active)
- Test pending event category dropdown
- Verify scrapers tab shows ohmyomaha

**Step 3: Push branch**

```bash
git push -u origin category_exploration
```

**Step 4: Test on Vercel preview**

Visit the preview URL and verify all features work.

---

## Summary

| Task | Description | Commit Message |
|------|-------------|----------------|
| 1 | Add category column to DB | `feat: add category column to events table` |
| 2 | Update TypeScript types | `feat: add category type to Event` |
| 3 | Create VenueManagement component | `feat: add VenueManagement component` |
| 4 | Add Venues tab to admin | `feat: add Venues tab to admin dashboard` |
| 5 | Add category dropdown to edit modal | `feat: add category dropdown to pending event edit modal` |
| 6 | Create ohmyomaha scraper | `feat: add ohmyomaha concerts scraper` |
| 7 | Add to scraper runner | `feat: add ohmyomaha scraper to runner` |
| 8 | Add to ScraperDashboard UI | `feat: add ohmyomaha to scraper dashboard` |
| 9 | Final testing | N/A |
