import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase, approveEvent, rejectEvent, getVenues } from "../lib/supabase";
import { VENUE_COLORS } from "../App";
import { ScraperDashboard } from "./ScraperDashboard";
import { VenueManagement } from "./VenueManagement";
import { Toast } from "./Toast";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  url = url.trim();
  if (!url) return null;
  // If no protocol, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export type AdminTab = "pending" | "scrapers" | "events" | "venues";

const EVENTS_PER_PAGE = 50;

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
  category: string | null;
  created_at: string;
}

interface Venue {
  id: string;
  name: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
}

export function AdminDashboard({ onLogout, tab, setTab }: AdminDashboardProps) {
  const [pendingEvents, setPendingEvents] = useState<DbEvent[]>([]);
  const [currentEvents, setCurrentEvents] = useState<DbEvent[]>([]);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);
  const [editForm, setEditForm] = useState<Partial<DbEvent>>({});
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const testEmailFunction = async () => {
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setTestEmailResult({ success: false, message: "No active session" });
        return;
      }

      // Pass anon key in Authorization header (gateway accepts HS256)
      // Pass user's access token in body (function verifies ES256 inside)
      const response = await fetch(`${supabaseUrl}/functions/v1/send-approval-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({
          title: "Test Show - The Email Works!",
          date: new Date().toISOString().split("T")[0],
          venue: "The Slowdown",
          submitterEmail: "canderson1192@gmail.com",
          accessToken: session.access_token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestEmailResult({ success: true, message: `Email sent! ID: ${data.id}` });
      } else {
        const error = await response.text();
        setTestEmailResult({ success: false, message: `Error ${response.status}: ${error}` });
      }
    } catch (err) {
      setTestEmailResult({ success: false, message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setTestingEmail(false);
    }
  };

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

  const fetchCurrentEvents = useCallback(async (search?: string, offset = 0) => {
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .gte("date", today)
      .eq("status", "approved")
      .order("date", { ascending: true });

    if (search && search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    query = query.range(offset, offset + EVENTS_PER_PAGE - 1);

    const { data, error, count } = await query;

    if (!error && data) {
      if (offset === 0) {
        setCurrentEvents(data);
      } else {
        setCurrentEvents(prev => [...prev, ...data]);
      }
      setHasMoreEvents(count ? offset + data.length < count : false);
    }
  }, []);

  const fetchVenues = useCallback(async () => {
    const venueData = await getVenues();
    setVenues(venueData.map(v => ({ id: v.id, name: v.name })));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchCurrentEvents(), fetchVenues()]);
      setLoading(false);
    };
    load();
  }, [fetchPending, fetchCurrentEvents, fetchVenues]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCurrentEvents(eventSearch, 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [eventSearch, fetchCurrentEvents]);

  // Refresh pending when tab changes to pending
  useEffect(() => {
    if (tab === "pending") {
      fetchPending();
    }
  }, [tab, fetchPending]);

  const loadMoreEvents = async () => {
    setLoadingMore(true);
    await fetchCurrentEvents(eventSearch, currentEvents.length);
    setLoadingMore(false);
  };

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

  const handleClearAllPending = async () => {
    if (!confirm(`Are you sure you want to reject all ${pendingEvents.length} pending submissions?`)) {
      return;
    }
    setActionLoading("clear-all");
    try {
      // Delete all pending events
      await supabase
        .from("events")
        .delete()
        .eq("status", "pending");
      await fetchPending();
    } catch (err) {
      console.error("Failed to clear pending:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (event: DbEvent) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      date: event.date,
      time: event.time || "",
      venue_id: event.venue_id,
      event_url: event.event_url || "",
      ticket_url: event.ticket_url || "",
      price: event.price || "",
      age_restriction: event.age_restriction || "",
      supporting_artists: event.supporting_artists || [],
      status: event.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: editForm.title,
          date: editForm.date,
          time: editForm.time || null,
          venue_id: editForm.venue_id,
          event_url: normalizeUrl(editForm.event_url),
          ticket_url: normalizeUrl(editForm.ticket_url),
          price: editForm.price || null,
          age_restriction: editForm.age_restriction || null,
          supporting_artists: editForm.supporting_artists?.length ? editForm.supporting_artists : null,
          status: editForm.status,
          category: editForm.category || null,
        })
        .eq("id", editingEvent.id);

      if (error) throw error;

      // Refresh data
      await Promise.all([fetchPending(), fetchCurrentEvents(eventSearch, 0)]);
      setEditingEvent(null);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent || !confirm("Are you sure you want to delete this event?")) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", editingEvent.id);

      if (error) throw error;

      await Promise.all([fetchPending(), fetchCurrentEvents(eventSearch, 0)]);
      setEditingEvent(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setSaving(false);
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
          <button
            onClick={testEmailFunction}
            disabled={testingEmail}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {testingEmail ? "Sending..." : "Test Email"}
          </button>
          <Link
            to="/"
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            Back to Site
          </Link>
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
          Current Events
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
        <button
          onClick={() => setTab("venues")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "venues"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Venues
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
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">
                  {pendingEvents.length} pending submission{pendingEvents.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  {pendingEvents.length > 0 && (
                    <button
                      onClick={handleClearAllPending}
                      disabled={actionLoading === "clear-all"}
                      className="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === "clear-all" ? "Clearing..." : "Clear All Pending"}
                    </button>
                  )}
                  <button
                    onClick={() => fetchPending()}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
              {pendingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No pending submissions</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Events submitted by users will appear here for approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingEvents.map((event) => {
                    const colors = VENUE_COLORS[event.venue_id] || VENUE_COLORS.other;
                    const venueName = venues.find(v => v.id === event.venue_id)?.name || event.venue_id;
                    const formatTime12 = (timeStr?: string | null) => {
                      if (!timeStr) return null;
                      const [hours, minutes] = timeStr.split(":");
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? "PM" : "AM";
                      const hour12 = hour % 12 || 12;
                      return `${hour12}:${minutes} ${ampm}`;
                    };
                    return (
                      <div
                        key={event.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
                      >
                        {/* Preview Section - mimics EventCardCompact */}
                        <div className="p-4 border-b border-gray-700/50">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Preview</p>
                          <div className="flex gap-4">
                            {/* Image placeholder */}
                            <div className="w-[140px] flex-shrink-0">
                              <div className="bg-slate-900 py-1 px-2 rounded-t-lg">
                                <p className="text-white font-semibold text-center text-xs">
                                  {formatDate(event.date)}
                                </p>
                              </div>
                              <div className="relative bg-gray-900 rounded-b-lg overflow-hidden aspect-square flex items-center justify-center">
                                {event.image_url ? (
                                  <img
                                    src={event.image_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-600 text-3xl">&#9834;</span>
                                )}
                              </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 pt-1">
                              <h3 className="text-lg font-bold text-white">{event.title}</h3>
                              {event.supporting_artists && event.supporting_artists.length > 0 && (
                                <p className="text-gray-400 text-sm mt-1">
                                  with {event.supporting_artists.join(", ")}
                                </p>
                              )}
                              <p className="text-gray-400 text-sm mt-2">
                                {formatTime12(event.time) && <>{formatTime12(event.time)} · </>}
                                <span className={colors.text}>{venueName}</span>
                              </p>
                              {event.price && (
                                <p className="text-gray-500 text-xs mt-1">{event.price}</p>
                              )}
                              {event.age_restriction && (
                                <p className="text-gray-500 text-xs">{event.age_restriction}</p>
                              )}
                            </div>
                          </div>
                          {/* URLs */}
                          {(event.event_url || event.ticket_url) && (
                            <div className="mt-3 flex gap-3 text-xs">
                              {event.event_url && (
                                <a
                                  href={event.event_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 truncate max-w-[200px]"
                                >
                                  Event URL ↗
                                </a>
                              )}
                              {event.ticket_url && event.ticket_url !== event.event_url && (
                                <a
                                  href={event.ticket_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 truncate max-w-[200px]"
                                >
                                  Ticket URL ↗
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="p-4 flex items-center justify-between bg-gray-900/50">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              Submitted {new Date(event.created_at).toLocaleDateString()}
                            </span>
                            {event.category ? (
                              <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded capitalize">
                                {event.category}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs bg-yellow-600/30 text-yellow-400 rounded">
                                No category
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(event)}
                              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleReject(event.id)}
                              disabled={actionLoading === event.id}
                              className="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(event.id)}
                              disabled={actionLoading === event.id}
                              className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === event.id ? "..." : "Approve"}
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

          {/* Current Events Tab */}
          {tab === "events" && (
            <div>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-4">
                Showing {currentEvents.length} upcoming events. Click to edit.
              </p>

              <div className="space-y-2">
                {currentEvents.map((event) => {
                  const colors = VENUE_COLORS[event.venue_id] || VENUE_COLORS.other;
                  return (
                    <div
                      key={event.id}
                      onClick={() => openEditModal(event)}
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

              {/* Load More */}
              {hasMoreEvents && (
                <div className="mt-4 text-center">
                  <button
                    onClick={loadMoreEvents}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}

              {currentEvents.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  {eventSearch ? "No events match your search." : "No upcoming events."}
                </div>
              )}
            </div>
          )}

          {/* Scrapers Tab */}
          {tab === "scrapers" && <ScraperDashboard />}

          {/* Venues Tab */}
          {tab === "venues" && <VenueManagement />}
        </>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setEditingEvent(null)}>
          <div
            className="w-full max-w-lg max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Edit Event</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={editForm.date || ""}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={editForm.time || ""}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Venue</label>
                <select
                  value={editForm.venue_id || ""}
                  onChange={(e) => setEditForm({ ...editForm, venue_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={editForm.status || ""}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={editForm.category || ""}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value || null })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="theater">Theater</option>
                    <option value="comedy">Comedy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Price</label>
                <input
                  type="text"
                  value={editForm.price || ""}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  placeholder="e.g. $20"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Age Restriction</label>
                <input
                  type="text"
                  value={editForm.age_restriction || ""}
                  onChange={(e) => setEditForm({ ...editForm, age_restriction: e.target.value })}
                  placeholder="e.g. 21+"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Event URL</label>
                <input
                  type="url"
                  value={editForm.event_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, event_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Ticket URL</label>
                <input
                  type="url"
                  value={editForm.ticket_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, ticket_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Supporting Artists (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.supporting_artists?.join(", ") || ""}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    supporting_artists: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Artist 1, Artist 2"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="text-xs text-gray-500">
                ID: {editingEvent.id}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <button
                onClick={handleDeleteEvent}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                {editingEvent.status === "pending" && (
                  <button
                    onClick={async () => {
                      await handleSaveEdit();
                      if (editingEvent) {
                        await handleApprove(editingEvent.id);
                        setEditingEvent(null);
                      }
                    }}
                    disabled={saving || !editForm.category}
                    title={!editForm.category ? "Category required for approval" : undefined}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "..." : "Save & Approve"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {testEmailResult && (
        <Toast
          message={testEmailResult.message}
          type={testEmailResult.success ? "success" : "error"}
          onClose={() => setTestEmailResult(null)}
        />
      )}
    </div>
  );
}
