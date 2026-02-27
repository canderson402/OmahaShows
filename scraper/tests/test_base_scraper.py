# scraper/tests/test_base_scraper.py
import pytest
import sys
import sys; from pathlib import Path; sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.base import BaseScraper
from models import Event

class MockScraper(BaseScraper):
    name = "Mock Venue"
    id = "mock"
    url = "https://example.com/events"

    def parse_events(self, html: str) -> list[Event]:
        return [Event(
            id="mock-2026-01-01-test",
            title="Test Event",
            date="2026-01-01",
            venue=self.name,
            source=self.id
        )]

def test_base_scraper_has_required_attributes():
    scraper = MockScraper()
    assert scraper.name == "Mock Venue"
    assert scraper.id == "mock"
    assert scraper.url == "https://example.com/events"

def test_base_scraper_parse_events_returns_list():
    scraper = MockScraper()
    events = scraper.parse_events("<html></html>")
    assert len(events) == 1
    assert events[0].title == "Test Event"
