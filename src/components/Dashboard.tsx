// web/src/components/Dashboard.tsx
import { useState } from "react";
import type { SourceStatus, Event, HistoricalShow } from "../types";

interface DashboardProps {
  sources: SourceStatus[];
  lastUpdated: string;
  events?: Event[];
  historyShows?: HistoricalShow[];
}

export function Dashboard({
  sources,
  lastUpdated,
  events = [],
  historyShows = []
}: DashboardProps) {
  const [showEventsJson, setShowEventsJson] = useState(false);
  const [showHistoryJson, setShowHistoryJson] = useState(false);

  const getTimeSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "less than an hour ago";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  };

  const totalEvents = sources.reduce((sum, s) => sum + s.eventCount, 0);
  const successCount = sources.filter(s => s.status === "ok").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Scraper Dashboard</h2>
        <p className="text-sm text-gray-400">
          Read-only view. Scrapers run daily via GitHub Actions.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalEvents}</div>
          <div className="text-xs text-gray-400">Total Events</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{sources.length}</div>
          <div className="text-xs text-gray-400">Venues</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${successCount === sources.length ? "text-green-400" : "text-yellow-400"}`}>
            {successCount}/{sources.length}
          </div>
          <div className="text-xs text-gray-400">Healthy</div>
        </div>
      </div>

      <div className="text-sm text-gray-400 mb-4">
        Last updated: {getTimeSince(lastUpdated)}
      </div>

      {/* Source Status List */}
      <div className="space-y-3">
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
              <span className="text-sm text-gray-400">
                {source.eventCount} events
              </span>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Last scraped: {getTimeSince(source.lastScraped)}
            </div>

            {source.error && (
              <div className="mt-2 text-sm text-red-400 bg-red-900/30 p-2 rounded">
                {source.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* JSON Viewers */}
      <div className="mt-6 pt-4 border-t border-gray-700 space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Raw Data</h3>

        {/* Events JSON */}
        <div>
          <button
            onClick={() => setShowEventsJson(!showEventsJson)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showEventsJson ? "Hide" : "Show"} events.json ({events.length} events)
          </button>
          {showEventsJson && (
            <pre className="mt-2 bg-gray-900 p-3 rounded-lg text-xs text-gray-300 overflow-auto max-h-96">
              {JSON.stringify(events, null, 2)}
            </pre>
          )}
        </div>

        {/* History JSON */}
        <div>
          <button
            onClick={() => setShowHistoryJson(!showHistoryJson)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showHistoryJson ? "Hide" : "Show"} history.json ({historyShows.length} shows)
          </button>
          {showHistoryJson && (
            <pre className="mt-2 bg-gray-900 p-3 rounded-lg text-xs text-gray-300 overflow-auto max-h-96">
              {JSON.stringify(historyShows, null, 2)}
            </pre>
          )}
        </div>
      </div>

    </div>
  );
}
