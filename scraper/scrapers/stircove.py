# scraper/scrapers/stircove.py
"""
Stir Concert Cove scraper.
Uses stircoveamp.com for event data and Playwright to fetch images + Ticketmaster links from caesars.com
(stircoveamp.com ticket links go to a scam site, so we use real Ticketmaster links from Caesars)
"""
import json
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
    url = "https://www.stircoveamp.com/events/"
    caesars_url = "https://www.caesars.com/harrahs-council-bluffs/shows"

    def scrape(self) -> list[Event]:
        """Override to use Playwright for images and Ticketmaster links from Caesars."""
        # First, fetch event data from stircoveamp.com (simple HTML)
        html = self.fetch_html()
        events = self.parse_events(html)

        # Then use Playwright to get images AND ticket URLs from Caesars
        # (stircoveamp.com ticket links redirect to a scam site)
        caesars_data = self._fetch_caesars_data()

        # Match images and ticket URLs to events
        for event in events:
            event_title_lower = event.title.lower().strip()
            for caesars_title, data in caesars_data.items():
                if self._titles_match(event_title_lower, caesars_title):
                    # Use Caesars image if we don't have one
                    if not event.imageUrl and data.get('image'):
                        event.imageUrl = data['image']
                    # Always use Ticketmaster link instead of scam site
                    if data.get('ticket_url'):
                        event.ticketUrl = data['ticket_url']
                    break

        return events

    def _titles_match(self, title1: str, title2: str) -> bool:
        """Check if two event titles likely refer to the same event."""
        # Normalize titles
        t1 = re.sub(r'[^a-z0-9\s]', '', title1.lower())
        t2 = re.sub(r'[^a-z0-9\s]', '', title2.lower())

        # Check if one contains the other
        if t1 in t2 or t2 in t1:
            return True

        # Check without spaces (handles "lilbigtown" vs "little big town")
        t1_nospace = t1.replace(' ', '')
        t2_nospace = t2.replace(' ', '')
        if t1_nospace in t2_nospace or t2_nospace in t1_nospace:
            return True

        # Handle common abbreviations
        abbreviations = {'little': 'lil', 'lil': 'little'}
        t1_expanded = t1_nospace
        t2_expanded = t2_nospace
        for full, abbr in abbreviations.items():
            t1_expanded = t1_expanded.replace(full, abbr)
            t2_expanded = t2_expanded.replace(full, abbr)
        if t1_expanded in t2_expanded or t2_expanded in t1_expanded:
            return True

        # Check for significant word overlap
        words1 = set(t1.split())
        words2 = set(t2.split())
        # Remove common words
        stopwords = {'the', 'a', 'an', 'and', 'or', 'with', 'at', 'in', 'on', 'for'}
        words1 = words1 - stopwords
        words2 = words2 - stopwords

        if not words1 or not words2:
            return False

        overlap = words1 & words2
        # If more than half the words match, consider it a match
        return len(overlap) >= min(len(words1), len(words2)) * 0.5

    def _fetch_caesars_data(self) -> dict[str, dict]:
        """Use Playwright to fetch images and Ticketmaster links from Caesars site.

        Returns dict mapping artist name -> {'image': url, 'ticket_url': url}
        """
        data_map = {}

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
                page.goto(self.caesars_url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(10000)  # Wait for JS to render

                # Scroll to load lazy content
                for i in range(5):
                    page.evaluate(f'window.scrollTo(0, {1000 * (i+1)})')
                    page.wait_for_timeout(1000)

                content = page.content()

                # Find Council Bluffs event images (cou- prefix) and nearby Ticketmaster links
                img_matches = list(re.finditer(r'cou-(?:entertainment-|shows-stir-cove-)?([a-z0-9-]+?)(?:-\d+x\d+)?\.(jpg|jpeg|png|webp)', content, re.I))

                for img_match in img_matches:
                    full_match = img_match.group(0)
                    artist_slug = img_match.group(1)

                    # Skip thumbnails and non-event images
                    if 'thul-' in content[max(0, img_match.start()-50):img_match.start()]:
                        continue
                    if artist_slug in ['exterior', 'brett', 'michaels']:
                        continue

                    artist_name = artist_slug.replace('-', ' ').strip()
                    if not artist_name:
                        continue

                    # Find the full image URL
                    img_url_match = re.search(
                        rf'(https://assets\.caesars\.com/[^"]+{re.escape(full_match)})',
                        content
                    )
                    img_url = img_url_match.group(1) if img_url_match else None

                    # Skip if it's a thumbnail version
                    if img_url and ('/thul-' in img_url or '/mini-' in img_url):
                        continue

                    # Look for Ticketmaster link within 5000 chars after the image
                    nearby_content = content[img_match.start():img_match.start()+5000]
                    tm_match = re.search(r'ticketmaster\.com/event/([A-Z0-9]+)', nearby_content)
                    ticket_url = f"https://www.ticketmaster.com/event/{tm_match.group(1)}" if tm_match else None

                    # Store data (don't overwrite if we already have this artist)
                    if artist_name not in data_map:
                        data_map[artist_name] = {}
                    if img_url and 'image' not in data_map[artist_name]:
                        data_map[artist_name]['image'] = img_url
                    if ticket_url and 'ticket_url' not in data_map[artist_name]:
                        data_map[artist_name]['ticket_url'] = ticket_url

                browser.close()
        except Exception as e:
            print(f"Warning: Failed to fetch Caesars data: {e}")

        return data_map

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []
        current_year = datetime.now().year

        # Extract images from JSON-LD structured data on stircoveamp.com
        image_map = self._extract_images_from_jsonld(soup)

        for card in soup.select("div.card"):
            try:
                # Title
                title_el = card.select_one("h5.title")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                if not title:
                    continue

                # Date - month and day from separate elements
                month_el = card.select_one("p.month")
                day_el = card.select_one("p.day")
                if not month_el or not day_el:
                    continue

                month_str = month_el.get_text(strip=True)
                day_str = day_el.get_text(strip=True)
                date_str = self._parse_date(month_str, day_str, current_year)
                if not date_str:
                    continue

                # Event URL (info link)
                event_url = None
                info_link = card.select_one("a.btn-outline")
                if info_link:
                    href = info_link.get("href")
                    if href:
                        if href.startswith("/"):
                            event_url = f"https://www.stircoveamp.com{href}"
                        else:
                            event_url = href

                # Skip ticket URLs from stircoveamp.com - they redirect to a scam site
                # Real Ticketmaster links are fetched from Caesars in scrape()
                ticket_url = None

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"stircove-{date_str}-{slug}"[:80]

                # Look up image from JSON-LD data (will be supplemented by Caesars images in scrape())
                image_url = image_map.get(title.lower().strip())

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date_str,
                    time=None,  # Times not listed on events page
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

    def _parse_date(self, month_str: str, day_str: str, current_year: int) -> str | None:
        """Convert month name and day to YYYY-MM-DD format."""
        try:
            month_map = {
                'jan': 1, 'january': 1,
                'feb': 2, 'february': 2,
                'mar': 3, 'march': 3,
                'apr': 4, 'april': 4,
                'may': 5,
                'jun': 6, 'june': 6,
                'jul': 7, 'july': 7,
                'aug': 8, 'august': 8,
                'sep': 9, 'september': 9,
                'oct': 10, 'october': 10,
                'nov': 11, 'november': 11,
                'dec': 12, 'december': 12,
            }

            month = month_map.get(month_str.lower().strip())
            if not month:
                return None

            day = int(day_str.strip())
            year = current_year

            # If date is in the past, assume next year
            today = datetime.now()
            event_date = datetime(year, month, day)
            if event_date < today:
                if (today - event_date).days > 30:
                    year += 1

            return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            return None

    def _extract_images_from_jsonld(self, soup) -> dict[str, str]:
        """Extract event images from JSON-LD structured data.

        Returns a dict mapping lowercase event name to image URL.
        """
        image_map = {}

        for script in soup.select('script[type="application/ld+json"]'):
            try:
                data = json.loads(script.string)

                # Handle both single objects and arrays
                items = data if isinstance(data, list) else [data]

                for item in items:
                    if item.get("@type") == "Event":
                        name = item.get("name", "").lower().strip()
                        image = item.get("image", "")
                        if name and image:
                            image_map[name] = image
            except (json.JSONDecodeError, TypeError, AttributeError):
                continue

        return image_map
