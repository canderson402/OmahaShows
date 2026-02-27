# scraper/tests/test_reverblounge.py
import pytest
import sys
from pathlib import Path
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.reverblounge import ReverbLoungeScraper


@pytest.fixture
def sample_html():
    fixture_path = Path(__file__).parent / "fixtures" / "reverblounge_sample.html"
    return fixture_path.read_text()


def test_reverblounge_scraper_parses_events(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    assert len(events) > 0
    event = events[0]
    assert event.source == "reverblounge"
    assert event.venue == "Reverb Lounge"
    assert event.title  # Has a title
    assert event.date   # Has a date


def test_reverblounge_scraper_attributes():
    scraper = ReverbLoungeScraper()
    assert scraper.name == "Reverb Lounge"
    assert scraper.id == "reverblounge"
    assert "reverblounge.com" in scraper.url


def test_reverblounge_scraper_parses_all_events(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # Sample fixture has 3 events
    assert len(events) == 3


def test_reverblounge_scraper_extracts_title(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    titles = [e.title for e in events]
    assert "Psyclon Nine" in titles
    assert "JACK" in titles
    assert "Ricky Chilton" in titles


def test_reverblounge_scraper_extracts_date(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # All dates should be in YYYY-MM-DD format
    for event in events:
        assert len(event.date) == 10
        assert event.date[4] == "-"
        assert event.date[7] == "-"


def test_reverblounge_scraper_extracts_ticket_url(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # Events with tickets should have etix URLs
    events_with_etix = [e for e in events if e.ticketUrl and "etix.com" in e.ticketUrl]
    assert len(events_with_etix) >= 2  # JACK and Ricky Chilton have etix links


def test_reverblounge_scraper_fallback_ticket_url(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # Psyclon Nine has no etix link, should fall back to More Info
    psyclon = next(e for e in events if e.title == "Psyclon Nine")
    assert psyclon.ticketUrl is not None
    assert "reverblounge.com" in psyclon.ticketUrl


def test_reverblounge_scraper_extracts_image_url(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.imageUrl is not None
        assert "reverblounge.com" in event.imageUrl


def test_reverblounge_scraper_extracts_price(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # All events should have prices
    for event in events:
        assert event.price is not None
        assert "$" in event.price


def test_reverblounge_scraper_extracts_age_restriction(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # All events should have age restrictions
    for event in events:
        assert event.ageRestriction is not None
        assert "AGES" in event.ageRestriction.upper()


def test_reverblounge_scraper_extracts_time(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    # All events should have a time
    for event in events:
        assert event.time is not None
        assert ":" in event.time


def test_reverblounge_scraper_generates_unique_ids(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    ids = [e.id for e in events]
    # All IDs should be unique
    assert len(ids) == len(set(ids))
    # All IDs should start with source prefix
    for event_id in ids:
        assert event_id.startswith("reverblounge-")


def test_reverblounge_scraper_sets_venue_url(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.venueUrl == "https://reverblounge.com"


def test_reverblounge_scraper_time_parsing():
    scraper = ReverbLoungeScraper()

    # Test show time extraction
    assert scraper._parse_time("Doors: 6 pm // Show: 6:30 pm") == "18:30"
    assert scraper._parse_time("Doors: 7 pm // Show: 8 pm") == "20:00"
    assert scraper._parse_time("Show: 7:30 pm") == "19:30"

    # Test fallback to doors time
    assert scraper._parse_time("Doors: 7 pm") == "19:00"


def test_reverblounge_scraper_date_parsing():
    scraper = ReverbLoungeScraper()

    # Test date parsing (assuming current year is 2026 based on fixture data)
    result = scraper._parse_date("Thu, Feb 26")
    assert result is not None
    assert result.endswith("-02-26")

    result = scraper._parse_date("Sat, Feb 28")
    assert result is not None
    assert result.endswith("-02-28")


def test_reverblounge_scraper_extracts_supporting_artists(sample_html):
    scraper = ReverbLoungeScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.supportingArtists is None or isinstance(event.supportingArtists, list)
