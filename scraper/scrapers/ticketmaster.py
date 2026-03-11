# scraper/scrapers/ticketmaster.py
"""
Ticketmaster API client - fetches music events from Omaha/Lincoln metro.
Runs after other scrapers to catch events we might have missed.
"""
import os
import re
import sys
from datetime import datetime
from pathlib import Path
import requests

sys.path.insert(0, str(Path(__file__).parent.parent))
from models import Event
from venue_matcher import VenueMatcher
from matching import find_existing_event


class TicketmasterClient:
    name = "Ticketmaster"
    id = "ticketmaster"
    url = "https://www.ticketmaster.com"

    # Cities to query for Omaha metro area
    CITIES = [
        ("Omaha", "NE"),
        ("Lincoln", "NE"),
        ("La Vista", "NE"),  # Astro Theater area
        ("Council Bluffs", "IA"),  # Across the river
    ]

    def __init__(self, supabase_client=None, venue_matcher=None, api_key=None):
        self.supabase = supabase_client
        self.venue_matcher = venue_matcher
        self.api_key = api_key or os.environ.get("TICKETMASTER_API_KEY")
        if not self.api_key:
            raise ValueError("TICKETMASTER_API_KEY environment variable required")

    def scrape(self) -> list[Event]:
        """Fetch music events from Ticketmaster API."""
        all_events = []
        seen_ids = set()  # Track Ticketmaster IDs to avoid dupes across cities

        for city, state in self.CITIES:
            events = self._fetch_city_events(city, state)
            for event in events:
                tm_id = event.get("id")
                if tm_id and tm_id not in seen_ids:
                    seen_ids.add(tm_id)
                    parsed = self._parse_event(event)
                    if parsed:
                        all_events.append(parsed)

        return all_events

    def _fetch_city_events(self, city: str, state: str) -> list[dict]:
        """Fetch all music events for a city with pagination."""
        events = []
        page = 0
        max_pages = 5  # Safety limit

        while page < max_pages:
            params = {
                "city": city,
                "stateCode": state,
                "classificationName": "music",
                "source": "ticketmaster,ticketweb,universe,frontgate",  # Exclude resale (tmr)
                "size": 50,
                "page": page,
                "apikey": self.api_key,
            }

            try:
                response = requests.get(
                    "https://app.ticketmaster.com/discovery/v2/events.json",
                    params=params,
                    timeout=30
                )
                response.raise_for_status()
                data = response.json()

                page_events = data.get("_embedded", {}).get("events", [])
                if not page_events:
                    break

                events.extend(page_events)

                # Check if there are more pages
                page_info = data.get("page", {})
                total_pages = page_info.get("totalPages", 1)
                if page >= total_pages - 1:
                    break

                page += 1

            except Exception as e:
                print(f"  Ticketmaster API error for {city}, {state}: {e}")
                break

        return events

    def _parse_event(self, tm_event: dict) -> Event | None:
        """Convert Ticketmaster event to our Event model."""
        try:
            # Basic info
            title = tm_event.get("name", "").strip()
            if not title:
                return None

            # Skip travel/hotel package listings (not real events)
            title_lower = title.lower()
            if "ticket + hotel" in title_lower or "hotel deal" in title_lower:
                return None

            # Skip if URL is a travel package URL
            event_url_check = tm_event.get("url", "")
            if "travel.ticketmaster.com" in event_url_check:
                return None

            # Date and time
            dates = tm_event.get("dates", {}).get("start", {})
            date = dates.get("localDate")
            if not date:
                return None
            time = dates.get("localTime")  # HH:MM:SS format
            if time:
                time = time[:5]  # Convert to HH:MM

            # Venue info
            venues = tm_event.get("_embedded", {}).get("venues", [])
            venue_data = venues[0] if venues else {}
            venue_name = venue_data.get("name", "Unknown Venue")

            # Try to match venue
            matched_venue_id = None
            if self.venue_matcher:
                match_result = self.venue_matcher.match(venue_name)
                if match_result:
                    matched_venue_id = match_result[0]

            # Determine final venue_id
            if matched_venue_id:
                venue_id = matched_venue_id
            else:
                venue_id = "other"

            # Check for duplicates
            if matched_venue_id and self.supabase:
                existing_events = self._get_events_for_venue_date(matched_venue_id, date)
                temp_event = Event(
                    id="temp",
                    title=title,
                    date=date,
                    time=time,
                    venue=venue_name,
                    eventUrl=None,
                    ticketUrl=None,
                    imageUrl=None,
                    price=None,
                    ageRestriction=None,
                    supportingArtists=None,
                    source=self.id
                )
                if find_existing_event(temp_event, existing_events):
                    return None  # Duplicate found

            # URLs
            event_url = tm_event.get("url")

            # Get ticket URL (prefer direct purchase link)
            ticket_url = None
            for sale in tm_event.get("sales", {}).get("public", {}).values() if isinstance(tm_event.get("sales", {}).get("public"), dict) else []:
                if isinstance(sale, dict) and sale.get("url"):
                    ticket_url = sale.get("url")
                    break
            if not ticket_url:
                ticket_url = event_url

            # Image
            image_url = None
            images = tm_event.get("images", [])
            # Prefer 16:9 ratio, larger sizes
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

            # Supporting artists (attractions beyond the first)
            supporting = None
            attractions = tm_event.get("_embedded", {}).get("attractions", [])
            if len(attractions) > 1:
                supporting = [a.get("name") for a in attractions[1:] if a.get("name")]

            # Generate ID using Ticketmaster's ID for uniqueness
            tm_id = tm_event.get("id", "")
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:40]
            event_id = f"tm-{venue_id}-{date}-{slug}"[:80]

            return Event(
                id=event_id,
                title=title,
                date=date,
                time=time,
                venue=venue_name,
                eventUrl=event_url,
                ticketUrl=ticket_url,
                imageUrl=image_url,
                price=price,
                ageRestriction=age_restriction,
                supportingArtists=supporting,
                source=venue_id
            )

        except Exception as e:
            print(f"  Error parsing Ticketmaster event: {e}")
            return None

    def _get_events_for_venue_date(self, venue_id: str, event_date: str) -> list[dict]:
        """Query existing events for a venue on a specific date."""
        if not self.supabase:
            return []
        result = self.supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
        return result.data or []


def scrape_ticketmaster(supabase_client=None, venue_matcher=None, api_key=None) -> list[dict]:
    """
    Fetch Ticketmaster events and return list ready for DB insertion.
    """
    client = TicketmasterClient(
        supabase_client=supabase_client,
        venue_matcher=venue_matcher,
        api_key=api_key
    )
    events = client.scrape()

    result = []
    for event in events:
        venue_id = event.source

        result.append({
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": venue_id,
            "venue_name": event.venue if venue_id == "other" else None,
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": "ticketmaster",
            "status": "pending",  # Review before publishing
        })

    return result
