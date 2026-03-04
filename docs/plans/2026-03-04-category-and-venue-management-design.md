# Category & Venue Management Design

**Date:** 2026-03-04
**Branch:** `category_exploration`

## Overview

Add event categorization, dynamic venue management, and an ohmyomaha scraper to discover shows we're missing.

## Features

### 1. Event Categories

Add a `category` field to events for internal organization.

**Values:** `music`, `sports`, `theater`, `comedy`

**Visibility:** Admin-only. Not shown on public event cards.

**Schema change:**
```sql
ALTER TABLE events
ADD COLUMN category TEXT CHECK (category IN ('music', 'sports', 'theater', 'comedy'));
```

### 2. Admin Venues Tab

New tab in admin dashboard for full venue CRUD.

**Tab order:** `Pending | Events | Scrapers | Venues`

**List view:**
- All venues with name, ID, address, website, active status, color badge
- Search/filter by name
- "Add Venue" button

**Add/Edit modal:**
- Name (required)
- ID (auto-generated from name for new, read-only for existing)
- Address, City, State
- Website URL
- Color picker (preset palette)
- Active toggle

**Behavior:**
- `active: true` = shows in public filters
- `active: false` = hidden from public, good for staging
- Warning when deactivating venue with events

### 3. Pending Event UI Updates

**Edit modal:**
- Category dropdown (Music, Sports, Theater, Comedy)
- Can save without category
- Cannot approve without category set

**Pending list:**
- Show category badge for admin convenience

### 4. ohmyomaha Scraper

Manual-trigger scraper to find shows we're missing.

**Source:** `https://ohmyomaha.com/biggest-concerts-omaha/`

**Trigger:** Manual only (admin Scrapers tab or CLI)

**Flow:**
1. Fetch and parse page (title, date, venue name, ticket link)
2. Map venue name → venue_id (fuzzy match)
3. Auto-categorize by title/venue keywords
4. Check for existing event by ID
5. Create pending event if new

**Event data:**
- `id`: `{venue_id}-{date}-{slug}` (standard format)
- `source`: `"ohmyomaha"` (for tracking/deletion)
- `status`: `"pending"`
- `category`: auto-detected
- `venue_id`: mapped or `"other"`
- `venue_name`: original name for "other" venues
- `ticket_url`: link from page

**Auto-categorization keywords:**
- Sports: `vs`, team names (Beef, Supernovas, Lancers, etc.)
- Theater: symphony, orchestra, ballet, broadway
- Comedy: comedy, comedian, stand-up
- Family: Disney on Ice, Globetrotters (maps to appropriate category)
- Default: music

## Implementation Order

1. Add `category` column to events table
2. Add Venues tab to admin dashboard
3. Update pending event UI with category dropdown
4. Build ohmyomaha scraper

## Rollback Strategy

Events from ohmyomaha can be deleted with:
```sql
DELETE FROM events WHERE source = 'ohmyomaha';
```

Category column is nullable and additive - won't break existing functionality.
