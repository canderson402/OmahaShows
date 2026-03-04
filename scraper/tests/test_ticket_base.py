import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.base import EnrichedEvent

def test_enriched_event_creation():
    event = EnrichedEvent(
        time="19:00",
        price="$25 - $35",
        image_url="https://example.com/image.jpg",
        supporting_artists=["Artist B", "Artist C"],
        source="test"
    )
    assert event.time == "19:00"
    assert event.price == "$25 - $35"
    assert event.source == "test"

def test_enriched_event_partial():
    event = EnrichedEvent(
        time="20:00",
        price=None,
        image_url=None,
        supporting_artists=None,
        source="heuristics"
    )
    assert event.time == "20:00"
    assert event.price is None
    assert event.source == "heuristics"

def test_enriched_event_to_dict():
    event = EnrichedEvent(
        time="19:00",
        price="$25",
        image_url="https://example.com/img.jpg",
        supporting_artists=["Opener"],
        source="etix"
    )
    d = event.to_dict()
    assert d["time"] == "19:00"
    assert d["source"] == "etix"
