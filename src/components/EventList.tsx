// web/src/components/EventList.tsx
import { useState, useEffect, useMemo } from "react";
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
    timeFilter?: "all" | "today" | "week" | "just-added";
    searchQuery?: string;
  };
  venueColors?: VenueColors;
  isJustAdded?: (event: Event) => boolean;  // function to check if event is just added
}

export function EventList({ events, layout, filter, venueColors, isJustAdded }: EventListProps) {
  const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(EVENTS_PER_PAGE);
  }, [filter?.enabledVenues?.size, filter?.showPast, filter?.timeFilter, filter?.searchQuery]);

  // Memoize filtered and sorted events
  const filtered = useMemo(() => {
    let result = events;

    // Filter by enabled venues
    if (filter?.enabledVenues && filter.enabledVenues.size > 0) {
      result = result.filter((e) => filter.enabledVenues!.has(e.source));
    }

    // Filter by past/upcoming
    if (filter?.showPast === true) {
      result = result.filter((e) => e.date < today);
    } else if (filter?.showPast === false) {
      result = result.filter((e) => e.date >= today);
    }

    // Apply time filter
    if (filter?.timeFilter && filter.timeFilter !== "all") {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const weekDateStr = weekFromNow.toISOString().split('T')[0];

      if (filter.timeFilter === "today") {
        result = result.filter((e) => e.date === today);
      } else if (filter.timeFilter === "week") {
        result = result.filter((e) => e.date >= today && e.date <= weekDateStr);
      } else if (filter.timeFilter === "just-added" && isJustAdded) {
        result = result.filter(isJustAdded);
      }
    }

    // Apply search filter
    if (filter?.searchQuery?.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.supportingArtists?.some(a => a.toLowerCase().includes(query))
      );
    }

    // Sort by date
    if (filter?.showPast) {
      result = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else {
      result = [...result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    return result;
  }, [events, filter?.enabledVenues, filter?.showPast, filter?.timeFilter, filter?.searchQuery, today, isJustAdded]);

  // Only show events up to visibleCount - only these images load
  const visibleEvents = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
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
            <EventCardCompact
              key={event.id}
              event={event}
              venueColors={venueColors}
              isJustAdded={isJustAdded?.(event)}
            />
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
