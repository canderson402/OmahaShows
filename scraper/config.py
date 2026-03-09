# scraper/config.py
import sys
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.theslowdown import SlowdownScraper
from scrapers.waitingroom import WaitingRoomScraper
from scrapers.reverblounge import ReverbLoungeScraper
from scrapers.bourbontheatre import BourbonTheatreScraper
from scrapers.admiral import AdmiralScraper
from scrapers.astrotheater import AstroTheaterScraper
from scrapers.steelhouse import SteelHouseScraper
from scrapers.omahaunderground import OtherVenuesScraper


def get_scrapers(supabase_client=None, venue_matcher=None):
    """Get list of scrapers, optionally with Supabase client for dedup."""
    return [
        SlowdownScraper(),
        WaitingRoomScraper(),
        ReverbLoungeScraper(),
        BourbonTheatreScraper(),
        AdmiralScraper(),
        AstroTheaterScraper(),
        SteelHouseScraper(),
        OtherVenuesScraper(supabase_client=supabase_client, venue_matcher=venue_matcher),
    ]


# Keep SCRAPERS for backwards compatibility
SCRAPERS = get_scrapers()
