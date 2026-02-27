# scraper/scrapers/steelhouse.py
import re
import sys
from datetime import datetime
sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.base import BaseScraper
from models import Event


class SteelHouseScraper(BaseScraper):
    name = "Steel House"
    id = "steelhouse"
    url = "https://steelhouseomaha.com/events/"

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        # Each event is in a div.bg-gray-800.rounded-lg card
        for card in soup.select("div.bg-gray-800.rounded-lg.overflow-hidden.shadow-lg.relative.group"):
            try:
                # Event URL from the clickable overlay link
                event_link = card.select_one("a.absolute.inset-0")
                event_url = event_link.get("href") if event_link else None

                # Title from aria-label or footer h4
                title = None
                if event_link and event_link.get("aria-label"):
                    title = event_link.get("aria-label").strip()
                if not title:
                    title_el = card.select_one("h4.text-white.mb-2.break-words")
                    title = title_el.get_text(strip=True) if title_el else None
                if not title:
                    continue

                # Image URL
                img_el = card.select_one("img.wp-post-image")
                image_url = img_el.get("src") if img_el else None

                # Date and time from footer paragraph (format: "Feb 26, 2026 @ 7:00 PM")
                date_str = None
                time_str = None
                footer_p = card.select_one("p.text-gray-300.mb-3")
                if footer_p:
                    footer_text = footer_p.get_text(strip=True)
                    date_str, time_str = self._parse_datetime(footer_text)

                # If no date from footer, try hover overlay
                if not date_str:
                    hover_details = card.select_one(".hover_card_details_wrapper")
                    if hover_details:
                        for row in hover_details.select("div.flex.gap-4"):
                            label = row.select_one("span.text-white.w-32")
                            value = row.select_one("span.text-white.font-semibold")
                            if label and value:
                                label_text = label.get_text(strip=True).lower()
                                value_text = value.get_text(strip=True)
                                if label_text == "date":
                                    date_str = self._parse_full_date(value_text)
                                elif label_text == "showtime":
                                    time_str = self._parse_time(value_text)

                if not date_str:
                    continue

                # Ticket URL
                ticket_link = card.select_one("a.ticket_link")
                ticket_url = ticket_link.get("href") if ticket_link else None

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"steelhouse-{date_str}-{slug}"[:80]

                events.append(Event(
                    id=event_id,
                    title=title.title(),  # Capitalize since titles are lowercase on site
                    date=date_str,
                    time=time_str,
                    venue=self.name,
                    eventUrl=event_url,
                    ticketUrl=ticket_url,
                    imageUrl=image_url,
                    price=None,
                    ageRestriction=None,
                    supportingArtists=None,
                    source=self.id
                ))
            except Exception:
                continue  # Skip malformed events

        return events

    def _parse_datetime(self, text: str) -> tuple[str | None, str | None]:
        """Parse 'Feb 26, 2026 @ 7:00 PM' format."""
        try:
            # Split on @ to get date and time
            if "@" in text:
                date_part, time_part = text.split("@", 1)
                date_str = self._parse_short_date(date_part.strip())
                time_str = self._parse_time(time_part.strip())
                return date_str, time_str
            else:
                return self._parse_short_date(text.strip()), None
        except Exception:
            return None, None

    def _parse_short_date(self, text: str) -> str | None:
        """Parse 'Feb 26, 2026' or 'Mar 11, 2026' to YYYY-MM-DD."""
        try:
            # Try parsing with datetime
            dt = datetime.strptime(text, "%b %d, %Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            return None

    def _parse_full_date(self, text: str) -> str | None:
        """Parse 'February 26, 2026' to YYYY-MM-DD."""
        try:
            dt = datetime.strptime(text, "%B %d, %Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            return None

    def _parse_time(self, text: str) -> str | None:
        """Convert '7:00 PM' to HH:MM format (24-hour)."""
        try:
            text = text.strip().upper()
            match = re.match(r'(\d{1,2}):(\d{2})\s*(AM|PM)', text)
            if not match:
                return None

            hour = int(match.group(1))
            minute = int(match.group(2))
            period = match.group(3)

            if period == 'PM' and hour != 12:
                hour += 12
            elif period == 'AM' and hour == 12:
                hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None
