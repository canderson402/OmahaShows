import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase, approveEvent, rejectEvent, getVenues } from "../lib/supabase";
import { VENUE_COLORS } from "../App";
import { ScraperDashboard } from "./ScraperDashboard";
import { VenueManagement } from "./VenueManagement";
import { Toast } from "./Toast";

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
  venue_name: string | null;
  other_venue_website: string | null;
  other_venue_address: string | null;
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

interface EventChange {
  id: string;
  event_id: string;
  change_type: 'update' | 'new';
  proposed_data: Partial<DbEvent>;
  original_data: Partial<DbEvent> | null;
  changed_fields: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
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
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const [viewingChange, setViewingChange] = useState<EventChange | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const fetchEventChanges = useCallback(async () => {
    const { data, error } = await supabase
      .from("event_changes")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEventChanges(data);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPending(), fetchCurrentEvents(), fetchVenues(), fetchEventChanges()]);
      setLoading(false);
    };
    load();
  }, [fetchPending, fetchCurrentEvents, fetchVenues, fetchEventChanges]);

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
      fetchEventChanges();
    }
  }, [tab, fetchPending, fetchEventChanges]);

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
    if (!confirm("Are you sure you want to reject this event?")) return;
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
      image_url: event.image_url || "",
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
          image_url: editForm.image_url || null,
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

  const handleApplyChange = async (change: EventChange) => {
    setActionLoading(change.id);
    try {
      // Only update the changed fields, not id/source/venue_id/added_at
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Fields that should never be updated via changes
      const excludeFields = ['id', 'source', 'venue_id', 'added_at', 'status'];

      // Only include the fields that actually changed
      if (change.changed_fields) {
        for (const field of change.changed_fields) {
          if (field in change.proposed_data && !excludeFields.includes(field)) {
            updateData[field] = change.proposed_data[field as keyof typeof change.proposed_data];
          }
        }
      }

      const { error: updateError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", change.event_id);

      if (updateError) throw updateError;

      // Mark change as approved
      const { error: changeError } = await supabase
        .from("event_changes")
        .update({
          status: "approved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", change.id);

      if (changeError) throw changeError;

      // Remove from local state immediately
      setEventChanges(prev => prev.filter(c => c.id !== change.id));
      setViewingChange(null);
      setToast({ message: "Changes applied successfully", type: "success" });

      // Also refresh from server
      await Promise.all([fetchPending(), fetchEventChanges()]);
    } catch (err) {
      console.error("Failed to apply change:", err);
      setToast({ message: `Failed to apply change: ${err instanceof Error ? err.message : 'Unknown error'}`, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectChange = async (change: EventChange) => {
    if (!confirm("Are you sure you want to reject this change?")) return;
    setActionLoading(change.id);
    try {
      // Mark change as rejected
      const { error } = await supabase
        .from("event_changes")
        .update({
          status: "rejected",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", change.id);

      if (error) throw error;

      // Remove from local state immediately
      setEventChanges(prev => prev.filter(c => c.id !== change.id));
      setViewingChange(null);
      setToast({ message: "Change rejected", type: "success" });

      // Also refresh from server
      await fetchEventChanges();
    } catch (err) {
      console.error("Failed to reject change:", err);
      setToast({ message: `Failed to reject change: ${err instanceof Error ? err.message : 'Unknown error'}`, type: "error" });
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

  const getChangeForEvent = (eventId: string): EventChange | undefined => {
    return eventChanges.find(c => c.event_id === eventId);
  };

  return (
    <div className="px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            Back
          </Link>
          <Link
            to="/submission"
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
          >
            + Add
          </Link>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          onClick={() => setTab("pending")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            tab === "pending"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Pending ({pendingEvents.length + eventChanges.filter(c => c.change_type === 'update').length})
        </button>
        <button
          onClick={() => setTab("events")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            tab === "events"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setTab("scrapers")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            tab === "scrapers"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Scrapers
        </button>
        <button
          onClick={() => setTab("venues")}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <p className="text-gray-500 text-xs sm:text-sm">
                  {pendingEvents.length} pending submission{pendingEvents.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  {pendingEvents.length > 0 && (
                    <button
                      onClick={handleClearAllPending}
                      disabled={actionLoading === "clear-all"}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === "clear-all" ? "..." : "Clear All"}
                    </button>
                  )}
                  <button
                    onClick={() => fetchPending()}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors flex items-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
              {/* Pending Changes to Approved Events */}
              {eventChanges.filter(c => c.change_type === 'update').length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3">Pending Changes to Approved Events</h3>
                  <div className="space-y-3">
                    {eventChanges.filter(c => c.change_type === 'update').map((change) => (
                      <div
                        key={change.id}
                        className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 sm:p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{change.original_data?.title || change.proposed_data.title}</p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">
                              Changed: {change.changed_fields?.join(', ')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(change.created_at).toLocaleDateString()}
                              </p>
                              {(change.proposed_data.event_url || change.original_data?.event_url) && (
                                <a
                                  href={change.proposed_data.event_url || change.original_data?.event_url || ''}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                  Source →
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                            <button
                              onClick={() => setViewingChange(change)}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-blue-400 hover:text-blue-300 border border-blue-600/30 rounded-lg hover:border-blue-500/50 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRejectChange(change)}
                              disabled={actionLoading === change.id}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApplyChange(change)}
                              disabled={actionLoading === change.id}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === change.id ? "..." : "Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingEvents.length === 0 && eventChanges.filter(c => c.change_type === 'update').length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No pending submissions or changes</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Events submitted by users and scraper changes will appear here for approval.
                  </p>
                </div>
              ) : pendingEvents.length === 0 ? null : (
                <div className="divide-y divide-gray-800">
                  {pendingEvents.map((event) => {
                    const venueHex = VENUE_COLORS[event.venue_id] || VENUE_COLORS.other || "#10b981";
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
                      <div key={event.id} className="py-6">
                        {/* Mobile Layout */}
                        <div className="md:hidden flex flex-col gap-4">
                          {/* Image with date header */}
                          <div className="relative">
                            <div className="bg-slate-900 py-1.5 px-3 rounded-t-xl">
                              <p className="text-white font-semibold text-center text-sm">
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <div className="relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square flex items-center justify-center">
                              {event.image_url ? (
                                <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-600 text-5xl">&#9834;</span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div>
                            <h3 className="text-xl font-bold text-white">{event.title}</h3>
                            {event.supporting_artists && event.supporting_artists.length > 0 && (
                              <p className="text-gray-400 mt-1">with {event.supporting_artists.join(", ")}</p>
                            )}
                            <p className="text-gray-400 mt-2">
                              {formatTime12(event.time) && <>{formatTime12(event.time)} · </>}
                              {event.venue_id === 'other' ? (
                                <span className="text-emerald-400">
                                  {event.venue_name || 'Unknown Venue'}
                                  {event.other_venue_address && (
                                    <span className="text-gray-500 text-xs ml-1">
                                      ({event.other_venue_address})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span style={{ color: venueHex }}>{venueName}</span>
                              )}
                            </p>
                            {event.price && <p className="text-gray-500 text-sm mt-1">{event.price}</p>}
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Submitted {new Date(event.created_at).toLocaleDateString()}
                            </span>
                            {(() => {
                              const change = getChangeForEvent(event.id);
                              return change ? (
                                <span className={`px-2 py-0.5 text-xs rounded ${change.change_type === 'new' ? 'bg-green-600/30 text-green-400' : 'bg-blue-600/30 text-blue-400'}`}>
                                  {change.change_type === 'new' ? 'New' : 'Changed'}
                                </span>
                              ) : null;
                            })()}
                            {event.category ? (
                              <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded capitalize">{event.category}</span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs bg-yellow-600/30 text-yellow-400 rounded">No category</span>
                            )}
                          </div>

                          {/* Other venue details */}
                          {event.venue_id === 'other' && event.venue_name && (
                            <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                              <p className="text-xs text-emerald-400 font-medium mb-1">External Venue</p>
                              <p className="text-sm text-white">{event.venue_name}</p>
                              {event.other_venue_address && (
                                <p className="text-xs text-gray-400 mt-0.5">{event.other_venue_address}</p>
                              )}
                              {event.other_venue_website && (
                                <a
                                  href={event.other_venue_website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                                >
                                  Venue Website
                                </a>
                              )}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(event)} className="flex-1 px-3 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleReject(event.id)} disabled={actionLoading === event.id} className="flex-1 px-3 py-2.5 bg-red-600/80 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
                              Reject
                            </button>
                            <button onClick={() => handleApprove(event.id)} disabled={actionLoading === event.id} className="flex-1 px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
                              {actionLoading === event.id ? "..." : "Approve"}
                            </button>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:flex gap-5 relative">
                          {/* Action buttons - top right */}
                          <div className="absolute top-0 right-0 flex gap-2">
                            <button onClick={() => openEditModal(event)} className="px-4 py-2 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors">
                              Edit
                            </button>
                            {(() => {
                              const change = getChangeForEvent(event.id);
                              return change && change.change_type === 'update' ? (
                                <button onClick={() => setViewingChange(change)} className="px-4 py-2 text-blue-400 hover:text-blue-300 border border-blue-600/30 rounded-lg hover:border-blue-500/50 transition-colors">
                                  Changes
                                </button>
                              ) : null;
                            })()}
                            <button onClick={() => handleReject(event.id)} disabled={actionLoading === event.id} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
                              Reject
                            </button>
                            <button onClick={() => handleApprove(event.id)} disabled={actionLoading === event.id} className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
                              {actionLoading === event.id ? "..." : "Approve"}
                            </button>
                          </div>

                          {/* Image with date header */}
                          <div className="w-[180px] flex-shrink-0">
                            <div className="bg-slate-900 py-1.5 px-3 rounded-t-xl">
                              <p className="text-white font-semibold text-center text-sm">
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <div className="relative bg-gray-900 rounded-b-xl overflow-hidden aspect-square flex items-center justify-center">
                              {event.image_url ? (
                                <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-600 text-5xl">&#9834;</span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1 pr-80">
                            <h3 className="text-xl font-bold text-white">{event.title}</h3>
                            {event.supporting_artists && event.supporting_artists.length > 0 && (
                              <p className="text-gray-400 mt-1">with {event.supporting_artists.join(", ")}</p>
                            )}
                            <p className="text-gray-400 mt-3">
                              {formatTime12(event.time) && <>{formatTime12(event.time)} · </>}
                              {event.venue_id === 'other' ? (
                                <span className="text-emerald-400">
                                  {event.venue_name || 'Unknown Venue'}
                                  {event.other_venue_address && (
                                    <span className="text-gray-500 text-xs ml-1">
                                      ({event.other_venue_address})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span style={{ color: venueHex }}>{venueName}</span>
                              )}
                            </p>
                            {event.price && <p className="text-gray-500 text-sm mt-1">{event.price}</p>}

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span className="text-xs text-gray-500">
                                Submitted {new Date(event.created_at).toLocaleDateString()}
                              </span>
                              {(() => {
                                const change = getChangeForEvent(event.id);
                                return change ? (
                                  <span className={`px-2 py-0.5 text-xs rounded ${change.change_type === 'new' ? 'bg-green-600/30 text-green-400' : 'bg-blue-600/30 text-blue-400'}`}>
                                    {change.change_type === 'new' ? 'New' : 'Changed'}
                                  </span>
                                ) : null;
                              })()}
                              {event.category ? (
                                <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded capitalize">{event.category}</span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs bg-yellow-600/30 text-yellow-400 rounded">No category</span>
                              )}
                              {(event.event_url || event.ticket_url) && (
                                <>
                                  {event.event_url && (
                                    <a href={event.event_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                                      Event ↗
                                    </a>
                                  )}
                                  {event.ticket_url && event.ticket_url !== event.event_url && (
                                    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                                      Tickets ↗
                                    </a>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Other venue details */}
                            {event.venue_id === 'other' && event.venue_name && (
                              <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                                <p className="text-xs text-emerald-400 font-medium mb-1">External Venue</p>
                                <p className="text-sm text-white">{event.venue_name}</p>
                                {event.other_venue_address && (
                                  <p className="text-xs text-gray-400 mt-0.5">{event.other_venue_address}</p>
                                )}
                                {event.other_venue_website && (
                                  <a
                                    href={event.other_venue_website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                                  >
                                    Venue Website
                                  </a>
                                )}
                              </div>
                            )}
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

              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                Showing {currentEvents.length} upcoming events. Tap to edit.
              </p>

              <div className="divide-y divide-gray-800">
                {currentEvents.map((event) => {
                  const venueHex = VENUE_COLORS[event.venue_id] || VENUE_COLORS.other || "#10b981";
                  const venueName = venues.find(v => v.id === event.venue_id)?.name || event.venue_id;
                  return (
                    <div
                      key={event.id}
                      onClick={() => openEditModal(event)}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-white/5 cursor-pointer transition-colors -mx-2 px-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                          {formatDate(event.date)}
                        </span>
                        <span className="text-sm text-white truncate">{event.title}</span>
                      </div>
                      <span className="text-xs sm:text-sm flex-shrink-0" style={{ color: venueHex }}>
                        {venueName}
                      </span>
                      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        {event.status === "approved" ? (
                          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : event.status === "pending" ? (
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
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
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          onClick={() => setEditingEvent(null)}
        >
          <div
            className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-gray-900 border-t sm:border border-gray-700 rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800">
              <h3 className="text-base sm:text-lg font-semibold text-white">Edit Event</h3>
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
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={editForm.date || ""}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={editForm.time || ""}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Venue</label>
                <select
                  value={editForm.venue_id || ""}
                  onChange={(e) => setEditForm({ ...editForm, venue_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={editForm.status || ""}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={editForm.category || ""}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value || null })}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="">-- Select --</option>
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="theater">Theater</option>
                    <option value="comedy">Comedy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">Price</label>
                  <input
                    type="text"
                    value={editForm.price || ""}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="e.g. $20"
                    className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">Age</label>
                  <input
                    type="text"
                    value={editForm.age_restriction || ""}
                    onChange={(e) => setEditForm({ ...editForm, age_restriction: e.target.value })}
                    placeholder="e.g. 21+"
                    className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Event URL</label>
                <input
                  type="url"
                  value={editForm.event_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, event_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Ticket URL</label>
                <input
                  type="url"
                  value={editForm.ticket_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, ticket_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editForm.image_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
                {editForm.image_url && (
                  <div className="mt-2">
                    <img
                      src={editForm.image_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg bg-gray-800"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1">Supporting Artists (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.supporting_artists?.join(", ") || ""}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    supporting_artists: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Artist 1, Artist 2"
                  className="w-full px-3 py-2 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="text-xs text-gray-500 truncate">
                ID: {editingEvent.id}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 border-t border-gray-800"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.75rem)' }}
            >
              <button
                onClick={handleDeleteEvent}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="px-3 sm:px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-3 sm:px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {saving ? "..." : "Save"}
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
                    className="px-3 sm:px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "..." : "Approve"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Changes Modal */}
      {viewingChange && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          onClick={() => setViewingChange(null)}
        >
          <div
            className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-gray-900 border-t sm:border border-gray-700 rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800">
              <h3 className="text-base sm:text-lg font-semibold text-white">Proposed Changes</h3>
              <button
                onClick={() => setViewingChange(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Changes */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <p className="text-xs sm:text-sm text-gray-400">
                  Event: <span className="text-white block sm:inline truncate">{viewingChange.original_data?.title || viewingChange.proposed_data.title}</span>
                </p>
                {(viewingChange.proposed_data.event_url || viewingChange.original_data?.event_url) && (
                  <a
                    href={viewingChange.proposed_data.event_url || viewingChange.original_data?.event_url || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline flex-shrink-0"
                  >
                    View Source →
                  </a>
                )}
              </div>

              {/* Mobile: Card layout */}
              <div className="sm:hidden space-y-3">
                {viewingChange.changed_fields?.map((field) => (
                  <div key={field} className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{field.replace(/_/g, ' ')}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0">Current:</span>
                        <span className="text-xs text-red-400/70 break-all">
                          {String(viewingChange.original_data?.[field as keyof DbEvent] ?? '—')}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 w-16 flex-shrink-0">New:</span>
                        <span className="text-xs text-green-400 break-all">
                          {String(viewingChange.proposed_data[field as keyof DbEvent] ?? '—')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <table className="hidden sm:table w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="pb-2 font-medium">Field</th>
                    <th className="pb-2 font-medium">Current</th>
                    <th className="pb-2 font-medium">Proposed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {viewingChange.changed_fields?.map((field) => (
                    <tr key={field}>
                      <td className="py-2 text-gray-400 capitalize">{field.replace(/_/g, ' ')}</td>
                      <td className="py-2 text-red-400/70 break-all">
                        {String(viewingChange.original_data?.[field as keyof DbEvent] ?? '—')}
                      </td>
                      <td className="py-2 text-green-400 break-all">
                        {String(viewingChange.proposed_data[field as keyof DbEvent] ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div
              className="flex flex-wrap items-center justify-end gap-2 p-3 sm:p-4 border-t border-gray-800"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.75rem)' }}
            >
              <button
                onClick={() => setViewingChange(null)}
                className="px-3 sm:px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleRejectChange(viewingChange)}
                disabled={actionLoading === viewingChange.id}
                className="px-3 sm:px-4 py-2 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleApplyChange(viewingChange)}
                disabled={actionLoading === viewingChange.id}
                className="px-3 sm:px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {actionLoading === viewingChange.id ? "..." : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
