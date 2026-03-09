# scraper/scrapers/omahaunderground.py
import re
import sys
from datetime import datetime
from pathlib import Path
import requests
sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event
from venue_matcher import VenueMatcher
from matching import find_existing_event


class OtherVenuesScraper(BaseScraper):
    name = "Other"
    id = "other"
    url = "https://omahaunderground.net/shows/"

    def __init__(self, supabase_client=None, venue_matcher=None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.supabase = supabase_client
        self.venue_matcher = venue_matcher

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

                # Try to match venue to an official venue
                matched_venue_id = None
                if self.venue_matcher:
                    match_result = self.venue_matcher.match(venue_name)
                    if match_result:
                        matched_venue_id = match_result[0]  # (venue_id, match_type)

                # Get detail page URL
                detail_link = show_div.select_one("a[href*='/shows/2']")
                if not detail_link:
                    continue
                detail_url = detail_link.get("href")
                if not detail_url.startswith("http"):
                    detail_url = f"https://omahaunderground.net{detail_url}"

                # Fetch detail page (dedup handled inside)
                event = self._fetch_detail(detail_url, venue_name, matched_venue_id)
                if event:
                    events.append(event)

            except Exception:
                continue

        return events

    def _fetch_detail(self, url: str, venue_name: str, matched_venue_id: str | None = None) -> Event | None:
        """Fetch a show detail page and extract event info.

        Args:
            url: Detail page URL
            venue_name: Raw venue name from scraper
            matched_venue_id: Official venue ID if matched, None otherwise

        Returns:
            Event object or None if skipped (duplicate) or error
        """
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

            # If matched to official venue, check for existing event
            if matched_venue_id and self.supabase:
                existing_events = self._get_events_for_venue_date(matched_venue_id, date_str)
                # Create a temp event object for matching
                temp_event = Event(
                    id="temp",
                    title=title,
                    date=date_str,
                    time=None,
                    venue=venue_name,
                    eventUrl=url,
                    ticketUrl=None,
                    imageUrl=None,
                    price=None,
                    ageRestriction=None,
                    supportingArtists=None,
                    source=self.id
                )
                if find_existing_event(temp_event, existing_events):
                    # Duplicate found - skip this event
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

            # Determine venue_id and venue_name for the event
            # If matched to official venue, use that venue_id
            # Otherwise, use "other" with the raw venue name
            if matched_venue_id:
                final_venue_id = matched_venue_id
                final_venue_name = None  # Don't need venue_name for official venues
            else:
                final_venue_id = "other"
                final_venue_name = venue_name

            # Generate ID
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            event_id = f"{final_venue_id}-{date_str}-{slug}"[:80]

            return Event(
                id=event_id,
                title=title,
                date=date_str,
                time=time_str,
                venue=final_venue_name,  # Only set for "other" venues
                eventUrl=url,
                ticketUrl=None,
                imageUrl=image_url,
                price=price,
                ageRestriction=None,
                supportingArtists=None,
                source=final_venue_id  # Use matched venue_id as source
            )
        except Exception:
            return None

    def _get_events_for_venue_date(self, venue_id: str, event_date: str) -> list[dict]:
        """Query existing events for a venue on a specific date."""
        if not self.supabase:
            return []
        result = self.supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
        return result.data or []

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
