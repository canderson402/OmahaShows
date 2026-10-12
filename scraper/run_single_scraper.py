#!/usr/bin/env python3
"""Run a single scraper by ID - used by GitHub Actions"""
import os
import sys
from config import SCRAPERS


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

    # Special handling for ticketmaster - needs API key and venue matcher
    if scraper_id == 'ticketmaster':
        from run_ticketmaster import run as run_ticketmaster
        run_ticketmaster()
        return

    if scraper_id != 'ticketmaster-uncovered' and not any(s.id == scraper_id for s in SCRAPERS):
        print(f'Unknown scraper: {scraper_id}')
        sys.exit(1)

    # Same code path as the nightly run, limited to this one scraper
    from run_scrape_supabase import run as run_all
    run_all(only_ids={scraper_id})


if __name__ == '__main__':
    main()
