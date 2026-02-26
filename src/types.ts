// web/src/types.ts
export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  venueUrl?: string;
  eventUrl?: string;  // Event detail page on venue's site
  ticketUrl?: string;  // Ticket purchase page (etix, etc.)
  imageUrl?: string;
  price?: string;
  ageRestriction?: string;
  supportingArtists?: string[];  // ["Artist 1", "Artist 2"]
  source: string;
}

export interface SourceStatus {
  name: string;
  id: string;
  url: string;
  status: "ok" | "error";
  lastScraped: string;
  eventCount: number;
  error?: string;
}

export interface EventsData {
  events: Event[];
  lastUpdated: string;
  sources: SourceStatus[];
}
