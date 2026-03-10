import { useState, useEffect, useCallback } from "react";
import {
  getLatestScraperRuns,
  createScraperRun,
  updateScraperRun,
  getEventsByIds,
  type ScraperRun
} from "../lib/supabase";
import { VENUE_COLORS, hexToRgba } from "../App";
import { Toast } from "./Toast";

// Scraper configuration matching the Python API
const SCRAPERS = [
  { id: "theslowdown", name: "The Slowdown", url: "https://theslowdown.com" },
  { id: "waitingroom", name: "Waiting Room", url: "https://waitingroomlounge.com" },
  { id: "reverblounge", name: "Reverb Lounge", url: "https://reverbloungeomaha.com" },
  { id: "bourbontheatre", name: "Bourbon Theatre", url: "https://bourbontheatre.com" },
  { id: "admiral", name: "The Admiral", url: "https://admiralomaha.com" },
  { id: "astrotheater", name: "The Astro", url: "https://astrotheateromaha.com" },
  { id: "steelhouse", name: "Steelhouse Omaha", url: "https://steelhouseomaha.com" },
  { id: "holland", name: "Holland Center", url: "https://ticketomaha.com" },
  { id: "orpheum", name: "Orpheum Theater", url: "https://ticketomaha.com" },
  { id: "baxterarena", name: "Baxter Arena", url: "https://www.baxterarena.com" },
  { id: "stircove", name: "Stir Concert Cove", url: "https://www.stircoveamp.com/events/" },
  { id: "other", name: "Other Venues", url: "https://omahaunderground.com" },
];

// Discovery scrapers - create pending events for admin review
const DISCOVERY_SCRAPERS = [
  { id: "ohmyomaha", name: "OhMyOmaha (Discovery)", url: "https://ohmyomaha.com/biggest-concerts-omaha/" },
];

// API base URL - use localhost for development
const API_BASE = import.meta.env.VITE_SCRAPER_API_URL || "http://localhost:8000";

// GitHub Actions config for triggering remote scrapes
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || "";
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || "";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";
const USE_GITHUB_ACTIONS = Boolean(GITHUB_OWNER && GITHUB_REPO && GITHUB_TOKEN);

interface ScraperResult {
  venue: string;
  venue_id: string;
  url: string;
  event_count: number;
  events: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    venue: string;
    price?: string;
    imageUrl?: string;
  }>;
  error?: string;
}

interface ScraperCardProps {
  scraper: typeof SCRAPERS[0];
  latestRun?: ScraperRun;
  isRunning: boolean;
  isTriggered: boolean;
  isGitHubMode: boolean;
  onRun: () => void;
  onViewResults: () => void;
}

function ScraperCard({ scraper, latestRun, isRunning, isTriggered, isGitHubMode, onRun, onViewResults }: ScraperCardProps) {
  const venueHex = VENUE_COLORS[scraper.id] || VENUE_COLORS.other || "#10b981";
  const [expanded, setExpanded] = useState(false);
  const [newEvents, setNewEvents] = useState<{ id: string; title: string; date: string }[]>([]);
  const [changedEvents, setChangedEvents] = useState<{ id: string; title: string; date: string }[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const hasNewOrChanged = latestRun && (latestRun.new_count > 0 || latestRun.changed_count > 0);

  const toggleExpanded = async () => {
    if (!expanded && hasNewOrChanged) {
      setLoadingEvents(true);
      try {
        const [newData, changedData] = await Promise.all([
          latestRun.new_event_ids?.length ? getEventsByIds(latestRun.new_event_ids) : Promise.resolve([]),
          latestRun.changed_event_ids?.length ? getEventsByIds(latestRun.changed_event_ids) : Promise.resolve([]),
        ]);
        setNewEvents(newData);
        setChangedEvents(changedData);
      } catch (err) {
        console.error("Failed to fetch event details:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    setExpanded(!expanded);
  };

  const getStatusDisplay = () => {
    if (isRunning) {
      return { text: "Running", color: "text-amber-400", bg: "bg-amber-500/20" };
    }
    if (isTriggered) {
      return { text: "Dispatched", color: "text-sky-400", bg: "bg-sky-500/20" };
    }
    if (!latestRun) {
      return { text: "Never run", color: "text-gray-500", bg: "bg-gray-500/20" };
    }
    if (latestRun.status === "running") {
      return { text: "Running", color: "text-amber-400", bg: "bg-amber-500/20" };
    }
    if (latestRun.status === "success") {
      return { text: "Success", color: "text-green-400", bg: "bg-green-500/20" };
    }
    return { text: "Error", color: "text-red-400", bg: "bg-red-500/20" };
  };

  const status = getStatusDisplay();
  const lastRunTime = latestRun?.started_at
    ? new Date(latestRun.started_at).toLocaleString()
    : "Never";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: venueHex }}>
              {scraper.name}
            </span>
            <span className={`text-xs ${status.color}`}>
              · {status.text}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{scraper.url}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            <span>Last: {lastRunTime}</span>
            {latestRun?.event_count !== undefined && latestRun.status === "success" && (
              <span>
                {latestRun.event_count} events
                {hasNewOrChanged ? (
                  <button
                    onClick={toggleExpanded}
                    className="ml-1 hover:underline"
                  >
                    (
                    {latestRun.new_count > 0 && (
                      <span className="text-green-400">{latestRun.new_count} new</span>
                    )}
                    {latestRun.new_count > 0 && latestRun.changed_count > 0 && ", "}
                    {latestRun.changed_count > 0 && (
                      <span className="text-amber-400">{latestRun.changed_count} changed</span>
                    )}
                    )
                    <svg
                      className={`inline-block w-3 h-3 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : null}
              </span>
            )}
          </div>
          {latestRun?.error_message && (
            <p className="text-xs text-red-400 mt-1 truncate" title={latestRun.error_message}>
              Error: {latestRun.error_message}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={isRunning || isTriggered}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
              isRunning
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : isTriggered
                  ? "text-sky-400"
                  : "text-amber-400 hover:bg-white/5"
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                Running
              </>
            ) : isTriggered ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sent
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isGitHubMode ? "Dispatch" : "Run"}
              </>
            )}
          </button>
          {latestRun && latestRun.status !== "running" && !isGitHubMode && (
            <button
              onClick={onViewResults}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              View
            </button>
          )}
        </div>
      </div>

      {/* Expanded new/changed events list */}
      {expanded && hasNewOrChanged && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          {loadingEvents ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin" />
              Loading events...
            </div>
          ) : (
            <div className="space-y-2">
              {newEvents.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">New Events:</p>
                  <ul className="space-y-1">
                    {newEvents.map(e => (
                      <li key={e.id} className="text-xs text-gray-300 flex items-center gap-2">
                        <span className="text-gray-500">{formatDate(e.date)}</span>
                        <span>{e.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {changedEvents.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-400 mb-1">Changed Events:</p>
                  <ul className="space-y-1">
                    {changedEvents.map(e => (
                      <li key={e.id} className="text-xs text-gray-300 flex items-center gap-2">
                        <span className="text-gray-500">{formatDate(e.date)}</span>
                        <span>{e.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultsModalProps {
  scraper: typeof SCRAPERS[0];
  result: ScraperResult | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

function ResultsModal({ scraper, result, loading, error, onClose }: ResultsModalProps) {
  const venueHex = VENUE_COLORS[scraper.id] || VENUE_COLORS.other || "#10b981";
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: hexToRgba(venueHex, 0.2), color: venueHex }}
            >
              {scraper.id}
            </span>
            <h3 className="text-lg font-semibold text-white">{scraper.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {result && !loading && (
              <div className="flex gap-1 p-0.5 bg-gray-800 rounded-lg mr-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    viewMode === 'cards' ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    viewMode === 'json' ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  JSON
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-gray-400">Fetching results...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          ) : result ? (
            <div>
              {/* Summary */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  result.error ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                }`}>
                  {result.error ? "Error" : "Success"}
                </span>
                <span className="text-gray-400">{result.event_count} events found</span>
              </div>

              {result.error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm">{result.error}</p>
                </div>
              )}

              {/* JSON View */}
              {viewMode === 'json' ? (
                <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-auto text-xs text-gray-300 font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                /* Cards View */
                result.events.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                      Events ({result.events.length})
                    </h4>
                    {result.events.map((event, i) => (
                      <div
                        key={event.id || i}
                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                      >
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt=""
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{event.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(event.date + 'T00:00').toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric'
                            })}</span>
                            {event.time && <span>{event.time}</span>}
                            {event.price && <span>• {event.price}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {result.events.length === 0 && !result.error && (
                <div className="text-center py-8 text-gray-500">
                  No events found from this source.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No results available. Run the scraper to see results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Trigger GitHub Actions workflow
async function triggerGitHubWorkflow(scraperId?: string): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/scrape-supabase.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: scraperId ? { scraper: scraperId } : {},
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }
}

export function ScraperDashboard() {
  const [latestRuns, setLatestRuns] = useState<Record<string, ScraperRun>>({});
  const [runningScrapers, setRunningScrapers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedScraper, setSelectedScraper] = useState<typeof SCRAPERS[0] | null>(null);
  const [selectedResult, setSelectedResult] = useState<ScraperResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [runAllStatus, setRunAllStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [useGitHub, setUseGitHub] = useState(USE_GITHUB_ACTIONS);
  const [githubTriggered, setGithubTriggered] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchLatestRuns = useCallback(async () => {
    try {
      const runs = await getLatestScraperRuns();
      setLatestRuns(runs);
    } catch (err) {
      console.error("Failed to fetch scraper runs:", err);
    }
  }, []);

  useEffect(() => {
    fetchLatestRuns().finally(() => setLoading(false));
  }, [fetchLatestRuns]);

  const runScraperLocal = async (scraper: typeof SCRAPERS[0]) => {
    let runId: number | null = null;

    try {
      // Create run record in Supabase
      const run = await createScraperRun(scraper.id, scraper.name);
      runId = run.id;

      // Update local state to show running
      setLatestRuns(prev => ({
        ...prev,
        [scraper.id]: run
      }));

      // Call the scraper API
      const response = await fetch(`${API_BASE}/api/scrape/${scraper.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const eventCount = data.data?.sources?.find((s: { id: string }) => s.id === scraper.id)?.eventCount || 0;

      // Update run record in Supabase
      await updateScraperRun(
        runId,
        data.success ? 'success' : 'error',
        eventCount,
        data.success ? undefined : data.message
      );

      // Update local state with result
      setLatestRuns(prev => ({
        ...prev,
        [scraper.id]: {
          ...prev[scraper.id],
          status: data.success ? 'success' as const : 'error' as const,
          event_count: eventCount,
          error_message: data.success ? null : data.message,
          finished_at: new Date().toISOString(),
        }
      }));

    } catch (err) {
      console.error("Scraper failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setApiError(`Failed to run ${scraper.name}: ${errorMsg}`);

      // Update run record in Supabase if we have one
      if (runId) {
        await updateScraperRun(runId, 'error', 0, errorMsg).catch(() => {});
      }

      // Update local state with error
      setLatestRuns(prev => ({
        ...prev,
        [scraper.id]: {
          ...prev[scraper.id],
          status: 'error' as const,
          event_count: 0,
          error_message: errorMsg,
          finished_at: new Date().toISOString(),
        }
      }));
    }
  };

  const runScraperGitHub = async (scraper: typeof SCRAPERS[0]) => {
    try {
      await triggerGitHubWorkflow(scraper.id);
      setGithubTriggered(prev => new Set(prev).add(scraper.id));
      setApiError(null);
      setToast({ message: `${scraper.name} dispatched. Check back in 1-2 minutes for results.`, type: 'success' });

      // Clear the "triggered" indicator after 30 seconds
      setTimeout(() => {
        setGithubTriggered(prev => {
          const next = new Set(prev);
          next.delete(scraper.id);
          return next;
        });
        fetchLatestRuns(); // Refresh to see if it completed
      }, 30000);

    } catch (err) {
      console.error("GitHub trigger failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setApiError(`Failed to trigger GitHub workflow: ${errorMsg}`);
    }
  };

  const runScraper = async (scraper: typeof SCRAPERS[0]) => {
    if (runningScrapers.has(scraper.id) || githubTriggered.has(scraper.id)) return;

    setRunningScrapers(prev => new Set(prev).add(scraper.id));
    setApiError(null);

    try {
      if (useGitHub && USE_GITHUB_ACTIONS) {
        await runScraperGitHub(scraper);
      } else {
        await runScraperLocal(scraper);
      }
    } finally {
      setRunningScrapers(prev => {
        const next = new Set(prev);
        next.delete(scraper.id);
        return next;
      });
    }
  };

  const runAllScrapers = async () => {
    setRunAllStatus('running');
    setApiError(null);

    if (useGitHub && USE_GITHUB_ACTIONS) {
      // Trigger all scrapers via single GitHub workflow
      try {
        await triggerGitHubWorkflow(); // No scraper ID = run all
        // Mark all scrapers as triggered/pending
        setGithubTriggered(new Set(SCRAPERS.map(s => s.id)));
        setRunAllStatus('idle');
        setToast({ message: "All scrapers dispatched. Check back in 2-5 minutes for results.", type: 'success' });
        // Clear the triggered state after 60 seconds
        setTimeout(() => {
          setGithubTriggered(new Set());
          fetchLatestRuns();
        }, 60000);
      } catch (err) {
        console.error("GitHub trigger failed:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setApiError(`Failed to trigger GitHub workflow: ${errorMsg}`);
        setRunAllStatus('idle');
      }
    } else {
      // Run locally one by one
      for (const scraper of SCRAPERS) {
        setRunningScrapers(prev => new Set(prev).add(scraper.id));
        await runScraperLocal(scraper);
        setRunningScrapers(prev => {
          const next = new Set(prev);
          next.delete(scraper.id);
          return next;
        });
      }
      setRunAllStatus('done');
      setTimeout(() => setRunAllStatus('idle'), 3000);
    }
  };

  const viewResults = async (scraper: typeof SCRAPERS[0]) => {
    setSelectedScraper(scraper);
    setResultLoading(true);
    setResultError(null);
    setSelectedResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/raw/${scraper.id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setSelectedResult(data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setResultError(err instanceof Error ? err.message : "Failed to fetch results");
    } finally {
      setResultLoading(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  const allScrapers = [...SCRAPERS, ...DISCOVERY_SCRAPERS];
  const successCount = allScrapers.filter(s => latestRuns[s.id]?.status === 'success').length;
  const errorCount = allScrapers.filter(s => latestRuns[s.id]?.status === 'error').length;
  const lastRunTime = Object.values(latestRuns)
    .map(r => new Date(r.started_at).getTime())
    .sort((a, b) => b - a)[0];

  return (
    <div>
      {/* Summary Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-medium">{allScrapers.length}</span> scrapers
          </span>
          <span className="text-gray-600">·</span>
          <span className="text-green-400">{successCount} success</span>
          {errorCount > 0 && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-red-400">{errorCount} errors</span>
            </>
          )}
          {lastRunTime && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">Last run {formatRelativeTime(new Date(lastRunTime).toISOString())}</span>
            </>
          )}
        </div>
        <button
          onClick={runAllScrapers}
          disabled={runAllStatus === 'running'}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            runAllStatus === 'running'
              ? "bg-amber-500/20 text-amber-400"
              : runAllStatus === 'done'
                ? "bg-green-500/20 text-green-400"
                : "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-400 hover:to-rose-400"
          }`}
        >
          {runAllStatus === 'running' ? (
            <>
              <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              Running...
            </>
          ) : runAllStatus === 'done' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {useGitHub ? "Dispatch All" : "Run All"}
            </>
          )}
        </button>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
          <p className="text-red-400 text-sm">{apiError}</p>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-500">Mode:</span>
        <div className="flex gap-1 p-0.5 bg-gray-800 rounded-lg">
          <button
            onClick={() => setUseGitHub(false)}
            className={`px-2 py-1 text-xs rounded transition-all ${
              !useGitHub
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Local
          </button>
          <button
            onClick={() => setUseGitHub(true)}
            disabled={!USE_GITHUB_ACTIONS}
            className={`px-2 py-1 text-xs rounded transition-all ${
              useGitHub && USE_GITHUB_ACTIONS
                ? "bg-gray-700 text-white"
                : !USE_GITHUB_ACTIONS
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-300"
            }`}
          >
            GitHub
          </button>
        </div>
      </div>

      {/* Scrapers List */}
      <div className="divide-y divide-gray-800">
        {SCRAPERS.map(scraper => (
          <ScraperCard
            key={scraper.id}
            scraper={scraper}
            latestRun={latestRuns[scraper.id]}
            isRunning={runningScrapers.has(scraper.id)}
            isTriggered={githubTriggered.has(scraper.id)}
            isGitHubMode={useGitHub}
            onRun={() => runScraper(scraper)}
            onViewResults={() => viewResults(scraper)}
          />
        ))}
      </div>

      {/* Discovery Scrapers Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-medium text-white">Discovery Scrapers</h3>
          <span className="px-2 py-0.5 text-xs bg-sky-500/20 text-sky-400 rounded">
            Creates Pending Events
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Discovery scrapers find shows we might be missing. Events are added to the pending queue for review.
        </p>
        <div className="divide-y divide-gray-800">
          {DISCOVERY_SCRAPERS.map(scraper => (
            <ScraperCard
              key={scraper.id}
              scraper={scraper}
              latestRun={latestRuns[scraper.id]}
              isRunning={runningScrapers.has(scraper.id)}
              isTriggered={githubTriggered.has(scraper.id)}
              isGitHubMode={useGitHub}
              onRun={() => runScraper(scraper)}
              onViewResults={() => viewResults(scraper)}
            />
          ))}
        </div>
      </div>

      {/* Results Modal */}
      {selectedScraper && (
        <ResultsModal
          scraper={selectedScraper}
          result={selectedResult}
          loading={resultLoading}
          error={resultError}
          onClose={() => {
            setSelectedScraper(null);
            setSelectedResult(null);
          }}
        />
      )}

      {/* Toast */}
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
