// web/src/App.tsx
import { useState, useEffect, useCallback } from "react";
import type { EventsData } from "./types";
import { EventList } from "./components/EventList";
import { Dashboard } from "./components/Dashboard";

type View = "events" | "dashboard" | "history";
type Layout = "compact" | "full";

const API_BASE = "http://localhost:8000";

function App() {
  const [data, setData] = useState<EventsData | null>(null);
  const [view, setView] = useState<View>("events");
  const [layout, setLayout] = useState<Layout>("full");
  const [venueFilter, setVenueFilter] = useState("all");
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
        setError(null);
      } else {
        setApiConnected(false);
        response = await fetch("/events.json");
        const json = await response.json();
        setData(json);
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

  return (
    <div className="min-h-screen bg-texture">
      <main className="py-8">
        <div className={`mx-auto px-4 ${layout === "compact" ? "max-w-4xl" : "max-w-xl"}`}>
          <div className="content-container rounded-2xl p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {(view === "events" || view === "history") && (
              <>
                {/* Filters and Layout Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <select
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value)}
                    className="border border-gray-700 bg-gray-900 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Venues</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  {/* Layout Toggle */}
                  <div className="flex bg-gray-900 rounded-lg p-1">
                    <button
                      onClick={() => setLayout("compact")}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        layout === "compact"
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Compact
                    </button>
                    <button
                      onClick={() => setLayout("full")}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        layout === "full"
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Full
                    </button>
                  </div>
                </div>

                <EventList
                  events={data.events}
                  layout={layout}
                  filter={{ venue: venueFilter, showPast: view === "history" }}
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
