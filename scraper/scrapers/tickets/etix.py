"""
Etix.com ticket site scraper.
"""
import re
from bs4 import BeautifulSoup
from .base import BaseTicketScraper, EnrichedEvent


class EtixScraper(BaseTicketScraper):
    name = "Etix"
    domains = ["etix.com"]

    def extract(self, url: str) -> EnrichedEvent:
        html = self.fetch_html(url)
        return self.parse(html)

    def parse(self, html: str) -> EnrichedEvent:
        soup = self.get_soup(html)
        return EnrichedEvent(
            time=self._extract_time(soup),
            price=self._extract_price(soup),
            image_url=self._extract_image(soup),
            supporting_artists=self._extract_supporting(soup),
            source="etix"
        )

    def _extract_time(self, soup: BeautifulSoup) -> str | None:
        text = soup.get_text()
        patterns = [
            r'show[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
            r'doors[:\s]+(\d{1,2}):?(\d{2})?\s*(am|pm)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return self._convert_to_24h(match)
        return None

    def _extract_price(self, soup: BeautifulSoup) -> str | None:
        text = soup.get_text()
        match = re.search(r'\$(\d+(?:\.\d{2})?)\s*[-–—]\s*\$(\d+(?:\.\d{2})?)', text)
        if match:
            return f"${match.group(1)} - ${match.group(2)}"
        match = re.search(r'\$(\d+(?:\.\d{2})?)', text)
        if match:
            return f"${match.group(1)}"
        return None

    def _extract_image(self, soup: BeautifulSoup) -> str | None:
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]
        img = soup.select_one(".event-image img, .poster img")
        if img:
            return img.get("src") or img.get("data-src")
        return None

    def _extract_supporting(self, soup: BeautifulSoup) -> list[str] | None:
        text = soup.get_text()
        match = re.search(r'(?:with|featuring|w/|ft\.?)\s+([^,\n]+(?:,\s*[^,\n]+)*)', text, re.IGNORECASE)
        if match:
            artists = [a.strip() for a in match.group(1).split(",") if a.strip()]
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
