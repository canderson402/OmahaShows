// web/src/components/EventCardCompact.tsx
import { memo, useState } from "react";
import type { Event } from "../types";
import { outboundClickProps } from "../analytics";

// VenueColors is now just venue_id -> hex color
type VenueColors = Record<string, string>;

interface EventCardCompactProps {
  event: Event;
  venueColors?: VenueColors;
  isJustAdded?: boolean;
  isHighlighted?: boolean;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  isExpired?: boolean;
}

// Image component with error fallback
function EventImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <span className="text-gray-500 text-5xl">&#9834;</span>
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="relative w-full h-full object-contain"
      />
    </>
  );
}

// Share button component
function ShareButton({ url, title }: { url: string; title: string }) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed - ignore
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-black/50 text-gray-400 hover:bg-black/70 hover:text-white"
      title="Share"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>
  );
}

// Save button component
function SaveButton({ isSaved, onClick }: { isSaved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isSaved
          ? "bg-green-500/90 text-white"
          : "bg-black/50 text-gray-400 hover:bg-black/70 hover:text-white"
      }`}
      title={isSaved ? "Remove from My Shows" : "Add to My Shows"}
    >
      {isSaved ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
}

// Memoized to prevent unnecessary re-renders
export const EventCardCompact = memo(function EventCardCompact({
  event,
  venueColors,
  isJustAdded,
  isHighlighted,
  isSaved = false,
  onToggleSave,
  isExpired = false,
}: EventCardCompactProps) {
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

  const listingUrl = event.eventUrl || event.ticketUrl;

  return (
    <div
      id={event.id}
      className={`py-6 transition-all duration-500 ${isHighlighted ? "bg-amber-500/10 -mx-4 px-4 rounded-xl" : ""} ${isExpired ? "opacity-60" : ""}`}
    >
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Image with date header - not clickable on mobile to prevent accidental taps */}
        <div className="relative">
          {isExpired && (
            <span className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full font-medium shadow-lg">
              Expired
            </span>
          )}
          {isJustAdded && !isExpired && (
            <span className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium shadow-lg">
              Recently Added
            </span>
          )}
          <div className="bg-slate-900 py-1.5 px-3 rounded-t-xl">
            <p className="text-white font-semibold text-center text-sm">
              {formatDateOverlay(event.date)}
            </p>
          </div>
          <div className="relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square">
            {event.imageUrl ? (
              <EventImage src={event.imageUrl} alt={event.title} />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500 text-5xl">&#9834;</span>
              </div>
            )}
            {listingUrl && (
              <div className="absolute bottom-2 left-2 z-10">
                <ShareButton url={listingUrl} title={event.title} />
              </div>
            )}
            {onToggleSave && (
              <div className="absolute bottom-2 right-2 z-10">
                <SaveButton isSaved={isSaved} onClick={() => onToggleSave(event.id)} />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {listingUrl && !isExpired ? (
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              {...outboundClickProps(event.venue, event.title, "info", listingUrl)}
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              {event.title}
            </a>
          ) : (
            <h3 className="text-xl font-bold text-white">{event.title}</h3>
          )}
          {event.supportingArtists && event.supportingArtists.length > 0 && (
            <p className="text-gray-400 mt-1">
              with {event.supportingArtists.join(", ")}
            </p>
          )}
          <p className="text-gray-400 mt-2">
            {formatTime(event.time) && <>{formatTime(event.time)} · </>}
            {event.venueUrl && !isExpired ? (
              <a
                href={event.venueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: venueColors?.[event.source] || "#9ca3af" }}
              >
                {event.venue}
              </a>
            ) : (
              <span style={{ color: venueColors?.[event.source] || "#9ca3af" }}>
                {event.venue}
              </span>
            )}
          </p>
          {event.price && (
            <p className="text-gray-500 text-sm mt-1">{event.price}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {isExpired ? (
            <span className="flex-1 text-center px-4 py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              This show has passed
            </span>
          ) : (
            <>
              {event.eventUrl && (
                <a
                  href={event.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...outboundClickProps(event.venue, event.title, "info", event.eventUrl!)}
                  className="flex-1 text-center px-4 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Info
                </a>
              )}
              {event.ticketUrl && event.ticketUrl !== event.eventUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...outboundClickProps(event.venue, event.title, "tickets", event.ticketUrl!)}
                  className="flex-1 text-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Tickets
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-5 relative">
        {/* Expired badge - top right */}
        {isExpired && (
          <span className="absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full font-medium shadow-lg">
            Expired
          </span>
        )}
        {/* Recently Added badge - top right */}
        {isJustAdded && !isExpired && (
          <span className="absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full font-medium shadow-lg">
            Recently Added
          </span>
        )}
        {/* Buttons - top right */}
        <div className="absolute top-0 right-0 flex gap-3 mt-6">
          {isExpired ? (
            <span className="px-5 py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              This show has passed
            </span>
          ) : (
            <>
              {event.eventUrl && (
                <a
                  href={event.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...outboundClickProps(event.venue, event.title, "info", event.eventUrl!)}
                  className="px-5 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Info
                </a>
              )}
              {event.ticketUrl && event.ticketUrl !== event.eventUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...outboundClickProps(event.venue, event.title, "tickets", event.ticketUrl!)}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Tickets
                </a>
              )}
            </>
          )}
        </div>

        {/* Image with date header - clickable unless expired */}
        {isExpired ? (
          <div className="w-[220px] flex-shrink-0 overflow-hidden block">
            <div className="bg-slate-900 py-1.5 px-3 rounded-t-xl">
              <p className="text-white font-semibold text-center text-sm">
                {formatDateOverlay(event.date)}
              </p>
            </div>
            <div className="relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square">
              {event.imageUrl ? (
                <EventImage src={event.imageUrl} alt={event.title} />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-5xl">&#9834;</span>
                </div>
              )}
              {listingUrl && (
                <div className="absolute bottom-2 left-2 z-10">
                  <ShareButton url={listingUrl} title={event.title} />
                </div>
              )}
              {onToggleSave && (
                <div className="absolute bottom-2 right-2 z-10">
                  <SaveButton isSaved={isSaved} onClick={() => onToggleSave(event.id)} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <a
            href={listingUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            {...(listingUrl ? outboundClickProps(event.venue, event.title, "image", listingUrl) : {})}
            className="w-[220px] flex-shrink-0 overflow-hidden block hover:opacity-90 transition-opacity"
          >
            <div className="bg-slate-900 py-1.5 px-3 rounded-t-xl">
              <p className="text-white font-semibold text-center text-sm">
                {formatDateOverlay(event.date)}
              </p>
            </div>
            <div className="relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square">
              {event.imageUrl ? (
                <EventImage src={event.imageUrl} alt={event.title} />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-5xl">&#9834;</span>
                </div>
              )}
              {listingUrl && (
                <div className="absolute bottom-2 left-2 z-10">
                  <ShareButton url={listingUrl} title={event.title} />
                </div>
              )}
              {onToggleSave && (
                <div className="absolute bottom-2 right-2 z-10">
                  <SaveButton isSaved={isSaved} onClick={() => onToggleSave(event.id)} />
                </div>
              )}
            </div>
          </a>
        )}

        {/* Content */}
        <div className="flex-1 pt-1 pr-52">
          {listingUrl && !isExpired ? (
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              {...outboundClickProps(event.venue, event.title, "info", listingUrl)}
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              {event.title}
            </a>
          ) : (
            <h3 className="text-xl font-bold text-white">{event.title}</h3>
          )}
          {event.supportingArtists && event.supportingArtists.length > 0 && (
            <p className="text-gray-400 mt-1">
              with {event.supportingArtists.join(", ")}
            </p>
          )}
          <p className="text-gray-400 mt-3">
            {formatTime(event.time) && <>{formatTime(event.time)} · </>}
            {event.venueUrl && !isExpired ? (
              <a
                href={event.venueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: venueColors?.[event.source] || "#9ca3af" }}
              >
                {event.venue}
              </a>
            ) : (
              <span style={{ color: venueColors?.[event.source] || "#9ca3af" }}>
                {event.venue}
              </span>
            )}
          </p>
          {event.price && (
            <p className="text-gray-500 text-sm mt-1">{event.price}</p>
          )}
        </div>
      </div>
    </div>
  );
});
