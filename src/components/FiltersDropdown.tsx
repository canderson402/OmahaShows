// web/src/components/FiltersDropdown.tsx
import { useState, useRef, useEffect } from "react";

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

interface FiltersDropdownProps {
  venues: { id: string; name: string }[];
  enabledVenues: Set<string>;
  toggleVenue: (venueId: string) => void;
  venueColors: VenueColors;
  timeFilter: "all" | "today" | "week" | "just-added";
  setTimeFilter: (filter: "all" | "today" | "week" | "just-added") => void;
  justAddedCount: number;
}

export function FiltersDropdown({
  venues,
  enabledVenues,
  toggleVenue,
  venueColors,
  timeFilter,
  setTimeFilter,
  justAddedCount,
}: FiltersDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle open/close with animation
  const openModal = () => {
    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setIsOpen(false);
    }, 150); // Match transition duration
  };

  const toggleModal = () => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  };

  // Close on outside click (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when modal is open on mobile
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

  const activeFiltersCount =
    (enabledVenues.size < venues.length ? 1 : 0) +
    (timeFilter !== "all" ? 1 : 0);

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

  const FilterContent = () => (
    <>
      {/* Time Filters */}
      <div className="p-4 border-b border-gray-700/50">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Show
        </h4>
        <div className="space-y-1">
          {[
            { id: "all", label: "All Upcoming" },
            { id: "today", label: "Today" },
            { id: "week", label: "Next 7 Days" },
            { id: "just-added", label: "Just Added", count: justAddedCount },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTimeFilter(option.id as typeof timeFilter)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] ${
                timeFilter === option.id
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <span>{option.label}</span>
              <div className="flex items-center gap-2">
                {option.count !== undefined && option.count > 0 && (
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
      <div className="p-4">
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
    <div className="relative" ref={dropdownRef}>
      {/* Filter button */}
      <button
        onClick={toggleModal}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
          isOpen || activeFiltersCount > 0
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

      {/* Desktop dropdown */}
      {isVisible && (
        <div
          className={`hidden md:block absolute top-full right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 transition-all duration-150 ease-out origin-top-right ${
            isAnimating
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-1"
          }`}
        >
          <FilterContent />
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
            onClick={closeModal}
          />

          {/* Bottom sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-150 ease-out ${
              isAnimating ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Handle */}
            <div className="sticky top-0 bg-gray-900 pt-3 pb-2 px-4 border-b border-gray-800 z-10">
              <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <FilterContent />

            {/* Apply button */}
            <div className="sticky bottom-0 p-4 bg-gray-900 border-t border-gray-800">
              <button
                onClick={closeModal}
                className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
