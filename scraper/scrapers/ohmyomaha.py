# scraper/scrapers/ohmyomaha.py
"""
Ohmyomaha scraper - discovers shows we might be missing.
Manual-trigger only, creates pending events for admin review.
Uses Playwright to bypass bot protection.
"""
import re
import sys
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event
from venue_matcher import VenueMatcher
from matching import find_existing_event

# Sports team names and keywords
SPORTS_KEYWORDS = [
    "vs", "vs.",
    "omaha beef", "beef",
    "omaha supernovas", "supernovas",
    "lancers",
    "storm chasers",
    "mavericks",
    "huskers",
    "creighton",
    "bluejays",
    "world wrestling", "wwe", "wrestling",
    "monster jam",
    "harlem globetrotters", "globetrotters",
]

# Theater/Arts keywords
THEATER_KEYWORDS = [
    "symphony", "orchestra", "philharmonic",
    "ballet", "opera",
    "broadway", "musical",
    "disney on ice",
    "cirque",
    "blue man group",
]

# Comedy keywords
COMEDY_KEYWORDS = [
    "comedy", "comedian", "stand-up", "standup",
    "live podcast",
]

# Sports venues that almost always have sports events
SPORTS_VENUES = ["chi health center", "chi"]


class OhMyOmahaScraper(BaseScraper):
    name = "OhMyOmaha"
    id = "ohmyomaha"
    url = "https://ohmyomaha.com/biggest-concerts-omaha/"

    def __init__(self, supabase_client=None, venue_matcher=None):
        super().__init__()
        self.supabase = supabase_client
        self.venue_matcher = venue_matcher

    def scrape(self) -> list[Event]:
        """Use Playwright to bypass bot protection."""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=['--disable-blink-features=AutomationControlled']
                )
                context = browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                )
                page = context.new_page()
                page.add_init_script('Object.defineProperty(navigator, "webdriver", {get: () => undefined});')

                page.goto(self.url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)  # Wait for content to load

                html = page.content()
                browser.close()

                return self.parse_events(html)
        except Exception as e:
            print(f"Error scraping OhMyOmaha with Playwright: {e}")
            return []

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        # Events are in <li> tags, look for ones with the pipe-separated format
        for li in soup.find_all("li"):
            try:
                text = li.get_text(separator=" ", strip=True)

                # Must have at least 2 pipes (title | date | venue)
                if text.count("|") < 2:
                    continue

                # Parse the pipe-separated format
                parts = text.split("|")
                if len(parts) < 3:
                    continue

                title = parts[0].strip()
                date_str = parts[1].strip()
                venue_part = parts[2].strip()

                # Skip empty titles
                if not title:
                    continue

                # Parse date
                date = self._parse_date(date_str)
                if not date:
                    continue

                # Extract venue name (before parenthesis if present)
                venue_name = venue_part.split("(")[0].strip()
                if not venue_name:
                    continue

                # Auto-categorize and skip sports events
                category = self._categorize(title, venue_name)
                if category == "sports":
                    continue

                # Get ticket link if present
                link = li.find("a")
                ticket_url = link.get("href") if link else None

                # Try to match venue using VenueMatcher
                matched_venue_id = None
                if self.venue_matcher:
                    match_result = self.venue_matcher.match(venue_name)
                    if match_result:
                        matched_venue_id = match_result[0]

                # Determine final venue_id
                if matched_venue_id:
                    venue_id = matched_venue_id
                    final_venue_name = None  # Don't need venue_name for official venues
                else:
                    venue_id = "other"
                    final_venue_name = venue_name

                # Check for duplicates if we matched to an official venue
                if matched_venue_id and self.supabase:
                    existing_events = self._get_events_for_venue_date(matched_venue_id, date)
                    temp_event = Event(
                        id="temp",
                        title=title,
                        date=date,
                        time=None,
                        venue=venue_name,
                        eventUrl=None,
                        ticketUrl=ticket_url,
                        imageUrl=None,
                        price=None,
                        ageRestriction=None,
                        supportingArtists=None,
                        source=self.id
                    )
                    if find_existing_event(temp_event, existing_events):
                        # Duplicate found - skip
                        continue

                # Generate standard ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"{venue_id}-{date}-{slug}"[:80]

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date,
                    time=None,  # ohmyomaha doesn't typically list times
                    venue=final_venue_name,  # Only set for "other" venues
                    eventUrl=None,
                    ticketUrl=ticket_url,
                    imageUrl=None,
                    price=None,
                    ageRestriction=None,
                    supportingArtists=None,
                    source=venue_id  # Use matched venue_id as source
                ))

            except Exception:
                continue

        return events

    def _get_events_for_venue_date(self, venue_id: str, event_date: str) -> list[dict]:
        """Query existing events for a venue on a specific date."""
        if not self.supabase:
            return []
        result = self.supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
        return result.data or []

    def _parse_date(self, text: str) -> str | None:
        """Parse various date formats to YYYY-MM-DD."""
        text = text.strip()

        # Common formats on ohmyomaha
        formats = [
            "%B %d, %Y",      # March 5, 2026
            "%b %d, %Y",      # Mar 5, 2026
            "%B %d %Y",       # March 5 2026
            "%b %d %Y",       # Mar 5 2026
            "%m/%d/%Y",       # 3/5/2026
            "%m/%d/%y",       # 3/5/26
        ]

        for fmt in formats:
            try:
                dt = datetime.strptime(text, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue

        return None

    def _categorize(self, title: str, venue_name: str) -> str:
        """Auto-categorize event based on title and venue."""
        title_lower = title.lower()
        venue_lower = venue_name.lower()

        # Check sports keywords in title
        for keyword in SPORTS_KEYWORDS:
            if keyword in title_lower:
                return "sports"

        # Check if it's a sports venue
        for venue in SPORTS_VENUES:
            if venue in venue_lower:
                # Could still be a concert at CHI
                # But if no obvious music indicators, default to sports
                return "sports"

        # Check theater keywords
        for keyword in THEATER_KEYWORDS:
            if keyword in title_lower:
                return "theater"

        # Check comedy keywords
        for keyword in COMEDY_KEYWORDS:
            if keyword in title_lower:
                return "comedy"

        # Default to music
        return "music"


# Standalone function to get categorized events
def scrape_ohmyomaha(supabase_client=None, venue_matcher=None) -> list[dict]:
    """
    Scrape ohmyomaha and return events with venue_id and category.
    Returns list of dicts ready for DB insertion.
    Sports events are automatically excluded.
    """
    scraper = OhMyOmahaScraper(supabase_client=supabase_client, venue_matcher=venue_matcher)
    events = scraper.scrape()

    result = []
    for event in events:
        # source is already set to the matched venue_id
        venue_id = event.source
        category = scraper._categorize(event.title, event.venue or "")

        result.append({
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": venue_id,
            "venue_name": event.venue if venue_id == "other" else None,
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": "ohmyomaha",
            "status": "pending",
            "category": category,
        })

    return result
