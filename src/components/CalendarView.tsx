// web/src/components/CalendarView.tsx
import { useState, useMemo, useEffect } from "react";
import type { Event } from "../types";
import { DayEventsSheet } from "./DayEventsSheet";

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

interface CalendarViewProps {
  events: Event[];
  venueColors: VenueColors;
  enabledVenues: Set<string>;
}

export function CalendarView({
  events,
  venueColors,
  enabledVenues,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Desktop panel animation state
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isPanelAnimating, setIsPanelAnimating] = useState(false);

  // Handle panel open/close animation on desktop
  useEffect(() => {
    if (selectedDate) {
      setIsPanelVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPanelAnimating(true);
        });
      });
    } else {
      setIsPanelAnimating(false);
      const timeout = setTimeout(() => {
        setIsPanelVisible(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [selectedDate]);

  // Filter events by enabled venues
  const filteredEvents = useMemo(
    () => events.filter((e) => enabledVenues.has(e.source)),
    [events, enabledVenues]
  );

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const event of filteredEvents) {
      const existing = map.get(event.date) || [];
      existing.push(event);
      map.set(event.date, existing);
    }
    return map;
  }, [filteredEvents]);

  const getEventsForDate = (dateStr: string) => {
    return eventsByDate.get(dateStr) || [];
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const formatDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const formatSelectedDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "TBA";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const today = new Date();
  const todayStr =
    today.getFullYear() === year && today.getMonth() === month
      ? String(today.getDate())
      : null;

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Get sorted list of dates with events for navigation
  const datesWithEvents = useMemo(() => {
    return Array.from(eventsByDate.keys()).sort();
  }, [eventsByDate]);

  const currentDateIndex = selectedDate ? datesWithEvents.indexOf(selectedDate) : -1;
  const hasPrevDay = currentDateIndex > 0;
  const hasNextDay = currentDateIndex >= 0 && currentDateIndex < datesWithEvents.length - 1;

  const goToPrevDay = () => {
    if (hasPrevDay) {
      setSelectedDate(datesWithEvents[currentDateIndex - 1]);
    }
  };

  const goToNextDay = () => {
    if (hasNextDay) {
      setSelectedDate(datesWithEvents[currentDateIndex + 1]);
    }
  };

  return (
    <div className="md:max-w-xl md:mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{monthName}</h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((d, i) => (
          <div
            key={i}
            className="text-center text-xs text-gray-500 py-2 font-medium"
          >
            {d}
          </div>
        ))}

        {/* Always render 42 cells (6 rows) for consistent height */}
        {Array(42)
          .fill(null)
          .map((_, i) => {
            const dayNumber = i - firstDayOfMonth + 1;
            const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;

            if (!isValidDay) {
              return <div key={`cell-${i}`} className="aspect-square" />;
            }

            const dateStr = formatDateStr(dayNumber);
            const dayEvents = getEventsForDate(dateStr);
            const eventCount = dayEvents.length;
            const hasEvents = eventCount > 0;
            const isToday = todayStr === String(dayNumber);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={`cell-${i}`}
                onClick={() => hasEvents && setSelectedDate(dateStr)}
                disabled={!hasEvents}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg transition-all
                  ${hasEvents ? "cursor-pointer" : "cursor-default"}
                  ${
                    hasEvents
                      ? "bg-gray-800 hover:bg-gray-700 active:scale-95"
                      : "hover:bg-gray-800/30"
                  }
                  ${isSelected ? "ring-2 ring-white" : ""}
                  ${isToday ? "ring-1 ring-purple-500" : ""}
                `}
              >
                <span
                  className={`text-sm ${
                    hasEvents ? "text-white font-medium" : "text-gray-500"
                  } ${isToday ? "text-purple-400" : ""}`}
                >
                  {dayNumber}
                </span>
                {hasEvents && (
                  <span className="text-[10px] text-gray-400 leading-none mt-0.5">
                    ({eventCount})
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Desktop side panel - slides in from right */}
      {isPanelVisible && (
        <div className="hidden md:block fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-150 ${
              isPanelAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setSelectedDate(null)}
          />

          {/* Side panel */}
          <div
            className={`absolute top-0 right-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-150 ease-out ${
              isPanelAnimating ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevDay}
                  disabled={!hasPrevDay}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    hasPrevDay
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-700 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-white text-center w-56">
                  {selectedDate && formatSelectedDate(selectedDate)}
                </h3>
                <button
                  onClick={goToNextDay}
                  disabled={!hasNextDay}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    hasNextDay
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-700 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
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

            {/* Events list */}
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {selectedEvents.map((event, idx) => {
                const colors = venueColors[event.source] || {
                  text: "text-gray-400",
                };
                const isLast = idx === selectedEvents.length - 1;
                const listingUrl = event.eventUrl || event.ticketUrl;

                return (
                  <div
                    key={event.id}
                    className={`py-4 px-6 ${!isLast ? "border-b border-gray-800" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {listingUrl ? (
                          <a
                            href={listingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium hover:text-blue-400 transition-colors"
                          >
                            {event.title}
                          </a>
                        ) : (
                          <span className="text-white font-medium">
                            {event.title}
                          </span>
                        )}
                        {event.supportingArtists &&
                          event.supportingArtists.length > 0 && (
                            <p className="text-gray-500 text-sm mt-0.5 truncate">
                              with {event.supportingArtists.join(", ")}
                            </p>
                          )}
                        <p className="text-sm text-gray-400 mt-1">
                          <span className={colors.text}>{event.venue}</span>
                          <span className="text-gray-600"> · </span>
                          {formatTime(event.time)}
                          {event.price && (
                            <>
                              <span className="text-gray-600"> · </span>
                              <span className="text-gray-500">{event.price}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        {event.eventUrl && (
                          <a
                            href={event.eventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700 transition-colors"
                          >
                            Info
                          </a>
                        )}
                        {event.ticketUrl && (
                          <a
                            href={event.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
                          >
                            Tickets
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      <div className="md:hidden">
        <DayEventsSheet
          isOpen={selectedDate !== null}
          onClose={() => setSelectedDate(null)}
          date={selectedDate || ""}
          events={selectedEvents}
          venueColors={venueColors}
          onPrevDay={goToPrevDay}
          onNextDay={goToNextDay}
          hasPrevDay={hasPrevDay}
          hasNextDay={hasNextDay}
        />
      </div>
    </div>
  );
}
