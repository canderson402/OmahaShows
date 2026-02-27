# scraper/scrapers/theslowdown.py
import re
import sys
from datetime import datetime
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.base import BaseScraper
from models import Event

class SlowdownScraper(BaseScraper):
    name = "The Slowdown"
    id = "theslowdown"
    url = "https://theslowdown.com/events/"

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        for card in soup.select(".seetickets-list-event-container"):
            try:
                # Title
                title_el = card.select_one(".title a")
                title = title_el.get_text(strip=True) if title_el else None
                if not title:
                    continue

                # Event URL - the detail page on Slowdown's site
                event_url = title_el.get("href") if title_el else None

                # Ticket URL - look for separate buy tickets link
                ticket_el = card.select_one('a.buy-button, a[href*="ticket"], a[href*="etix.com"]')
                ticket_url = ticket_el.get("href") if ticket_el else None

                # Date - parse from the date element (format: "Fri Feb 27", "Tue Mar 3")
                date_el = card.select_one(".date")
                date_str = self._parse_date(date_el.get_text(strip=True)) if date_el else None
                if not date_str:
                    continue

                # Image
                img_el = card.select_one("img.seetickets-list-view-event-image")
                image_url = img_el.get("src") if img_el else None

                # Price
                price_el = card.select_one(".price")
                price = price_el.get_text(strip=True) if price_el else None

                # Age restriction
                ages_el = card.select_one(".ages")
                age_restriction = ages_el.get_text(strip=True) if ages_el else None

                # Show time (format: "8:00PM")
                showtime_el = card.select_one(".see-showtime")
                time_str = self._parse_time(showtime_el.get_text(strip=True)) if showtime_el else None

                # Supporting Artists - look for supporting-talent element or "Supporting Talent:" text
                supporting_artists = None
                supporting_el = card.select_one(".supporting-talent")
                if supporting_el:
                    text = supporting_el.get_text(strip=True)
                    if text.startswith("Supporting Talent:"):
                        artists_str = text.replace("Supporting Talent:", "").strip()
                        if artists_str:
                            supporting_artists = [a.strip() for a in artists_str.split(',') if a.strip()]

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"theslowdown-{date_str}-{slug}"[:80]

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date_str,
                    time=time_str,
                    venue=self.name,
                    eventUrl=event_url,
                    ticketUrl=ticket_url,
                    imageUrl=image_url,
                    price=price,
                    ageRestriction=age_restriction,
                    supportingArtists=supporting_artists if supporting_artists else None,
                    source=self.id
                ))
            except Exception:
                continue  # Skip malformed events

        return events

    def _parse_date(self, date_text: str) -> str | None:
        """Convert date text like 'Fri Feb 27' or 'Tue Mar 3' to YYYY-MM-DD format."""
        try:
            # Clean up the date text - remove day of week if present
            # Format is typically "Fri Feb 27" or "Tue Mar 3"
            parts = date_text.split()
            if len(parts) >= 3:
                # Has day of week prefix, e.g., "Fri Feb 27"
                month_str = parts[1]
                day_str = parts[2]
            elif len(parts) == 2:
                # No day of week, e.g., "Feb 27"
                month_str = parts[0]
                day_str = parts[1]
            else:
                return None

            # Parse month
            month_map = {
                'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
            }
            month = month_map.get(month_str)
            if not month:
                return None

            day = int(day_str)
            year = datetime.now().year

            # If the date appears to be in the past, assume next year
            today = datetime.now()
            event_date = datetime(year, month, day)
            if event_date < today - datetime.resolution:
                # Allow some buffer for events today or recently passed
                if (today - event_date).days > 30:
                    year += 1

            return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            return None

    def _parse_time(self, time_text: str) -> str | None:
        """Convert time text like '8:00PM' to HH:MM format (24-hour)."""
        try:
            # Parse time like "8:00PM" or "7:00PM"
            time_text = time_text.strip().upper()
            match = re.match(r'(\d{1,2}):(\d{2})(AM|PM)', time_text)
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
