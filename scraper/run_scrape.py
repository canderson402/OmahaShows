#!/usr/bin/env python3
"""Automated scrape script for GitHub Actions and local use.

This script ONLY handles scraping - it adds and updates events.
History archiving is handled separately by update_history.py.
"""
import sys
from datetime import datetime, timezone
from pathlib import Path
import json

# Ensure imports work from scraper directory
sys.path.insert(0, str(Path(__file__).parent))

from config import SCRAPERS
from models import Event, SourceStatus, ScraperOutput

OUTPUT_DIR = Path(__file__).parent / "output"
EVENTS_PATH = OUTPUT_DIR / "events.json"


def load_events() -> ScraperOutput:
    if EVENTS_PATH.exists():
        return ScraperOutput(**json.loads(EVENTS_PATH.read_text(encoding="utf-8")))
    return ScraperOutput(events=[], lastUpdated="", sources=[])


def save_events(output: ScraperOutput):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    EVENTS_PATH.write_text(output.model_dump_json(indent=2), encoding="utf-8")


def run():
    now = datetime.now(timezone.utc).isoformat()

    # Load existing events
    current = load_events()
    existing_by_id = {e.id: e for e in current.events}

    # Track changes
    added = 0
    changed = 0
    sources = []
    failed_scrapers = []
    successful_scraper_ids = set()

    # Run all scrapers
    for scraper in SCRAPERS:
        status = "ok"
        error = None
        events = []

        try:
            print(f"Scraping {scraper.name}...")
            events = scraper.scrape()
            for event in events:
                if event.id not in existing_by_id:
                    # New event - set addedAt
                    event.addedAt = now
                    added += 1
                else:
                    # Existing event - preserve original addedAt, check for changes
                    old = existing_by_id[event.id]
                    event.addedAt = old.addedAt or now
                    if (event.title != old.title or event.date != old.date or
                            event.time != old.time or event.price != old.price or
                            event.imageUrl != old.imageUrl or event.eventUrl != old.eventUrl or
                            event.ticketUrl != old.ticketUrl):
                        changed += 1
                existing_by_id[event.id] = event

            print(f"  ✓ {len(events)} events")
            successful_scraper_ids.add(scraper.id)
        except Exception as e:
            status = "error"
            error = str(e)
            print(f"  ✗ FAILED: {e}")
            failed_scrapers.append((scraper.name, str(e)))

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
    all_events = sorted(existing_by_id.values(), key=lambda e: e.date)

    has_changes = added > 0 or changed > 0

    # Only write if something changed
    if has_changes:
        output = ScraperOutput(
            events=all_events,
            lastUpdated=datetime.now(timezone.utc).isoformat(),
            sources=sources
        )
        save_events(output)

    print(f"\n{'='*50}")
    print(f"SCRAPE SUMMARY - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*50}")
    print(f"Total events: {len(all_events)}")
    print(f"New events added: {added}")
    print(f"Events changed: {changed}")
    if not has_changes:
        print(f"\nNo changes detected — skipping file update.")
    print(f"")
    print(f"Scrapers: {len(successful_scraper_ids)}/{len(SCRAPERS)} successful")

    if failed_scrapers:
        print(f"\n{'!'*50}")
        print(f"FAILED SCRAPERS:")
        print(f"{'!'*50}")
        for name, err in failed_scrapers:
            print(f"  ✗ {name}: {err}")
        print(f"{'!'*50}")
        sys.exit(1)
    else:
        print(f"\n✓ All scrapers completed successfully")


if __name__ == "__main__":
    run()
