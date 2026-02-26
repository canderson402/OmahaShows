// web/src/components/EventList.tsx
import { useState, useEffect } from "react";
import type { Event } from "../types";
import { EventCard } from "./EventCard";
import { EventCardCompact } from "./EventCardCompact";

const EVENTS_PER_PAGE = 15;

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

interface EventListProps {
  events: Event[];
  layout: "compact" | "full";
  filter?: {
    enabledVenues?: Set<string>;
    showPast?: boolean;  // true = show only past, false = show only upcoming, undefined = show all
  };
  venueColors?: VenueColors;
}

export function EventList({ events, layout, filter, venueColors }: EventListProps) {
  const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE);
  const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(EVENTS_PER_PAGE);
  }, [filter?.enabledVenues?.size, filter?.showPast]);

  let filtered = events;

  // Filter by enabled venues
  if (filter?.enabledVenues && filter.enabledVenues.size > 0) {
    filtered = filtered.filter((e) => filter.enabledVenues!.has(e.source));
  }

  // Filter by past/upcoming
  if (filter?.showPast === true) {
    // History view: only past events
    filtered = filtered.filter((e) => e.date < today);
  } else if (filter?.showPast === false) {
    // Events view: only upcoming events (today and future)
    filtered = filtered.filter((e) => e.date >= today);
  }

  // Sort by date
  if (filter?.showPast) {
    // History: most recent past events first
    filtered = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else {
    // Upcoming: soonest first
    filtered = [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // Only show events up to visibleCount - only these images load
  const visibleEvents = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remainingCount = filtered.length - visibleCount;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {filter?.showPast ? "No past events found." : "No upcoming events found."}
      </div>
    );
  }

  const LoadMoreButton = () => (
    <div className="flex flex-col items-center gap-2 py-8">
      <button
        onClick={() => setVisibleCount(v => v + EVENTS_PER_PAGE)}
        className="px-6 py-3 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors"
      >
        Load More
      </button>
      <span className="text-gray-500 text-sm">
        {remainingCount} more event{remainingCount !== 1 ? 's' : ''}
      </span>
    </div>
  );

  if (layout === "compact") {
    return (
      <div>
        <div className="divide-y divide-gray-700">
          {visibleEvents.map((event) => (
            <EventCardCompact key={event.id} event={event} venueColors={venueColors} />
          ))}
        </div>
        {hasMore && <LoadMoreButton />}
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-700">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} venueColors={venueColors} />
        ))}
      </div>
      {hasMore && <LoadMoreButton />}
    </div>
  );
}
