# scraper/scrapers/base.py
from abc import ABC, abstractmethod
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import requests
from bs4 import BeautifulSoup
from models import Event

class BaseScraper(ABC):
    name: str
    id: str
    url: str
    timeout: int = 30
    headers: dict = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    def fetch_html(self) -> str:
        """Fetch HTML from the venue's events page."""
        response = requests.get(self.url, headers=self.headers, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def get_soup(self, html: str) -> BeautifulSoup:
        """Parse HTML into BeautifulSoup object."""
        return BeautifulSoup(html, "html.parser")

    @abstractmethod
    def parse_events(self, html: str) -> list[Event]:
        """Parse HTML and return list of Events. Implement in subclass."""
        pass

    def scrape(self) -> list[Event]:
        """Main entry point: fetch and parse events."""
        html = self.fetch_html()
        return self.parse_events(html)
