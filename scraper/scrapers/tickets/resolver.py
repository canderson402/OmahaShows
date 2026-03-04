"""
URL resolution utilities for ticket scrapers.
Handles redirects (fave.co) and domain extraction.
"""
import requests
from urllib.parse import urlparse


def get_domain(url: str) -> str:
    """
    Extract the domain from a URL, stripping www prefix.
    Examples:
        https://www.etix.com/ticket/123 -> etix.com
        https://wl.seetickets.us/event -> seetickets.us
    """
    parsed = urlparse(url)
    domain = parsed.netloc.lower()

    # Strip www prefix
    if domain.startswith("www."):
        domain = domain[4:]

    # For subdomains like wl.seetickets.us, extract base domain
    parts = domain.split(".")
    if len(parts) > 2:
        # Keep last two parts (seetickets.us, eventim.us, etc.)
        domain = ".".join(parts[-2:])

    return domain


def resolve_url(url: str, max_redirects: int = 5) -> str:
    """
    Follow redirects to get the final destination URL.
    Used for fave.co and other URL shorteners.

    Args:
        url: The URL to resolve
        max_redirects: Maximum number of redirects to follow

    Returns:
        The final destination URL after all redirects
    """
    try:
        response = requests.head(
            url,
            allow_redirects=True,
            timeout=10,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        return response.url
    except requests.RequestException:
        # If HEAD fails, try GET
        try:
            response = requests.get(
                url,
                allow_redirects=True,
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            return response.url
        except requests.RequestException:
            # Return original URL if all else fails
            return url
