import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.etix import EtixScraper

def test_etix_scraper_domains():
    scraper = EtixScraper()
    assert "etix.com" in scraper.domains

def test_etix_scraper_parse():
    scraper = EtixScraper()
    html = '''
    <html>
    <head><meta property="og:image" content="https://example.com/img.jpg"></head>
    <body>
    <div>Doors: 7:00 PM | Show: 8:00 PM</div>
    <div>Price: $25.00</div>
    </body>
    </html>
    '''
    result = scraper.parse(html)
    assert result.source == "etix"
    assert result.time is not None
    assert result.image_url == "https://example.com/img.jpg"
