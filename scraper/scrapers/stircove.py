# scraper/scrapers/stircove.py
import json
import re
import sys
from datetime import datetime
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class StirCoveScraper(BaseScraper):
    name = "Stir Concert Cove"
    id = "stircove"
    url = "https://www.stircoveamp.com/events/"

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []
        current_year = datetime.now().year

        # Extract images from JSON-LD structured data
        image_map = self._extract_images_from_jsonld(soup)

        for card in soup.select("div.card"):
            try:
                # Title
                title_el = card.select_one("h5.title")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                if not title:
                    continue

                # Date - month and day from separate elements
                month_el = card.select_one("p.month")
                day_el = card.select_one("p.day")
                if not month_el or not day_el:
                    continue

                month_str = month_el.get_text(strip=True)
                day_str = day_el.get_text(strip=True)
                date_str = self._parse_date(month_str, day_str, current_year)
                if not date_str:
                    continue

                # Event URL (info link)
                event_url = None
                info_link = card.select_one("a.btn-outline")
                if info_link:
                    href = info_link.get("href")
                    if href:
                        if href.startswith("/"):
                            event_url = f"https://www.stircoveamp.com{href}"
                        else:
                            event_url = href

                # Ticket URL
                ticket_url = None
                ticket_link = card.select_one("a.btn-blue")
                if ticket_link:
                    href = ticket_link.get("href")
                    if href:
                        if href.startswith("/"):
                            ticket_url = f"https://www.stircoveamp.com{href}"
                        else:
                            ticket_url = href

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"stircove-{date_str}-{slug}"[:80]

                # Look up image from JSON-LD data
                image_url = image_map.get(title.lower().strip())

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date_str,
                    time=None,  # Times not listed on events page
                    venue=self.name,
                    eventUrl=event_url,
                    ticketUrl=ticket_url,
                    imageUrl=image_url,
                    price=None,
                    ageRestriction=None,
                    supportingArtists=None,
                    source=self.id
                ))
            except Exception:
                continue

        return events

    def _parse_date(self, month_str: str, day_str: str, current_year: int) -> str | None:
        """Convert month name and day to YYYY-MM-DD format."""
        try:
            month_map = {
                'jan': 1, 'january': 1,
                'feb': 2, 'february': 2,
                'mar': 3, 'march': 3,
                'apr': 4, 'april': 4,
                'may': 5,
                'jun': 6, 'june': 6,
                'jul': 7, 'july': 7,
                'aug': 8, 'august': 8,
                'sep': 9, 'september': 9,
                'oct': 10, 'october': 10,
                'nov': 11, 'november': 11,
                'dec': 12, 'december': 12,
            }

            month = month_map.get(month_str.lower().strip())
            if not month:
                return None

            day = int(day_str.strip())
            year = current_year

            # If date is in the past, assume next year
            today = datetime.now()
            event_date = datetime(year, month, day)
            if event_date < today:
                if (today - event_date).days > 30:
                    year += 1

            return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            return None

    def _extract_images_from_jsonld(self, soup) -> dict[str, str]:
        """Extract event images from JSON-LD structured data.

        Returns a dict mapping lowercase event name to image URL.
        """
        image_map = {}

        for script in soup.select('script[type="application/ld+json"]'):
            try:
                data = json.loads(script.string)

                # Handle both single objects and arrays
                items = data if isinstance(data, list) else [data]

                for item in items:
                    if item.get("@type") == "Event":
                        name = item.get("name", "").lower().strip()
                        image = item.get("image", "")
                        if name and image:
                            image_map[name] = image
            except (json.JSONDecodeError, TypeError, AttributeError):
                continue

        return image_map
