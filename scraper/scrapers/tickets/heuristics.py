"""
Heuristic extraction for ticket pages without structured data.
Extracts og:image, common time/price patterns.
"""
import re
from bs4 import BeautifulSoup
from .base import EnrichedEvent


def extract_heuristics(html: str) -> EnrichedEvent | None:
    """
    Extract event data using heuristic pattern matching.
    """
    soup = BeautifulSoup(html, "html.parser")

    image_url = _extract_og_image(soup)
    time = _extract_time(soup, html)
    price = _extract_price(html)

    if image_url or time or price:
        return EnrichedEvent(
            time=time,
            price=price,
            image_url=image_url,
            supporting_artists=None,
            source="heuristics"
        )
    return None


def _extract_og_image(soup: BeautifulSoup) -> str | None:
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        url = og_image["content"]
        if "placeholder" not in url.lower() and "default" not in url.lower():
            return url
    return None


def _extract_time(soup: BeautifulSoup, html: str) -> str | None:
    text = html.lower()
    # Prefer "Show" time over "Doors"
    show_patterns = [
        r'show[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        r'start[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
    ]
    for pattern in show_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return _convert_to_24h(match)

    # Fallback to doors
    doors_pattern = r'doors?[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)'
    match = re.search(doors_pattern, text, re.IGNORECASE)
    if match:
        return _convert_to_24h(match)
    return None


def _convert_to_24h(match: re.Match) -> str:
    hour = int(match.group(1))
    minute = int(match.group(2)) if match.group(2) else 0
    period = match.group(3).upper()
    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0
    return f"{hour:02d}:{minute:02d}"


def _extract_price(html: str) -> str | None:
    # Range: $25 - $40
    match = re.search(r'\$(\d+(?:\.\d{2})?)\s*[-\u2013\u2014to]+\s*\$(\d+(?:\.\d{2})?)', html, re.IGNORECASE)
    if match:
        return f"${match.group(1)} - ${match.group(2)}"

    # Single price
    matches = re.findall(r'\$(\d+(?:\.\d{2})?)', html)
    if matches:
        prices = [float(p) for p in matches if 5 <= float(p) <= 500]
        if prices:
            if len(set(prices)) == 1:
                return f"${int(prices[0])}" if prices[0] == int(prices[0]) else f"${prices[0]}"
            return f"${int(min(prices))} - ${int(max(prices))}"

    if re.search(r'\b(free|no cover)\b', html, re.IGNORECASE):
        return "Free"
    return None
