// web/src/components/EventList.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Event } from "../types";
import { EventCard } from "./EventCard";
import { EventCardCompact } from "./EventCardCompact";

const EVENTS_PER_PAGE = 15;

// Format date for day separator
function formatDaySeparator(dateStr: string, today: string, tomorrow: string): string {
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";

  const date = new Date(dateStr + "T00:00:00");
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();

  return `${weekday}, ${month} ${day}`;
}

// Day separator component
function DaySeparator({ label }: { label: string }) {
  return (
    <div className="bg-gray-800 py-3 px-4 -mx-6 flex items-center justify-center border-y border-gray-700">
      <span className="text-white font-bold text-base tracking-wide">
        {label}
      </span>
    </div>
  );
}

// VenueColors is now just venue_id -> hex color
type VenueColors = Record<string, string>;

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
  hasMore?: boolean;  // more events available from database
  loadingMore?: boolean;  // currently loading more from database
  onLoadMore?: () => void;  // callback to load more from database
  highlightedEventId?: string | null;  // event to highlight and scroll to
  isSaved?: (id: string) => boolean;  // check if event is saved
  onToggleSave?: (id: string) => void;  // toggle save state
  initialVisibleCount?: number;  // initial number of visible events (for scroll restoration)
}

export function EventList({ events, layout, filter, venueColors, isJustAdded, hasMore: hasMoreFromDb, loadingMore, onLoadMore, highlightedEventId, isSaved, onToggleSave, initialVisibleCount }: EventListProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount || EVENTS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { today, tomorrow } = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomorrowStr = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;
    return { today: todayStr, tomorrow: tomorrowStr };
  }, []);

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
      const weekDateStr = `${weekFromNow.getFullYear()}-${String(weekFromNow.getMonth() + 1).padStart(2, '0')}-${String(weekFromNow.getDate()).padStart(2, '0')}`;

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
    const newCount = Math.min(visibleCount + EVENTS_PER_PAGE, filtered.length);
    setVisibleCount(newCount);

    // If we've shown all filtered events and there's more in database, load more
    if (newCount >= filtered.length && hasMoreFromDb && onLoadMore && !loadingMore) {
      onLoadMore();
    }
  }, [filtered.length, visibleCount, hasMoreFromDb, onLoadMore, loadingMore]);

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
  const hasMore = visibleCount < filtered.length || hasMoreFromDb;

  // Scroll to highlighted event - keep loading if not found yet
  useEffect(() => {
    if (!highlightedEventId) return;

    const eventInVisible = visibleEvents.some(e => e.id === highlightedEventId);

    if (eventInVisible) {
      // Event is visible, scroll to it
      setTimeout(() => {
        const element = document.getElementById(highlightedEventId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
    } else if (hasMore && onLoadMore && !loadingMore) {
      // Event not found yet, load more
      loadMore();
    }
  }, [highlightedEventId, visibleEvents, hasMore, onLoadMore, loadingMore, loadMore]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No upcoming shows found.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  if (layout === "compact") {
    let lastDate: string | null = null;

    return (
      <div>
        <div>
          {visibleEvents.map((event, index) => {
            const isNewDay = event.date !== lastDate;
            const showDaySeparator = isNewDay; // Show for first event too
            const showDivider = index > 0 && !isNewDay;
            lastDate = event.date;

            return (
              <div key={event.id}>
                {showDaySeparator && (
                  <DaySeparator label={formatDaySeparator(event.date, today, tomorrow)} />
                )}
                {showDivider && (
                  <div className="border-t border-gray-700" />
                )}
                <EventCardCompact
                  event={event}
                  venueColors={venueColors}
                  isJustAdded={isJustAdded?.(event)}
                  isHighlighted={event.id === highlightedEventId}
                  isSaved={isSaved?.(event.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            );
          })}
        </div>
        {/* Invisible sentinel for infinite scroll */}
        {(hasMore || loadingMore) && (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Full layout with day separators
  let lastDateFull: string | null = null;

  return (
    <div>
      <div>
        {visibleEvents.map((event, index) => {
          const isNewDay = event.date !== lastDateFull;
          const showDaySeparator = isNewDay; // Show for first event too
          const showDivider = index > 0 && !isNewDay;
          lastDateFull = event.date;

          return (
            <div key={event.id}>
              {showDaySeparator && (
                <DaySeparator label={formatDaySeparator(event.date, today, tomorrow)} />
              )}
              {showDivider && (
                <div className="border-t border-gray-700" />
              )}
              <EventCard event={event} venueColors={venueColors} />
            </div>
          );
        })}
      </div>
      {/* Invisible sentinel for infinite scroll */}
      {(hasMore || loadingMore) && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
