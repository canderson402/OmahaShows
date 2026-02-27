# scraper/scrapers/reverblounge.py
import re
import sys
from datetime import datetime
from pathlib import Path
import requests
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class ReverbLoungeScraper(BaseScraper):
    name = "Reverb Lounge"
    id = "reverblounge"
    url = "https://reverblounge.com/events/"

    # User-Agent header required to avoid 403 from their server
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    def fetch_html(self) -> str:
        """Fetch HTML from the venue's events page with proper headers."""
        response = requests.get(self.url, headers=self.headers, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        # Event cards are in div.eventWrapper.rhpSingleEvent
        for card in soup.select("div.eventWrapper.rhpSingleEvent"):
            try:
                # Title - h2 with class containing rhp-event__title
                title_el = card.select_one('h2[class*="rhp-event__title"]')
                title = title_el.get_text(strip=True) if title_el else None
                if not title:
                    continue

                # Date - div.eventMonth.singleEventDate (format: "Thu, Feb 26")
                date_el = card.select_one('.eventMonth.singleEventDate, .singleEventDate')
                date_str = self._parse_date(date_el.get_text(strip=True)) if date_el else None
                if not date_str:
                    continue

                # Event URL - the detail page on venue's site
                event_info_el = card.select_one('.eventMoreInfo a')
                event_url = event_info_el.get("href") if event_info_el else None

                # Ticket URL - look for etix link (external ticket purchase)
                ticket_el = card.select_one('a[href*="etix.com"]')
                ticket_url = ticket_el.get("href") if ticket_el else None

                # Image URL
                img_el = card.select_one('img.eventListImage, img[class*="rhp-event__image"]')
                image_url = img_el.get("src") if img_el else None

                # Price - span.rhp-event__cost-text--list
                price_el = card.select_one('.rhp-event__cost-text--list')
                price = price_el.get_text(strip=True) if price_el else None

                # Age restriction - div.eventAgeRestriction
                age_el = card.select_one('.eventAgeRestriction')
                age_restriction = age_el.get_text(strip=True) if age_el else None

                # Time - span.rhp-event__time-text--list (formats: "Show: 7:30 pm" or "Doors: 7 pm // Show: 8 pm")
                time_el = card.select_one('.rhp-event__time-text--list')
                time_str = self._parse_time(time_el.get_text(strip=True)) if time_el else None

                # Supporting Artists - look for h4 with "with Artist, Artist"
                supporting_artists = None
                for h4 in card.select("h4"):
                    h4_text = h4.get_text(strip=True)
                    if h4_text.lower().startswith("with "):
                        artists_str = h4_text[5:]  # Remove "with "
                        supporting_artists = [a.strip() for a in artists_str.split(',') if a.strip()]
                        break

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"reverblounge-{date_str}-{slug}"[:80]

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
                    source=self.id,
                    supportingArtists=supporting_artists if supporting_artists else None,
                ))
            except Exception:
                continue  # Skip malformed events

        return events

    def _parse_date(self, date_text: str) -> str | None:
        """Convert date text like 'Thu, Feb 26' to YYYY-MM-DD format."""
        try:
            # Clean up the date text - format is typically "Thu, Feb 26"
            # Remove day of week and comma
            date_text = date_text.strip()

            # Handle format "Thu, Feb 26" or "Sat, Mar 06"
            if ',' in date_text:
                date_text = date_text.split(',')[1].strip()

            parts = date_text.split()
            if len(parts) >= 2:
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
        """Convert time text like 'Show: 7:30 pm' or 'Doors: 7 pm // Show: 8 pm' to HH:MM format (24-hour).

        Extracts the show time if available, otherwise the doors time.
        """
        try:
            time_text = time_text.strip()

            # Try to find "Show:" time first
            show_match = re.search(r'Show:\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)', time_text, re.IGNORECASE)
            if show_match:
                return self._convert_time(show_match.group(1), show_match.group(2))

            # Fall back to "Doors:" time
            doors_match = re.search(r'Doors:\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)', time_text, re.IGNORECASE)
            if doors_match:
                return self._convert_time(doors_match.group(1), doors_match.group(2))

            # Try generic time pattern
            generic_match = re.search(r'(\d{1,2}(?::\d{2})?)\s*(am|pm)', time_text, re.IGNORECASE)
            if generic_match:
                return self._convert_time(generic_match.group(1), generic_match.group(2))

            return None
        except Exception:
            return None

    def _convert_time(self, time_str: str, period: str) -> str:
        """Convert time like '7:30' or '7' with period 'pm' to 24-hour format HH:MM."""
        if ':' in time_str:
            hour, minute = map(int, time_str.split(':'))
        else:
            hour = int(time_str)
            minute = 0

        period = period.upper()
        if period == 'PM' and hour != 12:
            hour += 12
        elif period == 'AM' and hour == 12:
            hour = 0

        return f"{hour:02d}:{minute:02d}"
