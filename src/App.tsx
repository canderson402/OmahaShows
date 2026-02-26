// web/src/App.tsx
import { useState, useEffect, useCallback } from "react";
import type { EventsData } from "./types";
import { EventList } from "./components/EventList";
import { Dashboard } from "./components/Dashboard";

type View = "events" | "dashboard" | "history";
type Layout = "compact" | "full";

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
};

function App() {
  const [data, setData] = useState<EventsData | null>(null);
  const [view] = useState<View>("events");
  const [layout] = useState<Layout>("compact");
  const [enabledVenues, setEnabledVenues] = useState<Set<string>>(new Set());
  const [isScrapingAll, setIsScrapingAll] = useState(false);
  const [scrapingVenue, setScrapingVenue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      // Try API first (local dev), fall back to static file (production)
      let response = await fetch(`${API_BASE}/api/events`).catch(() => null);
      if (response?.ok) {
        setApiConnected(true);
        const json = await response.json();
        setData(json);
        // Initialize all venues as enabled
        setEnabledVenues(new Set(json.sources.map((s: { id: string }) => s.id)));
        setError(null);
      } else {
        setApiConnected(false);
        // Use import.meta.env.BASE_URL for GitHub Pages compatibility
        response = await fetch(`${import.meta.env.BASE_URL}events.json`);
        const json = await response.json();
        setData(json);
        // Initialize all venues as enabled
        setEnabledVenues(new Set(json.sources.map((s: { id: string }) => s.id)));
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events");
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleScrapeAll = async () => {
    if (!apiConnected) {
      setError("API not running. Start with: ./scripts/dev.sh");
      return;
    }
    setIsScrapingAll(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/scrape/all`, { method: "POST" });
      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
        setApiConnected(true);
      } else {
        setError(result.message || "Scrape failed");
      }
    } catch (err) {
      setApiConnected(false);
      setError("API not running. Start with: ./scripts/dev.sh");
    } finally {
      setIsScrapingAll(false);
    }
  };

  const handleScrapeVenue = async (venueId: string) => {
    if (!apiConnected) {
      setError("API not running. Start with: ./scripts/dev.sh");
      return;
    }
    setScrapingVenue(venueId);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/scrape/${venueId}`, { method: "POST" });
      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
        setApiConnected(true);
      } else {
        setError(result.message || "Scrape failed");
      }
    } catch (err) {
      setApiConnected(false);
      setError("API not running. Start with: ./scripts/dev.sh");
    } finally {
      setScrapingVenue(null);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error ? <div className="text-red-600">{error}</div> : "Loading..."}
      </div>
    );
  }

  const venues = data.sources.map((s) => ({ id: s.id, name: s.name }));

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
      <main className="md:py-8">
        <div className={`mx-auto md:px-4 ${layout === "compact" ? "max-w-4xl" : "max-w-xl"}`}>
          <div className="content-container md:rounded-2xl p-6">
            {/* Logo */}
            <div className="text-center mb-6 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-black/20 md:rounded-t-2xl">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight">
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
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {(view === "events" || view === "history") && (
              <>
                {/* Venue Toggles */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {venues.map((v) => {
                    const colors = VENUE_COLORS[v.id] || { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500" };
                    const isEnabled = enabledVenues.has(v.id);
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleVenue(v.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                          isEnabled
                            ? `${colors.bg} ${colors.text} ${colors.border} hover:brightness-125`
                            : "bg-gray-800/50 text-gray-500 border-gray-700 opacity-50 hover:opacity-75"
                        }`}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
                {/* Victorian Decorative Divider */}
                <div className="mb-6 -mx-6 flex items-center">
                  <svg viewBox="0 0 800 24" className="w-full h-4 text-gray-500" preserveAspectRatio="none">
                    {/* Left scrollwork - smooth curves back to line */}
                    <path d="M0,12 C40,12 60,12 80,12 C100,12 110,4 130,4 C145,4 150,8 155,12 C160,16 170,20 185,20 C200,20 210,16 220,12 C235,6 250,4 270,4 C290,4 310,8 330,12 L360,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M0,12 C40,12 60,12 80,12 C100,12 110,20 130,20 C145,20 150,16 155,12 C160,8 170,4 185,4 C200,4 210,8 220,12 C235,18 250,20 270,20 C290,20 310,16 330,12 L360,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    {/* Center ornament */}
                    <ellipse cx="400" cy="12" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="400" cy="12" r="2" fill="currentColor"/>
                    <path d="M360,12 Q380,5 392,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M360,12 Q380,19 392,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M440,12 Q420,5 408,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M440,12 Q420,19 408,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    {/* Right scrollwork - smooth curves back to line (mirrored) */}
                    <path d="M800,12 C760,12 740,12 720,12 C700,12 690,4 670,4 C655,4 650,8 645,12 C640,16 630,20 615,20 C600,20 590,16 580,12 C565,6 550,4 530,4 C510,4 490,8 470,12 L440,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <path d="M800,12 C760,12 740,12 720,12 C700,12 690,20 670,20 C655,20 650,16 645,12 C640,8 630,4 615,4 C600,4 590,8 580,12 C565,18 550,20 530,20 C510,20 490,16 470,12 L440,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>

                <EventList
                  events={data.events}
                  layout={layout}
                  filter={{ enabledVenues, showPast: view === "history" }}
                  venueColors={VENUE_COLORS}
                />
              </>
            )}

            {view === "dashboard" && (
              <Dashboard
                sources={data.sources}
                lastUpdated={data.lastUpdated}
                onScrapeAll={handleScrapeAll}
                onScrapeVenue={handleScrapeVenue}
                isScrapingAll={isScrapingAll}
                scrapingVenue={scrapingVenue}
                apiConnected={apiConnected}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
