# scraper/scrapers/base.py
from abc import ABC, abstractmethod
import sys
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
import requests
from bs4 import BeautifulSoup
from models import Event

class BaseScraper(ABC):
    name: str
    id: str
    url: str
    timeout: int = 30

    def fetch_html(self) -> str:
        """Fetch HTML from the venue's events page."""
        response = requests.get(self.url, timeout=self.timeout)
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
