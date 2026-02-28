# scraper/tests/test_models.py
import pytest
from models import Event

def test_event_model_creates_valid_event():
    event = Event(
        id="theslowdown-2026-03-15-test-band",
        title="Test Band",
        date="2026-03-15",
        time="20:00",
        venue="Slowdown",
        venueUrl="https://theslowdown.com",
        ticketUrl="https://theslowdown.com/events/test",
        price="$25",
        source="theslowdown"
    )
    assert event.title == "Test Band"
    assert event.venue == "Slowdown"

def test_event_model_optional_fields():
    event = Event(
        id="test-123",
        title="Minimal Event",
        date="2026-03-15",
        venue="Test Venue",
        source="test"
    )
    assert event.time is None
    assert event.imageUrl is None
    assert event.ageRestriction is None
