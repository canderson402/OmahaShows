// web/src/components/HistoryList.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { HistoricalShow } from "../types";
import type { HistoryTimeFilter } from "./FiltersDropdown";

// VenueColors is now just venue_id -> hex color
type VenueColors = Record<string, string>;
type VenueUrls = Record<string, string>;

interface HistoryListProps {
  shows: HistoricalShow[];
  enabledVenues: Set<string>;
  searchQuery: string;
  venueColors: VenueColors;
  venueUrls?: VenueUrls;
  timeFilter?: HistoryTimeFilter;
  hasMore?: boolean;  // more shows available from database
  loadingMore?: boolean;  // currently loading more from database
  onLoadMore?: () => void;  // callback to load more from database
  isSaved?: (id: string) => boolean;
  onToggleSave?: (id: string) => void;
}

// Generate a stable ID for a historical show
function generateShowId(show: HistoricalShow): string {
  const slug = show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const venueSlug = show.venue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${venueSlug}-${show.date}-${slug}`;
}

const SHOWS_PER_PAGE = 25;

// Map venue display names to source IDs
const venueNameToId: Record<string, string> = {
  "Slowdown": "theslowdown",
  "The Slowdown": "theslowdown",
  "Waiting Room": "waitingroom",
  "The Waiting Room": "waitingroom",
  "Reverb Lounge": "reverblounge",
  "Reverb": "reverblounge",
  "Bourbon Theatre": "bourbontheatre",
  "The Bourbon Theatre": "bourbontheatre",
  "Admiral": "admiral",
  "The Admiral": "admiral",
  "The Astro": "astrotheater",
  "Astro Theater": "astrotheater",
  "Astro": "astrotheater",
  "Steelhouse Omaha": "steelhouse",
  "Steelhouse": "steelhouse",
  "Holland Center": "holland",
  "Holland Performing Arts Center": "holland",
  "Orpheum Theater": "orpheum",
  "Orpheum": "orpheum",
  "Barnato": "barnato",
};

export function HistoryList({ shows, enabledVenues, searchQuery, venueColors, venueUrls, timeFilter = "all", hasMore: hasMoreFromDb, loadingMore, onLoadMore, isSaved, onToggleSave }: HistoryListProps) {
  const [visibleCount, setVisibleCount] = useState(SHOWS_PER_PAGE);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(SHOWS_PER_PAGE);
  }, [enabledVenues.size, searchQuery, timeFilter]);

  // Filter shows (time filtering done by database, only venue/search here)
  const filtered = useMemo(() => {
    let result = shows;

    // Filter by venue
    if (enabledVenues.size > 0) {
      result = result.filter((show) => {
        const venueId = venueNameToId[show.venue] || "other";
        return enabledVenues.has(venueId);
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
  }, [shows, enabledVenues, searchQuery]);

  // Infinite scroll with IntersectionObserver
  const loadMore = useCallback(() => {
    const newCount = Math.min(visibleCount + SHOWS_PER_PAGE, filtered.length);
    setVisibleCount(newCount);

    // If we've shown all filtered shows and there's more in database, load more
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
  const hasMore = visibleCount < filtered.length || hasMoreFromDb;

  // Counts per month/day from ALL loaded shows (not just the visible slice), so the
  // header counts don't bounce as you scroll through the client-side pagination.
  const countsByMonth = useMemo(() => {
    const counts: { [monthKey: string]: { total: number; days: { [dayKey: string]: number } } } = {};
    filtered.forEach((show) => {
      const date = new Date(show.date + "T00:00:00");
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!counts[monthKey]) counts[monthKey] = { total: 0, days: {} };
      counts[monthKey].total++;
      counts[monthKey].days[show.date] = (counts[monthKey].days[show.date] || 0) + 1;
    });
    return counts;
  }, [filtered]);

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

  // Reset collapse state on filter change; when new months appear via load-more,
  // only collapse those new keys (don't override user's manual toggles on existing months).
  const filterKey = `${enabledVenues.size}|${searchQuery}|${timeFilter}`;
  const prevFilterKeyRef = useRef(filterKey);
  const seenMonthsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentKeys = groupedByMonth.map((g) => g.key);
    const filterChanged = prevFilterKeyRef.current !== filterKey;

    if (filterChanged) {
      const collapsed = new Set<string>();
      for (const key of currentKeys) {
        if (key !== currentMonth) collapsed.add(key);
      }
      setCollapsedMonths(collapsed);
      setCollapsedDays(new Set());
      seenMonthsRef.current = new Set(currentKeys);
      prevFilterKeyRef.current = filterKey;
      return;
    }

    const newKeys = currentKeys.filter((k) => !seenMonthsRef.current.has(k));
    if (newKeys.length === 0) return;

    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      for (const key of newKeys) {
        if (key !== currentMonth) next.add(key);
      }
      return next;
    });
    for (const key of newKeys) {
      seenMonthsRef.current.add(key);
    }
  }, [groupedByMonth, filterKey]);

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
                <span className="text-xs text-gray-500 font-normal">{countsByMonth[group.key]?.total ?? group.shows.length} shows</span>
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
                        className="w-full flex items-center justify-between py-1.5 px-6 cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      >
                        <span className="text-sm text-gray-400 font-medium">{day.label}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{countsByMonth[group.key]?.days[day.key] ?? day.shows.length}</span>
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
                        const venueHex = venueColors[venueId] || "#9ca3af";
                        const venueUrl = venueUrls?.[venueId];
                        const isLast = idx === day.shows.length - 1;
                        const showId = generateShowId(show);
                        const saved = isSaved?.(showId) ?? false;
                        return (
                          <div
                            key={`${show.date}-${show.title}-${idx}`}
                            className={`py-3 px-6 pl-10 ${!isLast ? "border-b border-gray-800/50" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white flex-1 truncate">{show.title}</span>
                              {venueUrl ? (
                                <a
                                  href={venueUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs flex-shrink-0 hover:underline"
                                  style={{ color: venueHex }}
                                >
                                  {show.venue}
                                </a>
                              ) : (
                                <span className="text-xs flex-shrink-0" style={{ color: venueHex }}>
                                  {show.venue}
                                </span>
                              )}
                              {onToggleSave && (
                                <button
                                  onClick={() => onToggleSave(showId)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                    saved
                                      ? "bg-green-500/90 text-white"
                                      : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
                                  }`}
                                  title={saved ? "Remove from My Shows" : "Add to My Shows"}
                                >
                                  {saved ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  )}
                                </button>
                              )}
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
      {(hasMore || loadingMore) && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
