# scraper/scrapers/bourbontheatre.py
import re
import sys
from datetime import datetime
from pathlib import Path
import requests

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class BourbonTheatreScraper(BaseScraper):
    name = "Bourbon Theatre"
    id = "bourbontheatre"
    url = "https://www.bourbontheatre.com/calendar/"

    def fetch_html(self) -> str:
        response = requests.get(self.url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []
        seen_ids = set()

        for popup in soup.select('.tw-cal-event-popup'):
            try:
                # Title and event URL
                name_link = popup.select_one('.tw-name a')
                if not name_link:
                    continue
                title = name_link.get_text(strip=True)
                event_url = name_link.get('href')
                if not title:
                    continue

                # Date
                date_el = popup.select_one('.tw-event-date')
                if not date_el:
                    continue
                date_str = self._parse_date(date_el.get_text(strip=True))
                if not date_str:
                    continue

                # Time (format: "19:00 pm" or "20:00 pm")
                time_el = popup.select_one('.tw-event-time-complete')
                time_str = self._parse_time(time_el.get_text(strip=True)) if time_el else None

                # Price
                price_el = popup.select_one('.tw-price')
                price = price_el.get_text(strip=True) if price_el else None

                # Ticket URL from buy button
                buy_el = popup.select_one('a.tw-buy-tix-btn')
                ticket_url = buy_el.get('href') if buy_el else None

                # Image
                img_el = popup.select_one('img')
                image_url = img_el.get('src') if img_el else None

                # Age restriction
                age_el = popup.select_one('.tw-age-restriction')
                age = age_el.get_text(strip=True) if age_el else None

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"bourbontheatre-{date_str}-{slug}"[:80]

                if event_id in seen_ids:
                    continue
                seen_ids.add(event_id)

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
                    ageRestriction=age,
                    source=self.id,
                ))
            except Exception:
                continue

        return events

    def _parse_date(self, date_text: str) -> str | None:
        """Parse date like 'February 27, 2026' to YYYY-MM-DD."""
        try:
            date_text = date_text.strip()
            for fmt in ("%B %d, %Y", "%b %d, %Y"):
                try:
                    return datetime.strptime(date_text, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return None
        except Exception:
            return None

    def _parse_time(self, time_text: str) -> str | None:
        """Convert time like '19:00 pm' or '7:00 PM' to HH:MM 24-hour."""
        if not time_text:
            return None
        try:
            time_text = time_text.strip()
            # Handle "19:00 pm" format (already 24h with spurious am/pm)
            match = re.match(r'(\d{1,2}):(\d{2})\s*(am|pm)?', time_text, re.I)
            if not match:
                return None

            hour = int(match.group(1))
            minute = int(match.group(2))
            period = (match.group(3) or '').upper()

            # If hour > 12, it's already 24-hour format, ignore am/pm
            if hour <= 12 and period:
                if period == 'PM' and hour != 12:
                    hour += 12
                elif period == 'AM' and hour == 12:
                    hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None
