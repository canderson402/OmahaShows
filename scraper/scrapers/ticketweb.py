# scraper/scrapers/ticketweb.py
"""
Generic scraper for venues that embed a TicketWeb widget on their own site.
Works with .tw-section containers. Handles pagination via ?twpage= parameter.
"""
import re
import sys
from datetime import datetime
from pathlib import Path
import requests

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class TicketWebScraper(BaseScraper):
    """Scraper for venue sites with embedded TicketWeb widgets."""

    def __init__(self, venue_name: str, venue_id: str, events_url: str):
        self.name = venue_name
        self.id = venue_id
        self.url = events_url

    def fetch_html(self) -> str:
        response = requests.get(self.url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def scrape(self) -> list[Event]:
        all_events = []
        seen_ids = set()
        page = 0

        while True:
            url = self.url if page == 0 else f"{self.url}?twpage={page}"
            try:
                response = requests.get(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }, timeout=self.timeout)
                response.raise_for_status()
            except Exception:
                break

            events = self.parse_events(response.text)
            if not events:
                break

            for e in events:
                if e.id not in seen_ids:
                    seen_ids.add(e.id)
                    all_events.append(e)

            # Check for next page
            soup = self.get_soup(response.text)
            next_links = soup.select('a[href*="twpage"]')
            next_page = None
            for link in next_links:
                if 'Next' in link.get_text():
                    match = re.search(r'twpage=(\d+)', link.get('href', ''))
                    if match:
                        next_page = int(match.group(1))
            if next_page is not None and next_page > page:
                page = next_page
            else:
                break

        return all_events

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []
        seen_ids = set()

        containers = soup.select('.tw-section')

        for container in containers:
            try:
                # Title and event URL
                name_link = container.select_one('.tw-name a')
                if not name_link:
                    continue
                title = name_link.get_text(strip=True)
                event_url = name_link.get('href')
                if not title:
                    continue

                # Date
                date_el = container.select_one('.tw-event-date')
                if not date_el:
                    continue
                date_str = self._parse_date(date_el.get_text(strip=True))
                if not date_str:
                    continue

                # Time
                time_el = container.select_one('.tw-event-time-complete, .tw-event-time')
                time_str = self._parse_time(time_el.get_text(strip=True)) if time_el else None

                # Price
                price_el = container.select_one('.tw-price')
                price = price_el.get_text(strip=True) if price_el else None

                # Ticket URL
                buy_el = container.select_one('a.tw-buy-tix-btn')
                ticket_url = buy_el.get('href') if buy_el else None

                # Image (check data-lazy-src for lazy-loaded images)
                img_el = container.select_one('img')
                image_url = None
                if img_el:
                    image_url = img_el.get('data-lazy-src') or img_el.get('src')
                    if image_url and image_url.startswith('data:'):
                        image_url = None

                # Age restriction
                age_el = container.select_one('.tw-age-restriction')
                age = age_el.get_text(strip=True) if age_el else None

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"{self.id}-{date_str}-{slug}"[:80]

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
        if not time_text:
            return None
        try:
            time_text = time_text.strip().lstrip('-').strip()
            match = re.match(r'(\d{1,2}):(\d{2})\s*(am|pm)?', time_text, re.I)
            if not match:
                match = re.match(r'(\d{1,2})\s*(AM|PM)', time_text, re.I)
                if not match:
                    return None
                hour, minute = int(match.group(1)), 0
                period = match.group(2).upper()
            else:
                hour = int(match.group(1))
                minute = int(match.group(2))
                period = (match.group(3) or '').upper()

            if hour <= 12 and period:
                if period == 'PM' and hour != 12:
                    hour += 12
                elif period == 'AM' and hour == 12:
                    hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None
