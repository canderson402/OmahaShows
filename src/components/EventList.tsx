// web/src/components/EventList.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  const loadMoreRef = useRef<HTMLDivElement>(null);
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

  // Infinite scroll with IntersectionObserver
  const loadMore = useCallback(() => {
    setVisibleCount(v => Math.min(v + EVENTS_PER_PAGE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' } // Load more before reaching the end
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore]);

  // Only show events up to visibleCount
  const visibleEvents = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {filter?.showPast ? "No past events found." : "No upcoming events found."}
      </div>
    );
  }

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
        {/* Invisible sentinel for infinite scroll */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
          </div>
        )}
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
      {/* Invisible sentinel for infinite scroll */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
