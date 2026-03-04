# Ticket Site Scrapers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a ticket site scraping system to enrich events with time, price, image, and supporting artists from ticket URLs.

**Architecture:** Hybrid fallback chain - try JSON-LD structured data first, then site-specific scrapers, then heuristic extraction. Completely independent from existing venue scrapers.

**Tech Stack:** Python, BeautifulSoup, requests, FastAPI, React/TypeScript

---

### Task 1: Create Base Infrastructure

**Files:**
- Create: `scraper/scrapers/tickets/__init__.py`
- Create: `scraper/scrapers/tickets/base.py`
- Test: `scraper/tests/test_ticket_base.py`

**Step 1: Create the tickets directory**

```bash
mkdir -p scraper/scrapers/tickets
```

**Step 2: Write the failing test for EnrichedEvent dataclass**

```python
# scraper/tests/test_ticket_base.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.base import EnrichedEvent

def test_enriched_event_creation():
    event = EnrichedEvent(
        time="19:00",
        price="$25 - $35",
        image_url="https://example.com/image.jpg",
        supporting_artists=["Artist B", "Artist C"],
        source="test"
    )
    assert event.time == "19:00"
    assert event.price == "$25 - $35"
    assert event.source == "test"

def test_enriched_event_partial():
    event = EnrichedEvent(
        time="20:00",
        price=None,
        image_url=None,
        supporting_artists=None,
        source="heuristics"
    )
    assert event.time == "20:00"
    assert event.price is None
    assert event.source == "heuristics"

def test_enriched_event_to_dict():
    event = EnrichedEvent(
        time="19:00",
        price="$25",
        image_url="https://example.com/img.jpg",
        supporting_artists=["Opener"],
        source="etix"
    )
    d = event.to_dict()
    assert d["time"] == "19:00"
    assert d["source"] == "etix"
```

**Step 3: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_base.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'scrapers.tickets'"

**Step 4: Write minimal implementation**

```python
# scraper/scrapers/tickets/__init__.py
"""
Ticket site scrapers for enriching events with additional data.
Independent from venue scrapers - only triggered manually via Enrich button.
"""
from .base import EnrichedEvent, BaseTicketScraper

__all__ = ["EnrichedEvent", "BaseTicketScraper"]
```

```python
# scraper/scrapers/tickets/base.py
"""
Base classes for ticket site scrapers.
"""
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup


@dataclass
class EnrichedEvent:
    """Data extracted from a ticket page."""
    time: str | None           # "19:00" (24h format)
    price: str | None          # "$25 - $35" or "Free"
    image_url: str | None      # Full URL to event image
    supporting_artists: list[str] | None  # ["Artist B", "Artist C"]
    source: str                # Which method extracted it: "json_ld", "etix", "heuristics"

    def to_dict(self) -> dict:
        return asdict(self)


class BaseTicketScraper(ABC):
    """Base class for site-specific ticket scrapers."""

    name: str  # Display name, e.g. "Etix"
    domains: list[str]  # Domains this scraper handles, e.g. ["etix.com"]
    timeout: int = 15

    def fetch_html(self, url: str) -> str:
        """Fetch HTML from URL with standard headers."""
        response = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def get_soup(self, html: str) -> BeautifulSoup:
        """Parse HTML into BeautifulSoup object."""
        return BeautifulSoup(html, "html.parser")

    @abstractmethod
    def extract(self, url: str) -> EnrichedEvent:
        """Extract event data from the ticket page. Implement in subclass."""
        pass
```

**Step 5: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_base.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add scraper/scrapers/tickets/ scraper/tests/test_ticket_base.py
git commit -m "feat(tickets): add base infrastructure for ticket scrapers"
```

---

### Task 2: Create URL Resolver (fave.co redirect handling)

**Files:**
- Create: `scraper/scrapers/tickets/resolver.py`
- Test: `scraper/tests/test_ticket_resolver.py`

**Step 1: Write failing test**

```python
# scraper/tests/test_ticket_resolver.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.resolver import resolve_url, get_domain

def test_get_domain_simple():
    assert get_domain("https://etix.com/ticket/123") == "etix.com"
    assert get_domain("https://www.eventbrite.com/e/test") == "eventbrite.com"
    assert get_domain("https://wl.seetickets.us/event/test") == "seetickets.us"

def test_get_domain_strips_www():
    assert get_domain("https://www.ticketmaster.com/event") == "ticketmaster.com"

def test_get_domain_handles_subdomains():
    # Keep relevant subdomains for seetickets
    assert get_domain("https://wl.seetickets.us/event") == "seetickets.us"
    assert get_domain("https://wl.eventim.us/event") == "eventim.us"
```

**Step 2: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_resolver.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# scraper/scrapers/tickets/resolver.py
"""
URL resolution utilities for ticket scrapers.
Handles redirects (fave.co) and domain extraction.
"""
import requests
from urllib.parse import urlparse


def get_domain(url: str) -> str:
    """
    Extract the domain from a URL, stripping www prefix.
    Examples:
        https://www.etix.com/ticket/123 -> etix.com
        https://wl.seetickets.us/event -> seetickets.us
    """
    parsed = urlparse(url)
    domain = parsed.netloc.lower()

    # Strip www prefix
    if domain.startswith("www."):
        domain = domain[4:]

    # For subdomains like wl.seetickets.us, extract base domain
    parts = domain.split(".")
    if len(parts) > 2:
        # Keep last two parts (seetickets.us, eventim.us, etc.)
        domain = ".".join(parts[-2:])

    return domain


def resolve_url(url: str, max_redirects: int = 5) -> str:
    """
    Follow redirects to get the final destination URL.
    Used for fave.co and other URL shorteners.

    Args:
        url: The URL to resolve
        max_redirects: Maximum number of redirects to follow

    Returns:
        The final destination URL after all redirects
    """
    try:
        response = requests.head(
            url,
            allow_redirects=True,
            timeout=10,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        return response.url
    except requests.RequestException:
        # If HEAD fails, try GET
        try:
            response = requests.get(
                url,
                allow_redirects=True,
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            return response.url
        except requests.RequestException:
            # Return original URL if all else fails
            return url
```

**Step 4: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_resolver.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scraper/scrapers/tickets/resolver.py scraper/tests/test_ticket_resolver.py
git commit -m "feat(tickets): add URL resolver for fave.co redirects"
```

---

### Task 3: Create JSON-LD Structured Data Extractor

**Files:**
- Create: `scraper/scrapers/tickets/structured_data.py`
- Test: `scraper/tests/test_ticket_structured_data.py`

**Step 1: Write failing test with sample JSON-LD**

```python
# scraper/tests/test_ticket_structured_data.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.structured_data import extract_json_ld

SAMPLE_HTML_WITH_JSONLD = '''
<html>
<head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Test Concert",
  "startDate": "2026-04-15T19:00:00",
  "image": "https://example.com/image.jpg",
  "offers": {
    "@type": "Offer",
    "price": "25.00",
    "priceCurrency": "USD"
  },
  "performer": [
    {"@type": "MusicGroup", "name": "Main Artist"},
    {"@type": "MusicGroup", "name": "Opener"}
  ]
}
</script>
</head>
<body></body>
</html>
'''

SAMPLE_HTML_NO_JSONLD = '''
<html><head></head><body>No structured data</body></html>
'''

def test_extract_json_ld_full():
    result = extract_json_ld(SAMPLE_HTML_WITH_JSONLD)
    assert result is not None
    assert result.time == "19:00"
    assert result.price == "$25.00"
    assert result.image_url == "https://example.com/image.jpg"
    assert result.supporting_artists == ["Opener"]
    assert result.source == "json_ld"

def test_extract_json_ld_missing():
    result = extract_json_ld(SAMPLE_HTML_NO_JSONLD)
    assert result is None
```

**Step 2: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_structured_data.py -v`
Expected: FAIL

**Step 3: Write implementation**

```python
# scraper/scrapers/tickets/structured_data.py
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
```

**Step 4: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_structured_data.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scraper/scrapers/tickets/structured_data.py scraper/tests/test_ticket_structured_data.py
git commit -m "feat(tickets): add JSON-LD structured data extractor"
```

---

### Task 4: Create Heuristics Fallback Extractor

**Files:**
- Create: `scraper/scrapers/tickets/heuristics.py`
- Test: `scraper/tests/test_ticket_heuristics.py`

**Step 1: Write failing test**

```python
# scraper/tests/test_ticket_heuristics.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.heuristics import extract_heuristics

SAMPLE_HTML_WITH_OG = '''
<html>
<head>
<meta property="og:image" content="https://example.com/og-image.jpg">
<meta property="og:title" content="Concert Name">
</head>
<body>
<p>Doors: 7:00 PM | Show: 8:00 PM</p>
<p>Price: $25 - $40</p>
</body>
</html>
'''

def test_extract_og_image():
    result = extract_heuristics(SAMPLE_HTML_WITH_OG)
    assert result is not None
    assert result.image_url == "https://example.com/og-image.jpg"
    assert result.source == "heuristics"

def test_extract_time_patterns():
    result = extract_heuristics(SAMPLE_HTML_WITH_OG)
    assert result.time is not None
    # Should extract show time (8:00 PM -> 20:00)
    assert result.time == "20:00"

def test_extract_price_patterns():
    result = extract_heuristics(SAMPLE_HTML_WITH_OG)
    assert result.price is not None
    assert "$25" in result.price or "$40" in result.price
```

**Step 2: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_heuristics.py -v`
Expected: FAIL

**Step 3: Write implementation**

```python
# scraper/scrapers/tickets/heuristics.py
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

    Tries:
    - og:image meta tag
    - Common time patterns (Doors: X, Show: Y)
    - Common price patterns ($XX, $XX - $YY)

    Args:
        html: The HTML content of the page

    Returns:
        EnrichedEvent with whatever was found, None if nothing found
    """
    soup = BeautifulSoup(html, "html.parser")

    image_url = _extract_og_image(soup)
    time = _extract_time(soup, html)
    price = _extract_price(html)

    # Only return if we found something
    if image_url or time or price:
        return EnrichedEvent(
            time=time,
            price=price,
            image_url=image_url,
            supporting_artists=None,  # Hard to extract reliably with heuristics
            source="heuristics"
        )

    return None


def _extract_og_image(soup: BeautifulSoup) -> str | None:
    """Extract image from og:image meta tag."""
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        url = og_image["content"]
        # Skip placeholder/default images
        if "placeholder" not in url.lower() and "default" not in url.lower():
            return url
    return None


def _extract_time(soup: BeautifulSoup, html: str) -> str | None:
    """
    Extract show time from common patterns.
    Prefers "Show" time over "Doors" time.
    """
    text = html.lower()

    # Pattern: Show: 8:00 PM or Show Time: 8 PM
    show_patterns = [
        r'show[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        r'start[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        r'begins?[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
    ]

    for pattern in show_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return _convert_to_24h(match)

    # Fallback: Doors time
    doors_pattern = r'doors?[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)'
    match = re.search(doors_pattern, text, re.IGNORECASE)
    if match:
        return _convert_to_24h(match)

    # Generic time pattern as last resort
    time_pattern = r'(\d{1,2}):(\d{2})\s*(am|pm)'
    match = re.search(time_pattern, text, re.IGNORECASE)
    if match:
        return _convert_to_24h(match)

    return None


def _convert_to_24h(match: re.Match) -> str:
    """Convert regex match to 24h time format."""
    hour = int(match.group(1))
    minute = int(match.group(2)) if match.group(2) else 0
    period = match.group(3).upper()

    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0

    return f"{hour:02d}:{minute:02d}"


def _extract_price(html: str) -> str | None:
    """Extract price from common patterns."""
    # Pattern: $25 - $40, $25-$40, $25 to $40
    range_pattern = r'\$(\d+(?:\.\d{2})?)\s*[-–—to]+\s*\$(\d+(?:\.\d{2})?)'
    match = re.search(range_pattern, html, re.IGNORECASE)
    if match:
        return f"${match.group(1)} - ${match.group(2)}"

    # Pattern: $25, $25.00
    single_pattern = r'\$(\d+(?:\.\d{2})?)'
    matches = re.findall(single_pattern, html)
    if matches:
        # Filter out likely non-prices (too high, etc.)
        prices = [float(p) for p in matches if 5 <= float(p) <= 500]
        if prices:
            if len(set(prices)) == 1:
                return f"${prices[0]:.0f}" if prices[0] == int(prices[0]) else f"${prices[0]}"
            else:
                return f"${min(prices):.0f} - ${max(prices):.0f}"

    # Check for "Free" or "No Cover"
    if re.search(r'\b(free|no cover)\b', html, re.IGNORECASE):
        return "Free"

    return None
```

**Step 4: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_heuristics.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scraper/scrapers/tickets/heuristics.py scraper/tests/test_ticket_heuristics.py
git commit -m "feat(tickets): add heuristics fallback extractor"
```

---

### Task 5: Create Etix Scraper

**Files:**
- Create: `scraper/scrapers/tickets/etix.py`
- Test: `scraper/tests/test_ticket_etix.py`
- Create: `scraper/tests/fixtures/etix_sample.html`

**Step 1: Fetch and save sample HTML fixture**

```bash
cd scraper && curl -s "https://etix.com/ticket/p/83032471/" -o tests/fixtures/etix_sample.html
```

**Step 2: Analyze the HTML structure and write failing test**

```python
# scraper/tests/test_ticket_etix.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.etix import EtixScraper

@pytest.fixture
def sample_html():
    fixture_path = Path(__file__).parent / "fixtures" / "etix_sample.html"
    if fixture_path.exists():
        return fixture_path.read_text()
    return None

def test_etix_scraper_domains():
    scraper = EtixScraper()
    assert "etix.com" in scraper.domains

def test_etix_scraper_extracts_data(sample_html):
    if sample_html is None:
        pytest.skip("No fixture available")

    scraper = EtixScraper()
    result = scraper.parse(sample_html)

    assert result is not None
    assert result.source == "etix"
    # At minimum we should get something
    assert result.time or result.price or result.image_url
```

**Step 3: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_etix.py -v`
Expected: FAIL

**Step 4: Write implementation (inspect actual HTML to refine selectors)**

```python
# scraper/scrapers/tickets/etix.py
"""
Etix.com ticket site scraper.
Handles ~97 events from ohmyomaha data.
"""
import re
from bs4 import BeautifulSoup
from .base import BaseTicketScraper, EnrichedEvent


class EtixScraper(BaseTicketScraper):
    name = "Etix"
    domains = ["etix.com"]

    def extract(self, url: str) -> EnrichedEvent:
        """Fetch URL and extract event data."""
        html = self.fetch_html(url)
        return self.parse(html)

    def parse(self, html: str) -> EnrichedEvent:
        """Parse etix HTML and extract event data."""
        soup = self.get_soup(html)

        time = self._extract_time(soup)
        price = self._extract_price(soup)
        image_url = self._extract_image(soup)
        supporting_artists = self._extract_supporting(soup)

        return EnrichedEvent(
            time=time,
            price=price,
            image_url=image_url,
            supporting_artists=supporting_artists,
            source="etix"
        )

    def _extract_time(self, soup: BeautifulSoup) -> str | None:
        """Extract show time from etix page."""
        # Look for time in event details
        time_el = soup.select_one(".event-time, .showtime, [class*='time']")
        if time_el:
            text = time_el.get_text(strip=True)
            match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm)', text, re.IGNORECASE)
            if match:
                return self._convert_to_24h(match)

        # Search full page text
        text = soup.get_text()
        patterns = [
            r'show[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
            r'doors[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return self._convert_to_24h(match)

        return None

    def _extract_price(self, soup: BeautifulSoup) -> str | None:
        """Extract ticket price."""
        # Look for price elements
        price_el = soup.select_one(".price, .ticket-price, [class*='price']")
        if price_el:
            text = price_el.get_text(strip=True)
            if "$" in text:
                return text

        # Search for price patterns in page
        text = soup.get_text()
        match = re.search(r'\$(\d+(?:\.\d{2})?)\s*[-–—]\s*\$(\d+(?:\.\d{2})?)', text)
        if match:
            return f"${match.group(1)} - ${match.group(2)}"

        match = re.search(r'\$(\d+(?:\.\d{2})?)', text)
        if match:
            return f"${match.group(1)}"

        return None

    def _extract_image(self, soup: BeautifulSoup) -> str | None:
        """Extract event image."""
        # Try og:image first
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]

        # Look for event image
        img = soup.select_one(".event-image img, .poster img, [class*='event'] img")
        if img:
            return img.get("src") or img.get("data-src")

        return None

    def _extract_supporting(self, soup: BeautifulSoup) -> list[str] | None:
        """Extract supporting artists if listed."""
        # Look for "with" or "featuring" patterns
        text = soup.get_text()
        match = re.search(r'(?:with|featuring|w/|ft\.?)\s+([^,\n]+(?:,\s*[^,\n]+)*)', text, re.IGNORECASE)
        if match:
            artists = [a.strip() for a in match.group(1).split(",")]
            return artists if artists else None
        return None

    def _convert_to_24h(self, match: re.Match) -> str:
        """Convert regex match to 24h time."""
        hour = int(match.group(1))
        minute = int(match.group(2)) if match.group(2) else 0
        period = match.group(3).upper()

        if period == "PM" and hour != 12:
            hour += 12
        elif period == "AM" and hour == 12:
            hour = 0

        return f"{hour:02d}:{minute:02d}"
```

**Step 5: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_etix.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add scraper/scrapers/tickets/etix.py scraper/tests/test_ticket_etix.py scraper/tests/fixtures/
git commit -m "feat(tickets): add Etix scraper"
```

---

### Task 6: Create SeeTickets Scraper

**Files:**
- Create: `scraper/scrapers/tickets/seetickets.py`
- Test: `scraper/tests/test_ticket_seetickets.py`

**Step 1: Write failing test**

```python
# scraper/tests/test_ticket_seetickets.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.seetickets import SeeTicketsScraper

def test_seetickets_scraper_domains():
    scraper = SeeTicketsScraper()
    assert "seetickets.us" in scraper.domains
    assert "eventim.us" in scraper.domains

def test_seetickets_scraper_parse():
    scraper = SeeTicketsScraper()
    # Basic structure test with minimal HTML
    html = '''
    <html>
    <head><meta property="og:image" content="https://example.com/img.jpg"></head>
    <body>
    <div class="event-info">Doors: 7:00 PM | Show: 8:00 PM</div>
    <div class="price">$25.00</div>
    </body>
    </html>
    '''
    result = scraper.parse(html)
    assert result.source == "seetickets"
```

**Step 2: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_seetickets.py -v`
Expected: FAIL

**Step 3: Write implementation**

```python
# scraper/scrapers/tickets/seetickets.py
"""
SeeTickets.us / Eventim.us ticket site scraper.
Handles ~56 events from ohmyomaha data (wl.seetickets.us, wl.eventim.us).
"""
import re
from bs4 import BeautifulSoup
from .base import BaseTicketScraper, EnrichedEvent


class SeeTicketsScraper(BaseTicketScraper):
    name = "SeeTickets"
    domains = ["seetickets.us", "eventim.us"]

    def extract(self, url: str) -> EnrichedEvent:
        """Fetch URL and extract event data."""
        html = self.fetch_html(url)
        return self.parse(html)

    def parse(self, html: str) -> EnrichedEvent:
        """Parse SeeTickets HTML and extract event data."""
        soup = self.get_soup(html)

        time = self._extract_time(soup, html)
        price = self._extract_price(soup, html)
        image_url = self._extract_image(soup)
        supporting_artists = self._extract_supporting(soup, html)

        return EnrichedEvent(
            time=time,
            price=price,
            image_url=image_url,
            supporting_artists=supporting_artists,
            source="seetickets"
        )

    def _extract_time(self, soup: BeautifulSoup, html: str) -> str | None:
        """Extract show time."""
        # Search for time patterns
        patterns = [
            r'show[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
            r'start[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
            r'doors[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        ]

        text = html.lower()
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return self._convert_to_24h(match)

        return None

    def _extract_price(self, soup: BeautifulSoup, html: str) -> str | None:
        """Extract ticket price."""
        # Look for price in structured elements
        price_el = soup.select_one(".price, .ticket-price, [class*='price']")
        if price_el:
            text = price_el.get_text(strip=True)
            if "$" in text:
                return text

        # Search for price patterns
        match = re.search(r'\$(\d+(?:\.\d{2})?)\s*[-–—]\s*\$(\d+(?:\.\d{2})?)', html)
        if match:
            return f"${match.group(1)} - ${match.group(2)}"

        match = re.search(r'\$(\d+(?:\.\d{2})?)', html)
        if match:
            return f"${match.group(1)}"

        return None

    def _extract_image(self, soup: BeautifulSoup) -> str | None:
        """Extract event image."""
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            url = og_image["content"]
            if "placeholder" not in url.lower():
                return url

        # Look for event image
        img = soup.select_one(".event-image img, .artist-image img, [class*='poster'] img")
        if img:
            return img.get("src") or img.get("data-src")

        return None

    def _extract_supporting(self, soup: BeautifulSoup, html: str) -> list[str] | None:
        """Extract supporting artists."""
        match = re.search(r'(?:with|featuring|w/|ft\.?|support:)\s+([^,\n]+(?:,\s*[^,\n]+)*)', html, re.IGNORECASE)
        if match:
            artists = [a.strip() for a in match.group(1).split(",")]
            # Filter out common non-artist strings
            artists = [a for a in artists if len(a) > 2 and not any(
                x in a.lower() for x in ["ticket", "door", "show", "age", "price"]
            )]
            return artists if artists else None
        return None

    def _convert_to_24h(self, match: re.Match) -> str:
        """Convert regex match to 24h time."""
        hour = int(match.group(1))
        minute = int(match.group(2)) if match.group(2) else 0
        period = match.group(3).upper()

        if period == "PM" and hour != 12:
            hour += 12
        elif period == "AM" and hour == 12:
            hour = 0

        return f"{hour:02d}:{minute:02d}"
```

**Step 4: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_seetickets.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scraper/scrapers/tickets/seetickets.py scraper/tests/test_ticket_seetickets.py
git commit -m "feat(tickets): add SeeTickets scraper"
```

---

### Task 7: Create Main Enricher with Registry

**Files:**
- Modify: `scraper/scrapers/tickets/__init__.py`
- Test: `scraper/tests/test_ticket_enricher.py`

**Step 1: Write failing test for the enricher**

```python
# scraper/tests/test_ticket_enricher.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets import enrich_from_url, get_scraper_for_domain, TICKET_SCRAPERS

def test_registry_has_scrapers():
    assert "etix.com" in TICKET_SCRAPERS
    assert "seetickets.us" in TICKET_SCRAPERS

def test_get_scraper_for_known_domain():
    scraper = get_scraper_for_domain("etix.com")
    assert scraper is not None
    assert scraper.name == "Etix"

def test_get_scraper_for_unknown_domain():
    scraper = get_scraper_for_domain("unknownsite.xyz")
    assert scraper is None

def test_get_scraper_handles_subdomains():
    # wl.seetickets.us should match seetickets.us
    scraper = get_scraper_for_domain("seetickets.us")
    assert scraper is not None
```

**Step 2: Run test to verify it fails**

Run: `cd scraper && python -m pytest tests/test_ticket_enricher.py -v`
Expected: FAIL

**Step 3: Update __init__.py with registry and enricher**

```python
# scraper/scrapers/tickets/__init__.py
"""
Ticket site scrapers for enriching events with additional data.
Independent from venue scrapers - only triggered manually via Enrich button.
"""
from .base import EnrichedEvent, BaseTicketScraper
from .resolver import resolve_url, get_domain
from .structured_data import extract_json_ld
from .heuristics import extract_heuristics
from .etix import EtixScraper
from .seetickets import SeeTicketsScraper

__all__ = [
    "EnrichedEvent",
    "BaseTicketScraper",
    "enrich_from_url",
    "get_scraper_for_domain",
    "TICKET_SCRAPERS",
]

# Registry of site-specific scrapers
# Maps domain -> scraper instance
TICKET_SCRAPERS: dict[str, BaseTicketScraper] = {}

def _register_scraper(scraper: BaseTicketScraper):
    """Register a scraper for its domains."""
    for domain in scraper.domains:
        TICKET_SCRAPERS[domain] = scraper

# Register all scrapers
_register_scraper(EtixScraper())
_register_scraper(SeeTicketsScraper())


def get_scraper_for_domain(domain: str) -> BaseTicketScraper | None:
    """Get the scraper for a domain, or None if not supported."""
    return TICKET_SCRAPERS.get(domain)


def enrich_from_url(url: str) -> dict:
    """
    Main entry point: enrich an event from its ticket URL.

    Tries extraction methods in order:
    1. Resolve redirects (fave.co, etc.)
    2. Try JSON-LD structured data
    3. Try site-specific scraper
    4. Try heuristic extraction

    Args:
        url: The ticket URL to scrape

    Returns:
        dict with success, source, data (or error)
    """
    try:
        # Step 1: Resolve redirects
        final_url = resolve_url(url)
        domain = get_domain(final_url)

        # Step 2: Try JSON-LD first (it's fast and reliable when present)
        import requests
        response = requests.get(final_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout=15)
        response.raise_for_status()
        html = response.text

        result = extract_json_ld(html)
        if result and (result.time or result.price or result.image_url):
            return {
                "success": True,
                "source": "json_ld",
                "data": result.to_dict()
            }

        # Step 3: Try site-specific scraper
        scraper = get_scraper_for_domain(domain)
        if scraper:
            result = scraper.parse(html)
            if result and (result.time or result.price or result.image_url):
                return {
                    "success": True,
                    "source": scraper.name.lower(),
                    "data": result.to_dict()
                }

        # Step 4: Try heuristics
        result = extract_heuristics(html)
        if result and (result.time or result.price or result.image_url):
            return {
                "success": True,
                "source": "heuristics",
                "data": result.to_dict()
            }

        # Nothing found
        return {
            "success": False,
            "error": f"Could not extract data from {domain}",
            "domain": domain
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "error": f"Network error: {str(e)}",
            "domain": get_domain(url) if url else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "domain": get_domain(url) if url else None
        }
```

**Step 4: Run test to verify it passes**

Run: `cd scraper && python -m pytest tests/test_ticket_enricher.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scraper/scrapers/tickets/__init__.py scraper/tests/test_ticket_enricher.py
git commit -m "feat(tickets): add enricher with scraper registry"
```

---

### Task 8: Add Enrich API Endpoint

**Files:**
- Modify: `scraper/api.py`
- Test: Manual test with curl

**Step 1: Add the endpoint to api.py**

Add after the existing imports at the top:

```python
from scrapers.tickets import enrich_from_url
```

Add the endpoint (after existing endpoints, before `if __name__`):

```python
class EnrichRequest(BaseModel):
    ticket_url: str


class EnrichResponse(BaseModel):
    success: bool
    source: str | None = None
    data: dict | None = None
    error: str | None = None
    domain: str | None = None


@app.post("/api/enrich")
def enrich_event(request: EnrichRequest) -> EnrichResponse:
    """
    Enrich an event by scraping its ticket URL.
    Extracts time, price, image, and supporting artists.
    """
    result = enrich_from_url(request.ticket_url)
    return EnrichResponse(**result)
```

**Step 2: Test manually**

Run: `cd scraper && uvicorn api:app --reload --port 8000`

In another terminal:
```bash
curl -X POST http://localhost:8000/api/enrich \
  -H "Content-Type: application/json" \
  -d '{"ticket_url": "https://etix.com/ticket/p/83032471/"}'
```

Expected: JSON response with success: true and extracted data

**Step 3: Commit**

```bash
git add scraper/api.py
git commit -m "feat(api): add /api/enrich endpoint for ticket enrichment"
```

---

### Task 9: Add Enrich Button to Admin UI

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

**Step 1: Add enrichment state and handler**

Add new state variables after existing state declarations (~line 68):

```typescript
const [enriching, setEnriching] = useState<string | null>(null);
const [enrichResult, setEnrichResult] = useState<{
  eventId: string;
  success: boolean;
  source?: string;
  data?: {
    time: string | null;
    price: string | null;
    image_url: string | null;
    supporting_artists: string[] | null;
  };
  error?: string;
  domain?: string;
} | null>(null);
const [showEnrichJson, setShowEnrichJson] = useState(false);
```

Add the enrich handler function (after existing handlers):

```typescript
const handleEnrich = async (event: DbEvent) => {
  if (!event.ticket_url) return;

  setEnriching(event.id);
  setEnrichResult(null);
  setShowEnrichJson(false);

  try {
    const response = await fetch("http://localhost:8000/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_url: event.ticket_url }),
    });

    const result = await response.json();
    setEnrichResult({ eventId: event.id, ...result });
  } catch (error) {
    setEnrichResult({
      eventId: event.id,
      success: false,
      error: `Network error: ${error}`,
    });
  } finally {
    setEnriching(null);
  }
};

const applyEnrichment = (event: DbEvent) => {
  if (!enrichResult?.data) return;

  setEditingEvent(event);
  setEditForm({
    ...event,
    time: enrichResult.data.time || event.time,
    price: enrichResult.data.price || event.price,
    image_url: enrichResult.data.image_url || event.image_url,
    supporting_artists: enrichResult.data.supporting_artists || event.supporting_artists,
  });
  setEnrichResult(null);
};
```

**Step 2: Add Enrich button to pending events list**

In the pending events rendering section, add an Enrich button next to Edit. Find where the Edit button is rendered for pending events and add:

```tsx
{event.ticket_url && (
  <button
    onClick={() => handleEnrich(event)}
    disabled={enriching === event.id}
    className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
  >
    {enriching === event.id ? "..." : "Enrich"}
  </button>
)}
```

**Step 3: Add enrichment result display**

After the Enrich button, add the result display:

```tsx
{enrichResult?.eventId === event.id && (
  <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
    {enrichResult.success ? (
      <>
        <div className="text-green-400 mb-2">
          Found: {[
            enrichResult.data?.time && "time",
            enrichResult.data?.price && "price",
            enrichResult.data?.image_url && "image",
            enrichResult.data?.supporting_artists?.length && "artists"
          ].filter(Boolean).join(", ") || "nothing"}
          <span className="text-gray-500 ml-2">via {enrichResult.source}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => applyEnrichment(event)}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            Apply to Event
          </button>
          <button
            onClick={() => setShowEnrichJson(!showEnrichJson)}
            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {showEnrichJson ? "Hide JSON" : "View JSON"}
          </button>
          <button
            onClick={() => setEnrichResult(null)}
            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Dismiss
          </button>
        </div>
        {showEnrichJson && (
          <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-x-auto">
            {JSON.stringify(enrichResult, null, 2)}
          </pre>
        )}
      </>
    ) : (
      <div className="text-red-400">
        Error: {enrichResult.error}
        {enrichResult.domain && <span className="text-gray-500 ml-2">({enrichResult.domain})</span>}
        <button
          onClick={() => setEnrichResult(null)}
          className="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Dismiss
        </button>
      </div>
    )}
  </div>
)}
```

**Step 4: Test locally**

Run frontend: `npm run dev`
Run API: `cd scraper && uvicorn api:app --reload --port 8000`

1. Go to admin dashboard
2. Find a pending event with a ticket_url
3. Click Enrich
4. Verify result appears with Apply/View JSON/Dismiss buttons

**Step 5: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat(admin): add Enrich button to pending events"
```

---

### Task 10: Final Integration Test

**Files:**
- Test manually with real URLs

**Step 1: Test the full flow with real ticket URLs**

Start the API:
```bash
cd scraper && uvicorn api:app --reload --port 8000
```

Test each ticket site:
```bash
# Etix
curl -X POST http://localhost:8000/api/enrich \
  -H "Content-Type: application/json" \
  -d '{"ticket_url": "https://etix.com/ticket/p/83032471/"}'

# SeeTickets
curl -X POST http://localhost:8000/api/enrich \
  -H "Content-Type: application/json" \
  -d '{"ticket_url": "https://wl.seetickets.us/event/all-them-witches/666174"}'

# fave.co (redirect)
curl -X POST http://localhost:8000/api/enrich \
  -H "Content-Type: application/json" \
  -d '{"ticket_url": "https://fave.co/43cF3Zh"}'

# ticketomaha (should use JSON-LD)
curl -X POST http://localhost:8000/api/enrich \
  -H "Content-Type: application/json" \
  -d '{"ticket_url": "https://ticketomaha.com/events/toto-bshd"}'
```

**Step 2: Verify in admin UI**

1. Start frontend: `npm run dev`
2. Go to `/admin` → Pending tab
3. Find an event with ticket_url
4. Click Enrich
5. Verify data appears
6. Click "Apply to Event"
7. Verify edit form is populated
8. Save changes

**Step 3: Run all tests**

```bash
cd scraper && python -m pytest tests/test_ticket*.py -v
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(tickets): complete ticket enrichment system

- Base infrastructure with EnrichedEvent dataclass
- URL resolver for fave.co redirects
- JSON-LD structured data extractor
- Heuristics fallback (og:image, time/price patterns)
- Etix scraper
- SeeTickets scraper
- /api/enrich endpoint
- Admin UI Enrich button with Apply/View JSON/Dismiss"
```

---

## Summary

This plan implements Phase 1 of the ticket scrapers:

| Task | Description |
|------|-------------|
| 1 | Base infrastructure (EnrichedEvent, BaseTicketScraper) |
| 2 | URL resolver for fave.co redirects |
| 3 | JSON-LD structured data extractor |
| 4 | Heuristics fallback extractor |
| 5 | Etix scraper |
| 6 | SeeTickets scraper |
| 7 | Main enricher with registry |
| 8 | API endpoint |
| 9 | Admin UI Enrich button |
| 10 | Integration testing |

**Phase 2** (eventbrite, ticketweb) and **Phase 3** (ticketmaster, automation) can follow the same pattern - just add new scraper files and register them.
