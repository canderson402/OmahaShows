#!/usr/bin/env python3
"""Automated scrape script for GitHub Actions and local use."""
import sys
from datetime import datetime, timezone, date
from pathlib import Path
import json

# Ensure imports work from scraper directory
sys.path.insert(0, str(Path(__file__).parent))

from config import SCRAPERS
from models import Event, SourceStatus, ScraperOutput, HistoricalShow, ShowHistory

OUTPUT_DIR = Path(__file__).parent / "output"
EVENTS_PATH = OUTPUT_DIR / "events.json"
HISTORY_PATH = OUTPUT_DIR / "history.json"


def load_events() -> ScraperOutput:
    if EVENTS_PATH.exists():
        return ScraperOutput(**json.loads(EVENTS_PATH.read_text(encoding="utf-8")))
    return ScraperOutput(events=[], lastUpdated="", sources=[])


def load_history() -> ShowHistory:
    if HISTORY_PATH.exists():
        return ShowHistory(**json.loads(HISTORY_PATH.read_text(encoding="utf-8")))
    return ShowHistory(shows=[], lastUpdated="")


def save_events(output: ScraperOutput):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    EVENTS_PATH.write_text(output.model_dump_json(indent=2), encoding="utf-8")


def save_history(history: ShowHistory):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_PATH.write_text(history.model_dump_json(indent=2), encoding="utf-8")


def run():
    today = date.today().isoformat()
    now = datetime.now(timezone.utc).isoformat()

    # Load existing data
    current = load_events()
    history = load_history()
    existing_by_id = {e.id: e for e in current.events}
    history_set = {(h.date, h.title, h.venue) for h in history.shows}

    # Track changes
    added = 0
    changed = 0
    removed = 0
    archived = 0
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
            scraped_ids = set()
            for event in events:
                scraped_ids.add(event.id)
                if event.id not in existing_by_id:
                    # New event - set addedAt
                    event.addedAt = now
                    added += 1
                else:
                    # Existing event - preserve original addedAt (or backfill if missing), check for changes
                    old = existing_by_id[event.id]
                    event.addedAt = old.addedAt or now
                    if (event.title != old.title or event.date != old.date or
                            event.time != old.time or event.price != old.price or
                            event.imageUrl != old.imageUrl or event.eventUrl != old.eventUrl or
                            event.ticketUrl != old.ticketUrl):
                        changed += 1
                existing_by_id[event.id] = event

            # Detect removed events (only from successful scrapers)
            for eid, existing in list(existing_by_id.items()):
                if existing.source == scraper.id and eid not in scraped_ids:
                    del existing_by_id[eid]
                    removed += 1

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

    # Archive past events
    active_events = []
    for event in existing_by_id.values():
        if event.date < today:
            # Move to history (dedupe)
            key = (event.date, event.title, event.venue)
            if key not in history_set:
                history.shows.append(HistoricalShow(
                    date=event.date,
                    title=event.title,
                    venue=event.venue,
                    supportingArtists=event.supportingArtists
                ))
                history_set.add(key)
                archived += 1
        else:
            active_events.append(event)

    # Sort
    active_events.sort(key=lambda e: e.date)
    history.shows.sort(key=lambda h: h.date, reverse=True)

    has_changes = added > 0 or changed > 0 or removed > 0 or archived > 0

    # Only write files if something actually changed (avoids unnecessary deploys)
    if has_changes:
        history.lastUpdated = datetime.now(timezone.utc).isoformat()
        output = ScraperOutput(
            events=active_events,
            lastUpdated=datetime.now(timezone.utc).isoformat(),
            sources=sources
        )
        save_events(output)
        save_history(history)

    print(f"\n{'='*50}")
    print(f"SCRAPE SUMMARY - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*50}")
    print(f"Active events: {len(active_events)}")
    print(f"New events added: {added}")
    print(f"Events changed: {changed}")
    print(f"Events removed: {removed}")
    print(f"Archived to history: {archived}")
    print(f"Total history: {len(history.shows)}")
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
        # Exit with error code so GitHub Actions knows it failed
        import sys
        sys.exit(1)
    else:
        print(f"\n✓ All scrapers completed successfully")


if __name__ == "__main__":
    run()
