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
from scrapers.ticketweb import TicketWebScraper
from scrapers.thesydney import TheSydneyScraper


# Venues whose scraper already gets its shows from Ticketmaster's API.
TICKETMASTER_BACKED_SCRAPERS = {"stircove"}


def uncovered_venue_ids(supabase_client, scrapers) -> set[str]:
    """Active venues that no venue scraper covers (the 'other' bucket is never a real venue)."""
    covered = {s.id for s in scrapers} | TICKETMASTER_BACKED_SCRAPERS | {"other"}
    try:
        rows = supabase_client.table("venues").select("id").eq("active", True).execute().data or []
    except Exception as e:
        print(f"  Could not load venues for Ticketmaster coverage: {e}")
        return set()
    uncovered = {r["id"] for r in rows} - covered
    if uncovered:
        print(f"  Ticketmaster will cover venues without a scraper: {', '.join(sorted(uncovered))}")
    return uncovered


def get_scrapers(supabase_client=None, venue_matcher=None, api_keys=None, include_on_demand=False):
    """Get list of scrapers, optionally with Supabase client for dedup.

    Args:
        include_on_demand: If True, include scrapers that should only run on-demand
                          (ohmyomaha, ticketmaster). Default False for daily runs.
    """
    api_keys = api_keys or {}

    scrapers = [
        # Primary scrapers - run daily
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
    ]

    # Venues that sell through TicketWeb: read their TicketWeb venue page (structured data)
    scrapers.append(TicketWebScraper("Barnato", "barnato", "https://www.ticketweb.com/venue/barnato-omaha-ne/482015"))

    # Ticketmaster, but only for venues with no scraper of their own (e.g. Pinewood Bowl, Whiskey Roadhouse).
    # Limiting it to those venues avoids the duplicates the full metro sweep caused at venues we already scrape.
    ticketmaster_key = api_keys.get("ticketmaster") or os.environ.get("TICKETMASTER_API_KEY")
    if not include_on_demand and ticketmaster_key and supabase_client is not None:
        uncovered = uncovered_venue_ids(supabase_client, scrapers)
        if uncovered:
            scrapers.append(TicketmasterClient(
                supabase_client=supabase_client,
                venue_matcher=venue_matcher,
                api_key=ticketmaster_key,
                only_venue_ids=uncovered,
            ))

    # On-demand only scrapers (discovery/aggregator scrapers)
    if include_on_demand:
        scrapers.append(OhMyOmahaScraper(supabase_client=supabase_client, venue_matcher=venue_matcher))

        # Ticketmaster - catches events we missed, dedupes against existing
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
