// web/src/App.tsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { EventsData, ShowHistory, Event } from "./types";
import { EventList } from "./components/EventList";
import { Dashboard } from "./components/Dashboard";
import { HistoryList } from "./components/HistoryList";
import { FiltersDropdown, type HistoryTimeFilter } from "./components/FiltersDropdown";
import { ContactModal } from "./components/ContactModal";
import { CalendarView } from "./components/CalendarView";
import { useDebounce } from "./hooks/useDebounce";

type View = "events" | "dashboard" | "history" | "calendar";
type Layout = "compact" | "full";
type TimeFilter = "all" | "today" | "week" | "just-added";

const API_BASE = "http://localhost:8000";

// Venue colors - matching the OMAHA gradient (amber -> rose -> purple)
export const VENUE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  theslowdown: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500" },
  waitingroom: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500" },
  reverblounge: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500" },
  bourbontheatre: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500" },
  admiral: { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", border: "border-fuchsia-500" },
  astrotheater: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500" },
  steelhouse: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500" },
  other: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500" },
  holland: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500" },
  orpheum: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500" },
  barnato: { bg: "bg-lime-500/20", text: "text-lime-400", border: "border-lime-500" },
};

// Helper to check if event was added within last 7 days
const isJustAdded = (event: Event) => {
  if (!event.addedAt) return false;
  const addedTime = new Date(event.addedAt).getTime();
  const daysSince = (Date.now() - addedTime) / (1000 * 60 * 60 * 24);
  return daysSince < 7;
};

// Format as date and time
const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function App() {
  const [data, setData] = useState<EventsData | null>(null);
  const [history, setHistory] = useState<ShowHistory | null>(null);
  const [view, setView] = useState<View>("events");
  const [layout] = useState<Layout>("compact");
  const [enabledVenues, setEnabledVenues] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [historyTimeFilter, setHistoryTimeFilter] = useState<HistoryTimeFilter>("30days");
  const [historySearch, setHistorySearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Debounce search inputs for better performance
  const debouncedEventSearch = useDebounce(eventSearch, 300);
  const debouncedHistorySearch = useDebounce(historySearch, 300);

  // Secret menu state
  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      // In dev, try local API first; in production, go straight to static file
      let response: Response | null = null;
      if (import.meta.env.DEV) {
        response = await fetch(`${API_BASE}/api/events`).catch(() => null);
      }
      if (!response?.ok) {
        response = await fetch(`${import.meta.env.BASE_URL}events.json`);
      }
      const json = await response.json();
      setData(json);
      setEnabledVenues(new Set(json.sources.map((s: { id: string }) => s.id)));
      setError(null);

      const historyResponse = await fetch(`${import.meta.env.BASE_URL}history.json`).catch(() => null);
      if (historyResponse?.ok) {
        const historyJson = await historyResponse.json();
        setHistory(historyJson);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events");
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fade out loading screen once data arrives
  useEffect(() => {
    if (data && !ready) {
      const timer = setTimeout(() => setReady(true), 300);
      return () => clearTimeout(timer);
    }
  }, [data, ready]);

  // Secret menu: click logo 5 times within 2 seconds
  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      setView(v => v === "dashboard" ? "events" : "dashboard");
      setLogoClicks(0);
      if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
      return;
    }
    setLogoClicks(newCount);
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => setLogoClicks(0), 2000);
  };

  // Memoize derived data (must be before early return to maintain hook order)
  const venues = useMemo(() => {
    const list = data?.sources.map((s) => ({ id: s.id, name: s.name })) ?? [];
    return list.sort((a, b) => {
      if (a.id === "other") return 1;
      if (b.id === "other") return -1;
      return 0;
    });
  }, [data?.sources]);
  const justAddedCount = useMemo(() => data?.events.filter(isJustAdded).length ?? 0, [data?.events]);

  const toggleVenue = (venueId: string) => {
    setEnabledVenues((prev) => {
      const next = new Set(prev);
      if (next.has(venueId)) {
        next.delete(venueId);
      } else {
        next.add(venueId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-texture">
      {/* Loading overlay */}
      {!ready && (
        <div
          className="fixed inset-0 z-50 bg-[#0d0d0f] flex flex-col items-center justify-center gap-6 transition-opacity duration-500"
          style={{ opacity: data ? 0 : 1, pointerEvents: data ? "none" : "auto" }}
        >
          {error ? (
            <div className="text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-6 py-3">{error}</div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  OMAHA
                </span>
                <span className="text-white ml-3">SHOWS</span>
              </h1>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {data && <main className="md:py-8">
        <div className={`mx-auto md:px-4 ${layout === "compact" ? "max-w-4xl" : "max-w-xl"}`}>
          <div className="content-container md:rounded-2xl p-6">
            {/* Logo */}
            <div className="text-center mb-6 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-[#050506] md:rounded-t-2xl">
              <h1
                onClick={handleLogoClick}
                className="text-5xl md:text-6xl font-black tracking-tight select-none"
              >
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  OMAHA
                </span>
                <span className="text-white ml-3">SHOWS</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-600"></div>
                <span className="text-gray-500 text-sm tracking-widest uppercase">Live Music</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-600"></div>
              </div>

              {/* View tabs - only show events/calendar/history (dashboard is secret) */}
              {view !== "dashboard" && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setView("events")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      view === "events"
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Shows
                  </button>
                  <button
                    onClick={() => setView("calendar")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      view === "calendar"
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setView("history")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      view === "history"
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    History
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {(view === "events" || view === "history" || view === "calendar") && (
              <>
                {/* Header row with filters */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">
                    Updated {formatTimestamp(data.lastUpdated)}
                  </span>
                  <div className="flex items-center gap-2">
                    {(view === "events" || view === "history") && (
                      <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={view === "events" ? eventSearch : historySearch}
                          onChange={(e) => view === "events" ? setEventSearch(e.target.value) : setHistorySearch(e.target.value)}
                          className="w-28 sm:w-40 pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    )}
                    {view === "history" ? (
                      <FiltersDropdown
                        mode="history"
                        venues={venues}
                        enabledVenues={enabledVenues}
                        toggleVenue={toggleVenue}
                        venueColors={VENUE_COLORS}
                        timeFilter={historyTimeFilter}
                        setTimeFilter={setHistoryTimeFilter}
                        isOpen={filtersOpen}
                        onOpenChange={setFiltersOpen}
                      />
                    ) : (
                      <FiltersDropdown
                        venues={venues}
                        enabledVenues={enabledVenues}
                        toggleVenue={toggleVenue}
                        venueColors={VENUE_COLORS}
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        justAddedCount={justAddedCount}
                        isOpen={filtersOpen}
                        onOpenChange={setFiltersOpen}
                      />
                    )}
                  </div>
                </div>

                {/* Victorian Decorative Divider */}
                <div className="mb-6 -mx-6 flex items-center">
                  <svg viewBox="0 0 800 24" className="w-full h-4 text-gray-500" preserveAspectRatio="none">
                    <path d="M0,12 C40,12 60,12 80,12 C100,12 110,4 130,4 C145,4 150,8 155,12 C160,16 170,20 185,20 C200,20 210,16 220,12 C235,6 250,4 270,4 C290,4 310,8 330,12 L360,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M0,12 C40,12 60,12 80,12 C100,12 110,20 130,20 C145,20 150,16 155,12 C160,8 170,4 185,4 C200,4 210,8 220,12 C235,18 250,20 270,20 C290,20 310,16 330,12 L360,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <ellipse cx="400" cy="12" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="400" cy="12" r="2" fill="currentColor"/>
                    <path d="M360,12 Q380,5 392,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M360,12 Q380,19 392,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M440,12 Q420,5 408,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M440,12 Q420,19 408,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M800,12 C760,12 740,12 720,12 C700,12 690,4 670,4 C655,4 650,8 645,12 C640,16 630,20 615,20 C600,20 590,16 580,12 C565,6 550,4 530,4 C510,4 490,8 470,12 L440,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M800,12 C760,12 740,12 720,12 C700,12 690,20 670,20 C655,20 650,16 645,12 C640,8 630,4 615,4 C600,4 590,8 580,12 C565,18 550,20 530,20 C510,20 490,16 470,12 L440,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>

                {/* Content */}
                {view === "events" ? (
                  <EventList
                    events={data.events}
                    layout={layout}
                    filter={{ enabledVenues, showPast: false, timeFilter, searchQuery: debouncedEventSearch }}
                    venueColors={VENUE_COLORS}
                    isJustAdded={isJustAdded}
                  />
                ) : view === "history" ? (
                  <HistoryList
                    shows={history?.shows || []}
                    enabledVenues={enabledVenues}
                    searchQuery={debouncedHistorySearch}
                    venueColors={VENUE_COLORS}
                    timeFilter={historyTimeFilter}
                  />
                ) : (
                  <CalendarView
                    events={data.events}
                    venueColors={VENUE_COLORS}
                    enabledVenues={enabledVenues}
                  />
                )}
              </>
            )}

            {view === "dashboard" && (
              <Dashboard
                sources={data.sources}
                lastUpdated={data.lastUpdated}
                events={data.events}
                historyShows={history?.shows}
              />
            )}

            <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
          </div>
        </div>
      </main>}

      {/* Floating Pills - both mobile and desktop */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowContact(true)}
          className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;
