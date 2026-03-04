# scraper/scrapers/ohmyomaha.py
"""
Ohmyomaha scraper - discovers shows we might be missing.
Manual-trigger only, creates pending events for admin review.
"""
import re
import sys
from datetime import datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event

# Venue name mappings (lowercase keys)
# Maps to venue_id in database. Unknown venues go to "other" with venue_name preserved.
VENUE_MAPPINGS = {
    # The Slowdown
    "slowdown": "theslowdown",
    "the slowdown": "theslowdown",
    # Waiting Room
    "waiting room": "waitingroom",
    "waiting room lounge": "waitingroom",
    "the waiting room": "waitingroom",
    # Reverb Lounge
    "reverb": "reverblounge",
    "reverb lounge": "reverblounge",
    # Bourbon Theatre
    "bourbon": "bourbontheatre",
    "bourbon theatre": "bourbontheatre",
    "bourbon theater": "bourbontheatre",
    # The Admiral
    "admiral": "admiral",
    "the admiral": "admiral",
    # The Astro
    "astro": "astrotheater",
    "the astro": "astrotheater",
    "astro theater": "astrotheater",
    "astro theatre": "astrotheater",
    # Steelhouse
    "steelhouse": "steelhouse",
    "steelhouse omaha": "steelhouse",
    "steakhouse omaha": "steelhouse",  # Common typo on ohmyomaha
    # Holland Center
    "holland": "holland",
    "holland center": "holland",
    "holland performing arts center": "holland",
    # Orpheum
    "orpheum": "orpheum",
    "orpheum theater": "orpheum",
    "orpheum theatre": "orpheum",
    # Barnato
    "barnato": "barnato",
}

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

                # Get ticket link if present
                link = li.find("a")
                ticket_url = link.get("href") if link else None

                # Map venue to venue_id
                venue_id = self._map_venue(venue_name)

                # Auto-categorize
                category = self._categorize(title, venue_name)

                # Generate standard ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"{venue_id}-{date}-{slug}"[:80]

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date,
                    time=None,  # ohmyomaha doesn't typically list times
                    venue=venue_name,  # Original venue name for display
                    eventUrl=None,
                    ticketUrl=ticket_url,
                    imageUrl=None,
                    price=None,
                    ageRestriction=None,
                    supportingArtists=None,
                    source=self.id
                ))

            except Exception:
                continue

        return events

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

    def _map_venue(self, venue_name: str) -> str:
        """Map venue name to venue_id."""
        name_lower = venue_name.lower().strip()

        # Exact match first
        if name_lower in VENUE_MAPPINGS:
            return VENUE_MAPPINGS[name_lower]

        # Partial match
        for key, venue_id in VENUE_MAPPINGS.items():
            if key in name_lower or name_lower in key:
                return venue_id

        return "other"

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
def scrape_ohmyomaha() -> list[dict]:
    """
    Scrape ohmyomaha and return events with venue_id and category.
    Returns list of dicts ready for DB insertion.
    """
    scraper = OhMyOmahaScraper()
    events = scraper.scrape()

    result = []
    for event in events:
        venue_id = scraper._map_venue(event.venue)
        category = scraper._categorize(event.title, event.venue)

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
