# ShowCal / Omaha Shows

A local music event aggregator that scrapes venue websites and displays upcoming shows in a unified interface.

**Live Site:** https://canderson402.github.io/OmahaShows/

## Project Structure

```
ShowCal/
├── web/                    # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── App.tsx         # Main app with venue filters, layout
│   │   ├── components/
│   │   │   ├── EventCard.tsx        # Full-size event card
│   │   │   ├── EventCardCompact.tsx # Compact event card (primary view)
│   │   │   ├── EventList.tsx        # Event list with pagination
│   │   │   └── Dashboard.tsx        # Scraper dashboard (dev only)
│   │   ├── index.css       # Global styles, backgrounds
│   │   └── types.ts        # TypeScript types
│   ├── public/
│   │   ├── events.json     # Scraped event data
│   │   ├── images/astro/   # Downloaded Astro Theater images
│   │   └── favicon.svg     # Gradient "O" favicon
│   └── .github/workflows/deploy.yml  # GitHub Pages deployment
│
├── scraper/                # Python scrapers
│   ├── scrapers/
│   │   ├── base.py         # BaseScraper class
│   │   ├── theslowdown.py
│   │   ├── waitingroom.py
│   │   ├── reverblounge.py
│   │   ├── bourbontheatre.py  # Playwright (JS-rendered)
│   │   ├── admiral.py
│   │   └── astrotheater.py    # Playwright + image downloads
│   ├── models.py           # Pydantic models (Event, SourceStatus, etc.)
│   ├── config.py           # Scraper registry
│   ├── api.py              # FastAPI for local dev scraping
│   └── output/events.json  # Scraper output
```

## Current Venues (6)

| Venue | Scraper Type | Notes |
|-------|--------------|-------|
| The Slowdown | BeautifulSoup | Standard HTML |
| Waiting Room | BeautifulSoup | RHP system |
| Reverb Lounge | BeautifulSoup | RHP system |
| Admiral | BeautifulSoup | RHP system |
| Bourbon Theatre | Playwright | JS-rendered, TicketWeb widget |
| The Astro | Playwright | JS-rendered, downloads images locally |

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
import requests

sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
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

In `web/src/App.tsx`, add to `VENUE_COLORS`:
```typescript
export const VENUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // ... existing venues
  venueid: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500" },
};
```

### Step 5: Test & Deploy

```bash
# Test scraper
cd scraper
source venv/bin/activate
python -c "from scrapers.newvenue import NewVenueScraper; s = NewVenueScraper(); print(len(s.scrape()))"

# Run full scrape and update web
python -c "
from config import SCRAPERS
from models import ScraperOutput, SourceStatus
from datetime import datetime, timezone

all_events = []
sources = []
for scraper in SCRAPERS:
    events = scraper.scrape()
    all_events.extend(events)
    print(f'{scraper.name}: {len(events)}')
    sources.append(SourceStatus(
        name=scraper.name, id=scraper.id, url=scraper.url,
        status='ok', lastScraped=datetime.now(timezone.utc).isoformat(),
        eventCount=len(events), error=None
    ))
all_events.sort(key=lambda e: e.date)
output = ScraperOutput(events=all_events, lastUpdated=datetime.now(timezone.utc).isoformat(), sources=sources)
open('output/events.json', 'w').write(output.model_dump_json(indent=2))
"
cp output/events.json ../web/public/events.json

# Commit and deploy
cd ../web
git add -A && git commit -m "Add NewVenue scraper" && git push
```

## Tips & Tricks Discovered

### Scraping

1. **Bot Protection**: Some sites (like Astro Theater) have Cloudflare/captcha protection on direct requests. Use Playwright to bypass.

2. **Hotlink Protection**: Astro Theater blocks image hotlinking. Solution: Download images during scraping to `web/public/images/venue/` and reference locally.

3. **Image Path for GitHub Pages**: Local images must use the base path:
   ```python
   return f"/OmahaShows/images/astro/{filename}"  # NOT /images/astro/
   ```

4. **RHP System**: Waiting Room, Reverb, and Admiral all use the same "Red House Press" event system with similar HTML structure.

5. **TicketWeb Widget**: Bourbon Theatre uses `.tw-cal-event` containers with `.tw-image`, `.tw-name`, `.tw-date` classes.

6. **Getting Unsplash Direct URLs**: Use curl to follow redirects:
   ```bash
   curl -sIL "https://unsplash.com/photos/PHOTO_ID/download?w=1920" | grep location | tail -1
   ```

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

3. **Check Workflow Status**:
   ```bash
   gh run list --repo canderson402/OmahaShows --limit 1
   gh run view RUN_ID --repo canderson402/OmahaShows --log-failed
   ```

## Event Data Model

```typescript
interface Event {
  id: string;           // "venueid-YYYY-MM-DD-slug"
  title: string;
  date: string;         // "YYYY-MM-DD"
  time: string | null;  // "HH:MM" (24-hour)
  venue: string;        // Display name
  venueUrl: string;
  eventUrl: string | null;   // Event detail page
  ticketUrl: string | null;  // Ticket purchase link
  imageUrl: string | null;
  price: string | null;
  ageRestriction: string | null;
  supportingArtists: string[] | null;
  source: string;       // Scraper ID
}
```

## Local Development

```bash
# Start web dev server
cd web
npm run dev

# Start API (for live scraping in browser)
cd scraper
source venv/bin/activate
python api.py

# Run scrapers manually
python -c "from config import SCRAPERS; [print(f'{s.name}: {len(s.scrape())}') for s in SCRAPERS]"
```

## Future Ideas

- Add more Omaha venues (Sokol Auditorium, The Sydney, Harney Street Tavern, etc.)
- Calendar view
- Search/filter by artist name
- Email/push notifications for favorite artists
- Historical data tracking
- Spotify integration to highlight artists you follow
- Automated daily scraping via GitHub Actions
