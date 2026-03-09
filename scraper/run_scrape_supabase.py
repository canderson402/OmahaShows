#!/usr/bin/env python3
"""Automated scrape script that pushes directly to Supabase."""
import os
import sys
from datetime import datetime, timezone, date
from pathlib import Path

# Ensure imports work from scraper directory
sys.path.insert(0, str(Path(__file__).parent))

from supabase import create_client, Client
from config import get_scrapers
from models import Event
from matching import find_existing_event
from venue_matcher import VenueMatcher

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


def normalize_value(val, field_name=None):
    """Normalize a value for comparison - treat None, empty string, empty list as equal."""
    if val is None:
        return None
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
        # Normalize time format: "21:00:00" -> "21:00"
        if field_name == "time" and len(val) == 8 and val.count(":") == 2:
            val = val[:5]  # Strip seconds
        return val
    if isinstance(val, list):
        return val if val else None
    return val


def get_events_by_venue_date(venue_id: str, event_date: str) -> list[dict]:
    """Fetch all events for a venue on a specific date."""
    result = supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
    return result.data or []


def log_event_change(event_id: str, change_type: str, proposed_data: dict, original_data: dict | None, changed_fields: list[str] | None):
    """Log a proposed change to the event_changes table."""
    supabase.table("event_changes").insert({
        "event_id": event_id,
        "change_type": change_type,
        "proposed_data": proposed_data,
        "original_data": original_data,
        "changed_fields": changed_fields,
        "status": "pending",
    }).execute()


def upsert_events(events: list[Event], scraper_id: str) -> tuple[list[str], list[str]]:
    """Upsert events to Supabase using fuzzy matching.

    - New events: inserted with status='pending'
    - Changed events: NOT updated directly, change logged to event_changes
    - Unchanged events: skipped

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
        # Get all events for this venue + date for fuzzy matching
        db_events = get_events_by_venue_date(scraper_id, event.date)

        # Try fuzzy match first
        existing = find_existing_event(event, db_events)

        # Build event data
        event_data = {
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue_id": scraper_id,
            "venue_name": event.venue if scraper_id == 'other' else None,
            "event_url": event.eventUrl,
            "ticket_url": event.ticketUrl,
            "image_url": event.imageUrl,
            "price": event.price,
            "age_restriction": event.ageRestriction,
            "supporting_artists": event.supportingArtists,
            "source": scraper_id,
        }

        if existing:
            # Found a match - check if anything actually changed
            changed_fields = []
            for field in compare_fields:
                old_val = normalize_value(existing.get(field), field)
                new_val = normalize_value(event_data.get(field), field)
                if old_val != new_val:
                    changed_fields.append(field)

            if changed_fields:
                # Log the proposed change (don't update event directly)
                log_event_change(
                    event_id=existing["id"],
                    change_type="update",
                    proposed_data=event_data,
                    original_data={f: existing.get(f) for f in compare_fields},
                    changed_fields=changed_fields,
                )
                changed_ids.append(existing["id"])
        else:
            # No match found - check if event ID already exists (safety check)
            existing_by_id = supabase.table("events").select("id").eq("id", event.id).execute()
            if existing_by_id.data:
                # Event already exists by ID, skip
                continue

            # New event - insert as pending
            event_data["status"] = "pending"
            event_data["added_at"] = now
            event_data["updated_at"] = now
            supabase.table("events").insert(event_data).execute()

            # Log new event for tracking
            log_event_change(
                event_id=event.id,
                change_type="new",
                proposed_data=event_data,
                original_data=None,
                changed_fields=None,
            )
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


def notify_admin_pending(total_new: int, total_changed: int, scraper_results: list[dict]):
    """Send email notification to admin about pending items."""
    import requests

    # Get Supabase URL for edge function
    supabase_url = SUPABASE_URL.rstrip("/")
    function_url = f"{supabase_url}/functions/v1/notify-admin-pending"

    try:
        response = requests.post(
            function_url,
            json={
                "type": "scraper_complete",
                "scraperSummary": {
                    "totalNew": total_new,
                    "totalChanged": total_changed,
                    "scrapers": scraper_results,
                }
            },
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        if response.ok:
            print(f"✓ Admin notification sent")
        else:
            print(f"! Failed to send notification: {response.text}")
    except Exception as e:
        print(f"! Error sending notification: {e}")


def run():
    today = date.today().isoformat()
    failed_scrapers = []
    successful_scrapers = []
    scraper_results = []
    total_events = 0
    total_new = 0
    total_changed = 0

    # Create venue matcher for deduplication
    venue_matcher = VenueMatcher(supabase)

    # Get scrapers with Supabase client and venue matcher
    scrapers = get_scrapers(supabase_client=supabase, venue_matcher=venue_matcher)

    print(f"\n{'='*60}")
    print(f"SUPABASE SCRAPE - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*60}\n")

    # Run all scrapers and collect results
    for scraper in scrapers:
        print(f"Scraping {scraper.name}...", end=" ", flush=True)

        events, error = run_scraper(scraper)

        if error:
            print(f"FAILED: {error}")
            failed_scrapers.append((scraper.name, error))
            log_scraper_run(scraper.id, scraper.name, "error", 0, error=error)
            scraper_results.append({"name": scraper.name, "newCount": 0, "changedCount": 0})
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
            scraper_results.append({"name": scraper.name, "newCount": len(new_ids), "changedCount": len(changed_ids)})

    # Send admin notification if there are pending items
    if total_new > 0 or total_changed > 0:
        notify_admin_pending(total_new, total_changed, scraper_results)

    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total events processed: {total_events}")
    print(f"New events added: {total_new}")
    print(f"Events changed: {total_changed}")
    print(f"Scrapers: {len(successful_scrapers)}/{len(scrapers)} successful")

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
