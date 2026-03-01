// web/src/components/FiltersDropdown.tsx
import { useState, useEffect } from "react";

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

export type TimeFilter = "all" | "today" | "week" | "just-added";
export type HistoryTimeFilter = "all" | "30days" | "90days" | "year" | "this-year";

interface BaseFiltersDropdownProps {
  venues: { id: string; name: string }[];
  enabledVenues: Set<string>;
  toggleVenue: (venueId: string) => void;
  venueColors: VenueColors;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface EventsFiltersDropdownProps extends BaseFiltersDropdownProps {
  mode?: "events";
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  justAddedCount: number;
}

interface HistoryFiltersDropdownProps extends BaseFiltersDropdownProps {
  mode: "history";
  timeFilter: HistoryTimeFilter;
  setTimeFilter: (filter: HistoryTimeFilter) => void;
}

type FiltersDropdownProps = EventsFiltersDropdownProps | HistoryFiltersDropdownProps;

export function FiltersDropdown(props: FiltersDropdownProps) {
  const {
    venues,
    enabledVenues,
    toggleVenue,
    venueColors,
    timeFilter,
    setTimeFilter,
    isOpen: externalIsOpen,
    onOpenChange,
  } = props;

  const mode = props.mode ?? "events";
  const justAddedCount = mode === "events" ? (props as EventsFiltersDropdownProps).justAddedCount : 0;

  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use external control if provided, otherwise internal state
  const isVisible = externalIsOpen !== undefined ? externalIsOpen : internalIsVisible;
  const setIsVisible = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalIsVisible(value);
    }
  };

  const openPanel = () => {
    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
  };

  const closePanel = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  // Sync animation state when externally opened
  useEffect(() => {
    if (externalIsOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    }
  }, [externalIsOpen]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // Default time filter depends on mode
  const defaultTimeFilter = mode === "history" ? "30days" : "all";

  const activeFiltersCount =
    (enabledVenues.size < venues.length ? 1 : 0) +
    (timeFilter !== defaultTimeFilter ? 1 : 0);

  const selectAllVenues = () => {
    venues.forEach((v) => {
      if (!enabledVenues.has(v.id)) toggleVenue(v.id);
    });
  };

  const clearAllVenues = () => {
    venues.forEach((v) => {
      if (enabledVenues.has(v.id)) toggleVenue(v.id);
    });
  };

  const clearAllFilters = () => {
    (setTimeFilter as (f: string) => void)(defaultTimeFilter);
    selectAllVenues();
  };

  const hasActiveFilters = timeFilter !== defaultTimeFilter || enabledVenues.size < venues.length;

  const eventsTimeOptions = [
    { id: "all", label: "All Upcoming" },
    { id: "today", label: "Today" },
    { id: "week", label: "Next 7 Days" },
    { id: "just-added", label: "Recently Added", count: justAddedCount },
  ];

  const historyTimeOptions = [
    { id: "30days", label: "Last 30 Days" },
    { id: "90days", label: "Last 90 Days" },
    { id: "this-year", label: "This Year" },
    { id: "year", label: "Last 12 Months" },
    { id: "all", label: "All History" },
  ];

  const timeOptions = mode === "history" ? historyTimeOptions : eventsTimeOptions;
  const timeLabel = mode === "history" ? "Time Period" : "Show";

  const FilterContent = () => (
    <>
      {/* Time Filters */}
      <div className="p-4 md:p-6 border-b border-gray-700/50">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {timeLabel}
        </h4>
        <div className="space-y-1">
          {timeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => (setTimeFilter as (f: string) => void)(option.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] ${
                timeFilter === option.id
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <span>{option.label}</span>
              <div className="flex items-center gap-2">
                {"count" in option && typeof option.count === "number" && option.count > 0 && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    {option.count}
                  </span>
                )}
                {timeFilter === option.id && (
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Venue Filters */}
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Venues
          </h4>
          <div className="flex gap-3 text-sm">
            <button onClick={selectAllVenues} className="text-gray-400 hover:text-white transition-colors active:scale-95">
              All
            </button>
            <span className="text-gray-600">·</span>
            <button onClick={clearAllVenues} className="text-gray-400 hover:text-white transition-colors active:scale-95">
              None
            </button>
          </div>
        </div>
        <div className="space-y-1">
          {venues.map((v) => {
            const colors = venueColors[v.id] || { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500" };
            const isEnabled = enabledVenues.has(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVenue(v.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-white/5 active:scale-[0.98] ${
                  isEnabled ? "" : "opacity-40"
                }`}
              >
                <span className={isEnabled ? colors.text : "text-gray-500"}>
                  {v.name}
                </span>
                {isEnabled && (
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      {/* Filter button */}
      <button
        onClick={openPanel}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
          activeFiltersCount > 0
            ? "bg-white/10 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
        }`}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="hidden sm:inline">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 flex items-center justify-center bg-purple-500 text-white text-xs rounded-full flex-shrink-0">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Desktop side panel */}
      {isVisible && (
        <div className="hidden md:block fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={closePanel}
          />

          {/* Side panel */}
          <div
            className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-150 ease-out flex flex-col ${
              isAnimating ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <button
                onClick={closePanel}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <FilterContent />
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className={`flex-1 py-3 font-medium rounded-xl transition-all active:scale-[0.98] ${
                  hasActiveFilters
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                }`}
              >
                Clear All
              </button>
              <button
                onClick={closePanel}
                className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isVisible && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={closePanel}
          />

          {/* Bottom sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-150 ease-out flex flex-col ${
              isAnimating ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 py-3 px-4 border-b border-gray-800 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={closePanel}
                  className="p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <FilterContent />

            {/* Footer buttons */}
            <div className="sticky bottom-0 p-4 bg-gray-900 border-t border-gray-800 flex gap-3">
              <button
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className={`flex-1 py-3 font-medium rounded-xl transition-all active:scale-[0.98] ${
                  hasActiveFilters
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                }`}
              >
                Clear All
              </button>
              <button
                onClick={closePanel}
                className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
