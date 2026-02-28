# scraper/tests/test_theslowdown.py
import pytest
import sys
from pathlib import Path
import sys; from pathlib import Path; sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.theslowdown import SlowdownScraper

@pytest.fixture
def sample_html():
    fixture_path = Path(__file__).parent / "fixtures" / "theslowdown_sample.html"
    return fixture_path.read_text()

def test_slowdown_scraper_parses_events(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    assert len(events) > 0
    event = events[0]
    assert event.source == "theslowdown"
    assert event.venue == "Slowdown"
    assert event.title  # Has a title
    assert event.date   # Has a date

def test_slowdown_scraper_attributes():
    scraper = SlowdownScraper()
    assert scraper.name == "Slowdown"
    assert scraper.id == "theslowdown"
    assert "theslowdown.com" in scraper.url

def test_slowdown_scraper_parses_all_events(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    # Sample fixture has 3 events
    assert len(events) == 3

def test_slowdown_scraper_extracts_title(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    titles = [e.title for e in events]
    assert "Gannon Fremin & CCREV" in titles
    assert "Can't Feel My Face: 2010s Dance Party" in titles
    assert "All Them Witches" in titles

def test_slowdown_scraper_extracts_date(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    # All dates should be in YYYY-MM-DD format
    for event in events:
        assert len(event.date) == 10
        assert event.date[4] == "-"
        assert event.date[7] == "-"

def test_slowdown_scraper_extracts_ticket_url(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.ticketUrl is not None
        assert "seetickets.us" in event.ticketUrl

def test_slowdown_scraper_extracts_image_url(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.imageUrl is not None
        assert "seetickets.us" in event.imageUrl

def test_slowdown_scraper_extracts_price(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    prices = [e.price for e in events]
    assert "$14.00-$17.00" in prices
    assert "$12.50-$20.00" in prices
    assert "$35.00-$60.00" in prices

def test_slowdown_scraper_extracts_age_restriction(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    ages = [e.ageRestriction for e in events]
    assert "All Ages*" in ages
    assert "21+" in ages

def test_slowdown_scraper_extracts_time(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    # All events should have a time extracted from show time
    for event in events:
        assert event.time is not None
        assert ":" in event.time

def test_slowdown_scraper_generates_unique_ids(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    ids = [e.id for e in events]
    # All IDs should be unique
    assert len(ids) == len(set(ids))
    # All IDs should start with source prefix
    for event_id in ids:
        assert event_id.startswith("theslowdown-")

def test_slowdown_scraper_extracts_supporting_artists(sample_html):
    scraper = SlowdownScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.supportingArtists is None or isinstance(event.supportingArtists, list)
