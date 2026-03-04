import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.seetickets import SeeTicketsScraper

def test_seetickets_scraper_domains():
    scraper = SeeTicketsScraper()
    assert "seetickets.us" in scraper.domains
    assert "eventim.us" in scraper.domains

def test_seetickets_scraper_parse():
    scraper = SeeTicketsScraper()
    html = '''
    <html>
    <head><meta property="og:image" content="https://example.com/img.jpg"></head>
    <body>
    <div>Doors: 7:00 PM | Show: 8:00 PM</div>
    <div>$25.00</div>
    </body>
    </html>
    '''
    result = scraper.parse(html)
    assert result.source == "seetickets"
