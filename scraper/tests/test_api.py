# scraper/tests/test_api.py
import pytest
import sys
import sys; from pathlib import Path; sys.path.insert(0, str(Path(__file__).parent.parent))
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_get_events_returns_json():
    response = client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert "sources" in data

def test_scrape_all_returns_success():
    response = client.post("/api/scrape/all")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "events" in data["data"]

def test_scrape_single_venue_returns_success():
    response = client.post("/api/scrape/theslowdown")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True

def test_scrape_invalid_venue_returns_error():
    response = client.post("/api/scrape/invalid-venue")
    assert response.status_code == 404
