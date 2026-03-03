// src/pages/ShowPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getEventById } from "../lib/supabase";
import { EventCardCompact } from "../components/EventCardCompact";
import { VENUE_COLORS } from "../App";
import type { Event } from "../types";

export function ShowPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getEventById(id);
        if (data) {
          setEvent(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Build meta description
  const getDescription = () => {
    if (!event) return "Live music in Omaha, NE";
    const parts = [formatDate(event.date)];
    if (event.time) parts.push(formatTime(event.time));
    if (event.venue) parts.push(event.venue);
    if (event.price) parts.push(event.price);
    return parts.join(" · ");
  };

  // Build meta title
  const getTitle = () => {
    if (!event) return "Show Not Found | Omaha Shows";
    return `${event.title}${event.venue ? ` at ${event.venue}` : ""} | Omaha Shows`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-texture flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <>
        <Helmet>
          <title>Show Not Found | Omaha Shows</title>
        </Helmet>
        <div className="min-h-screen bg-texture flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Show Not Found</h1>
            <p className="text-gray-400 mb-8">
              This show may have been removed or the link is incorrect.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
            >
              View All Shows
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getTitle()}</title>
        <meta property="og:title" content={getTitle()} />
        <meta property="og:description" content={getDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://omahashows.com/show/${id}`} />
        {event?.imageUrl && <meta property="og:image" content={event.imageUrl} />}
        <meta name="twitter:card" content={event?.imageUrl ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={getTitle()} />
        <meta name="twitter:description" content={getDescription()} />
        {event?.imageUrl && <meta name="twitter:image" content={event.imageUrl} />}
      </Helmet>
      <div className="min-h-screen bg-texture flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {event && (
            <div className="bg-[#0c0c0e] border border-gray-800 rounded-2xl p-6">
              <EventCardCompact event={event} venueColors={VENUE_COLORS} />
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              View all shows
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
