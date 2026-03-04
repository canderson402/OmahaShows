# Ticket Site Scrapers - Design Document

## Overview

Build a generic ticket site scraping system to enrich events discovered from sources like ohmyomaha.com. When an event has a ticket URL but is missing time, price, image, or supporting artists, admins can click "Enrich" to fetch that data from the ticket page.

## Goals

- Extract: time, price, image_url, supporting_artists from ticket URLs
- Support mainstream ticket sites (etix, eventbrite, ticketmaster, seetickets, etc.)
- Generic enough to work with any ticket site where possible
- Manual trigger only (Enrich button) - no automatic enrichment yet
- Independent of existing venue scrapers - no side effects

## Architecture: Hybrid with Fallback Chain

Try extraction methods in order:

1. **JSON-LD structured data** (schema.org/Event) - works on some sites (e.g., ticketomaha.com)
2. **Site-specific scraper** if registered in the domain registry
3. **Heuristic extraction** - og:image, common time/price patterns

### Why Hybrid?

Testing revealed:
- JSON-LD: Only ~20% of ticket sites have it (ticketomaha does, etix/eventbrite/ticketmaster don't)
- Open Graph: More common for images (og:image)
- Most sites need site-specific parsing for time/price

## Directory Structure

```
scraper/
├── scrapers/
│   ├── tickets/                    # Ticket site scrapers (NEW)
│   │   ├── __init__.py             # Registry + enrich_from_url() entry point
│   │   ├── base.py                 # BaseTicketScraper class
│   │   ├── structured_data.py      # JSON-LD / schema.org extractor
│   │   ├── heuristics.py           # Fallback pattern matching (og:image, etc.)
│   │   ├── etix.py                 # Site-specific: etix.com
│   │   ├── seetickets.py           # Site-specific: seetickets.us
│   │   ├── eventbrite.py           # Site-specific: eventbrite.com (Phase 2)
│   │   ├── ticketweb.py            # Site-specific: ticketweb.com (Phase 2)
│   │   └── ticketmaster.py         # Site-specific: ticketmaster.com (Phase 3)
│   └── ... (existing venue scrapers unchanged)
```

## Data Model

```python
@dataclass
class EnrichedEvent:
    time: str | None           # "19:00" (24h format)
    price: str | None          # "$25 - $35" or "Free"
    image_url: str | None      # Full URL to event image
    supporting_artists: list[str] | None  # ["Artist B", "Artist C"]
    source: str                # "json_ld", "etix", "heuristics", etc.
```

## API Endpoint

```
POST /api/enrich
Body: { "ticket_url": "https://etix.com/..." }

Success Response:
{
  "success": true,
  "source": "etix",
  "data": {
    "time": "19:00",
    "price": "$25 - $35",
    "image_url": "https://...",
    "supporting_artists": ["Artist B"]
  }
}

Error Response:
{
  "success": false,
  "error": "No scraper available for this domain",
  "domain": "unknownsite.com"
}
```

## URL Resolution

fave.co is a URL shortener used by ~116 events. The system will:
1. Follow HTTP redirects (up to 5 hops)
2. Extract final destination domain
3. Use that domain to select the appropriate scraper

## Admin UI Integration

Pending events with ticket_url show an "Enrich" button:

1. Admin clicks "Enrich"
2. Loading spinner while fetching
3. On success: Show summary ("Found: time, price, image") with [Apply to Event] [View JSON] [Dismiss]
4. "View JSON" toggles raw response display
5. "Apply to Event" opens edit modal with fields pre-filled
6. On error: Show error message

## Phase 1 (Build Now)

- Base infrastructure (BaseTicketScraper, registry, API endpoint)
- JSON-LD extractor (gets ticketomaha.com for free)
- fave.co redirect resolver
- etix.com scraper (97 events)
- seetickets.us scraper (56 events)
- Heuristics fallback (og:image, patterns)
- Admin UI Enrich button

## Phase 2 (Later)

- eventbrite.com scraper
- ticketweb.com scraper

## Phase 3 (Future)

- ticketmaster.com scraper
- Automatic enrichment during ohmyomaha scrape (if Phase 1 proves reliable)

## Testing Strategy

- Unit tests for each scraper with sample HTML fixtures
- Integration test for full enrich flow
- Test redirect resolution with mock fave.co URLs

## Error Handling

- Network errors: Return error JSON with message
- No scraper for domain: Return error with domain name
- Partial extraction: Return whatever was found (success: true, some fields null)
- Blocked/rate-limited: Return error suggesting manual check

## Independence from Venue Scrapers

This system is completely separate from venue scrapers:
- Different directory (scrapers/tickets/ vs scrapers/)
- Different purpose (enrichment vs discovery)
- Only triggered manually (no cron, no automatic runs)
- No modifications to existing scraper code
