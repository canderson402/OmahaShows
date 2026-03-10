# scraper/scrapers/baxterarena.py
import re
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class BaxterArenaScraper(BaseScraper):
    name = "Baxter Arena"
    id = "baxterarena"
    # We'll scrape both concerts and comedy pages
    url = "https://www.baxterarena.com/events/category/concerts/"
    comedy_url = "https://www.baxterarena.com/events/category/comedy/list/"

    def scrape(self) -> list[Event]:
        """Override to scrape multiple pages (concerts + comedy)."""
        events = []

        # Scrape concerts
        try:
            html = self.fetch_html()
            events.extend(self.parse_events(html))
        except Exception:
            pass

        # Scrape comedy
        try:
            import requests
            response = requests.get(self.comedy_url, timeout=self.timeout)
            response.raise_for_status()
            comedy_events = self.parse_events(response.text, category="comedy")
            # Dedupe by ID
            existing_ids = {e.id for e in events}
            for event in comedy_events:
                if event.id not in existing_ids:
                    events.append(event)
        except Exception:
            pass

        return events

    def parse_events(self, html: str, category: str = "music") -> list[Event]:
        soup = self.get_soup(html)
        events = []

        for card in soup.select(".tribe-events-calendar-list__event-row"):
            try:
                # Title and event URL
                title_el = card.select_one(".tribe-events-calendar-list__event-title a")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                if not title:
                    continue
                event_url = title_el.get("href")

                # Date from datetime attribute
                time_el = card.select_one("time.tribe-events-calendar-list-datetime-wrapper")
                if not time_el:
                    continue
                date_str = time_el.get("datetime")  # Format: 2026-03-22
                if not date_str:
                    continue

                # Time from span.time
                time_span = card.select_one("span.time")
                time_str = None
                if time_span:
                    time_text = time_span.get_text(strip=True)
                    time_str = self._parse_time(time_text)

                # Image
                img_el = card.select_one("a.event-thumbnail img")
                image_url = img_el.get("src") if img_el else None

                # Ticket URL - look for "Buy tickets" link
                ticket_el = card.select_one('a[href*="ticketmaster"], a.tribe-common-c-btn:not(.btn-secondary)')
                ticket_url = None
                if ticket_el and "More Info" not in ticket_el.get_text():
                    ticket_url = ticket_el.get("href")

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"baxterarena-{date_str}-{slug}"[:80]

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date_str,
                    time=time_str,
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

    def _parse_time(self, time_text: str) -> str | None:
        """Convert time text like '7:00 PM' to HH:MM format (24-hour)."""
        try:
            # Clean up - remove icon text if present
            time_text = time_text.strip().upper()
            match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)', time_text)
            if not match:
                return None

            hour = int(match.group(1))
            minute = int(match.group(2))
            period = match.group(3)

            # Convert to 24-hour format
            if period == 'PM' and hour != 12:
                hour += 12
            elif period == 'AM' and hour == 12:
                hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None
