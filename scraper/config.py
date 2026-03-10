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
from scrapers.baxterarena import BaxterArenaScraper
from scrapers.stircove import StirCoveScraper
from scrapers.opa import OPAScraper
from scrapers.omahaunderground import OtherVenuesScraper
from scrapers.ohmyomaha import OhMyOmahaScraper


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
        BaxterArenaScraper(),
        StirCoveScraper(),
        OPAScraper("Holland Performing Arts Center", "holland"),
        OPAScraper("Orpheum Theater", "orpheum"),
        OtherVenuesScraper(supabase_client=supabase_client, venue_matcher=venue_matcher),
        OhMyOmahaScraper(supabase_client=supabase_client, venue_matcher=venue_matcher),
    ]


# Keep SCRAPERS for backwards compatibility
SCRAPERS = get_scrapers()
