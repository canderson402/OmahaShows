# scraper/config.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
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
