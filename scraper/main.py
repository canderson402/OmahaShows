# scraper/main.py
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from models import Event, SourceStatus, ScraperOutput
from config import SCRAPERS

def run_all_scrapers() -> ScraperOutput:
    """Run all configured scrapers and collect results."""
    all_events: list[Event] = []
    sources: list[SourceStatus] = []

    for scraper in SCRAPERS:
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

    # Sort events by date
    all_events.sort(key=lambda e: e.date)

    return ScraperOutput(
        events=all_events,
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        sources=sources
    )

def save_output(output: ScraperOutput, path: Path) -> None:
    """Save scraper output to JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(output.model_dump_json(indent=2))

def main():
    output = run_all_scrapers()
    output_path = Path(__file__).parent / "output" / "events.json"
    save_output(output, output_path)

    print(f"Scraped {len(output.events)} events from {len(output.sources)} sources")
    for source in output.sources:
        status_icon = "+" if source.status == "ok" else "x"
        print(f"  {status_icon} {source.name}: {source.eventCount} events")
        if source.error:
            print(f"    Error: {source.error}")

if __name__ == "__main__":
    main()
