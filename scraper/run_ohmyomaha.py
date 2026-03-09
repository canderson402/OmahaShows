#!/usr/bin/env python3
"""
Run the ohmyomaha scraper - creates pending events for admin review.
Skips events that already exist in the database.
Sports events are automatically excluded.

Usage:
    python run_ohmyomaha.py

Or via GitHub Actions with SCRAPER_ID=ohmyomaha
"""
import os
import re
import sys
from datetime import datetime, timezone, date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from supabase import create_client, Client
from scrapers.ohmyomaha import OhMyOmahaScraper
from venue_matcher import VenueMatcher

# Get Supabase credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


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


def run():
    print(f"\n{'='*60}")
    print(f"OHMYOMAHA SCRAPE - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*60}\n")

    # Create venue matcher for deduplication
    venue_matcher = VenueMatcher(supabase)

    scraper = OhMyOmahaScraper(supabase_client=supabase, venue_matcher=venue_matcher)
    now = datetime.now(timezone.utc).isoformat()
    today = date.today().isoformat()

    try:
        print("Fetching ohmyomaha.com...")
        events = scraper.scrape()
        print(f"Found {len(events)} total events")

        # Filter to future events
        future_events = [e for e in events if e.date >= today]
        print(f"Future events: {len(future_events)}")

        new_ids = []
        skipped_ids = []

        for event in future_events:
            # Check if event already exists (by ID or similar title+date)
            existing_by_id = supabase.table("events").select("id").eq("id", event.id).execute()

            if existing_by_id.data:
                skipped_ids.append(event.id)
                continue

            # Also check for similar events (same date, similar title) to avoid duplicates
            similar = supabase.table("events").select("id, title").eq("date", event.date).execute()
            is_duplicate = False

            # Normalize title for comparison (lowercase, remove special chars)
            def normalize(s):
                return re.sub(r'[^a-z0-9\s]', '', s.lower()).strip()

            title_normalized = normalize(event.title)
            title_words = set(title_normalized.split())

            for existing in similar.data:
                existing_normalized = normalize(existing["title"])
                existing_words = set(existing_normalized.split())

                # Check 1: One title contains the other
                if title_normalized in existing_normalized or existing_normalized in title_normalized:
                    is_duplicate = True
                    skipped_ids.append(event.id)
                    break

                # Check 2: First word matches (artist name usually comes first)
                title_first = title_normalized.split()[0] if title_normalized.split() else ""
                existing_first = existing_normalized.split()[0] if existing_normalized.split() else ""
                if title_first and existing_first and title_first == existing_first and len(title_first) > 3:
                    is_duplicate = True
                    skipped_ids.append(event.id)
                    break

                # Check 3: Word overlap (original logic)
                common_words = title_words & existing_words
                if len(common_words) > min(len(title_words), len(existing_words)) * 0.5:
                    is_duplicate = True
                    skipped_ids.append(event.id)
                    break

            if is_duplicate:
                continue

            # source is already set to matched venue_id by the scraper
            venue_id = event.source
            category = scraper._categorize(event.title, event.venue or "")

            # Insert as pending event
            event_data = {
                "id": event.id,
                "title": event.title,
                "date": event.date,
                "time": event.time,
                "venue_id": venue_id,
                "venue_name": event.venue if venue_id == "other" else None,
                "event_url": event.eventUrl,
                "ticket_url": event.ticketUrl,
                "image_url": event.imageUrl,
                "price": event.price,
                "age_restriction": event.ageRestriction,
                "supporting_artists": event.supportingArtists,
                "source": "ohmyomaha",
                "status": "pending",
                "category": category,
                "added_at": now,
                "updated_at": now,
            }

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
            print(f"  + {event.title} ({event.date}) @ {event.venue} [{category}]")

        # Log the scraper run
        supabase.table("scraper_runs").insert({
            "scraper_id": "ohmyomaha",
            "scraper_name": "OhMyOmaha",
            "status": "success",
            "event_count": len(future_events),
            "new_count": len(new_ids),
            "changed_count": 0,
            "new_event_ids": new_ids,
            "changed_event_ids": [],
            "started_at": now,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        print(f"\n{'='*60}")
        print(f"SUMMARY")
        print(f"{'='*60}")
        print(f"Total events found: {len(future_events)}")
        print(f"New pending events: {len(new_ids)}")
        print(f"Skipped (already exist): {len(skipped_ids)}")
        print(f"\n{'='*60}")

        if new_ids:
            print(f"\nNew events added to pending queue:")
            for eid in new_ids:
                print(f"  - {eid}")

    except Exception as e:
        # Log error
        supabase.table("scraper_runs").insert({
            "scraper_id": "ohmyomaha",
            "scraper_name": "OhMyOmaha",
            "status": "error",
            "event_count": 0,
            "new_count": 0,
            "changed_count": 0,
            "new_event_ids": [],
            "changed_event_ids": [],
            "error_message": str(e),
            "started_at": now,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        print(f"ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    run()
