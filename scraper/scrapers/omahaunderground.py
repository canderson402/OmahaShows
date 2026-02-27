# scraper/scrapers/omahaunderground.py
import re
import sys
from datetime import datetime
import requests
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.base import BaseScraper
from models import Event

# Venues we already scrape - skip these to avoid duplicates
EXISTING_VENUES = {
    "the slowdown", "slowdown",
    "waiting room", "waiting room lounge",
    "reverb lounge", "reverb",
    "bourbon theatre", "bourbon theater",
    "the admiral", "admiral",
    "the astro", "astro theater", "astro theatre",
    "steel house", "steelhouse", "steelhouse omaha",
}


class OtherVenuesScraper(BaseScraper):
    name = "Other"
    id = "other"
    url = "https://omahaunderground.net/shows/"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def scrape(self) -> list[Event]:
        """Override scrape to fetch detail pages for each show."""
        html = self.fetch_html()
        return self.parse_events(html)

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        # Each show is in a div.show
        for show_div in soup.select("div.show"):
            try:
                # Get venue name to check if we should skip
                venue_link = show_div.select_one("h3 a[href*='/venues/']")
                if not venue_link:
                    continue
                venue_name = venue_link.get_text(strip=True)

                # Skip venues we already scrape
                if venue_name.lower() in EXISTING_VENUES:
                    continue

                # Get detail page URL
                detail_link = show_div.select_one("a[href*='/shows/2']")
                if not detail_link:
                    continue
                detail_url = detail_link.get("href")
                if not detail_url.startswith("http"):
                    detail_url = f"https://omahaunderground.net{detail_url}"

                # Fetch detail page
                event = self._fetch_detail(detail_url, venue_name)
                if event:
                    events.append(event)

            except Exception:
                continue

        return events

    def _fetch_detail(self, url: str, venue_name: str) -> Event | None:
        """Fetch a show detail page and extract event info."""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            soup = self.get_soup(response.text)

            # Date from h2.name (format: "Feb. 27, 2026")
            date_el = soup.select_one("h2.name")
            if not date_el:
                return None
            date_str = self._parse_date(date_el.get_text(strip=True))
            if not date_str:
                return None

            # Title from h1 in below-name div
            title_el = soup.select_one("div.below-name h1")
            title = title_el.get_text(strip=True) if title_el else None
            if not title:
                return None

            # Image
            img_el = soup.select_one("div.below-name img")
            image_url = img_el.get("src") if img_el else None

            # Time and price from h3 in below-name
            time_str = None
            price = None
            info_el = soup.select_one("div.below-name h3")
            if info_el:
                info_text = info_el.get_text(separator=" ", strip=True)
                time_str = self._parse_time(info_text)
                price = self._parse_price(info_text)

            # Generate ID
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            event_id = f"other-{date_str}-{slug}"[:80]

            return Event(
                id=event_id,
                title=title,
                date=date_str,
                time=time_str,
                venue=venue_name,
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

    def _parse_date(self, text: str) -> str | None:
        """Parse 'Feb. 27, 2026' or 'March 7, 2026' to YYYY-MM-DD."""
        try:
            # Handle abbreviated month with period (e.g., "Feb. 27, 2026")
            text = text.replace(".", "")
            try:
                dt = datetime.strptime(text, "%b %d, %Y")
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                pass

            # Handle full month name (e.g., "March 7, 2026")
            try:
                dt = datetime.strptime(text, "%B %d, %Y")
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                pass

            return None
        except Exception:
            return None

    def _parse_time(self, text: str) -> str | None:
        """Extract time like '6 p.m.' or '8:30 p.m.' from text."""
        try:
            # Match patterns like "6 p.m.", "8:30 p.m.", "7pm"
            match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?', text.lower())
            if not match:
                return None

            hour = int(match.group(1))
            minute = int(match.group(2)) if match.group(2) else 0
            period = match.group(3)

            if period == 'p' and hour != 12:
                hour += 12
            elif period == 'a' and hour == 12:
                hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None

    def _parse_price(self, text: str) -> str | None:
        """Extract price like '$10' or '$10 PWYC' from text."""
        try:
            # Normalize whitespace
            text = ' '.join(text.split())

            # Look for dollar amount, optionally with PWYC
            match = re.search(r'\$\d+', text)
            if match:
                price = match.group(0)
                if 'pwyc' in text.lower():
                    return f"{price} PWYC"
                return price
            if 'free' in text.lower():
                return 'Free'
            if 'pwyc' in text.lower() or 'donation' in text.lower():
                return 'PWYC'
            return None
        except Exception:
            return None
