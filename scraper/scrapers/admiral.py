# scraper/scrapers/admiral.py
"""
Admiral Omaha scraper - uses same RHP system as Waiting Room/Reverb.
"""
import re
import sys
from datetime import datetime
import requests

sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.base import BaseScraper
from models import Event


class AdmiralScraper(BaseScraper):
    name = "Admiral"
    id = "admiral"
    url = "https://admiralomaha.com/events/"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    def fetch_html(self) -> str:
        """Fetch HTML with proper headers."""
        response = requests.get(self.url, headers=self.headers, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def parse_events(self, html: str) -> list[Event]:
        soup = self.get_soup(html)
        events = []

        for card in soup.select("div.eventWrapper.rhpSingleEvent"):
            try:
                # Title - h2 with class containing rhp-event__title or eventTitleDiv
                title_el = card.select_one('h2[class*="rhp-event__title"], .eventTitleDiv h2, h2')
                title = title_el.get_text(strip=True) if title_el else None
                if not title:
                    continue

                # Date - div.eventMonth or .singleEventDate
                date_el = card.select_one('.eventMonth, .singleEventDate')
                date_str = self._parse_date(date_el.get_text(strip=True)) if date_el else None
                if not date_str:
                    continue

                # Event URL - look for "More Info" link
                event_url = None
                more_info = card.select_one('a[href*="/event/"]')
                if more_info:
                    event_url = more_info.get("href")
                    if event_url and not event_url.startswith("http"):
                        event_url = f"https://admiralomaha.com{event_url}"

                # Ticket URL - look for etix link or "Buy Tickets" link
                ticket_url = None
                ticket_el = card.select_one('a[href*="etix.com"], a[href*="ticketmaster"], a[href*="axs.com"]')
                if ticket_el:
                    ticket_url = ticket_el.get("href")
                else:
                    # Look for Buy Tickets link
                    buy_link = card.find('a', string=re.compile(r'Buy Tickets', re.I))
                    if buy_link:
                        ticket_url = buy_link.get("href")

                # Image URL
                img_el = card.select_one('img.eventListImage, img[class*="rhp-event__image"], .eventListImage img')
                image_url = img_el.get("src") if img_el else None

                # Price
                price_el = card.select_one('.rhp-event__cost-text--list, .eventCost')
                price = price_el.get_text(strip=True) if price_el else None
                if not price:
                    # Try to find price in card text
                    card_text = card.get_text()
                    price_match = re.search(r'\$[\d.]+(?: ADV)?(?:\s*/\s*\$[\d.]+ DOS)?(?:\s*/\s*\$[\d.]+ [A-Z ]+)?', card_text)
                    if price_match:
                        price = price_match.group(0).strip()

                # Age restriction
                age_el = card.select_one('.eventAgeRestriction')
                age_restriction = age_el.get_text(strip=True) if age_el else None
                if not age_restriction:
                    card_text = card.get_text()
                    if "ALL AGES" in card_text.upper():
                        age_restriction = "All Ages"
                    elif "21+" in card_text:
                        age_restriction = "21+"
                    elif "18+" in card_text or "18 and up" in card_text.lower():
                        age_restriction = "18+"

                # Time
                time_str = None
                time_el = card.select_one('.rhp-event__time-text--list')
                if time_el:
                    time_str = self._parse_time(time_el.get_text(strip=True))
                else:
                    card_text = card.get_text()
                    time_match = re.search(r'Show:\s*(\d{1,2}(?::\d{2})?\s*[ap]m)', card_text, re.I)
                    if time_match:
                        time_str = self._parse_time(time_match.group(1))
                    else:
                        doors_match = re.search(r'Doors:\s*(\d{1,2}(?::\d{2})?\s*[ap]m)', card_text, re.I)
                        if doors_match:
                            time_str = self._parse_time(doors_match.group(1))

                # Supporting Artists - look for "with Artist, Artist"
                supporting_artists = None
                for h4 in card.select("h4"):
                    h4_text = h4.get_text(strip=True)
                    if h4_text.lower().startswith("with "):
                        artists_str = h4_text[5:]
                        supporting_artists = [a.strip() for a in artists_str.split(',') if a.strip()]
                        break

                # Also check for "with" in other elements
                if not supporting_artists:
                    card_text = card.get_text()
                    with_match = re.search(r'with\s+([A-Z][^$\n]+?)(?:\s+ALL AGES|\s+\d+\+|\s+Doors:)', card_text)
                    if with_match:
                        artists_str = with_match.group(1).strip()
                        supporting_artists = [a.strip() for a in artists_str.split(',') if a.strip()]

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"admiral-{date_str}-{slug}"[:80]

                events.append(Event(
                    id=event_id,
                    title=title,
                    date=date_str,
                    time=time_str,
                    venue=self.name,
                    eventUrl=event_url,
                    ticketUrl=ticket_url,
                    imageUrl=image_url,
                    price=price,
                    ageRestriction=age_restriction,
                    supportingArtists=supporting_artists if supporting_artists else None,
                    source=self.id
                ))
            except Exception:
                continue

        return events

    def _parse_date(self, date_text: str) -> str | None:
        """Convert date like 'Thu, Feb 26' or 'Sat, Mar 06' to YYYY-MM-DD."""
        try:
            date_text = date_text.strip()

            # Handle format "Thu, Feb 26"
            if ',' in date_text:
                date_text = date_text.split(',')[1].strip()

            parts = date_text.split()
            if len(parts) >= 2:
                month_str = parts[0]
                day_str = parts[1]
            else:
                return None

            month_map = {
                'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
            }
            month = month_map.get(month_str)
            if not month:
                return None

            day = int(day_str)
            year = datetime.now().year

            # If date is in the past, assume next year
            today = datetime.now()
            event_date = datetime(year, month, day)
            if event_date < today - datetime.resolution:
                if (today - event_date).days > 30:
                    year += 1

            return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            return None

    def _parse_time(self, time_text: str) -> str | None:
        """Convert time like '7 pm' or '7:30 pm' to 24-hour HH:MM."""
        try:
            time_text = time_text.strip().lower()

            # Handle "Show: 7 pm" or just "7 pm"
            if 'show:' in time_text:
                time_text = time_text.split('show:')[-1].strip()

            match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', time_text)
            if not match:
                return None

            hour = int(match.group(1))
            minute = int(match.group(2)) if match.group(2) else 0
            period = match.group(3).upper()

            if period == 'PM' and hour != 12:
                hour += 12
            elif period == 'AM' and hour == 12:
                hour = 0

            return f"{hour:02d}:{minute:02d}"
        except Exception:
            return None
