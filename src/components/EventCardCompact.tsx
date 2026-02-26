// web/src/components/EventCardCompact.tsx
import type { Event } from "../types";

interface EventCardCompactProps {
  event: Event;
}

export function EventCardCompact({ event }: EventCardCompactProps) {
  const formatDateOverlay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${weekday} ${month} ${day}`;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const listingUrl = event.eventUrl || event.ticketUrl || event.venueUrl;

  return (
    <div className="py-6 flex gap-5 relative">
      {/* Buttons - top right */}
      <div className="absolute top-6 right-0 flex gap-3">
        {(event.eventUrl || (!event.ticketUrl && event.venueUrl)) && (
          <a
            href={event.eventUrl || event.venueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Listing
          </a>
        )}
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            Tickets
          </a>
        )}
      </div>

      {/* Image with date header - clickable */}
      <a
        href={listingUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[220px] flex-shrink-0 overflow-hidden block hover:opacity-90 transition-opacity"
      >
        {/* Date header */}
        <div className="bg-slate-900 py-1.5 px-3 rounded-t-xl">
          <p className="text-white font-semibold text-center text-sm">
            {formatDateOverlay(event.date)}
          </p>
        </div>
        {/* Image */}
        <div className="relative bg-gray-900 rounded-b-xl overflow-hidden">
          {event.imageUrl ? (
            <>
              <img
                src={event.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
              />
              <img
                src={event.imageUrl}
                alt={event.title}
                className="relative w-full aspect-square object-contain"
              />
            </>
          ) : (
            <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
              <span className="text-gray-500 text-5xl">&#9834;</span>
            </div>
          )}
        </div>
      </a>

      {/* Content */}
      <div className="flex-1 pt-1 pr-36">
        {/* Title */}
        {listingUrl ? (
          <a
            href={listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            {event.title}
          </a>
        ) : (
          <h3 className="text-xl font-bold text-white">{event.title}</h3>
        )}

        {/* Supporting Artists */}
        {event.supportingArtists && event.supportingArtists.length > 0 && (
          <p className="text-gray-400 mt-1">
            with {event.supportingArtists.join(", ")}
          </p>
        )}

        {/* Details */}
        <p className="text-gray-400 mt-3">
          {formatTime(event.time) || "TBA"} · {event.venue}
        </p>
        {event.price && (
          <p className="text-gray-500 text-sm mt-1">{event.price}</p>
        )}
      </div>
    </div>
  );
}
