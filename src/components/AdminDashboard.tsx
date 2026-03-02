import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase, approveEvent, rejectEvent } from "../lib/supabase";
import { VENUE_COLORS } from "../App";
import { ScraperDashboard } from "./ScraperDashboard";

type AdminTab = "pending" | "scrapers" | "events";

interface DbEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  venue_id: string;
  event_url: string | null;
  ticket_url: string | null;
  image_url: string | null;
  price: string | null;
  age_restriction: string | null;
  supporting_artists: string[] | null;
  source: string;
  status: string;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("pending");
  const [pendingEvents, setPendingEvents] = useState<DbEvent[]>([]);
  const [allEvents, setAllEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPendingEvents(data);
    }
  }, []);

  const fetchAllEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .limit(100);

    if (!error && data) {
      setAllEvents(data);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchAllEvents()]);
      setLoading(false);
    };
    load();
  }, [fetchPending, fetchAllEvents]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveEvent(id);
      await fetchPending();
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectEvent(id);
      await fetchPending();
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/submission"
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
          >
            + Add Show
          </Link>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "pending"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Pending ({pendingEvents.length})
        </button>
        <button
          onClick={() => setTab("events")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "events"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setTab("scrapers")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "scrapers"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Scrapers
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Pending Tab */}
          {tab === "pending" && (
            <div>
              {pendingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No pending submissions</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Events submitted by users will appear here for approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => {
                    const colors = VENUE_COLORS[event.venue_id] || VENUE_COLORS.other;
                    return (
                      <div
                        key={event.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                {event.venue_id}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(event.date)}
                                {event.time && ` • ${event.time.slice(0, 5)}`}
                              </span>
                            </div>
                            <h3 className="text-white font-medium">{event.title}</h3>
                            {event.supporting_artists && event.supporting_artists.length > 0 && (
                              <p className="text-sm text-gray-500 mt-1">
                                with {event.supporting_artists.join(", ")}
                              </p>
                            )}
                            {event.price && (
                              <p className="text-sm text-gray-400 mt-1">{event.price}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(event.id)}
                              disabled={actionLoading === event.id}
                              className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === event.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(event.id)}
                              disabled={actionLoading === event.id}
                              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* All Events Tab */}
          {tab === "events" && (
            <div>
              <p className="text-gray-500 text-sm mb-4">
                Showing {allEvents.length} events. Click to edit.
              </p>
              <div className="space-y-2">
                {allEvents.map((event) => {
                  const colors = VENUE_COLORS[event.venue_id] || VENUE_COLORS.other;
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 py-2 px-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <span className="text-sm text-gray-500 w-24 flex-shrink-0">
                        {formatDate(event.date)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} flex-shrink-0`}>
                        {event.venue_id}
                      </span>
                      <span className="text-white truncate flex-1">{event.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        event.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : event.status === "pending"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scrapers Tab */}
          {tab === "scrapers" && <ScraperDashboard />}
        </>
      )}
    </div>
  );
}
