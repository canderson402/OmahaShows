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

SCRAPERS = [
    SlowdownScraper(),
    WaitingRoomScraper(),
    ReverbLoungeScraper(),
    BourbonTheatreScraper(),
    AdmiralScraper(),
    AstroTheaterScraper(),
    SteelHouseScraper(),
    OtherVenuesScraper(),
]
