"""
SeeTickets.us / Eventim.us ticket site scraper.
"""
import re
from bs4 import BeautifulSoup
from .base import BaseTicketScraper, EnrichedEvent


class SeeTicketsScraper(BaseTicketScraper):
    name = "SeeTickets"
    domains = ["seetickets.us", "eventim.us"]

    def extract(self, url: str) -> EnrichedEvent:
        html = self.fetch_html(url)
        return self.parse(html)

    def parse(self, html: str) -> EnrichedEvent:
        soup = self.get_soup(html)
        return EnrichedEvent(
            time=self._extract_time(html),
            price=self._extract_price(html),
            image_url=self._extract_image(soup),
            supporting_artists=self._extract_supporting(html),
            source="seetickets"
        )

    def _extract_time(self, html: str) -> str | None:
        patterns = [
            r'show[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
            r'start[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
            r'doors[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        ]
        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return self._convert_to_24h(match)
        return None

    def _extract_price(self, html: str) -> str | None:
        match = re.search(r'\$(\d+(?:\.\d{2})?)\s*[-–—]\s*\$(\d+(?:\.\d{2})?)', html)
        if match:
            return f"${match.group(1)} - ${match.group(2)}"
        match = re.search(r'\$(\d+(?:\.\d{2})?)', html)
        if match:
            return f"${match.group(1)}"
        return None

    def _extract_image(self, soup: BeautifulSoup) -> str | None:
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            url = og_image["content"]
            if "placeholder" not in url.lower():
                return url
        return None

    def _extract_supporting(self, html: str) -> list[str] | None:
        match = re.search(r'(?:with|featuring|w/|ft\.?|support:)\s+([^,\n]+(?:,\s*[^,\n]+)*)', html, re.IGNORECASE)
        if match:
            artists = [a.strip() for a in match.group(1).split(",")]
            artists = [a for a in artists if len(a) > 2 and not any(
                x in a.lower() for x in ["ticket", "door", "show", "age", "price"]
            )]
            return artists if artists else None
        return None

    def _convert_to_24h(self, match: re.Match) -> str:
        hour = int(match.group(1))
        minute = int(match.group(2)) if match.group(2) else 0
        period = match.group(3).upper()
        if period == "PM" and hour != 12:
            hour += 12
        elif period == "AM" and hour == 12:
            hour = 0
        return f"{hour:02d}:{minute:02d}"
