// web/src/components/DayEventsSheet.tsx
import { useState, useEffect } from "react";
import type { Event } from "../types";

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

interface DayEventsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
  events: Event[];
  venueColors: VenueColors;
}

export function DayEventsSheet({
  isOpen,
  onClose,
  date,
  events,
  venueColors,
}: DayEventsSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Prevent body scroll when sheet is open
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

  if (!isVisible) return null;

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-150 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-gray-900 pt-3 pb-2 px-6 border-b border-gray-800 z-10">
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {formatDate(date)}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
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
        </div>

        {/* Events list - history style */}
        <div>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No events on this day
            </p>
          ) : (
            events.map((event, idx) => {
              const colors = venueColors[event.source] || {
                text: "text-gray-400",
              };
              const isLast = idx === events.length - 1;
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
                        <span className="text-white font-medium">{event.title}</span>
                      )}
                      {event.supportingArtists && event.supportingArtists.length > 0 && (
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
            })
          )}
        </div>

        {/* Close button at bottom */}
        <div className="sticky bottom-0 p-4 bg-gray-900 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
