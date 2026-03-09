# scraper/venue_matcher.py
"""
Venue matching module for fuzzy-matching scraped venue names to official venues.

Match priority:
1. Exact match against venue aliases (case-insensitive)
2. Exact match against venue name (case-insensitive, normalized)
3. Fuzzy match against venue name (85% threshold)
"""
from difflib import SequenceMatcher
from typing import Optional


FUZZY_THRESHOLD = 0.85


def normalize_venue_name(name: str) -> str:
    """Normalize venue name for comparison."""
    if not name:
        return ""
    name = name.lower().strip()
    if not name:
        return ""
    # Remove common prefixes
    if name.startswith("the "):
        name = name[4:]
    # Remove all spaces for more forgiving matching
    # "waiting room" and "waitingroom" both become "waitingroom"
    name = name.replace(" ", "")
    return name


class VenueMatcher:
    """Matches scraped venue names to official venue IDs."""

    def __init__(self, supabase_client):
        """Initialize with Supabase client and load venues."""
        self.supabase = supabase_client
        self._venues: list[dict] = []
        self._alias_map: dict[str, str] = {}  # normalized alias -> venue_id
        self._name_map: dict[str, str] = {}   # normalized name -> venue_id
        self._load_venues()

    def _load_venues(self):
        """Load venues from database."""
        result = self.supabase.table("venues").select("id, name, aliases").neq("id", "other").execute()
        # Filter out "other" venue in Python as well (safeguard for tests/edge cases)
        self._venues = [v for v in (result.data or []) if v.get("id") != "other"]

        # Build lookup maps
        for venue in self._venues:
            venue_id = venue["id"]
            # Map normalized name
            normalized_name = normalize_venue_name(venue["name"])
            self._name_map[normalized_name] = venue_id
            # Map all aliases
            for alias in venue.get("aliases") or []:
                normalized_alias = normalize_venue_name(alias)
                if normalized_alias:
                    self._alias_map[normalized_alias] = venue_id

    def match(self, venue_name: str) -> Optional[tuple[str, str]]:
        """
        Match a venue name to an official venue.

        Args:
            venue_name: Raw venue name from scraper

        Returns:
            Tuple of (venue_id, match_type) or None if no match.
            match_type is one of: "alias", "name", "fuzzy:0.XX"
        """
        if not venue_name:
            return None

        normalized = normalize_venue_name(venue_name)
        if not normalized:
            return None

        # Priority 1: Exact alias match
        if normalized in self._alias_map:
            return (self._alias_map[normalized], "alias")

        # Priority 2: Exact name match
        if normalized in self._name_map:
            return (self._name_map[normalized], "name")

        # Priority 3: Fuzzy match against venue names
        best_match: Optional[tuple[str, float]] = None
        for venue in self._venues:
            venue_normalized = normalize_venue_name(venue["name"])
            ratio = SequenceMatcher(None, normalized, venue_normalized).ratio()
            if ratio >= FUZZY_THRESHOLD:
                if best_match is None or ratio > best_match[1]:
                    best_match = (venue["id"], ratio)

        if best_match:
            return (best_match[0], f"fuzzy:{best_match[1]:.2f}")

        return None
