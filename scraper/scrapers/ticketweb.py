# scraper/scrapers/ticketweb.py
"""
Scraper for venues that sell through TicketWeb, reading the venue's TicketWeb page directly
(e.g. https://www.ticketweb.com/venue/barnato-omaha-ne/482015).

The page embeds schema.org MusicEvent JSON-LD for every upcoming show (name, start date/time,
ticket URL, image, performers), so we read that instead of page markup. Venue websites that embed
the TicketWeb widget now load it client-side, which is why we no longer scrape the venue's own site.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event

_LD_JSON = re.compile(r'<script[^>]+type="application/ld\+json"[^>]*>([\s\S]*?)</script>', re.I)
_START = re.compile(r"^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?")


class TicketWebScraper(BaseScraper):
    """Scraper for a TicketWeb venue page (structured data)."""

    def __init__(self, venue_name: str, venue_id: str, venue_page_url: str):
        self.name = venue_name
        self.id = venue_id
        self.url = venue_page_url
        m = re.search(r"/venue/[^/]+/(\d+)", venue_page_url)
        self._venue_number = m.group(1) if m else None

    def parse_events(self, html: str) -> list[Event]:
        events: list[Event] = []
        seen: set[str] = set()
        for item in self._music_events(html):
            event = self._to_event(item)
            if event and event.id not in seen:
                seen.add(event.id)
                events.append(event)
        events.sort(key=lambda e: (e.date, e.time or ""))
        return events

    def _music_events(self, html: str) -> list[dict]:
        items: list[dict] = []
        for block in _LD_JSON.findall(html):
            try:
                data = json.loads(block)
            except ValueError:
                continue
            for item in data if isinstance(data, list) else [data]:
                if isinstance(item, dict) and item.get("@type") in ("MusicEvent", "Event"):
                    items.append(item)
        return items

    def _is_this_venue(self, item: dict) -> bool:
        loc = item.get("location") or {}
        if not isinstance(loc, dict):
            return False
        same_as = str(loc.get("sameAs") or "")
        if self._venue_number and f"/{self._venue_number}" in same_as:
            return True
        return str(loc.get("name") or "").strip().lower() == self.name.lower()

    def _to_event(self, item: dict) -> Event | None:
        title = str(item.get("name") or "").strip()
        start = _START.match(str(item.get("startDate") or ""))
        if not title or not start or not self._is_this_venue(item):
            return None
        date = start.group(1)
        time = f"{start.group(2)}:{start.group(3)}" if start.group(2) else None

        offers = item.get("offers")
        url = item.get("url") or (offers.get("url") if isinstance(offers, dict) else None)
        image = item.get("image")
        if isinstance(image, list):
            image = image[0] if image else None
        if isinstance(image, str):
            image = re.sub(r"(?<!:)//+", "/", image)  # "ticketweb.com//i/..." -> "ticketweb.com/i/..."

        performers = [str(p.get("name")).strip() for p in (item.get("performer") or []) if isinstance(p, dict) and p.get("name")]
        headliner = performers[0].lower() if performers else ""
        supporting = [p for p in performers[1:] if p.lower() != headliner] or None

        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        return Event(
            id=f"{self.id}-{date}-{slug}"[:80],
            title=title,
            date=date,
            time=time,
            venue=self.name,
            eventUrl=url,
            ticketUrl=url,
            imageUrl=image if isinstance(image, str) else None,
            supportingArtists=supporting,
            source=self.id,
        )
