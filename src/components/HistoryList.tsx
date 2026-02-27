// web/src/components/HistoryList.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { HistoricalShow } from "../types";
import type { HistoryTimeFilter } from "./FiltersDropdown";

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

interface HistoryListProps {
  shows: HistoricalShow[];
  enabledVenues: Set<string>;
  searchQuery: string;
  venueColors: VenueColors;
  timeFilter?: HistoryTimeFilter;
}

const SHOWS_PER_PAGE = 25;

// Map venue display names to source IDs
const venueNameToId: Record<string, string> = {
  "The Slowdown": "theslowdown",
  "Waiting Room": "waitingroom",
  "Reverb Lounge": "reverblounge",
  "Bourbon Theatre": "bourbontheatre",
  "Admiral": "admiral",
  "The Astro": "astrotheater",
  "Astro Theater": "astrotheater",
  "Steel House Omaha": "steelhouse",
  "Steel House": "steelhouse",
};

export function HistoryList({ shows, enabledVenues, searchQuery, venueColors, timeFilter = "all" }: HistoryListProps) {
  const [visibleCount, setVisibleCount] = useState(SHOWS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(SHOWS_PER_PAGE);
  }, [enabledVenues.size, searchQuery, timeFilter]);

  // Filter shows
  const filtered = useMemo(() => {
    let result = shows;

    // Filter by time period
    if (timeFilter !== "all") {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      let cutoffDate: string;

      if (timeFilter === "30days") {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        cutoffDate = d.toISOString().split('T')[0];
      } else if (timeFilter === "90days") {
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        cutoffDate = d.toISOString().split('T')[0];
      } else if (timeFilter === "year") {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        cutoffDate = d.toISOString().split('T')[0];
      } else if (timeFilter === "this-year") {
        cutoffDate = `${now.getFullYear()}-01-01`;
      } else {
        cutoffDate = "1900-01-01";
      }

      result = result.filter((show) => show.date >= cutoffDate && show.date < today);
    }

    // Filter by venue
    if (enabledVenues.size > 0) {
      result = result.filter((show) => {
        const venueId = venueNameToId[show.venue];
        return venueId && enabledVenues.has(venueId);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((show) =>
        show.title.toLowerCase().includes(query) ||
        show.venue.toLowerCase().includes(query)
      );
    }

    return result;
  }, [shows, enabledVenues, searchQuery, timeFilter]);

  // Infinite scroll with IntersectionObserver
  const loadMore = useCallback(() => {
    setVisibleCount(v => Math.min(v + SHOWS_PER_PAGE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
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

  const visibleShows = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getVenueId = (venueName: string) => venueNameToId[venueName] || "other";

  // Group shows by month
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: HistoricalShow[] } = {};
    visibleShows.forEach((show) => {
      const date = new Date(show.date + "T00:00:00");
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(show);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => ({
        key,
        label: new Date(items[0].date + "T00:00:00").toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        shows: items,
      }));
  }, [visibleShows]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No shows found.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Show list grouped by month */}
      {groupedByMonth.map((group) => (
        <div key={group.key} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-3 sticky top-0 bg-gray-900/90 py-2 -mx-6 px-6">
            {group.label}
          </h3>
          <div className="-mx-6">
            {group.shows.map((show, idx) => {
              const venueId = getVenueId(show.venue);
              const colors = venueColors[venueId] || { text: "text-gray-400" };
              const isLast = idx === group.shows.length - 1;
              return (
                <div
                  key={`${show.date}-${show.title}-${idx}`}
                  className={`py-3 px-6 ${!isLast ? "border-b border-gray-800" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                      {formatDate(show.date)}
                    </span>
                    <span className="text-white flex-1 truncate">{show.title}</span>
                    <span className={`text-xs ${colors.text} flex-shrink-0`}>
                      {show.venue}
                    </span>
                  </div>
                  {show.supportingArtists && show.supportingArtists.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500 truncate pl-[6.75rem]">
                      with {show.supportingArtists.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
