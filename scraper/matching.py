# scraper/matching.py
"""
Fuzzy matching module for finding existing events.

Uses multiple signals to match events even when titles change:
1. First word match (artist name usually comes first)
2. 50%+ word overlap
3. Title containment (one title contains the other)
"""
import re


def normalize_text(text: str) -> str:
    """Normalize text for comparison - lowercase, remove special chars."""
    if not text:
        return ""
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()


def find_existing_event(new_event, db_events: list[dict]) -> dict | None:
    """
    Find an existing event that matches the new event.

    Args:
        new_event: Event object with title, date, venue_id attributes
        db_events: List of dicts from database (same venue + same date)

    Returns:
        Matching event dict or None if no match found
    """
    new_normalized = normalize_text(new_event.title)
    if not new_normalized:
        return None

    new_words = set(new_normalized.split())
    new_first = new_normalized.split()[0] if new_normalized.split() else ""

    for existing in db_events:
        old_normalized = normalize_text(existing.get("title", ""))
        if not old_normalized:
            continue

        old_words = set(old_normalized.split())
        old_first = old_normalized.split()[0] if old_normalized.split() else ""

        # Signal 1: First word match (artist name)
        # Only if first word is substantial (> 3 chars)
        if new_first and old_first and new_first == old_first and len(new_first) > 3:
            return existing

        # Signal 2: Title containment
        if new_normalized in old_normalized or old_normalized in new_normalized:
            return existing

        # Signal 3: 50%+ word overlap
        if new_words and old_words:
            common = new_words & old_words
            min_len = min(len(new_words), len(old_words))
            if min_len > 0 and len(common) / min_len > 0.5:
                return existing

    return None


def stable_event_key(url: str | None) -> str | None:
    """
    Key that identifies a show across date changes, derived from its URL.

    Ticketmaster puts the date in the slug but keeps the event ID, so use the ID.
    Other URLs are compared without scheme, www, query, fragment or trailing slash.
    Bare homepages are too generic to identify a show.
    """
    if not url:
        return None
    tm = re.search(r'ticketmaster\.com/.*/event/([A-Za-z0-9]+)', url)
    if tm:
        return f"tm:{tm.group(1).upper()}"
    stripped = re.sub(r'^[a-z]+://', '', url.strip().lower())
    stripped = re.sub(r'^www\.', '', stripped)
    stripped = re.split(r'[?#]', stripped)[0].rstrip('/')
    if '/' not in stripped:
        return None
    return stripped


def find_rescheduled_event(new_event, db_events: list[dict], scraped_dates: set[str]) -> dict | None:
    """
    Find an existing event that is the same show moved to a new date.

    Args:
        new_event: Event object with title, date, eventUrl attributes
        db_events: Upcoming events from the database at the same venue
        scraped_dates: Dates in this scrape whose URL has the same stable key

    A candidate must share the URL key, have a matching title, and its own date
    must no longer appear in the scrape (otherwise it's another night of a run).
    """
    key = stable_event_key(getattr(new_event, "eventUrl", None))
    if not key:
        return None

    for existing in db_events:
        if existing.get("date") == new_event.date or existing.get("date") in scraped_dates:
            continue
        if stable_event_key(existing.get("event_url")) != key:
            continue
        if find_existing_event(new_event, [existing]):
            return existing

    return None


def pair_renames(vanished: list[dict], unmatched: list) -> list[tuple[dict, object]]:
    """
    Pair shows that vanished from a venue's site with newly scraped ones on the same date.

    Only pairs when a date has exactly one vanished show and exactly one new show,
    which is a rename (e.g. the headliner changed). Anything less clear-cut is left
    unpaired so the old show gets removed and the new one inserted.
    """
    vanished_by_date: dict[str, list[dict]] = {}
    for row in vanished:
        vanished_by_date.setdefault(row.get("date"), []).append(row)
    unmatched_by_date: dict[str, list] = {}
    for event in unmatched:
        unmatched_by_date.setdefault(event.date, []).append(event)

    pairs = []
    for event_date, rows in vanished_by_date.items():
        events = unmatched_by_date.get(event_date, [])
        if len(rows) == 1 and len(events) == 1:
            pairs.append((rows[0], events[0]))
    return pairs


def removal_looks_safe(vanished_count: int, upcoming_count: int) -> bool:
    """
    Guard against a half-broken scrape wiping a venue's calendar.

    Removes freely when only a few shows vanished, otherwise only when it's at most
    half of the venue's upcoming shows.
    """
    return vanished_count <= max(3, upcoming_count // 2)
