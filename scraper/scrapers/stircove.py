# scraper/scrapers/stircove.py
"""
Stir Concert Cove scraper.
Scrapes event data directly from the official Caesars/Harrah's website.
"""
import re
import sys
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class StirCoveScraper(BaseScraper):
    name = "Stir Concert Cove"
    id = "stircove"
    url = "https://www.caesars.com/harrahs-council-bluffs/shows"

    def scrape(self) -> list[Event]:
        """Use Playwright to scrape events from the official Caesars site."""
        events = []

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=['--disable-blink-features=AutomationControlled']
                )
                context = browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                )
                page = context.new_page()

                # Anti-detection
                page.add_init_script('Object.defineProperty(navigator, "webdriver", {get: () => undefined});')

                # Navigate to Caesars shows page
                page.goto(self.url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(10000)  # Wait for JS to render

                # Scroll to load lazy content
                for i in range(8):
                    page.evaluate(f'window.scrollTo(0, {1000 * (i+1)})')
                    page.wait_for_timeout(1000)

                # Try to find event cards/tiles on the page
                # Caesars uses various card structures for events
                event_cards = page.query_selector_all('[data-testid="event-card"], .event-card, .show-card, [class*="EventCard"], [class*="ShowCard"]')

                if event_cards:
                    for card in event_cards:
                        try:
                            event = self._parse_event_card(card)
                            if event:
                                events.append(event)
                        except Exception:
                            continue
                else:
                    # Fallback: parse from page content using regex patterns
                    content = page.content()
                    events = self._parse_events_from_html(content)

                browser.close()

        except Exception as e:
            print(f"Error scraping Stir Cove from Caesars: {e}")

        return events

    def _parse_event_card(self, card) -> Event | None:
        """Parse an individual event card element."""
        try:
            # Try to get title
            title_el = card.query_selector('h2, h3, h4, [class*="title"], [class*="Title"], [class*="name"], [class*="Name"]')
            if not title_el:
                return None
            title = title_el.inner_text().strip()
            if not title:
                return None

            # Try to get date
            date_el = card.query_selector('[class*="date"], [class*="Date"], time')
            date_str = None
            if date_el:
                date_text = date_el.inner_text().strip()
                date_str = self._parse_date_text(date_text)

            if not date_str:
                return None

            # Try to get image
            img_el = card.query_selector('img')
            image_url = None
            if img_el:
                image_url = img_el.get_attribute('src') or img_el.get_attribute('data-src')

            # Try to get ticket link
            ticket_el = card.query_selector('a[href*="ticketmaster"], a[href*="tickets"]')
            ticket_url = None
            if ticket_el:
                ticket_url = ticket_el.get_attribute('href')

            # Try to get event info link
            event_url = None
            link_el = card.query_selector('a[href*="shows"], a[href*="event"]')
            if link_el:
                href = link_el.get_attribute('href')
                if href and not 'ticketmaster' in href:
                    if href.startswith('/'):
                        event_url = f"https://www.caesars.com{href}"
                    else:
                        event_url = href

            # Generate ID
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            event_id = f"stircove-{date_str}-{slug}"[:80]

            return Event(
                id=event_id,
                title=title,
                date=date_str,
                time=None,
                venue=self.name,
                eventUrl=event_url,
                ticketUrl=ticket_url,
                imageUrl=image_url,
                price=None,
                ageRestriction=None,
                supportingArtists=None,
                source=self.id
            )
        except Exception:
            return None

    def _parse_events_from_html(self, content: str) -> list[Event]:
        """Fallback: parse events from raw HTML content using patterns."""
        events = []
        current_year = datetime.now().year

        # Find Stir Cove specific images and nearby data
        # Images have patterns like: cou-shows-stir-cove-ARTIST or cou-entertainment-ARTIST
        img_pattern = re.compile(
            r'(https://assets\.caesars\.com/[^"\']+?cou-(?:shows-stir-cove-|entertainment-)?([a-z0-9-]+?)(?:-\d+x\d+)?\.(jpg|jpeg|png|webp))',
            re.I
        )

        seen_artists = set()

        for match in img_pattern.finditer(content):
            img_url = match.group(1)
            artist_slug = match.group(2)

            # Skip thumbnails and non-event images
            if '/thul-' in img_url or '/mini-' in img_url:
                continue
            if artist_slug in ['exterior', 'header', 'hero', 'banner', 'logo']:
                continue

            artist_name = artist_slug.replace('-', ' ').title().strip()
            if not artist_name or artist_name.lower() in seen_artists:
                continue
            seen_artists.add(artist_name.lower())

            # Look for date near the image (within surrounding context)
            start_pos = max(0, match.start() - 2000)
            end_pos = min(len(content), match.end() + 2000)
            nearby = content[start_pos:end_pos]

            # Try to find a date
            date_str = self._find_date_in_context(nearby, current_year)

            # Look for Ticketmaster link
            tm_match = re.search(r'(https://www\.ticketmaster\.com/event/[A-Z0-9]+)', nearby)
            ticket_url = tm_match.group(1) if tm_match else None

            # If no date found, try to extract from structured data or skip
            if not date_str:
                # Try JSON-LD in the content
                jsonld_match = re.search(
                    rf'"name"\s*:\s*"[^"]*{re.escape(artist_slug.replace("-", "."))}[^"]*"[^}}]*"startDate"\s*:\s*"(\d{{4}}-\d{{2}}-\d{{2}})',
                    nearby, re.I
                )
                if jsonld_match:
                    date_str = jsonld_match.group(1)

            if not date_str:
                continue

            # Generate ID
            slug = re.sub(r'[^a-z0-9]+', '-', artist_name.lower()).strip('-')
            event_id = f"stircove-{date_str}-{slug}"[:80]

            events.append(Event(
                id=event_id,
                title=artist_name,
                date=date_str,
                time=None,
                venue=self.name,
                eventUrl=f"https://www.caesars.com/harrahs-council-bluffs/shows",
                ticketUrl=ticket_url,
                imageUrl=img_url,
                price=None,
                ageRestriction=None,
                supportingArtists=None,
                source=self.id
            ))

        return events

    def _find_date_in_context(self, text: str, current_year: int) -> str | None:
        """Try to find and parse a date from surrounding text context."""
        # Pattern for dates like "May 24", "June 15, 2026", "6/15/2026", etc.
        patterns = [
            # "May 24, 2026" or "May 24"
            r'(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?',
            # "2026-05-24"
            r'(\d{4})-(\d{2})-(\d{2})',
        ]

        month_map = {
            'jan': 1, 'january': 1, 'feb': 2, 'february': 2, 'mar': 3, 'march': 3,
            'apr': 4, 'april': 4, 'may': 5, 'jun': 6, 'june': 6, 'jul': 7, 'july': 7,
            'aug': 8, 'august': 8, 'sep': 9, 'september': 9, 'oct': 10, 'october': 10,
            'nov': 11, 'november': 11, 'dec': 12, 'december': 12
        }

        # Try "Month Day, Year" pattern
        match = re.search(patterns[0], text, re.I)
        if match:
            month_str = match.group(1).lower()
            day = int(match.group(2))
            year = int(match.group(3)) if match.group(3) else current_year

            month = month_map.get(month_str[:3])
            if month:
                # Adjust year if date is in the past
                try:
                    event_date = datetime(year, month, day)
                    today = datetime.now()
                    if event_date < today and (today - event_date).days > 30:
                        year += 1
                    return f"{year:04d}-{month:02d}-{day:02d}"
                except ValueError:
                    pass

        # Try ISO date pattern
        match = re.search(patterns[1], text)
        if match:
            return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"

        return None

    def _parse_date_text(self, date_text: str) -> str | None:
        """Parse a date from text like 'May 24, 2026' or 'Saturday, May 24'."""
        current_year = datetime.now().year
        return self._find_date_in_context(date_text, current_year)

    def parse_events(self, html: str) -> list[Event]:
        """Required by base class but we override scrape() instead."""
        return []
