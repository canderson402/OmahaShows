"""
Ticket site scrapers for enriching events with additional data.
Independent from venue scrapers - only triggered manually via Enrich button.
"""
import requests
from .base import EnrichedEvent, BaseTicketScraper
from .resolver import resolve_url, get_domain
from .structured_data import extract_json_ld
from .heuristics import extract_heuristics
from .etix import EtixScraper
from .seetickets import SeeTicketsScraper

# Sites that block scraping - give friendly error instead of trying
BLOCKED_DOMAINS = {
    "ticketmaster.com": "Ticketmaster blocks automated requests. Check the ticket link manually.",
    "livenation.com": "Live Nation blocks automated requests. Check the ticket link manually.",
    "axs.com": "AXS blocks automated requests. Check the ticket link manually.",
}

__all__ = [
    "EnrichedEvent",
    "BaseTicketScraper",
    "enrich_from_url",
    "get_scraper_for_domain",
    "TICKET_SCRAPERS",
    "resolve_url",
    "get_domain",
    "extract_json_ld",
    "extract_heuristics",
]

# Registry of site-specific scrapers
TICKET_SCRAPERS: dict[str, BaseTicketScraper] = {}

def _register_scraper(scraper: BaseTicketScraper):
    for domain in scraper.domains:
        TICKET_SCRAPERS[domain] = scraper

_register_scraper(EtixScraper())
_register_scraper(SeeTicketsScraper())


def get_scraper_for_domain(domain: str) -> BaseTicketScraper | None:
    return TICKET_SCRAPERS.get(domain)


def enrich_from_url(url: str) -> dict:
    """
    Main entry point: enrich an event from its ticket URL.
    Tries: JSON-LD -> site-specific scraper -> heuristics
    """
    try:
        final_url = resolve_url(url)
        domain = get_domain(final_url)

        # Check if domain is known to block scraping
        if domain in BLOCKED_DOMAINS:
            return {
                "success": False,
                "error": BLOCKED_DOMAINS[domain],
                "domain": domain
            }

        response = requests.get(final_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }, timeout=15)
        response.raise_for_status()
        html = response.text

        # Try JSON-LD first
        result = extract_json_ld(html)
        if result and (result.time or result.price or result.image_url):
            return {"success": True, "source": "json_ld", "data": result.to_dict()}

        # Try site-specific scraper
        scraper = get_scraper_for_domain(domain)
        if scraper:
            result = scraper.parse(html)
            if result and (result.time or result.price or result.image_url):
                return {"success": True, "source": scraper.name.lower(), "data": result.to_dict()}

        # Try heuristics
        result = extract_heuristics(html)
        if result and (result.time or result.price or result.image_url):
            return {"success": True, "source": "heuristics", "data": result.to_dict()}

        return {"success": False, "error": f"Could not extract data from {domain}", "domain": domain}

    except requests.HTTPError as e:
        domain = get_domain(url) if url else None
        if e.response is not None and e.response.status_code in (401, 403):
            return {
                "success": False,
                "error": f"Access blocked by {domain}. Check the ticket link manually.",
                "domain": domain
            }
        return {"success": False, "error": f"HTTP error: {str(e)}", "domain": domain}
    except requests.RequestException as e:
        return {"success": False, "error": f"Network error: {str(e)}", "domain": get_domain(url) if url else None}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}", "domain": get_domain(url) if url else None}
