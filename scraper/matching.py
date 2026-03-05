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
