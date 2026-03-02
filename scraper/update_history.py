#!/usr/bin/env python3
"""Archive past events to history.json without running scrapers.

Used by the daily history update GitHub Action to ensure history stays
current even when no new shows are found.
"""
import sys
from datetime import datetime, timezone, date
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).parent))

from models import Event, ScraperOutput, HistoricalShow, ShowHistory

# Use public/ as the source of truth (that's what gets committed by scrape workflow)
PUBLIC_DIR = Path(__file__).parent.parent / "public"
EVENTS_PATH = PUBLIC_DIR / "events.json"
HISTORY_PATH = PUBLIC_DIR / "history.json"


def load_events() -> ScraperOutput:
    if EVENTS_PATH.exists():
        return ScraperOutput(**json.loads(EVENTS_PATH.read_text(encoding="utf-8")))
    return ScraperOutput(events=[], lastUpdated="", sources=[])


def load_history() -> ShowHistory:
    if HISTORY_PATH.exists():
        return ShowHistory(**json.loads(HISTORY_PATH.read_text(encoding="utf-8")))
    return ShowHistory(shows=[], lastUpdated="")


def save_events(output: ScraperOutput):
    EVENTS_PATH.write_text(output.model_dump_json(indent=2), encoding="utf-8")


def save_history(history: ShowHistory):
    HISTORY_PATH.write_text(history.model_dump_json(indent=2), encoding="utf-8")


def run():
    today = date.today().isoformat()
    now = datetime.now(timezone.utc).isoformat()

    # Load existing data
    current = load_events()
    history = load_history()
    history_set = {(h.date, h.title, h.venue) for h in history.shows}

    # Archive past events
    archived = 0
    active_events = []

    for event in current.events:
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

    print(f"History Update - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"Events checked: {len(current.events)}")
    print(f"Archived to history: {archived}")
    print(f"Active events remaining: {len(active_events)}")
    print(f"Total history: {len(history.shows)}")

    if archived == 0:
        print("\nNo events to archive. Files unchanged.")
        return False

    # Sort and save
    active_events.sort(key=lambda e: e.date)
    history.shows.sort(key=lambda h: h.date, reverse=True)
    history.lastUpdated = now

    output = ScraperOutput(
        events=active_events,
        lastUpdated=now,
        sources=current.sources  # Preserve existing source info
    )
    save_events(output)
    save_history(history)

    print(f"\n✓ Archived {archived} events to history")
    return True


if __name__ == "__main__":
    changed = run()
    sys.exit(0 if changed else 0)  # Always succeed, workflow checks for file changes
