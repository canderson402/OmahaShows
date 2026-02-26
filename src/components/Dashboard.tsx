// web/src/components/Dashboard.tsx
import { useState } from "react";
import type { SourceStatus } from "../types";

interface DashboardProps {
  sources: SourceStatus[];
  lastUpdated: string;
  onScrapeAll: () => Promise<void>;
  onScrapeVenue: (venueId: string) => Promise<void>;
  isScrapingAll: boolean;
  scrapingVenue: string | null;
  apiConnected: boolean | null;
}

const API_BASE = "http://localhost:8000";

export function Dashboard({
  sources,
  lastUpdated,
  onScrapeAll,
  onScrapeVenue,
  isScrapingAll,
  scrapingVenue,
  apiConnected
}: DashboardProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<Record<string, unknown> | null>(null);
  const [loadingJson, setLoadingJson] = useState(false);

  const fetchRawJson = async (venueId: string) => {
    if (expandedSource === venueId) {
      setExpandedSource(null);
      setRawJson(null);
      return;
    }

    setLoadingJson(true);
    setExpandedSource(venueId);
    try {
      const response = await fetch(`${API_BASE}/api/raw/${venueId}`);
      if (response.ok) {
        const data = await response.json();
        setRawJson(data);
      } else {
        setRawJson({ error: "Failed to fetch raw data" });
      }
    } catch {
      setRawJson({ error: "API not available" });
    }
    setLoadingJson(false);
  };
  const getTimeSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "less than an hour ago";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  };

  return (
    <div>
      {/* API Status */}
      <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
        apiConnected
          ? "bg-green-900/30 border border-green-700"
          : "bg-yellow-900/30 border border-yellow-700"
      }`}>
        <span className={`w-3 h-3 rounded-full ${apiConnected ? "bg-green-500" : "bg-yellow-500"}`} />
        <span className={apiConnected ? "text-green-300" : "text-yellow-300"}>
          {apiConnected
            ? "API Connected - Scraping enabled"
            : "API Offline - Run ./scripts/dev.sh to enable scraping"}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          Last updated: {getTimeSince(lastUpdated)}
        </div>
        <button
          onClick={onScrapeAll}
          disabled={!apiConnected || isScrapingAll || scrapingVenue !== null}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isScrapingAll ? (
            <>
              <span className="animate-spin">↻</span>
              Scraping All...
            </>
          ) : (
            "Scrape All"
          )}
        </button>
      </div>

      <div className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="border border-gray-700 rounded-lg p-4 bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    source.status === "ok" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium text-white">{source.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {source.eventCount} events
                </span>
                <button
                  onClick={() => onScrapeVenue(source.id)}
                  disabled={!apiConnected || isScrapingAll || scrapingVenue !== null}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scrapingVenue === source.id ? (
                    <span className="animate-spin inline-block">↻</span>
                  ) : (
                    "Scrape"
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-400">
              Last scraped: {getTimeSince(source.lastScraped)}
            </div>

            {source.error && (
              <div className="mt-2 text-sm text-red-400 bg-red-900/30 p-2 rounded">
                {source.error}
              </div>
            )}

            {/* View Raw JSON Button */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <button
                onClick={() => fetchRawJson(source.id)}
                disabled={!apiConnected}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {expandedSource === source.id ? "Hide Raw JSON" : "View Raw JSON"}
              </button>

              {expandedSource === source.id && (
                <div className="mt-3">
                  {loadingJson ? (
                    <div className="text-gray-400 text-sm">Loading...</div>
                  ) : (
                    <pre className="bg-gray-900 p-3 rounded-lg text-xs text-gray-300 overflow-auto max-h-96">
                      {JSON.stringify(rawJson, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
