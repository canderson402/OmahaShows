# scraper/scrapers/astrotheater.py
"""
Astro Theater scraper using Playwright for JS-rendered content.
This venue uses WordPress with custom grid layout and Ticketmaster tickets.
"""
import re
import sys
import hashlib
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event

# Path to save downloaded images (relative to repo root)
IMAGES_DIR = Path(__file__).parent.parent.parent / 'public' / 'images' / 'astro'


class AstroTheaterScraper(BaseScraper):
    name = "The Astro"
    id = "astrotheater"
    url = "https://theastrotheater.com/#shows"

    def scrape(self) -> list[Event]:
        """Override scrape to use Playwright instead of requests."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(self.url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(5000)  # Wait for JS to render

            events = self._extract_events(page)
            browser.close()
            return events

    def _extract_events(self, page) -> list[Event]:
        """Extract events from the rendered page."""
        events = []
        seen_ids = set()

        # Get all grid-item elements
        items = page.query_selector_all('.grid-item')

        for item in items:
            try:
                # Title
                title_el = item.query_selector('.grid-item-headline h2')
                title = title_el.inner_text().strip() if title_el else None
                if not title:
                    continue

                # Tour name / tagline (optional)
                tagline_el = item.query_selector('.grid-item-tagline')
                tagline = tagline_el.inner_text().strip() if tagline_el else None

                # Supporting artists
                subheader_el = item.query_selector('.grid-item-subheader')
                supporting_artists = None
                if subheader_el:
                    subheader = subheader_el.inner_text().strip()
                    if subheader and subheader.lower().startswith('with '):
                        artists_str = subheader[5:]
                        # Handle "Artist1, Artist2, & Artist3" format
                        artists_str = artists_str.replace(' & ', ', ')
                        supporting_artists = [a.strip() for a in artists_str.split(',') if a.strip()]

                # Venue (Theater vs Amphitheater)
                venue_el = item.query_selector('.grid-item-location')
                venue_name = venue_el.inner_text().strip() if venue_el else self.name

                # Date and time
                date_el = item.query_selector('.grid-item-date')
                date_str = None
                time_str = None
                if date_el:
                    date_text = date_el.inner_text().strip()
                    date_str, time_str = self._parse_date_time(date_text)
                if not date_str:
                    continue

                # Price and age restriction
                cost_age_el = item.query_selector('.grid-item-cost-age')
                price = None
                age_restriction = None
                if cost_age_el:
                    cost_age_text = cost_age_el.inner_text().strip()
                    price, age_restriction = self._parse_cost_age(cost_age_text)

                # Event URL
                event_url = None
                more_info_el = item.query_selector('.grid-item-more-info a')
                if more_info_el:
                    event_url = more_info_el.get_attribute('href')

                # Ticket URL
                ticket_url = None
                buy_tickets_el = item.query_selector('.grid-item-buy-tickets-btn a')
                if buy_tickets_el:
                    ticket_url = buy_tickets_el.get_attribute('href')

                # Image URL - download locally due to hotlink protection
                image_url = None
                img_el = item.query_selector('.grid-featured-image img')
                if img_el:
                    remote_url = img_el.get_attribute('src')
                    if remote_url:
                        image_url = self._download_image(page, remote_url)

                # Combine title with tagline if present
                display_title = title
                if tagline:
                    display_title = f"{title} - {tagline}"

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"astrotheater-{date_str}-{slug}"[:80]

                if event_id in seen_ids:
                    continue
                seen_ids.add(event_id)

                events.append(Event(
                    id=event_id,
                    title=display_title,
                    date=date_str,
                    time=time_str,
                    venue=venue_name,
                    eventUrl=event_url,
                    ticketUrl=ticket_url,
                    imageUrl=image_url,
                    price=price,
                    ageRestriction=age_restriction,
                    supportingArtists=supporting_artists,
                    source=self.id
                ))
            except Exception:
                continue

        return events

    def _parse_date_time(self, date_text: str) -> tuple[str | None, str | None]:
        """Parse 'Mar 06 @ 8:00 pm' into (YYYY-MM-DD, HH:MM)."""
        try:
            # Pattern: "Mar 06 @ 8:00 pm"
            match = re.match(r'([A-Za-z]+)\s+(\d{1,2})\s*@\s*(\d{1,2}):(\d{2})\s*(am|pm)', date_text, re.I)
            if not match:
                return None, None

            month_str, day_str, hour_str, minute_str, period = match.groups()

            # Parse month
            month_map = {
                'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
            }
            month = month_map.get(month_str.lower()[:3])
            if not month:
                return None, None

            day = int(day_str)
            year = datetime.now().year

            # If date is in the past, assume next year
            today = datetime.now()
            event_date = datetime(year, month, day)
            if event_date < today:
                if (today - event_date).days > 30:
                    year += 1

            date_str = f"{year:04d}-{month:02d}-{day:02d}"

            # Parse time
            hour = int(hour_str)
            minute = int(minute_str)
            if period.lower() == 'pm' and hour != 12:
                hour += 12
            elif period.lower() == 'am' and hour == 12:
                hour = 0

            time_str = f"{hour:02d}:{minute:02d}"

            return date_str, time_str
        except Exception:
            return None, None

    def _download_image(self, page, remote_url: str) -> str | None:
        """Download image locally and return local path."""
        try:
            # Create filename from URL hash
            url_hash = hashlib.md5(remote_url.encode()).hexdigest()[:12]
            ext = Path(remote_url).suffix or '.png'
            filename = f"{url_hash}{ext}"
            local_path = IMAGES_DIR / filename

            # Skip if already downloaded
            if local_path.exists():
                return f"/images/astro/{filename}"

            # Download using Playwright's request context (same session, bypasses protection)
            response = page.request.get(remote_url)
            if response.ok:
                IMAGES_DIR.mkdir(parents=True, exist_ok=True)
                local_path.write_bytes(response.body())
                return f"/images/astro/{filename}"
        except Exception:
            pass
        return None

    def _parse_cost_age(self, text: str) -> tuple[str | None, str | None]:
        """Parse 'Starting at $41.10 | All Ages' into (price, age_restriction)."""
        price = None
        age_restriction = None

        try:
            # Split by pipe
            parts = text.split('|')

            # Price is usually first part
            if parts:
                price_part = parts[0].strip()
                price_match = re.search(r'\$[\d.]+', price_part)
                if price_match:
                    price = price_match.group(0)

            # Age restriction is usually second part
            if len(parts) > 1:
                age_part = parts[1].strip()
                if 'all ages' in age_part.lower():
                    age_restriction = 'All Ages'
                elif '21+' in age_part:
                    age_restriction = '21+'
                elif '18+' in age_part:
                    age_restriction = '18+'

        except Exception:
            pass

        return price, age_restriction

    def fetch_html(self) -> str:
        """Not used - this scraper uses Playwright instead."""
        raise NotImplementedError("Use scrape() directly for JS-rendered sites")

    def parse_events(self, html: str) -> list[Event]:
        """Not used - this scraper uses Playwright instead."""
        raise NotImplementedError("Use scrape() directly for JS-rendered sites")
