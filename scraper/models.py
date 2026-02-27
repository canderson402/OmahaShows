# scraper/models.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Event(BaseModel):
    id: str
    title: str
    date: str  # YYYY-MM-DD
    time: Optional[str] = None  # HH:MM
    venue: str
    eventUrl: Optional[str] = None  # Event detail page on venue's site
    ticketUrl: Optional[str] = None  # Ticket purchase page (etix, etc.)
    imageUrl: Optional[str] = None
    price: Optional[str] = None
    ageRestriction: Optional[str] = None
    supportingArtists: Optional[list[str]] = None  # ["Artist 1", "Artist 2"]
    source: str
    addedAt: Optional[str] = None  # ISO timestamp when first seen

class SourceStatus(BaseModel):
    name: str
    id: str
    url: str
    status: str  # "ok" or "error"
    lastScraped: str  # ISO timestamp
    eventCount: int
    error: Optional[str] = None

class ScraperOutput(BaseModel):
    events: list[Event]
    lastUpdated: str
    sources: list[SourceStatus]


class HistoricalShow(BaseModel):
    date: str      # YYYY-MM-DD
    title: str     # Band/event name
    venue: str     # Venue name
    supportingArtists: Optional[list[str]] = None


class ShowHistory(BaseModel):
    shows: list[HistoricalShow]
    lastUpdated: str
