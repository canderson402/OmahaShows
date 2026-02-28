# scraper/api.py
import sys
from pathlib import Path
from datetime import datetime, timezone
sys.path.insert(0, str(Path(__file__).parent))

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
from scrapers.opa import OPAScraper
from scrapers.ticketweb import TicketWebScraper

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
    "holland": OPAScraper("Holland Center", "holland"),
    "orpheum": OPAScraper("Orpheum Theater", "orpheum"),
    "barnato": TicketWebScraper("Barnato", "barnato", "https://barnato.bar/events/"),
}

OUTPUT_PATH = Path(__file__).parent / "output" / "events.json"


class ScrapeResponse(BaseModel):
    success: bool
    message: str
    data: ScraperOutput | None = None


def load_events() -> ScraperOutput:
    """Load current events from JSON file."""
    if OUTPUT_PATH.exists():
        import json
        data = json.loads(OUTPUT_PATH.read_text())
        return ScraperOutput(**data)
    return ScraperOutput(events=[], lastUpdated="", sources=[])


def save_events(output: ScraperOutput) -> None:
    """Save events to JSON file."""
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(output.model_dump_json(indent=2))


@app.get("/api/events")
def get_events() -> ScraperOutput:
    """Get current events data."""
    return load_events()


@app.post("/api/scrape/all")
def scrape_all() -> ScrapeResponse:
    """Run all scrapers and update events."""
    # Load existing events for merging
    current = load_events()
    existing_by_id = {e.id: e for e in current.events}

    sources: list[SourceStatus] = []

    now = datetime.now(timezone.utc).isoformat()

    for scraper_id, scraper in SCRAPERS.items():
        status = "ok"
        error = None
        events: list[Event] = []

        try:
            events = scraper.scrape()
            # Merge: update existing or add new, preserving addedAt
            for event in events:
                if event.id not in existing_by_id:
                    event.addedAt = now  # New event
                else:
                    event.addedAt = existing_by_id[event.id].addedAt  # Preserve original
                existing_by_id[event.id] = event
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

    all_events = list(existing_by_id.values())
    all_events.sort(key=lambda e: e.date)

    output = ScraperOutput(
        events=all_events,
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        sources=sources
    )

    save_events(output)

    total = len(all_events)
    return ScrapeResponse(
        success=True,
        message=f"Scraped and merged events. Total: {total} events from {len(sources)} sources",
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
    """Run scraper for a single venue."""
    if venue_id not in SCRAPERS:
        raise HTTPException(status_code=404, detail=f"Unknown venue: {venue_id}")

    scraper = SCRAPERS[venue_id]

    # Load existing data
    current = load_events()
    existing_by_id = {e.id: e for e in current.events}
    other_sources = [s for s in current.sources if s.id != venue_id]

    # Scrape new events
    status = "ok"
    error = None
    events: list[Event] = []
    scraped_count = 0

    now = datetime.now(timezone.utc).isoformat()

    try:
        events = scraper.scrape()
        scraped_count = len(events)
        # Merge: update existing or add new, preserving addedAt
        for event in events:
            if event.id not in existing_by_id:
                event.addedAt = now  # New event
            else:
                event.addedAt = existing_by_id[event.id].addedAt  # Preserve original
            existing_by_id[event.id] = event
    except Exception as e:
        status = "error"
        error = str(e)

    all_events = list(existing_by_id.values())
    all_events.sort(key=lambda e: e.date)

    sources = other_sources + [SourceStatus(
        name=scraper.name,
        id=scraper.id,
        url=scraper.url,
        status=status,
        lastScraped=datetime.now(timezone.utc).isoformat(),
        eventCount=scraped_count,
        error=error
    )]

    output = ScraperOutput(
        events=all_events,
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        sources=sources
    )

    save_events(output)

    return ScrapeResponse(
        success=status == "ok",
        message=f"Scraped {scraped_count} events from {scraper.name}. Total: {len(all_events)} events" if status == "ok" else f"Error: {error}",
        data=output
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
