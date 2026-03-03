# scraper/api.py
import sys
from datetime import datetime, timezone
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import Event, SourceStatus, ScraperOutput
from scrapers.theslowdown import SlowdownScraper
from scrapers.waitingroom import WaitingRoomScraper
from scrapers.reverblounge import ReverbLoungeScraper
from scrapers.bourbontheatre import BourbonTheatreScraper
from scrapers.admiral import AdmiralScraper
from scrapers.astrotheater import AstroTheaterScraper
from scrapers.steelhouse import SteelHouseScraper
from scrapers.omahaunderground import OtherVenuesScraper

app = FastAPI(title="ShowCal Scraper API")

# Allow CORS for local development (any localhost port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scraper registry
SCRAPERS = {
    "theslowdown": SlowdownScraper(),
    "waitingroom": WaitingRoomScraper(),
    "reverblounge": ReverbLoungeScraper(),
    "bourbontheatre": BourbonTheatreScraper(),
    "admiral": AdmiralScraper(),
    "astrotheater": AstroTheaterScraper(),
    "steelhouse": SteelHouseScraper(),
    "other": OtherVenuesScraper(),
}


class ScrapeResponse(BaseModel):
    success: bool
    message: str
    data: ScraperOutput | None = None


@app.post("/api/scrape/all")
def scrape_all() -> ScrapeResponse:
    """Run all scrapers and return results (no file saving)."""
    sources: list[SourceStatus] = []
    all_events: list[Event] = []

    for scraper_id, scraper in SCRAPERS.items():
        status = "ok"
        error = None
        events: list[Event] = []

        try:
            events = scraper.scrape()
            all_events.extend(events)
        except Exception as e:
            status = "error"
            error = str(e)

        sources.append(SourceStatus(
            name=scraper.name,
            id=scraper.id,
            url=scraper.url,
            status=status,
            lastScraped=datetime.now(timezone.utc).isoformat(),
            eventCount=len(events),
            error=error
        ))

    all_events.sort(key=lambda e: e.date)

    output = ScraperOutput(
        events=all_events,
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        sources=sources
    )

    return ScrapeResponse(
        success=True,
        message=f"Scraped {len(all_events)} events from {len(sources)} sources",
        data=output
    )


@app.get("/api/raw/{venue_id}")
def get_raw_venue(venue_id: str):
    """Get raw scraped data for a single venue (without saving)."""
    if venue_id not in SCRAPERS:
        raise HTTPException(status_code=404, detail=f"Unknown venue: {venue_id}")

    scraper = SCRAPERS[venue_id]

    try:
        events = scraper.scrape()
        return {
            "venue": scraper.name,
            "venue_id": scraper.id,
            "url": scraper.url,
            "event_count": len(events),
            "events": [e.model_dump() for e in events]
        }
    except Exception as e:
        return {
            "venue": scraper.name,
            "venue_id": scraper.id,
            "url": scraper.url,
            "error": str(e),
            "events": []
        }


@app.post("/api/scrape/{venue_id}")
def scrape_venue(venue_id: str) -> ScrapeResponse:
    """Run scraper for a single venue and return results (no file saving)."""
    if venue_id not in SCRAPERS:
        raise HTTPException(status_code=404, detail=f"Unknown venue: {venue_id}")

    scraper = SCRAPERS[venue_id]

    status = "ok"
    error = None
    events: list[Event] = []

    try:
        events = scraper.scrape()
    except Exception as e:
        status = "error"
        error = str(e)

    source = SourceStatus(
        name=scraper.name,
        id=scraper.id,
        url=scraper.url,
        status=status,
        lastScraped=datetime.now(timezone.utc).isoformat(),
        eventCount=len(events),
        error=error
    )

    output = ScraperOutput(
        events=events,
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        sources=[source]
    )

    return ScrapeResponse(
        success=status == "ok",
        message=f"Scraped {len(events)} events from {scraper.name}" if status == "ok" else f"Error: {error}",
        data=output
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
