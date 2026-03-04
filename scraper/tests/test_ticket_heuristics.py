import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.heuristics import extract_heuristics

SAMPLE_HTML_WITH_OG = '''
<html>
<head>
<meta property="og:image" content="https://example.com/og-image.jpg">
</head>
<body>
<p>Doors: 7:00 PM | Show: 8:00 PM</p>
<p>Price: $25 - $40</p>
</body>
</html>
'''

def test_extract_og_image():
    result = extract_heuristics(SAMPLE_HTML_WITH_OG)
    assert result is not None
    assert result.image_url == "https://example.com/og-image.jpg"
    assert result.source == "heuristics"

def test_extract_time_patterns():
    result = extract_heuristics(SAMPLE_HTML_WITH_OG)
    assert result.time == "20:00"  # Show time preferred over doors

def test_extract_price_patterns():
    result = extract_heuristics(SAMPLE_HTML_WITH_OG)
    assert "$25" in result.price and "$40" in result.price
