"""
Ticket site scrapers for enriching events with additional data.
Independent from venue scrapers - only triggered manually via Enrich button.
"""
from .base import EnrichedEvent, BaseTicketScraper

__all__ = ["EnrichedEvent", "BaseTicketScraper"]
