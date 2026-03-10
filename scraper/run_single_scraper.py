#!/usr/bin/env python3
"""Run a single scraper by ID - used by GitHub Actions"""
import os
import sys
import requests
from datetime import datetime, timezone, date
from supabase import create_client
from config import SCRAPERS
from matching import find_existing_event

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

COMPARE_FIELDS = ['title', 'date', 'time', 'event_url', 'ticket_url', 'image_url', 'price', 'age_restriction', 'supporting_artists']


def normalize_value(val, field_name=None):
    """Normalize a value for comparison."""
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


def get_events_by_venue_date(supabase, venue_id: str, event_date: str) -> list[dict]:
    """Fetch all events for a venue on a specific date."""
    result = supabase.table("events").select("*").eq("venue_id", venue_id).eq("date", event_date).execute()
    return result.data or []


def log_event_change(supabase, event_id: str, change_type: str, proposed_data: dict, original_data: dict | None, changed_fields: list[str] | None):
    """Log a proposed change to the event_changes table."""
    supabase.table("event_changes").insert({
        "event_id": event_id,
        "change_type": change_type,
        "proposed_data": proposed_data,
        "original_data": original_data,
        "changed_fields": changed_fields,
        "status": "pending",
    }).execute()


def notify_admin_pending(scraper_name: str, new_count: int, changed_count: int):
    """Send email notification to admin about pending items."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("! Notification skipped: missing Supabase credentials")
        return

    supabase_url = SUPABASE_URL.rstrip("/")
    function_url = f"{supabase_url}/functions/v1/notify-admin-pending"

    try:
        response = requests.post(
            function_url,
            json={
                "type": "scraper_complete",
                "scraperSummary": {
                    "totalNew": new_count,
                    "totalChanged": changed_count,
                    "scrapers": [{"name": scraper_name, "newCount": new_count, "changedCount": changed_count}],
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


def main():
    scraper_id = os.environ.get('SCRAPER_ID', '')
    if not scraper_id:
        print('SCRAPER_ID environment variable not set')
        sys.exit(1)

    # Special handling for ohmyomaha - it has its own runner
    if scraper_id == 'ohmyomaha':
        from run_ohmyomaha import run as run_ohmyomaha
        run_ohmyomaha()
        return

    scraper = next((s for s in SCRAPERS if s.id == scraper_id), None)
    if not scraper:
        print(f'Unknown scraper: {scraper_id}')
        sys.exit(1)

    supabase = create_client(
        os.environ['SUPABASE_URL'],
        os.environ['SUPABASE_SERVICE_KEY']
    )

    print(f'Running {scraper.name}...')
    now = datetime.now(timezone.utc).isoformat()

    try:
        events = scraper.scrape()
        today = date.today().isoformat()
        future_events = [e for e in events if e.date >= today]

        new_ids, changed_ids = [], []
        for e in future_events:
            # Get all events for this venue + date for fuzzy matching
            db_events = get_events_by_venue_date(supabase, scraper.id, e.date)

            # Try fuzzy match
            existing = find_existing_event(e, db_events)

            data = {
                'id': e.id,
                'title': e.title,
                'date': e.date,
                'time': e.time,
                'venue_id': scraper.id,
                'venue_name': e.venue if scraper.id == 'other' else None,
                'event_url': e.eventUrl,
                'ticket_url': e.ticketUrl,
                'image_url': e.imageUrl,
                'price': e.price,
                'age_restriction': e.ageRestriction,
                'supporting_artists': e.supportingArtists,
                'source': scraper.id,
            }

            if existing:
                # Check for actual changes
                changed_fields = []
                for f in COMPARE_FIELDS:
                    if normalize_value(existing.get(f), f) != normalize_value(data.get(f), f):
                        changed_fields.append(f)

                if changed_fields:
                    # Log proposed change (don't update event directly)
                    log_event_change(
                        supabase,
                        event_id=existing['id'],
                        change_type='update',
                        proposed_data=data,
                        original_data={f: existing.get(f) for f in COMPARE_FIELDS},
                        changed_fields=changed_fields,
                    )
                    changed_ids.append(existing['id'])
            else:
                # No match found - check if event ID already exists (safety check)
                existing_by_id = supabase.table('events').select('id').eq('id', e.id).execute()
                if existing_by_id.data:
                    # Event already exists by ID, skip
                    continue

                # New event - insert as pending
                data['status'] = 'pending'
                data['added_at'] = now
                data['updated_at'] = now
                supabase.table('events').insert(data).execute()

                log_event_change(
                    supabase,
                    event_id=e.id,
                    change_type='new',
                    proposed_data=data,
                    original_data=None,
                    changed_fields=None,
                )
                new_ids.append(e.id)

        supabase.table('scraper_runs').insert({
            'scraper_id': scraper.id,
            'scraper_name': scraper.name,
            'status': 'success',
            'event_count': len(future_events),
            'new_count': len(new_ids),
            'changed_count': len(changed_ids),
            'new_event_ids': new_ids,
            'changed_event_ids': changed_ids,
            'started_at': now,
            'finished_at': datetime.now(timezone.utc).isoformat()
        }).execute()

        print(f'Success: {len(future_events)} events ({len(new_ids)} new, {len(changed_ids)} changed)')

        # Send admin notification if there are pending items
        if len(new_ids) > 0 or len(changed_ids) > 0:
            notify_admin_pending(scraper.name, len(new_ids), len(changed_ids))

    except Exception as ex:
        supabase.table('scraper_runs').insert({
            'scraper_id': scraper.id,
            'scraper_name': scraper.name,
            'status': 'error',
            'event_count': 0,
            'new_count': 0,
            'changed_count': 0,
            'new_event_ids': [],
            'changed_event_ids': [],
            'error_message': str(ex),
            'started_at': now,
            'finished_at': datetime.now(timezone.utc).isoformat()
        }).execute()
        print(f'Error: {ex}')
        sys.exit(1)

if __name__ == '__main__':
    main()
