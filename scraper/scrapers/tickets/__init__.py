"""
Ticket site scrapers for enriching events with additional data.
Independent from venue scrapers - only triggered manually via Enrich button.
"""
from .base import EnrichedEvent, BaseTicketScraper
from .resolver import resolve_url, get_domain
from .structured_data import extract_json_ld
from .heuristics import extract_heuristics

__all__ = ["EnrichedEvent", "BaseTicketScraper", "resolve_url", "get_domain", "extract_json_ld", "extract_heuristics"]
