# ShowCal / Omaha Shows

A local music event aggregator that scrapes venue websites and displays upcoming shows in a unified interface.

## Workflow Rules

- **NEVER commit until the user has tested the changes first.** Always wait for explicit approval before committing.
- Run `npm run build` to verify changes compile, but let the user run `npm run dev` and test before committing.
- **NEVER modify external URLs in events.json.** Only the scraper should set image URLs. External URLs (http/https) must never be changed - we don't control those files. Only local paths like `/images/astro/` can be modified.
- Before committing events.json changes, run `npm run validate` to check for issues.
- **Always use `run_scrape.py` for scraping** - never use inline scrape scripts. `run_scrape.py` handles archiving past events to `history.json`, tracking new/changed events, and `addedAt` timestamps. After running, copy both output files:
  ```bash
  cd scraper
  PYTHONIOENCODING=utf-8 python3 run_scrape.py
  cp output/events.json ../public/events.json
  cp output/history.json ../public/history.json
  ```
- **Windows encoding**: Always use `encoding="utf-8"` when reading/writing JSON files in Python on Windows. The default `cp1252` codec will fail on special characters.

**Live Site:** https://canderson402.github.io/OmahaShows/

## Project Structure

```
omaha_shows/
├── src/                        # React + Vite + Tailwind frontend
│   ├── App.tsx                 # Main app with venue filters, layout, views
│   ├── components/
│   │   ├── EventCard.tsx        # Full-size event card
│   │   ├── EventCardCompact.tsx # Compact event card (primary view)
│   │   ├── EventList.tsx        # Event list with pagination
│   │   ├── HistoryList.tsx      # Past shows with collapsible months
│   │   ├── CalendarView.tsx     # Calendar grid view
│   │   ├── DayEventsSheet.tsx   # Side panel for calendar day details
│   │   ├── FiltersDropdown.tsx  # Venue/time filter dropdowns
│   │   ├── ContactModal.tsx     # Contact form modal
│   │   └── Dashboard.tsx        # Scraper dashboard (dev only)
│   ├── index.css               # Global styles, backgrounds
│   └── types.ts                # TypeScript types
├── public/
│   ├── events.json             # Scraped event data (upcoming)
│   ├── history.json            # Archived past events
│   ├── images/astro/           # Downloaded Astro Theater images
│   └── favicon.svg             # Gradient "O" favicon
├── scraper/                    # Python scrapers
│   ├── scrapers/
│   │   ├── base.py             # BaseScraper class
│   │   ├── theslowdown.py      # Slowdown (BeautifulSoup)
│   │   ├── waitingroom.py      # Waiting Room (BeautifulSoup, RHP)
│   │   ├── reverblounge.py     # Reverb Lounge (BeautifulSoup, RHP)
│   │   ├── admiral.py          # Admiral (BeautifulSoup, RHP)
│   │   ├── bourbontheatre.py   # Bourbon Theatre (BeautifulSoup, TicketWeb)
│   │   ├── astrotheater.py     # The Astro (Playwright + image downloads)
│   │   ├── steelhouse.py       # Steelhouse (BeautifulSoup)
│   │   ├── opa.py              # Holland Center & Orpheum (ticketomaha.com, shared cache)
│   │   ├── ticketweb.py        # Barnato (TicketWeb widget)
│   │   └── omahaunderground.py # Other venues via omahaunderground.net
│   ├── models.py               # Pydantic models (Event, SourceStatus, HistoricalShow, etc.)
│   ├── config.py               # Scraper registry
│   ├── api.py                  # FastAPI for local dev scraping
│   ├── run_scrape.py           # Main scrape script (archives history, tracks changes)
│   └── output/
│       ├── events.json         # Scraper output (upcoming events)
│       └── history.json        # Archived past events
└── .github/workflows/
    ├── deploy.yml              # GitHub Pages deployment (on push to main)
    └── scrape.yml              # Daily automated scrape (9 AM UTC / 3 AM Central)
```

## Current Venues (11)

| Venue | Scraper ID | Scraper Type | Notes |
|-------|-----------|--------------|-------|
| Slowdown | theslowdown | BeautifulSoup | seetickets listings, prices from hidden `.price` element |
| Waiting Room | waitingroom | BeautifulSoup | RHP system |
| Reverb Lounge | reverblounge | BeautifulSoup | RHP system |
| Admiral | admiral | BeautifulSoup | RHP system |
| Bourbon Theatre | bourbontheatre | BeautifulSoup | TicketWeb `.tw-cal-event-popup` containers |
| The Astro | astrotheater | Playwright | JS-rendered, downloads images locally |
| Steelhouse | steelhouse | BeautifulSoup | steelhouseomaha.com |
| Holland Center | holland | BeautifulSoup (OPA) | ticketomaha.com, fetches detail pages for prices |
| Orpheum Theater | orpheum | BeautifulSoup (OPA) | ticketomaha.com, shares cache with Holland |
| Barnato | barnato | BeautifulSoup | TicketWeb widget via barnato.bar |
| Other | other | BeautifulSoup | omahaunderground.net, skips known venues |

## Price Scraping

- **Slowdown**: Prices exist in hidden `.price` elements on the listing page (not visible to users). Extracted as "From $X" using the low end of the range. `$0.00` becomes "Free".
- **Holland Center / Orpheum**: No prices on listing page. Each event's detail page on ticketomaha.com is fetched (with 0.5s delay between requests) to extract "Tickets start at $X" → "From $X". Uses class-level `_price_cache` shared between both venue instances.
- **Slowdown detail pages** (eventim.us) return 403 due to bot protection - cannot be scraped with requests.

## History System

Past events are automatically archived to `history.json` by `run_scrape.py`:
- When a scrape runs, any event with a date before today is moved from `events.json` to `history.json`
- Deduplication by `(date, title, venue)` tuple
- The history tab in the frontend shows collapsible month sections, with only the last 7 days expanded by default
- The GitHub Actions scrape workflow commits both `events.json` and `history.json`

## Adding New Venues

### Step 1: Analyze the Site

```bash
# Check if it needs Playwright (JS-rendered)
curl -s "https://venue-url.com/events" | head -100

# If you see actual event data, use BeautifulSoup
# If you see empty containers or JS loading, use Playwright
```

### Step 2: Create the Scraper

For **static HTML sites** (BeautifulSoup):
```python
# scraper/scrapers/newvenue.py
import re
import sys
from datetime import datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event

class NewVenueScraper(BaseScraper):
    name = "Venue Name"
    id = "venueid"  # lowercase, no spaces
    url = "https://venue-url.com/events"

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []
        # ... parse logic
        return events
```

For **JS-rendered sites** (Playwright):
```python
from playwright.sync_api import sync_playwright

class NewVenueScraper(BaseScraper):
    name = "Venue Name"
    id = "venueid"
    url = "https://venue-url.com/events"

    def scrape(self) -> list[Event]:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(self.url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(3000)  # Wait for JS
            events = self._extract_events(page)
            browser.close()
            return events
```

### Step 3: Register the Scraper

Add to `scraper/config.py`:
```python
from scrapers.newvenue import NewVenueScraper
SCRAPERS = [
    # ... existing scrapers
    NewVenueScraper(),
]
```

Add to `scraper/api.py`:
```python
from scrapers.newvenue import NewVenueScraper
SCRAPERS = {
    # ... existing scrapers
    "venueid": NewVenueScraper(),
}
```

### Step 4: Add Venue Color

In `src/App.tsx`, add to `VENUE_COLORS`:
```typescript
export const VENUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // ... existing venues
  venueid: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500" },
};
```

Also add to `src/components/HistoryList.tsx` `venueNameToId` map:
```typescript
"Venue Name": "venueid",
```

### Step 5: Test & Deploy

```bash
# Test scraper
cd scraper
python3 -c "from scrapers.newvenue import NewVenueScraper; s = NewVenueScraper(); print(len(s.scrape()))"

# Run full scrape (archives past events to history automatically)
PYTHONIOENCODING=utf-8 python3 run_scrape.py

# Copy to public
cp output/events.json ../public/events.json
cp output/history.json ../public/history.json
```

## Tips & Tricks Discovered

### Scraping

1. **Bot Protection**: Some sites (like Astro Theater, Slowdown detail pages on eventim.us) have Cloudflare/bot protection. Use Playwright for JS-rendered sites, or fall back to listing page data.

2. **Hotlink Protection**: Astro Theater blocks image hotlinking. Solution: Download images during scraping to `public/images/astro/` and reference locally.

3. **Image Path for GitHub Pages**: Local images must use the base path:
   ```python
   return f"/OmahaShows/images/astro/{filename}"  # NOT /images/astro/
   ```

4. **RHP System**: Waiting Room, Reverb, and Admiral all use the same "Red House Press" event system with similar HTML structure.

5. **TicketWeb Widget**: Bourbon Theatre and Barnato use `.tw-cal-event-popup` containers with `.tw-image`, `.tw-name`, `.tw-date` classes.

6. **OPA Shared Cache**: Holland Center and Orpheum share a class-level `_cache` so the paginated ticketomaha.com site is only fetched once when both scrapers run. Price fetches also share `_price_cache`.

7. **Detail Page Price Fetching**: When listing pages don't have prices, fetch individual event detail pages with a polite delay (0.5s). Use `requests.Session` for connection reuse.

### Frontend

1. **GitHub Pages Base URL**: Set in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/OmahaShows/',
   })
   ```

2. **Fetching events.json**: Use `import.meta.env.BASE_URL` for the path:
   ```typescript
   fetch(`${import.meta.env.BASE_URL}events.json`)
   ```

3. **Mobile Background Issues**: `background-attachment: fixed` breaks on iOS/Android. Use media query:
   ```css
   @media (max-width: 768px) {
     .bg-texture {
       background-attachment: scroll;
     }
   }
   ```

4. **Responsive Layout**: Use `md:` prefix for desktop-only styles. Mobile is full-width, desktop has padding/rounded corners.

5. **Image Aspect Ratios**: Use blurred background fill technique for varying aspect ratios:
   ```tsx
   <div className="relative">
     <img src={url} className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" />
     <img src={url} className="relative w-full aspect-square object-contain" />
   </div>
   ```

6. **Prevent White Flash on Mobile**: Set dark background on html/body as fallback:
   ```css
   html, body {
     background-color: #0d0d0f;
   }
   ```

### Deployment

1. **TypeScript Strict Mode**: Build fails on unused variables. Remove them or use `_varName` prefix.

2. **GitHub Pages Setup**:
   - Go to repo Settings → Pages
   - Set Source to "GitHub Actions"
   - Workflow deploys automatically on push to main

3. **Daily Scrape**: GitHub Actions runs `scrape.yml` daily at 9 AM UTC (3 AM Central). It:
   - Runs `run_scrape.py` which scrapes all venues, archives past events to history
   - Copies both `events.json` and `history.json` to `public/`
   - Commits and pushes if changed
   - Triggers `deploy.yml` to rebuild and deploy the site

4. **Check Workflow Status**:
   ```bash
   gh run list --repo canderson402/OmahaShows --limit 1
   gh run view RUN_ID --repo canderson402/OmahaShows --log-failed
   ```

## Data Models

```typescript
// Upcoming event
interface Event {
  id: string;           // "venueid-YYYY-MM-DD-slug"
  title: string;
  date: string;         // "YYYY-MM-DD"
  time: string | null;  // "HH:MM" (24-hour)
  venue: string;        // Display name
  eventUrl: string | null;   // Event detail page
  ticketUrl: string | null;  // Ticket purchase link
  imageUrl: string | null;
  price: string | null;       // "From $25", "Free", or null
  ageRestriction: string | null;
  supportingArtists: string[] | null;
  source: string;       // Scraper ID
  addedAt: string | null; // ISO timestamp when first seen
}

// Archived past event
interface HistoricalShow {
  date: string;         // "YYYY-MM-DD"
  title: string;
  venue: string;
  supportingArtists: string[] | null;
}
```

## Local Development

```bash
# Start web dev server
npm run dev

# Start API (for live scraping in browser)
cd scraper
python3 api.py

# Run full scrape (preferred method - archives history)
cd scraper
PYTHONIOENCODING=utf-8 python3 run_scrape.py
cp output/events.json ../public/events.json
cp output/history.json ../public/history.json

# Test a single scraper
python3 -c "from scrapers.theslowdown import SlowdownScraper; s = SlowdownScraper(); print(len(s.scrape()))"
```

## Future Ideas

- Add more Omaha venues (Sokol Auditorium, The Sydney, Harney Street Tavern, etc.)
- Search/filter by artist name
- Email/push notifications for favorite artists
- Spotify integration to highlight artists you follow
