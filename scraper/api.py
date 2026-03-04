# scraper/api.py
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Load .env.local file from web directory
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)

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
from scrapers.ohmyomaha import OhMyOmahaScraper

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
    "ohmyomaha": OhMyOmahaScraper(),
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
    # Special handling for ohmyomaha - return detailed dupe check results
    if venue_id == "ohmyomaha":
        try:
            import os
            from datetime import date
            from supabase import create_client
            from scrapers.ohmyomaha import OhMyOmahaScraper

            supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

            if not supabase_url or not supabase_key:
                return {"error": "Missing SUPABASE env vars", "events": []}

            db = create_client(supabase_url, supabase_key)
            scraper = OhMyOmahaScraper()
            today = date.today().isoformat()

            events = scraper.scrape()
            future_events = [e for e in events if e.date >= today]

            results = []
            for event in future_events:
                status = "new"
                reason = None

                # Check ID
                existing_by_id = db.table("events").select("id").eq("id", event.id).execute()
                if existing_by_id.data:
                    status = "duplicate"
                    reason = "ID exists"
                else:
                    # Check similar
                    similar = db.table("events").select("id, title").eq("date", event.date).execute()
                    title_lower = event.title.lower()
                    for existing in similar.data:
                        existing_title = existing["title"].lower()
                        title_words = set(title_lower.split())
                        existing_words = set(existing_title.split())
                        common_words = title_words & existing_words
                        if len(common_words) > min(len(title_words), len(existing_words)) * 0.5:
                            status = "duplicate"
                            reason = f"Similar: {existing['title']}"
                            break

                results.append({
                    "id": event.id,
                    "title": event.title,
                    "date": event.date,
                    "venue": event.venue,
                    "venue_id": scraper._map_venue(event.venue),
                    "category": scraper._categorize(event.title, event.venue),
                    "ticket_url": event.ticketUrl,
                    "status": status,
                    "reason": reason,
                })

            new_count = len([r for r in results if r["status"] == "new"])
            dupe_count = len([r for r in results if r["status"] == "duplicate"])

            return {
                "venue": "OhMyOmaha",
                "venue_id": "ohmyomaha",
                "url": "https://ohmyomaha.com/biggest-concerts-omaha/",
                "event_count": len(results),
                "new_count": new_count,
                "duplicate_count": dupe_count,
                "events": results,
            }
        except Exception as e:
            return {"error": str(e), "events": []}

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
    # Special handling for ohmyomaha - preview mode with dupe checking
    if venue_id == "ohmyomaha":
        try:
            import os
            from datetime import date
            from supabase import create_client
            from scrapers.ohmyomaha import OhMyOmahaScraper

            # Connect to Supabase for dupe checking
            supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

            if not supabase_url or not supabase_key:
                return ScrapeResponse(
                    success=False,
                    message=f"Missing env vars. Found URL={supabase_url is not None}, KEY={supabase_key is not None}",
                    data=None
                )

            db = create_client(supabase_url, supabase_key)
            scraper = OhMyOmahaScraper()
            today = date.today().isoformat()

            # Scrape events
            events = scraper.scrape()
            future_events = [e for e in events if e.date >= today]

            new_events = []
            skipped_events = []

            for event in future_events:
                # Check if event already exists by ID
                existing_by_id = db.table("events").select("id").eq("id", event.id).execute()
                if existing_by_id.data:
                    skipped_events.append({"id": event.id, "title": event.title, "reason": "ID exists"})
                    continue

                # Check for similar events (same date, similar title)
                similar = db.table("events").select("id, title").eq("date", event.date).execute()
                is_duplicate = False
                title_lower = event.title.lower()

                for existing in similar.data:
                    existing_title = existing["title"].lower()
                    title_words = set(title_lower.split())
                    existing_words = set(existing_title.split())
                    common_words = title_words & existing_words
                    if len(common_words) > min(len(title_words), len(existing_words)) * 0.5:
                        is_duplicate = True
                        skipped_events.append({
                            "id": event.id,
                            "title": event.title,
                            "reason": f"Similar to: {existing['title']}"
                        })
                        break

                if not is_duplicate:
                    venue_id_mapped = scraper._map_venue(event.venue)
                    category = scraper._categorize(event.title, event.venue)
                    new_events.append({
                        "id": event.id,
                        "title": event.title,
                        "date": event.date,
                        "venue": event.venue,
                        "venue_id": venue_id_mapped,
                        "category": category,
                        "ticket_url": event.ticketUrl,
                    })

            return ScrapeResponse(
                success=True,
                message=f"Found {len(future_events)} events: {len(new_events)} new, {len(skipped_events)} duplicates",
                data=ScraperOutput(
                    events=[],  # Empty - just using message for now
                    lastUpdated=datetime.now(timezone.utc).isoformat(),
                    sources=[SourceStatus(
                        name="OhMyOmaha",
                        id="ohmyomaha",
                        url="https://ohmyomaha.com/biggest-concerts-omaha/",
                        status="ok",
                        lastScraped=datetime.now(timezone.utc).isoformat(),
                        eventCount=len(new_events),
                        error=None
                    )]
                )
            )
        except Exception as e:
            import traceback
            return ScrapeResponse(
                success=False,
                message=f"Error: {str(e)}\n{traceback.format_exc()}",
                data=None
            )

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
