# scraper/scrapers/stircove.py
"""
Stir Concert Cove scraper.
Uses Ticketmaster API to fetch events directly - much more reliable than scraping.
"""
import os
import re
import sys
from pathlib import Path
import requests

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event


class StirCoveScraper(BaseScraper):
    name = "Stir Concert Cove"
    id = "stircove"
    url = "https://www.caesars.com/harrahs-council-bluffs/shows"

    # Ticketmaster venue ID for Stir Concert Cove
    TM_VENUE_ID = "KovZpZAF6aIA"

    def __init__(self):
        self.tm_api_key = os.environ.get("TICKETMASTER_API_KEY")

    def scrape(self) -> list[Event]:
        """Fetch events from Ticketmaster API for Stir Cove venue."""
        if not self.tm_api_key:
            print("Warning: TICKETMASTER_API_KEY not set, cannot scrape Stir Cove")
            return []

        events = []
        page = 0
        max_pages = 5

        while page < max_pages:
            try:
                response = requests.get(
                    "https://app.ticketmaster.com/discovery/v2/events.json",
                    params={
                        "venueId": self.TM_VENUE_ID,
                        "classificationName": "music",
                        "size": 50,
                        "page": page,
                        "apikey": self.tm_api_key,
                    },
                    timeout=30
                )

                if response.status_code != 200:
                    print(f"Ticketmaster API error: {response.status_code}")
                    break

                data = response.json()
                page_events = data.get("_embedded", {}).get("events", [])

                if not page_events:
                    break

                for tm_event in page_events:
                    event = self._parse_event(tm_event)
                    if event:
                        events.append(event)

                # Check for more pages
                page_info = data.get("page", {})
                total_pages = page_info.get("totalPages", 1)
                if page >= total_pages - 1:
                    break

                page += 1

            except Exception as e:
                print(f"Error fetching from Ticketmaster API: {e}")
                break

        return events

    def _parse_event(self, tm_event: dict) -> Event | None:
        """Parse a Ticketmaster event into our Event model."""
        try:
            # Title
            title = tm_event.get("name", "").strip()
            if not title:
                return None

            # Skip travel packages
            title_lower = title.lower()
            if "ticket + hotel" in title_lower or "hotel deal" in title_lower:
                return None

            # Date and time
            dates = tm_event.get("dates", {}).get("start", {})
            date = dates.get("localDate")
            if not date:
                return None

            time = dates.get("localTime")  # HH:MM:SS format
            if time:
                time = time[:5]  # Convert to HH:MM

            # Ticket URL (the main event URL on Ticketmaster)
            ticket_url = tm_event.get("url")

            # Image - prefer 16:9 ratio, larger sizes
            image_url = None
            images = tm_event.get("images", [])
            for img in sorted(images, key=lambda x: x.get("width", 0), reverse=True):
                if img.get("ratio") == "16_9" and img.get("width", 0) >= 640:
                    image_url = img.get("url")
                    break
            if not image_url and images:
                image_url = images[0].get("url")

            # Price range
            price = None
            price_ranges = tm_event.get("priceRanges", [])
            if price_ranges:
                pr = price_ranges[0]
                min_price = pr.get("min")
                max_price = pr.get("max")
                if min_price and max_price:
                    if min_price == max_price:
                        price = f"${min_price:.0f}"
                    else:
                        price = f"${min_price:.0f}-${max_price:.0f}"
                elif min_price:
                    price = f"${min_price:.0f}+"

            # Age restriction
            age_restriction = None
            age_limit = tm_event.get("ageRestrictions", {}).get("legalAgeEnforced")
            if age_limit:
                age_restriction = "21+"

            # Supporting artists
            supporting = None
            attractions = tm_event.get("_embedded", {}).get("attractions", [])
            if len(attractions) > 1:
                supporting = [a.get("name") for a in attractions[1:] if a.get("name")]

            # Generate ID
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:40]
            event_id = f"stircove-{date}-{slug}"[:80]

            return Event(
                id=event_id,
                title=title,
                date=date,
                time=time,
                venue=self.name,
                eventUrl=None,  # Stir Cove has no separate event info pages
                ticketUrl=ticket_url,
                imageUrl=image_url,
                price=price,
                ageRestriction=age_restriction,
                supportingArtists=supporting,
                source=self.id
            )

        except Exception as e:
            print(f"Error parsing Ticketmaster event: {e}")
            return None

    def parse_events(self, html: str) -> list[Event]:
        """Required by base class but we use Ticketmaster API instead."""
        return []
