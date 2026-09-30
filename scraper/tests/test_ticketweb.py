# scraper/tests/test_ticketweb.py
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))
from scrapers.ticketweb import TicketWebScraper

BARNATO_URL = "https://www.ticketweb.com/venue/barnato-omaha-ne/482015"


@pytest.fixture
def sample_html():
    return (Path(__file__).parent / "fixtures" / "ticketweb_barnato_sample.html").read_text()


@pytest.fixture
def scraper():
    return TicketWebScraper("Barnato", "barnato", BARNATO_URL)


def test_parses_every_event_from_structured_data(scraper, sample_html):
    events = scraper.parse_events(sample_html)
    assert [(e.date, e.time) for e in events] == [
        ("2026-09-30", "19:30"),
        ("2026-10-07", "20:00"),
        ("2026-10-13", "19:30"),
        ("2026-10-15", "20:00"),
        ("2026-11-07", "20:00"),
    ]


def test_event_fields(scraper, sample_html):
    e = scraper.parse_events(sample_html)[0]
    assert e.title == "GOODBYE JUNE - Trouble For All Tour"
    assert e.venue == "Barnato"
    assert e.source == "barnato"
    assert e.id == "barnato-2026-09-30-goodbye-june-trouble-for-all-tour"
    assert e.ticketUrl == "https://www.ticketweb.com/event/goodbye-june-trouble-barnato-tickets/14250184"
    assert e.eventUrl == e.ticketUrl
    assert e.imageUrl and e.imageUrl.startswith("https://www.ticketweb.com/")
    assert "//i/" not in e.imageUrl.replace("https://", "")  # double slash normalized
    # openers come from the performer list; the headliner is not repeated
    assert e.supportingArtists == ["Me Like Bees"]


def test_ignores_events_at_other_venues_and_non_events(scraper):
    html = """<script type="application/ld+json">[
      {"@type":"MusicEvent","name":"Elsewhere","startDate":"2026-10-01T20:00","url":"https://www.ticketweb.com/event/x/1",
       "location":{"name":"Some Other Club","sameAs":"https://www.ticketweb.com/venue/other/999"}},
      {"@type":"EventVenue","name":"Barnato"},
      {"@type":"MusicEvent","name":"Here","startDate":"2026-10-02T21:00","url":"https://www.ticketweb.com/event/y/2",
       "location":{"name":"Barnato","sameAs":"https://www.ticketweb.com/venue/Barnato/482015"}, "performer":[{"name":"Here"}]}
    ]</script>"""
    events = scraper.parse_events(html)
    assert [e.title for e in events] == ["Here"]
    assert events[0].supportingArtists is None


def test_bad_or_missing_structured_data_yields_nothing(scraper):
    assert scraper.parse_events("<html>no data</html>") == []
    assert scraper.parse_events('<script type="application/ld+json">{not json</script>') == []
    # missing date / name are skipped rather than crashing
    assert scraper.parse_events('<script type="application/ld+json">[{"@type":"MusicEvent","name":"x"}]</script>') == []


def test_attributes(scraper):
    assert (scraper.name, scraper.id, scraper.url) == ("Barnato", "barnato", BARNATO_URL)
