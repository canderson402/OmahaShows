import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.resolver import resolve_url, get_domain

def test_get_domain_simple():
    assert get_domain("https://etix.com/ticket/123") == "etix.com"
    assert get_domain("https://www.eventbrite.com/e/test") == "eventbrite.com"
    assert get_domain("https://wl.seetickets.us/event/test") == "seetickets.us"

def test_get_domain_strips_www():
    assert get_domain("https://www.ticketmaster.com/event") == "ticketmaster.com"

def test_get_domain_handles_subdomains():
    # Keep relevant subdomains for seetickets
    assert get_domain("https://wl.seetickets.us/event") == "seetickets.us"
    assert get_domain("https://wl.eventim.us/event") == "eventim.us"
