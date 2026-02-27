# scraper/tests/test_waitingroom.py
import pytest
import sys
from pathlib import Path
import sys; from pathlib import Path; sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.waitingroom import WaitingRoomScraper

@pytest.fixture
def sample_html():
    fixture_path = Path(__file__).parent / "fixtures" / "waitingroom_sample.html"
    return fixture_path.read_text()

def test_waitingroom_scraper_parses_events(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    assert len(events) > 0
    event = events[0]
    assert event.source == "waitingroom"
    assert event.venue == "Waiting Room Lounge"
    assert event.title  # Has a title
    assert event.date   # Has a date

def test_waitingroom_scraper_attributes():
    scraper = WaitingRoomScraper()
    assert scraper.name == "Waiting Room Lounge"
    assert scraper.id == "waitingroom"
    assert "waitingroomlounge.com" in scraper.url

def test_waitingroom_scraper_parses_all_events(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    # Sample fixture has 5 events
    assert len(events) == 5

def test_waitingroom_scraper_extracts_title(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    titles = [e.title for e in events]
    assert "Snowball Showdown 2!!" in titles
    assert "Jeff Tweedy" in titles  # Sold out event

def test_waitingroom_scraper_extracts_date(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    # All dates should be in YYYY-MM-DD format
    for event in events:
        assert len(event.date) == 10
        assert event.date[4] == "-"
        assert event.date[7] == "-"

def test_waitingroom_scraper_extracts_ticket_url(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    # Most events should have ticket URLs (some might be sold out)
    events_with_tickets = [e for e in events if e.ticketUrl]
    assert len(events_with_tickets) > 0
    for event in events_with_tickets:
        assert "etix.com" in event.ticketUrl or "waitingroomlounge.com" in event.ticketUrl

def test_waitingroom_scraper_extracts_image_url(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.imageUrl is not None
        assert "waitingroomlounge.com" in event.imageUrl

def test_waitingroom_scraper_extracts_price(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    # At least some events should have prices
    events_with_prices = [e for e in events if e.price]
    assert len(events_with_prices) > 0
    # Prices should contain dollar amounts
    for event in events_with_prices:
        assert "$" in event.price

def test_waitingroom_scraper_extracts_age_restriction(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    ages = [e.ageRestriction for e in events if e.ageRestriction]
    # We should have different age restrictions
    assert any("ALL AGES" in age.upper() for age in ages)

def test_waitingroom_scraper_extracts_18_plus(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    ages = [e.ageRestriction for e in events if e.ageRestriction]
    # Sample has 18+ event
    assert any("18+" in age for age in ages)

def test_waitingroom_scraper_extracts_time(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    # All events should have a time
    for event in events:
        assert event.time is not None
        assert ":" in event.time

def test_waitingroom_scraper_generates_unique_ids(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    ids = [e.id for e in events]
    # All IDs should be unique
    assert len(ids) == len(set(ids))
    # All IDs should start with source prefix
    for event_id in ids:
        assert event_id.startswith("waitingroom-")

def test_waitingroom_scraper_sets_venue_url(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.venueUrl == "https://waitingroomlounge.com"

def test_waitingroom_scraper_extracts_supporting_artists(sample_html):
    scraper = WaitingRoomScraper()
    events = scraper.parse_events(sample_html)

    for event in events:
        assert event.supportingArtists is None or isinstance(event.supportingArtists, list)
