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


def upsert_events(events: list[Event], scraper_id: str) -> tuple[list[str], list[str]]:
    """Upsert events to Supabase, only updating if changed.

    Returns tuple of (new_event_ids, changed_event_ids).
    """
    if not events:
        return [], []

    now = datetime.now(timezone.utc).isoformat()
    new_ids: list[str] = []
    changed_ids: list[str] = []

    # Fields to compare for changes (excluding metadata fields)
    compare_fields = [
        "title", "date", "time", "event_url", "ticket_url",
        "image_url", "price", "age_restriction", "supporting_artists"
    ]

    for event in events:
        # Check if event exists and get all fields for comparison
        existing = supabase.table("events").select("*").eq("id", event.id).execute()

        # For "other" scraper, use the event's venue name, not "other"
        venue_id = event.venue if scraper_id == 'other' else scraper_id

        event_data = {
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": venue_id,
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": scraper_id,
            "status": "approved",
        }

        if existing.data:
            old = existing.data[0]
            # Check if any field changed
            has_changes = False
            for field in compare_fields:
                old_val = old.get(field)
                new_val = event_data.get(field)
                # Normalize None vs empty for comparison
                if old_val != new_val:
                    has_changes = True
                    break

            if has_changes:
                # Update existing - preserve added_at
                event_data["added_at"] = old["added_at"]
                event_data["updated_at"] = now
                supabase.table("events").update(event_data).eq("id", event.id).execute()
                changed_ids.append(event.id)
        else:
            # Insert new
            event_data["added_at"] = now
            event_data["updated_at"] = now
            supabase.table("events").insert(event_data).execute()
            new_ids.append(event.id)

    return new_ids, changed_ids


def log_scraper_run(
    scraper_id: str,
    scraper_name: str,
    status: str,
    event_count: int,
    new_count: int = 0,
    changed_count: int = 0,
    new_event_ids: list[str] | None = None,
    changed_event_ids: list[str] | None = None,
    error: str | None = None
):
    """Log a scraper run to the scraper_runs table."""
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("scraper_runs").insert({
        "scraper_id": scraper_id,
        "scraper_name": scraper_name,
        "status": status,
        "event_count": event_count,
        "new_count": new_count,
        "changed_count": changed_count,
        "new_event_ids": new_event_ids or [],
        "changed_event_ids": changed_event_ids or [],
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
    total_changed = 0

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
            log_scraper_run(scraper.id, scraper.name, "error", 0, error=error)
        else:
            # Filter to future events only
            future_events = [e for e in events if e.date >= today]
            new_ids, changed_ids = upsert_events(future_events, scraper.id)
            total_events += len(future_events)
            total_new += len(new_ids)
            total_changed += len(changed_ids)
            print(f"OK - {len(future_events)} events ({len(new_ids)} new, {len(changed_ids)} changed)")
            successful_scrapers.append(scraper.name)
            log_scraper_run(
                scraper.id,
                scraper.name,
                "success",
                len(future_events),
                new_count=len(new_ids),
                changed_count=len(changed_ids),
                new_event_ids=new_ids,
                changed_event_ids=changed_ids,
            )

    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total events processed: {total_events}")
    print(f"New events added: {total_new}")
    print(f"Events changed: {total_changed}")
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
