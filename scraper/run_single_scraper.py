#!/usr/bin/env python3
"""Run a single scraper by ID - used by GitHub Actions"""
import os
import sys
from datetime import datetime, timezone, date
from supabase import create_client
from config import SCRAPERS

COMPARE_FIELDS = ['title', 'date', 'time', 'event_url', 'ticket_url', 'image_url', 'price', 'age_restriction', 'supporting_artists']

def main():
    scraper_id = os.environ.get('SCRAPER_ID', '')
    if not scraper_id:
        print('SCRAPER_ID environment variable not set')
        sys.exit(1)

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
            existing = supabase.table('events').select('*').eq('id', e.id).execute()

            # For "other" scraper, use the event's venue name, not "other"
            venue_id = e.venue if scraper.id == 'other' else scraper.id

            data = {
                'id': e.id,
                'title': e.title,
                'date': e.date,
                'time': e.time,
                'venue_id': venue_id,
                'event_url': e.eventUrl,
                'ticket_url': e.ticketUrl,
                'image_url': e.imageUrl,
                'price': e.price,
                'age_restriction': e.ageRestriction,
                'supporting_artists': e.supportingArtists,
                'source': scraper.id,
                'status': 'approved',
            }

            if existing.data:
                old = existing.data[0]
                has_changes = any(old.get(f) != data.get(f) for f in COMPARE_FIELDS)
                if has_changes:
                    data['added_at'] = old['added_at']
                    data['updated_at'] = now
                    supabase.table('events').update(data).eq('id', e.id).execute()
                    changed_ids.append(e.id)
            else:
                data['added_at'] = now
                data['updated_at'] = now
                supabase.table('events').insert(data).execute()
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
