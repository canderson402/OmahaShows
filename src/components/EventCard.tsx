// web/src/components/EventCard.tsx
import type { Event } from "../types";

type VenueColors = Record<string, { bg: string; text: string; border: string }>;

interface EventCardProps {
  event: Event;
  venueColors?: VenueColors;
}

export function EventCard({ event, venueColors }: EventCardProps) {
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

  // Use eventUrl for listing, fall back to ticketUrl or venueUrl
  const listingUrl = event.eventUrl || event.ticketUrl || event.venueUrl;

  return (
    <div className="group py-8">
      {/* Title - above image */}
      <div className="mb-3">
        {listingUrl ? (
          <a
            href={listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            {event.title}
          </a>
        ) : (
          <h3 className="text-2xl font-bold text-white">{event.title}</h3>
        )}
        {event.supportingArtists && event.supportingArtists.length > 0 && (
          <p className="text-gray-400 mt-1">
            with {event.supportingArtists.join(", ")}
          </p>
        )}
      </div>

      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-auto"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-800 flex items-center justify-center rounded-2xl">
            <span className="text-gray-600 text-6xl">&#9834;</span>
          </div>
        )}

        {/* Date badge - top left */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <p className="text-white font-semibold text-sm">
            {formatDateOverlay(event.date)}
          </p>
        </div>
      </div>

      {/* Details & Buttons - below image */}
      <div className="pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400 flex-wrap">
          <span>{formatTime(event.time) || "TBA"}</span>
          <span className="text-gray-600">·</span>
          <span className={venueColors?.[event.source]?.text || "text-gray-400"}>{event.venue}</span>
          {event.price && (
            <>
              <span className="text-gray-600">·</span>
              <span>{event.price}</span>
            </>
          )}
          {event.ageRestriction && (
            <>
              <span className="text-gray-600">·</span>
              <span>{event.ageRestriction}</span>
            </>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {(event.eventUrl || (!event.ticketUrl && event.venueUrl)) && (
            <a
              href={event.eventUrl || event.venueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-800 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Listing
            </a>
          )}
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
            >
              Get Tickets
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
