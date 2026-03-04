import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scrapers.tickets.structured_data import extract_json_ld

SAMPLE_HTML_WITH_JSONLD = '''
<html>
<head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Test Concert",
  "startDate": "2026-04-15T19:00:00",
  "image": "https://example.com/image.jpg",
  "offers": {
    "@type": "Offer",
    "price": "25.00",
    "priceCurrency": "USD"
  },
  "performer": [
    {"@type": "MusicGroup", "name": "Main Artist"},
    {"@type": "MusicGroup", "name": "Opener"}
  ]
}
</script>
</head>
<body></body>
</html>
'''

SAMPLE_HTML_NO_JSONLD = '''
<html><head></head><body>No structured data</body></html>
'''

def test_extract_json_ld_full():
    result = extract_json_ld(SAMPLE_HTML_WITH_JSONLD)
    assert result is not None
    assert result.time == "19:00"
    assert result.price == "$25.00"
    assert result.image_url == "https://example.com/image.jpg"
    assert result.supporting_artists == ["Opener"]
    assert result.source == "json_ld"

def test_extract_json_ld_missing():
    result = extract_json_ld(SAMPLE_HTML_NO_JSONLD)
    assert result is None
