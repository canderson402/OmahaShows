"""
Ticket site scrapers for enriching events with additional data.
Independent from venue scrapers - only triggered manually via Enrich button.
"""
from .base import EnrichedEvent, BaseTicketScraper
from .resolver import resolve_url, get_domain

__all__ = ["EnrichedEvent", "BaseTicketScraper", "resolve_url", "get_domain"]
