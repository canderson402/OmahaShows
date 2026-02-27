# scraper/scrapers/bourbontheatre.py
"""
Bourbon Theatre scraper using Playwright for JS-rendered content.
This venue uses TicketWeb widget and renders events via JavaScript.
"""
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

sys.path.insert(0, '/Users/codyanderson/Dev/ShowCal/scraper')
from scrapers.base import BaseScraper
from models import Event


class BourbonTheatreScraper(BaseScraper):
    name = "Bourbon Theatre"
    id = "bourbontheatre"
    url = "https://www.bourbontheatre.com/calendar/"

    def scrape(self) -> list[Event]:
        """Override scrape to use Playwright instead of requests."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(self.url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(3000)  # Wait for JS to render

            events = self._extract_events(page)
            browser.close()
            return events

    def _extract_events(self, page) -> list[Event]:
        """Extract events from the rendered page."""
        events = []
        seen_ids = set()

        # Find all tw-cal-event containers (this is the TicketWeb widget structure)
        event_containers = page.query_selector_all('.tw-cal-event')

        for container in event_containers:
            try:
                # Get title and event URL from .tw-name a
                name_link = container.query_selector('.tw-name a')
                if not name_link:
                    continue

                title = name_link.inner_text().strip()
                event_url = name_link.get_attribute('href')

                if not title:
                    continue

                # Get image URL from .tw-image img
                img_el = container.query_selector('.tw-image img')
                image_url = img_el.get_attribute('src') if img_el else None

                # Get date from .tw-event-date
                date_el = container.query_selector('.tw-event-date')
                date_str = None
                if date_el:
                    date_text = date_el.inner_text().strip()
                    date_str = self._parse_date(date_text)

                if not date_str:
                    continue

                # Get time from calendar popup or event content
                time_str = None
                time_el = container.query_selector('.tw-calendar-event-time, .tw-event-time-complete')
                if time_el:
                    time_text = time_el.inner_text().strip()
                    time_str = self._parse_time(time_text)

                # Generate ticket URL from event URL
                # Pattern: /tm-event/slug/ -> ticketweb URL
                ticket_url = None
                if event_url:
                    # We'll need to visit the event page to get the actual ticket URL
                    # For now, leave it as None - the event URL links to info page
                    pass

                # Generate ID
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                event_id = f"bourbontheatre-{date_str}-{slug}"[:80]

                if event_id in seen_ids:
                    continue
                seen_ids.add(event_id)

                events.append(Event(
                    id=event_id,
                    title=title,
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
                continue

        # Also check calendar view for events with times
        events = self._enrich_with_calendar_times(page, events)

        return events

    def _enrich_with_calendar_times(self, page, events: list[Event]) -> list[Event]:
        """Try to get show times from the calendar view."""
        # Build a map of date+slug to event for updating
        event_map = {(e.date, re.sub(r'[^a-z0-9]+', '-', e.title.lower()).strip('-')[:30]): e for e in events}

        # Look for calendar entries with times
        calendar_events = page.query_selector_all('.tw-calendar-event-content')
        for cal_event in calendar_events:
            try:
                title_el = cal_event.query_selector('.tw-calendar-event-title')
                if not title_el:
                    continue

                title = title_el.inner_text().strip()
                slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:30]

                # Get time
                time_el = cal_event.query_selector('.tw-calendar-event-time')
                doors_el = cal_event.query_selector('.tw-calendar-event-doors')

                show_time = None
                if time_el:
                    time_text = time_el.inner_text().strip()
                    # Format: "Show: 7:00 PM"
                    match = re.search(r'(\d{1,2}:\d{2}\s*[AP]M)', time_text, re.I)
                    if match:
                        show_time = self._parse_time(match.group(1))

                if not show_time and doors_el:
                    doors_text = doors_el.inner_text().strip()
                    match = re.search(r'(\d{1,2}:\d{2}\s*[AP]M)', doors_text, re.I)
                    if match:
                        show_time = self._parse_time(match.group(1))

                # Try to find matching event and update time
                for (date, event_slug), event in event_map.items():
                    if slug in event_slug or event_slug in slug:
                        if show_time and not event.time:
                            event.time = show_time
                        break

            except Exception:
                continue

        return events

    def _parse_date(self, date_text: str) -> str | None:
        """Parse date like 'February 26, 2026' to YYYY-MM-DD."""
        try:
            date_text = date_text.strip()
            # Try full format: "February 26, 2026"
            try:
                date_obj = datetime.strptime(date_text, "%B %d, %Y")
                return date_obj.strftime("%Y-%m-%d")
            except ValueError:
                pass

            # Try short format: "Feb 26, 2026"
            try:
                date_obj = datetime.strptime(date_text, "%b %d, %Y")
                return date_obj.strftime("%Y-%m-%d")
            except ValueError:
                pass

            return None
        except Exception:
            return None

    def _parse_time(self, time_str: str) -> str | None:
        """Convert time like '07:00 PM' or '7:00 pm' to 24-hour format."""
        if not time_str:
            return None

        try:
            time_str = time_str.strip().upper()
            match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)', time_str)
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
        except:
            return None

    def fetch_html(self) -> str:
        """Not used - this scraper uses Playwright instead."""
        raise NotImplementedError("Use scrape() directly for JS-rendered sites")

    def parse_events(self, html: str) -> list[Event]:
        """Not used - this scraper uses Playwright instead."""
        raise NotImplementedError("Use scrape() directly for JS-rendered sites")
