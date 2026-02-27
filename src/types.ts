// web/src/types.ts
export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  eventUrl?: string;  // Event detail page on venue's site
  ticketUrl?: string;  // Ticket purchase page (etix, etc.)
  imageUrl?: string;
  price?: string;
  ageRestriction?: string;
  supportingArtists?: string[];  // ["Artist 1", "Artist 2"]
  source: string;
  addedAt?: string;  // ISO timestamp when first seen
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

export interface HistoricalShow {
  date: string;
  title: string;
  venue: string;
  supportingArtists?: string[];
}

export interface ShowHistory {
  shows: HistoricalShow[];
  lastUpdated: string;
}
