import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets import enrich_from_url, get_scraper_for_domain, TICKET_SCRAPERS

def test_registry_has_scrapers():
    assert "etix.com" in TICKET_SCRAPERS
    assert "seetickets.us" in TICKET_SCRAPERS

def test_get_scraper_for_known_domain():
    scraper = get_scraper_for_domain("etix.com")
    assert scraper is not None
    assert scraper.name == "Etix"

def test_get_scraper_for_unknown_domain():
    scraper = get_scraper_for_domain("unknownsite.xyz")
    assert scraper is None
