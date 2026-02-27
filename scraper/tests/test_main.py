# scraper/tests/test_main.py
import pytest
import json
import sys
from pathlib import Path
import sys; from pathlib import Path; sys.path.insert(0, str(Path(__file__).parent.parent))
from main import run_all_scrapers, save_output

def test_save_output_creates_valid_json(tmp_path):
    from models import Event, SourceStatus, ScraperOutput

    output = ScraperOutput(
        events=[Event(
            id="test-1",
            title="Test",
            date="2026-01-01",
            venue="Test Venue",
            source="test"
        )],
        lastUpdated="2026-01-01T00:00:00Z",
        sources=[SourceStatus(
            name="Test",
            id="test",
            url="https://test.com",
            status="ok",
            lastScraped="2026-01-01T00:00:00Z",
            eventCount=1,
            error=None
        )]
    )

    output_path = tmp_path / "events.json"
    save_output(output, output_path)

    assert output_path.exists()
    data = json.loads(output_path.read_text())
    assert len(data["events"]) == 1
    assert data["events"][0]["title"] == "Test"
