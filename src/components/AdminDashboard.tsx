import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase, approveEvent, rejectEvent, getVenues } from "../lib/supabase";
import { VENUE_COLORS } from "../App";
import { ScraperDashboard } from "./ScraperDashboard";

export type AdminTab = "pending" | "scrapers" | "events";

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
          event_url: editForm.event_url || null,
          ticket_url: editForm.ticket_url || null,
          price: editForm.price || null,
          age_restriction: editForm.age_restriction || null,
          supporting_artists: editForm.supporting_artists?.length ? editForm.supporting_artists : null,
          status: editForm.status,
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
                  className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
