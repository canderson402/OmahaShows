# scraper/scrapers/opa.py
import re
import sys
import time
from datetime import datetime, date as date_type
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class OPAScraper(BaseScraper):
    """Scraper for Omaha Performing Arts venues via ticketomaha.com.

    Instantiate once per venue. Both instances share a class-level cache
    so the paginated site is only fetched once.
    """

    _cache: list[dict] | None = None
    _cache_time: float = 0

    BASE_URL = "https://ticketomaha.com/events"
    VENUE_MAP = {
        "Holland Performing Arts Center": "holland",
        "Orpheum Theater": "orpheum",
    }

    def __init__(self, venue_name: str, venue_id: str):
        self.name = venue_name
        self.id = venue_id
        self.url = f"https://ticketomaha.com/events?themes%5B%5D=6"

    def scrape(self) -> list[Event]:
        all_raw = self._get_all_events()
        events = []
        for raw in all_raw:
            if raw["venue_id"] != self.id:
                continue
            events.append(Event(
                id=raw["id"],
                title=raw["title"],
                date=raw["date"],
                time=raw["time"],
                venue=self.name,
                eventUrl=raw["event_url"],
                ticketUrl=raw["ticket_url"],
                imageUrl=raw["image_url"],
                price=None,
                ageRestriction=raw["age_restriction"],
                source=self.id,
            ))
        return events

    def parse_events(self, html: str) -> list[Event]:
        # Required by BaseScraper ABC but unused — scrape() handles everything
        return []

    @classmethod
    def _get_all_events(cls) -> list[dict]:
        if cls._cache is not None and (time.time() - cls._cache_time) < 60:
            return cls._cache

        import requests
        from bs4 import BeautifulSoup

        all_raw = []
        page = 1

        while True:
            url = f"{cls.BASE_URL}?start=&end=&themes%5B%5D=6&page={page}"
            try:
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
            except Exception:
                break

            raw_events = cls._parse_page(resp.text)
            if not raw_events:
                break

            all_raw.extend(raw_events)

            soup = BeautifulSoup(resp.text, "html.parser")
            page_options = soup.select("select[name=page] option")
            max_page = max((int(o.get_text(strip=True)) for o in page_options), default=1)
            if page >= max_page:
                break
            page += 1

        cls._cache = all_raw
        cls._cache_time = time.time()
        return all_raw

    @classmethod
    def _parse_page(cls, html: str) -> list[dict]:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        results = []

        for card in soup.select("li.eventCard"):
            try:
                title_el = card.select_one("h3.title")
                title = title_el.get_text(strip=True) if title_el else None
                if not title:
                    continue

                # Determine venue from card text
                full_text = card.get_text(" ", strip=True)
                venue_id = None
                for venue_text, vid in cls.VENUE_MAP.items():
                    if venue_text in full_text:
                        venue_id = vid
                        break
                if not venue_id:
                    continue

                title, age_restriction = cls._extract_age_restriction(title)

                # Date
                start_el = card.select_one(".start")
                date_text = start_el.get_text(strip=True) if start_el else None
                date_str = cls._parse_date(date_text) if date_text else None
                if not date_str:
                    continue

                # Time
                time_el = card.select_one(".time")
                time_str = cls._parse_time(time_el.get_text(strip=True)) if time_el else None

                # Event/ticket URL
                detail_link = card.select_one('a[href^="/events/"]')
                event_url = f"https://ticketomaha.com{detail_link.get('href')}" if detail_link else None

                # Image
                img_el = card.select_one("img")
                image_url = img_el.get("src") if img_el else None

                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"{venue_id}-{date_str}-{slug}"[:80]

                results.append({
                    "id": event_id,
                    "title": title,
                    "date": date_str,
                    "time": time_str,
                    "venue_id": venue_id,
                    "event_url": event_url,
                    "ticket_url": event_url,
                    "image_url": image_url,
                    "age_restriction": age_restriction,
                })
            except Exception:
                continue

        return results

    @staticmethod
    def _parse_date(date_text: str) -> str | None:
        try:
            date_text = date_text.strip()
            # Strip day-of-week prefix and collapse whitespace
            date_text = re.sub(r'^[A-Za-z]{3}\s+', '', date_text)
            date_text = re.sub(r'\s+', ' ', date_text).strip()

            match = re.match(r'([A-Za-z]+)\s+(\d+)', date_text)
            if not match:
                return None

            month_str = match.group(1)
            day = int(match.group(2))
            months = {
                'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
            }
            month = months.get(month_str.lower())
            if not month:
                return None

            year = datetime.now().year
            try:
                event_date = date_type(year, month, day)
                if (date_type.today() - event_date).days > 30:
                    year += 1
            except ValueError:
                return None

            return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            return None

    @staticmethod
    def _parse_time(time_text: str) -> str | None:
        try:
            time_text = time_text.strip().lstrip('-').strip()
            if not time_text or 'Multiple' in time_text:
                return None

            match = re.match(r'(\d{1,2}):(\d{2})\s*(AM|PM)', time_text, re.IGNORECASE)
            if not match:
                return None

            hour = int(match.group(1))
            minute = int(match.group(2))
            period = match.group(3).upper()

            if period == 'PM' and hour != 12:
                hour += 12
            elif period == 'AM' and hour == 12:
                hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None

    @staticmethod
    def _extract_age_restriction(title: str) -> tuple[str, str | None]:
        match = re.search(r'\s*\((\d+\+)\)\s*$', title)
        if match:
            return title[:match.start()].strip(), match.group(1)
        return title, None
