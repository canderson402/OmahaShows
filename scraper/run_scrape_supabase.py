#!/usr/bin/env python3
"""Automated scrape script that pushes directly to Supabase."""
import os
import sys
from datetime import datetime, timezone, date
from pathlib import Path

# Ensure imports work from scraper directory
sys.path.insert(0, str(Path(__file__).parent))

from supabase import create_client, Client
from config import SCRAPERS
from models import Event

# Get Supabase credentials from environment
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def run_scraper(scraper) -> tuple[list[Event], str | None]:
    """Run a single scraper and return events and error (if any)."""
    try:
        events = scraper.scrape()
        return events, None
    except Exception as e:
        return [], str(e)


def upsert_events(events: list[Event], scraper_id: str):
    """Upsert events to Supabase, using venue_id from scraper_id."""
    if not events:
        return 0

    now = datetime.now(timezone.utc).isoformat()
    inserted = 0

    for event in events:
        # Check if event exists
        existing = supabase.table("events").select("id, added_at").eq("id", event.id).execute()

        event_data = {
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": scraper_id,  # Use scraper ID as venue_id
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": scraper_id,
            "status": "approved",  # Auto-approve scraped events
            "updated_at": now,
        }

        if existing.data:
            # Update existing - preserve added_at
            event_data["added_at"] = existing.data[0]["added_at"]
            supabase.table("events").update(event_data).eq("id", event.id).execute()
        else:
            # Insert new
            event_data["added_at"] = now
            supabase.table("events").insert(event_data).execute()
            inserted += 1

    return inserted


def log_scraper_run(scraper_id: str, scraper_name: str, status: str, event_count: int, error: str | None = None):
    """Log a scraper run to the scraper_runs table."""
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("scraper_runs").insert({
        "scraper_id": scraper_id,
        "scraper_name": scraper_name,
        "status": status,
        "event_count": event_count,
        "error_message": error,
        "started_at": now,
        "finished_at": now,
    }).execute()


def run():
    today = date.today().isoformat()
    failed_scrapers = []
    successful_scrapers = []
    total_events = 0
    total_new = 0

    print(f"\n{'='*60}")
    print(f"SUPABASE SCRAPE - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*60}\n")

    # Run all scrapers
    for scraper in SCRAPERS:
        print(f"Scraping {scraper.name}...", end=" ", flush=True)

        events, error = run_scraper(scraper)

        if error:
            print(f"FAILED: {error}")
            failed_scrapers.append((scraper.name, error))
            log_scraper_run(scraper.id, scraper.name, "error", 0, error)
        else:
            # Filter to future events only
            future_events = [e for e in events if e.date >= today]
            new_count = upsert_events(future_events, scraper.id)
            total_events += len(future_events)
            total_new += new_count
            print(f"OK - {len(future_events)} events ({new_count} new)")
            successful_scrapers.append(scraper.name)
            log_scraper_run(scraper.id, scraper.name, "success", len(future_events))

    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total events processed: {total_events}")
    print(f"New events added: {total_new}")
    print(f"Scrapers: {len(successful_scrapers)}/{len(SCRAPERS)} successful")

    if failed_scrapers:
        print(f"\n{'!'*60}")
        print(f"FAILED SCRAPERS:")
        print(f"{'!'*60}")
        for name, err in failed_scrapers:
            print(f"  ✗ {name}: {err}")
        print(f"{'!'*60}")
        sys.exit(1)
    else:
        print(f"\n✓ All scrapers completed successfully")


if __name__ == "__main__":
    run()
