// web/src/pages/ShowPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventById } from "../lib/supabase";
import { supabase } from "../lib/supabase";
import type { Event } from "../types";
import { outboundClickProps } from "../analytics";
import { useSavedShows } from "../hooks/useSavedShows";

interface VenueDetails {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  website_url: string | null;
  color_hex: string | null;
}

// Get venue details by ID
async function getVenueDetails(venueId: string): Promise<VenueDetails | null> {
  if (venueId === "other") return null;

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("id", venueId)
    .single();

  if (error || !data) return null;
  return data;
}

export function ShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isSaved, toggleSave } = useSavedShows();

  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const eventData = await getEventById(id);

      if (!eventData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check if event is in the past - use string comparison to avoid timezone issues
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      if (eventData.date < todayStr) {
        // Redirect to history tab - past events are not kept
        navigate("/?view=history", { replace: true });
        return;
      }

      setEvent(eventData);

      // Load venue details
      const venueData = await getVenueDetails(eventData.source);
      setVenue(venueData);

      setLoading(false);
    }

    loadEvent();
  }, [id, navigate]);

  // Update page title and meta tags
  useEffect(() => {
    if (event) {
      document.title = `${event.title} | Omaha Shows`;

      // Update Open Graph meta tags
      const updateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      };

      updateMeta("og:title", event.title);
      updateMeta("og:description", `${formatDate(event.date)} at ${event.venue}`);
      updateMeta("og:type", "event");
      if (event.imageUrl) {
        updateMeta("og:image", event.imageUrl);
      }
      updateMeta("og:url", window.location.href);
    }

    return () => {
      document.title = "Omaha Shows | Live Music in Omaha, NE";
    };
  }, [event]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return {
      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      month: date.toLocaleDateString("en-US", { month: "long" }),
      day: date.getDate(),
      year: date.getFullYear(),
    };
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = event?.title || "Show";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">OMAHA</span>
          <span className="text-white ml-3">SHOWS</span>
        </h1>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6 opacity-20">🎵</div>
          <h1 className="text-3xl font-bold text-white mb-3">Show Not Found</h1>
          <p className="text-gray-400 mb-8">This event doesn't exist or may have ended.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-full hover:from-amber-400 hover:to-rose-400 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shows
          </Link>
        </div>
      </div>
    );
  }

  const dateInfo = formatDate(event.date);
  const venueColor = venue?.color_hex || "#9ca3af";
  const saved = isSaved(event.id);

  return (
    <div className="min-h-screen bg-[#0d0d0f] relative overflow-hidden">
      {/* Background image with blur */}
      {event.imageUrl && (
        <div className="fixed inset-0 z-0">
          <img
            src={event.imageUrl}
            alt=""
            className={`w-full h-full object-cover scale-110 blur-3xl opacity-30 transition-opacity duration-1000 ${imageLoaded ? "opacity-30" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/60 via-[#0d0d0f]/80 to-[#0d0d0f]" />
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-20 px-4 py-4 md:px-8 md:py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">All Shows</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSave(event.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                saved
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Save
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-full font-medium transition-all border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 px-4 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Event image */}
            <div className="lg:w-1/2">
              {/* Date banner */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-amber-400 font-bold uppercase tracking-wider">{dateInfo.weekday}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white text-2xl font-black">{dateInfo.month} {dateInfo.day}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-gray-400 font-medium">{dateInfo.year}</span>
                </div>
              </div>

              <div className="rounded-b-2xl overflow-hidden bg-gray-900 shadow-2xl shadow-black/50">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <span className="text-gray-600 text-9xl">🎵</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event details */}
            <div className="lg:w-1/2 flex flex-col justify-center">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {event.title}
              </h1>

              {/* Supporting artists */}
              {event.supportingArtists && event.supportingArtists.length > 0 && (
                <p className="text-xl md:text-2xl text-gray-400 mt-4">
                  with {event.supportingArtists.join(", ")}
                </p>
              )}

              {/* Time and price */}
              <div className="flex flex-wrap items-center gap-4 mt-6">
                {event.time && (
                  <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-medium">{formatTime(event.time)}</span>
                  </div>
                )}
                {event.price && (
                  <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-medium">{event.price}</span>
                  </div>
                )}
                {event.ageRestriction && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
                    {event.ageRestriction}
                  </span>
                )}
              </div>

              {/* Venue section */}
              <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: venueColor + "20" }}
                  >
                    <svg className="w-6 h-6" style={{ color: venueColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {event.venueUrl ? (
                      <a
                        href={event.venueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold hover:underline"
                        style={{ color: venueColor }}
                      >
                        {event.venue}
                      </a>
                    ) : (
                      <span className="text-xl font-bold" style={{ color: venueColor }}>
                        {event.venue}
                      </span>
                    )}
                    {venue?.address && (
                      <p className="text-gray-400 mt-1">
                        {venue.address}, {venue.city}, {venue.state}
                      </p>
                    )}
                    {venue?.description && (
                      <p className="text-gray-500 mt-2 text-sm">{venue.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...outboundClickProps(event.venue, event.title, "tickets", event.ticketUrl)}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-lg rounded-xl hover:from-amber-400 hover:to-rose-400 transition-all shadow-lg shadow-amber-500/25"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Get Tickets
                  </a>
                )}
                {event.eventUrl && event.eventUrl !== event.ticketUrl && (
                  <a
                    href={event.eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...outboundClickProps(event.venue, event.title, "info", event.eventUrl)}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    More Info
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 mt-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">OMAHA</span>
              <span className="text-white ml-2">SHOWS</span>
            </span>
          </Link>
          <p className="text-gray-600 text-sm mt-2">Live Music in Omaha, NE</p>
        </div>
      </footer>
    </div>
  );
}
