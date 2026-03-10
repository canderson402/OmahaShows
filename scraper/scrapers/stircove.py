# scraper/scrapers/stircove.py
"""
Stir Concert Cove scraper.
Uses stircoveamp.com for event data and Playwright to fetch images from caesars.com
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
        """Override to use Playwright for image fetching from Caesars."""
        # First, fetch event data from stircoveamp.com (simple HTML)
        html = self.fetch_html()
        events = self.parse_events(html)

        # Then use Playwright to get images from Caesars
        image_map = self._fetch_caesars_images()

        # Match images to events
        for event in events:
            if not event.imageUrl:
                # Try to find matching image from Caesars
                event_title_lower = event.title.lower().strip()
                for caesars_title, image_url in image_map.items():
                    # Fuzzy match - check if titles overlap
                    if self._titles_match(event_title_lower, caesars_title):
                        event.imageUrl = image_url
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

    def _fetch_caesars_images(self) -> dict[str, str]:
        """Use Playwright to fetch images from Caesars site."""
        image_map = {}

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                )
                page = context.new_page()

                # Navigate to Caesars shows page
                page.goto(self.caesars_url, wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(3000)  # Wait for JS to render

                # Try to find event cards/tiles with images
                # Look for common patterns in event listings
                cards = page.query_selector_all('[class*="event"], [class*="show"], [class*="card"], [class*="tile"]')

                for card in cards:
                    try:
                        # Try to find title
                        title_el = card.query_selector('h2, h3, h4, [class*="title"], [class*="name"]')
                        if not title_el:
                            continue
                        title = title_el.inner_text().strip().lower()
                        if not title:
                            continue

                        # Try to find image
                        img_el = card.query_selector('img')
                        if img_el:
                            img_url = img_el.get_attribute('src') or img_el.get_attribute('data-src')
                            if img_url and not any(x in img_url.lower() for x in ['logo', 'icon', 'placeholder']):
                                image_map[title] = img_url
                    except Exception:
                        continue

                # Also try to extract from JSON-LD or other structured data
                scripts = page.query_selector_all('script[type="application/ld+json"]')
                for script in scripts:
                    try:
                        content = script.inner_text()
                        data = json.loads(content)
                        items = data if isinstance(data, list) else [data]
                        for item in items:
                            if item.get("@type") == "Event":
                                name = item.get("name", "").lower().strip()
                                image = item.get("image", "")
                                if name and image:
                                    image_map[name] = image
                    except Exception:
                        continue

                browser.close()
        except Exception as e:
            print(f"Warning: Failed to fetch Caesars images: {e}")

        return image_map

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

                # Ticket URL
                ticket_url = None
                ticket_link = card.select_one("a.btn-blue")
                if ticket_link:
                    href = ticket_link.get("href")
                    if href:
                        if href.startswith("/"):
                            ticket_url = f"https://www.stircoveamp.com{href}"
                        else:
                            ticket_url = href

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
