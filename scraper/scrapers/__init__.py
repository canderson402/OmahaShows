# scraper/scrapers/__init__.py
from scrapers.base import BaseScraper
from scrapers.theslowdown import SlowdownScraper
from scrapers.waitingroom import WaitingRoomScraper

__all__ = ['BaseScraper', 'SlowdownScraper', 'WaitingRoomScraper']
