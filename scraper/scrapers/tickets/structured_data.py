"""
JSON-LD / schema.org structured data extractor.
Works with sites that embed Event data in JSON-LD format.
"""
import json
import re
from bs4 import BeautifulSoup
from .base import EnrichedEvent


def extract_json_ld(html: str) -> EnrichedEvent | None:
    """
    Extract event data from JSON-LD structured data (schema.org/Event).

    Args:
        html: The HTML content of the page

    Returns:
        EnrichedEvent if JSON-LD Event data found, None otherwise
    """
    soup = BeautifulSoup(html, "html.parser")
    scripts = soup.find_all("script", type="application/ld+json")

    for script in scripts:
        try:
            data = json.loads(script.string)

            # Handle array wrapper
            if isinstance(data, list):
                data = data[0]

            # Check if it's an Event
            event_type = data.get("@type", "")
            if event_type not in ("Event", "MusicEvent", "TheaterEvent", "ComedyEvent"):
                continue

            # Extract time from startDate
            time = None
            start_date = data.get("startDate", "")
            if "T" in start_date:
                time_match = re.search(r'T(\d{2}):(\d{2})', start_date)
                if time_match:
                    time = f"{time_match.group(1)}:{time_match.group(2)}"

            # Extract price from offers
            price = None
            offers = data.get("offers", {})
            if isinstance(offers, list):
                offers = offers[0] if offers else {}
            if offers:
                price_val = offers.get("price")
                currency = offers.get("priceCurrency", "USD")
                if price_val:
                    if currency == "USD":
                        price = f"${price_val}"
                    else:
                        price = f"{price_val} {currency}"

            # Extract image
            image_url = data.get("image")
            if isinstance(image_url, list):
                image_url = image_url[0] if image_url else None
            if isinstance(image_url, dict):
                image_url = image_url.get("url")

            # Extract performers (skip first one as that's the headliner)
            supporting_artists = None
            performers = data.get("performer", [])
            if isinstance(performers, dict):
                performers = [performers]
            if len(performers) > 1:
                supporting_artists = []
                for p in performers[1:]:  # Skip headliner
                    name = p.get("name") if isinstance(p, dict) else str(p)
                    if name:
                        supporting_artists.append(name)

            # Only return if we found at least something useful
            if time or price or image_url or supporting_artists:
                return EnrichedEvent(
                    time=time,
                    price=price,
                    image_url=image_url,
                    supporting_artists=supporting_artists if supporting_artists else None,
                    source="json_ld"
                )

        except (json.JSONDecodeError, KeyError, TypeError):
            continue

    return None
