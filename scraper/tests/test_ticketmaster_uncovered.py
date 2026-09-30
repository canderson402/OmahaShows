# scraper/tests/test_ticketmaster_uncovered.py
"""Nightly Ticketmaster only covers venues that have no scraper of their own."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import uncovered_venue_ids, get_scrapers
from scrapers.ticketmaster import TicketmasterClient


class FakeQuery:
    def __init__(self, rows): self.rows = rows
    def select(self, *_): return self
    def eq(self, *_): return self
    def execute(self): return type("R", (), {"data": self.rows})()


class FakeSupabase:
    def __init__(self, venue_ids): self.venue_ids = venue_ids
    def table(self, name):
        assert name == "venues"
        return FakeQuery([{"id": v} for v in self.venue_ids])


class FakeMatcher:
    MAP = {"Pinewood Bowl Theater": "pinewood-bowl", "The Slowdown": "theslowdown"}
    def match(self, name):
        v = self.MAP.get(name)
        return (v, "name") if v else None


def tm_event(name, venue):
    return {"id": name, "name": name, "dates": {"start": {"localDate": "2026-10-10", "localTime": "19:00:00"}},
            "_embedded": {"venues": [{"name": venue}]}, "url": "https://www.ticketmaster.com/e/1"}


class _S:
    def __init__(self, id): self.id = id


def test_uncovered_is_active_venues_minus_scraped_ones():
    sb = FakeSupabase(["theslowdown", "barnato", "stircove", "pinewood-bowl", "whiskey-roadhouse", "other"])
    assert uncovered_venue_ids(sb, [_S("theslowdown"), _S("barnato"), _S("other")]) == {"pinewood-bowl", "whiskey-roadhouse"}


def test_venue_limited_mode_keeps_only_uncovered_venues():
    tm = TicketmasterClient(venue_matcher=FakeMatcher(), api_key="k", only_venue_ids={"pinewood-bowl"})
    assert tm.id == "ticketmaster-uncovered"
    assert tm._parse_event(tm_event("Show A", "Pinewood Bowl Theater")) is not None
    assert tm._parse_event(tm_event("Show B", "The Slowdown")) is None       # venue we already scrape
    assert tm._parse_event(tm_event("Show C", "Some Unknown Bar")) is None    # unmatched never lands in 'other'


def test_full_sweep_mode_is_unchanged():
    tm = TicketmasterClient(venue_matcher=FakeMatcher(), api_key="k")
    assert tm.id == "ticketmaster"
    assert tm._parse_event(tm_event("Show B", "The Slowdown")) is not None


def test_daily_scrapers_include_barnato_and_limited_ticketmaster(monkeypatch):
    monkeypatch.setenv("TICKETMASTER_API_KEY", "k")
    sb = FakeSupabase(["theslowdown", "barnato", "pinewood-bowl", "whiskey-roadhouse"])
    scrapers = get_scrapers(supabase_client=sb, venue_matcher=FakeMatcher())
    ids = [s.id for s in scrapers]
    assert "barnato" in ids
    assert ids.count("ticketmaster-uncovered") == 1 and "ticketmaster" not in ids
    tm = next(s for s in scrapers if s.id == "ticketmaster-uncovered")
    assert tm.only_venue_ids == {"pinewood-bowl", "whiskey-roadhouse"}


def test_no_key_means_no_ticketmaster(monkeypatch):
    monkeypatch.delenv("TICKETMASTER_API_KEY", raising=False)
    ids = [s.id for s in get_scrapers(supabase_client=FakeSupabase(["pinewood-bowl"]), venue_matcher=FakeMatcher())]
    assert "ticketmaster-uncovered" not in ids
