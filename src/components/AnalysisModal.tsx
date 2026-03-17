// src/components/AnalysisModal.tsx
"use client";

interface ArtistAnalysis {
  name: string;
  role: "headliner" | "supporting" | "co-headliner";
  genres: string[];
  spotify_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
}

interface AnalysisResult {
  artists: ArtistAnalysis[];
  duplicate_of: string | null;
  duplicate_confidence: "high" | "medium" | "low" | null;
}

interface AnalysisModalProps {
  eventId: string;
  eventTitle: string;
  result: AnalysisResult;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function AnalysisModal({
  eventTitle,
  result,
  onAccept,
  onReject,
  isLoading,
}: AnalysisModalProps) {
  const hasDuplicate = result.duplicate_of !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
          <button
            onClick={onReject}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Event Title */}
          <div className="text-sm text-gray-400">
            Event: <span className="text-white">{eventTitle}</span>
          </div>

          {/* Duplicate Warning */}
          {hasDuplicate && (
            <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Potential Duplicate
              </div>
              <p className="mt-1 text-sm text-gray-300">
                This may match: <span className="text-white">{result.duplicate_of}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Confidence: {result.duplicate_confidence}
              </p>
            </div>
          )}

          {/* Artists */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Artists</h4>
            <div className="space-y-3">
              {result.artists.map((artist, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{artist.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                      {artist.role}
                    </span>
                  </div>
                  {artist.genres.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {artist.genres.map((genre, gIdx) => (
                        <span
                          key={gIdx}
                          className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 space-y-1">
                    {artist.spotify_url && (
                      <a
                        href={artist.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:underline block truncate"
                      >
                        Spotify: {artist.spotify_url}
                      </a>
                    )}
                    {artist.instagram_url && (
                      <a
                        href={artist.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-pink-400 hover:underline block truncate"
                      >
                        Instagram: {artist.instagram_url}
                      </a>
                    )}
                    {artist.website_url && (
                      <a
                        href={artist.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline block truncate"
                      >
                        Website: {artist.website_url}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duplicate Check Result */}
          {!hasDuplicate && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No duplicates found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Saving..." : hasDuplicate ? "Accept Anyway" : "Accept All"}
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {hasDuplicate ? "Skip (Duplicate)" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
