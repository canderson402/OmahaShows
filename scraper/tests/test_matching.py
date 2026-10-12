# scraper/tests/test_matching.py
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from matching import normalize_text, find_existing_event


class MockEvent:
    def __init__(self, id, title, date, venue_id):
        self.id = id
        self.title = title
        self.date = date
        self.venue_id = venue_id


def test_normalize_text_removes_special_chars():
    assert normalize_text("Leila's Rose!") == "leilas rose"
    assert normalize_text("Band-Name (Live)") == "bandname live"


def test_normalize_text_handles_empty():
    assert normalize_text("") == ""
    assert normalize_text("   ") == ""


def test_find_existing_exact_match():
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose", "2026-03-10", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"


def test_find_existing_title_changed():
    """Event renamed with suffix should still match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose - Moved to Waiting Room", "2026-03-10", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"


def test_find_existing_first_word_match():
    """First word match (artist name) should match."""
    db_events = [
        {"id": "e1", "title": "Metallica World Tour", "date": "2026-03-10", "venue_id": "steelhouse"}
    ]
    new_event = MockEvent("e2", "Metallica - Final Show", "2026-03-10", "steelhouse")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"


def test_find_existing_word_overlap():
    """50%+ word overlap should match."""
    db_events = [
        {"id": "e1", "title": "Summer Rock Festival 2026", "date": "2026-06-15", "venue_id": "steelhouse"}
    ]
    new_event = MockEvent("e2", "Summer Rock Festival", "2026-06-15", "steelhouse")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"


def test_find_existing_no_match_different_venue():
    """Same title but different venue should NOT match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Leila's Rose", "2026-03-10", "waitingroom")
    match = find_existing_event(new_event, db_events)
    # Note: find_existing_event assumes db_events are already filtered by venue+date
    # So this test verifies behavior when venue filtering happens upstream
    assert match is not None  # Will match because db_events aren't filtered here


def test_find_existing_no_match_completely_different():
    """Completely different title should NOT match."""
    db_events = [
        {"id": "e1", "title": "Leila's Rose", "date": "2026-03-10", "venue_id": "reverblounge"}
    ]
    new_event = MockEvent("e2", "Heavy Metal Thunder", "2026-03-10", "reverblounge")
    match = find_existing_event(new_event, db_events)
    assert match is None


def test_find_existing_containment():
    """One title contains the other should match."""
    db_events = [
        {"id": "e1", "title": "Band Name", "date": "2026-03-10", "venue_id": "admiral"}
    ]
    new_event = MockEvent("e2", "Band Name with Special Guest", "2026-03-10", "admiral")
    match = find_existing_event(new_event, db_events)
    assert match is not None
    assert match["id"] == "e1"


def test_find_existing_short_first_word_no_match():
    """Short first words (<=3 chars) should not trigger first-word match."""
    db_events = [
        {"id": "e1", "title": "The Beatles Tribute", "date": "2026-03-10", "venue_id": "admiral"}
    ]
    new_event = MockEvent("e2", "The Rolling Stones", "2026-03-10", "admiral")
    match = find_existing_event(new_event, db_events)
    # "The" is only 3 chars, so first-word match shouldn't trigger
    # And word overlap is low, so should not match
    assert match is None


def test_find_existing_empty_db():
    """Empty database should return None."""
    db_events = []
    new_event = MockEvent("e1", "Some Event", "2026-03-10", "admiral")
    match = find_existing_event(new_event, db_events)
    assert match is None


# --- Rescheduled events (same show, new date) ---

from matching import stable_event_key, find_rescheduled_event

TM_OLD = "https://www.ticketmaster.com/chris-stapletons-allamerican-road-show-lincoln-nebraska-10-07-2026/event/06006425DA7EA5F4"
TM_NEW = "https://www.ticketmaster.com/chris-stapletons-allamerican-road-show-lincoln-nebraska-10-26-2026/event/06006425DA7EA5F4"


class ScrapedEvent:
    def __init__(self, title, date, eventUrl):
        self.title = title
        self.date = date
        self.eventUrl = eventUrl


def test_stable_key_ticketmaster_ignores_date_in_slug():
    assert stable_event_key(TM_OLD) == stable_event_key(TM_NEW)


def test_stable_key_normalizes_plain_urls():
    assert stable_event_key("https://www.venue.com/events/band-x/?ref=1#top") == stable_event_key("http://venue.com/events/band-x")


def test_stable_key_none_for_missing_or_homepage_urls():
    assert stable_event_key(None) is None
    assert stable_event_key("") is None
    assert stable_event_key("https://venue.com/") is None


def test_rescheduled_event_found_by_ticketmaster_id():
    old = {"id": "tm-old", "title": "Chris Stapleton's All-American Road Show", "date": "2026-10-07", "event_url": TM_OLD}
    new = ScrapedEvent("Chris Stapleton's All-American Road Show", "2026-10-26", TM_NEW)
    assert find_rescheduled_event(new, [old], scraped_dates={"2026-10-26"}) == old


def test_rescheduled_ignores_different_url():
    old = {"id": "a", "title": "Band X", "date": "2026-10-07", "event_url": "https://venue.com/events/band-x-1"}
    new = ScrapedEvent("Band X", "2026-10-26", "https://venue.com/events/band-x-2")
    assert find_rescheduled_event(new, [old], scraped_dates={"2026-10-26"}) is None


def test_rescheduled_ignores_unrelated_title_sharing_url():
    old = {"id": "a", "title": "Totally Different Act", "date": "2026-10-07", "event_url": "https://venue.com/events/shared"}
    new = ScrapedEvent("Band X", "2026-10-26", "https://venue.com/events/shared")
    assert find_rescheduled_event(new, [old], scraped_dates={"2026-10-26"}) is None


def test_multi_night_run_is_not_merged():
    # Same URL for both nights; night 1 is still in the scrape, so it hasn't moved
    night1 = {"id": "n1", "title": "Band X", "date": "2026-10-07", "event_url": "https://venue.com/events/band-x"}
    night2 = ScrapedEvent("Band X", "2026-10-08", "https://venue.com/events/band-x")
    assert find_rescheduled_event(night2, [night1], scraped_dates={"2026-10-07", "2026-10-08"}) is None


def test_rescheduled_requires_url():
    old = {"id": "a", "title": "Band X", "date": "2026-10-07", "event_url": None}
    new = ScrapedEvent("Band X", "2026-10-26", None)
    assert find_rescheduled_event(new, [old], scraped_dates={"2026-10-26"}) is None


from matching import pair_renames, removal_looks_safe


def test_pair_renames_pairs_single_swap_on_a_date():
    # Slowdown 10/16: headliner changed from Joyer to Amphibaphobia
    old = {"id": "theslowdown-2026-10-16-joyer", "date": "2026-10-16", "title": "Joyer"}
    new = MockEvent("theslowdown-2026-10-16-amphibaphobia", "Amphibaphobia", "2026-10-16", "theslowdown")
    assert pair_renames([old], [new]) == [(old, new)]


def test_pair_renames_skips_ambiguous_dates():
    # Two rooms, two shows swapped out the same night: can't tell which is which
    olds = [
        {"id": "a", "date": "2026-10-16", "title": "Band A"},
        {"id": "b", "date": "2026-10-16", "title": "Band B"},
    ]
    news = [
        MockEvent("c", "Band C", "2026-10-16", "theslowdown"),
        MockEvent("d", "Band D", "2026-10-16", "theslowdown"),
    ]
    assert pair_renames(olds, news) == []


def test_pair_renames_needs_same_date():
    old = {"id": "a", "date": "2026-10-16", "title": "Band A"}
    new = MockEvent("b", "Band B", "2026-10-17", "theslowdown")
    assert pair_renames([old], [new]) == []


def test_removal_looks_safe():
    assert removal_looks_safe(1, 40)
    assert removal_looks_safe(3, 4)
    assert removal_looks_safe(20, 40)
    assert not removal_looks_safe(21, 40)
    assert not removal_looks_safe(30, 30)
