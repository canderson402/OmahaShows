# scraper/config.py
import os
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
from scrapers.ticketmaster import TicketmasterClient
from scrapers.thesydney import TheSydneyScraper


def get_scrapers(supabase_client=None, venue_matcher=None, api_keys=None):
    """Get list of scrapers, optionally with Supabase client for dedup."""
    api_keys = api_keys or {}

    scrapers = [
        # Primary scrapers - run first, their data is preferred
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
        TheSydneyScraper(),
        OtherVenuesScraper(supabase_client=supabase_client, venue_matcher=venue_matcher),
        OhMyOmahaScraper(supabase_client=supabase_client, venue_matcher=venue_matcher),
    ]

    # Ticketmaster runs last - catches events we missed, dedupes against existing
    ticketmaster_key = api_keys.get("ticketmaster") or os.environ.get("TICKETMASTER_API_KEY")
    if ticketmaster_key:
        scrapers.append(TicketmasterClient(
            supabase_client=supabase_client,
            venue_matcher=venue_matcher,
            api_key=ticketmaster_key
        ))

    return scrapers


# Keep SCRAPERS for backwards compatibility
SCRAPERS = get_scrapers()
