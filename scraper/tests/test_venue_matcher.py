# scraper/tests/test_venue_matcher.py
import pytest
import sys
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent))

from venue_matcher import VenueMatcher, normalize_venue_name


class TestNormalizeVenueName:
    def test_lowercase_and_strips_spaces(self):
        assert normalize_venue_name("The Waiting Room") == "waitingroom"

    def test_strips_the_prefix(self):
        assert normalize_venue_name("The Slowdown") == "slowdown"

    def test_strips_all_spaces(self):
        assert normalize_venue_name("  Reverb Lounge  ") == "reverblounge"

    def test_handles_empty(self):
        assert normalize_venue_name("") == ""
        assert normalize_venue_name("   ") == ""

    def test_space_variations_match(self):
        # "waiting room" and "waitingroom" should normalize to same value
        assert normalize_venue_name("waiting room") == normalize_venue_name("waitingroom")
        assert normalize_venue_name("steel house") == normalize_venue_name("steelhouse")


class TestVenueMatcher:
    @pytest.fixture
    def mock_venues(self):
        return [
            {"id": "waitingroom", "name": "Waiting Room Lounge", "aliases": ["waiting room", "the waiting room"]},
            {"id": "theslowdown", "name": "The Slowdown", "aliases": []},
            {"id": "reverblounge", "name": "Reverb Lounge", "aliases": ["reverb"]},
            {"id": "other", "name": "Other", "aliases": []},
        ]

    @pytest.fixture
    def matcher(self, mock_venues):
        mock_supabase = MagicMock()
        mock_supabase.table.return_value.select.return_value.neq.return_value.execute.return_value.data = mock_venues
        return VenueMatcher(mock_supabase)

    def test_exact_alias_match(self, matcher):
        result = matcher.match("waiting room")
        assert result is not None
        assert result[0] == "waitingroom"
        assert result[1] == "alias"

    def test_exact_alias_match_case_insensitive(self, matcher):
        result = matcher.match("WAITING ROOM")
        assert result is not None
        assert result[0] == "waitingroom"

    def test_exact_name_match(self, matcher):
        result = matcher.match("The Slowdown")
        assert result is not None
        assert result[0] == "theslowdown"
        assert result[1] == "name"

    def test_fuzzy_match_above_threshold(self, matcher):
        result = matcher.match("Waiting Room Loung")  # typo
        assert result is not None
        assert result[0] == "waitingroom"
        assert result[1].startswith("fuzzy:")

    def test_fuzzy_match_below_threshold_returns_none(self, matcher):
        result = matcher.match("Completely Different Venue")
        assert result is None

    def test_no_match_for_other_venue(self, matcher):
        result = matcher.match("Other")
        assert result is None

    def test_prefers_alias_over_fuzzy(self, matcher):
        result = matcher.match("reverb")
        assert result is not None
        assert result[0] == "reverblounge"
        assert result[1] == "alias"

    def test_reverb_lounge_matches_by_name(self, matcher):
        # "Reverb Lounge" should match "reverblounge" venue by name
        result = matcher.match("Reverb Lounge")
        assert result is not None
        assert result[0] == "reverblounge"
        assert result[1] == "name"
