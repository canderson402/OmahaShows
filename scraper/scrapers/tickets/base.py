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
