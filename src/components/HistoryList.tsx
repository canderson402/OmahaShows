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
  "Slowdown": "theslowdown",
  "Waiting Room": "waitingroom",
  "Reverb Lounge": "reverblounge",
  "Bourbon Theatre": "bourbontheatre",
  "Admiral": "admiral",
  "The Astro": "astrotheater",
  "Astro Theater": "astrotheater",
  "Steelhouse Omaha": "steelhouse",
  "Steelhouse": "steelhouse",
};

export function HistoryList({ shows, enabledVenues, searchQuery, venueColors, timeFilter = "all" }: HistoryListProps) {
  const [visibleCount, setVisibleCount] = useState(SHOWS_PER_PAGE);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
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
      const toLocalDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const today = toLocalDateStr(now);
      let cutoffDate: string;

      if (timeFilter === "30days") {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        cutoffDate = toLocalDateStr(d);
      } else if (timeFilter === "90days") {
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        cutoffDate = toLocalDateStr(d);
      } else if (timeFilter === "year") {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        cutoffDate = toLocalDateStr(d);
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

  const getVenueId = (venueName: string) => venueNameToId[venueName] || "other";

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Group shows by month, then by day within each month
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
      .map(([key, items]) => {
        // Sub-group by day
        const dayGroups: { [dayKey: string]: HistoricalShow[] } = {};
        items.forEach((show) => {
          if (!dayGroups[show.date]) dayGroups[show.date] = [];
          dayGroups[show.date].push(show);
        });
        const days = Object.entries(dayGroups)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([dayKey, dayShows]) => ({
            key: dayKey,
            label: formatDayLabel(dayKey),
            shows: dayShows,
          }));
        return {
          key,
          label: new Date(items[0].date + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          shows: items,
          days,
        };
      });
  }, [visibleShows]);

  // Collapse months that don't contain shows from the last 7 days
  const initialCollapsed = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const cutoff = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`;

    const collapsed = new Set<string>();
    for (const group of groupedByMonth) {
      const hasRecent = group.shows.some((s) => s.date >= cutoff);
      if (!hasRecent) collapsed.add(group.key);
    }
    return collapsed;
  }, [groupedByMonth]);

  // Reset collapsed state when filters change
  useEffect(() => {
    setCollapsedMonths(initialCollapsed);
    setCollapsedDays(new Set());
  }, [initialCollapsed]);

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleDay = (key: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
      {groupedByMonth.map((group) => {
        const isCollapsed = collapsedMonths.has(group.key);
        return (
          <div key={group.key} className="mb-6">
            <button
              onClick={() => toggleMonth(group.key)}
              className="w-full flex items-center justify-between text-lg font-semibold text-gray-300 sticky top-0 bg-gray-900/90 py-2 -mx-6 px-6 cursor-pointer hover:text-white transition-colors"
              style={{ width: "calc(100% + 3rem)" }}
            >
              <span>{group.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-normal">{group.shows.length} shows</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {!isCollapsed && (
              <div className="-mx-6">
                {group.days.map((day) => {
                  const isDayCollapsed = collapsedDays.has(day.key);
                  return (
                    <div key={day.key}>
                      <button
                        onClick={() => toggleDay(day.key)}
                        className="w-full flex items-center justify-between py-1.5 px-6 cursor-pointer hover:bg-gray-800/50 transition-colors"
                      >
                        <span className="text-sm text-gray-400 font-medium">{day.label}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{day.shows.length}</span>
                          <svg
                            className={`w-3 h-3 text-gray-600 transition-transform ${isDayCollapsed ? "" : "rotate-180"}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>
                      {!isDayCollapsed && day.shows.map((show, idx) => {
                        const venueId = getVenueId(show.venue);
                        const colors = venueColors[venueId] || { text: "text-gray-400" };
                        const isLast = idx === day.shows.length - 1;
                        return (
                          <div
                            key={`${show.date}-${show.title}-${idx}`}
                            className={`py-3 px-6 pl-10 ${!isLast ? "border-b border-gray-800/50" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white flex-1 truncate">{show.title}</span>
                              <span className={`text-xs ${colors.text} flex-shrink-0`}>
                                {show.venue}
                              </span>
                            </div>
                            {show.supportingArtists && show.supportingArtists.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500 truncate">
                                with {show.supportingArtists.join(", ")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
