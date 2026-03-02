// web/src/components/SubmitShow.tsx
import { useState, useMemo } from "react";
import type { Event } from "../types";
import { VENUE_COLORS } from "../App";
import { EventCardCompact } from "./EventCardCompact";

interface SubmitShowProps {
  onBack?: () => void;
  embedded?: boolean;
}

const VENUES = [
  { id: "theslowdown", name: "The Slowdown" },
  { id: "waitingroom", name: "Waiting Room Lounge" },
  { id: "reverblounge", name: "Reverb Lounge" },
  { id: "bourbontheatre", name: "Bourbon Theatre" },
  { id: "admiral", name: "Admiral" },
  { id: "astrotheater", name: "The Astro" },
  { id: "steelhouse", name: "Steelhouse Omaha" },
  { id: "holland", name: "Holland Center" },
  { id: "orpheum", name: "Orpheum Theater" },
  { id: "barnato", name: "Barnato" },
  { id: "other", name: "Other Venue" },
];

// Common show times
const TIME_PRESETS = [
  { label: "6 PM", value: "18:00" },
  { label: "7 PM", value: "19:00" },
  { label: "8 PM", value: "20:00" },
  { label: "9 PM", value: "21:00" },
  { label: "10 PM", value: "22:00" },
];

export function SubmitShow({ onBack, embedded = false }: SubmitShowProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [customVenue, setCustomVenue] = useState("");
  const [eventUrl, setEventUrl] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [supportingArtists, setSupportingArtists] = useState("");
  const [copied, setCopied] = useState(false);
  const [submissions, setSubmissions] = useState<Event[]>([]);

  const selectedVenue = VENUES.find(v => v.id === venueId);
  const venueName = venueId === "other" ? customVenue : (selectedVenue?.name || "");
  const effectiveTime = time || customTime;

  // Generate event ID
  const generateId = () => {
    if (!title || !date || !venueId) return "";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    return `manual-${date}-${slug}`;
  };

  // Build the event object
  const eventPreview: Event | null = useMemo(() => {
    if (!title || !date || !venueId) return null;

    const event: Event = {
      id: generateId(),
      title: title.trim(),
      date,
      venue: venueName,
      source: venueId === "other" ? "other" : venueId,
    };

    if (effectiveTime) event.time = effectiveTime;
    if (eventUrl) event.eventUrl = eventUrl;
    if (ticketUrl) event.ticketUrl = ticketUrl;
    if (imageUrl) event.imageUrl = imageUrl;
    if (price) event.price = price;
    if (ageRestriction) event.ageRestriction = ageRestriction;
    if (supportingArtists.trim()) {
      event.supportingArtists = supportingArtists.split(",").map(s => s.trim()).filter(Boolean);
    }

    return event;
  }, [title, date, effectiveTime, venueId, venueName, eventUrl, ticketUrl, imageUrl, price, ageRestriction, supportingArtists]);

  const handleAddToQueue = () => {
    if (!eventPreview) return;
    setSubmissions(prev => [...prev, { ...eventPreview, addedAt: new Date().toISOString() }]);
    // Reset form
    setTitle("");
    setDate("");
    setTime("");
    setCustomTime("");
    setVenueId("");
    setCustomVenue("");
    setEventUrl("");
    setTicketUrl("");
    setImageUrl("");
    setPrice("");
    setAgeRestriction("");
    setSupportingArtists("");
  };

  const handleExportAll = () => {
    const json = JSON.stringify(submissions, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveFromQueue = (index: number) => {
    setSubmissions(prev => prev.filter((_, i) => i !== index));
  };

  const handleTimeSelect = (value: string) => {
    setTime(value);
    setCustomTime("");
  };

  const handleCustomTimeChange = (value: string) => {
    setCustomTime(value);
    setTime("");
  };

  const isValid = title && date && venueId && (venueId !== "other" || customVenue);

  const formContent = (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Show Details
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Artist / Event Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. The National, Local Band Showcase"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Time - Preset buttons + custom */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Time
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleTimeSelect(preset.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    time === preset.value
                      ? "bg-amber-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <div className="relative flex-1 min-w-[100px]">
                <input
                  type="time"
                  value={customTime}
                  onChange={e => handleCustomTimeChange(e.target.value)}
                  placeholder="Other"
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all [color-scheme:dark] ${
                    customTime
                      ? "bg-amber-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  } focus:outline-none focus:ring-1 focus:ring-amber-500/20`}
                />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Venue <span className="text-rose-400">*</span>
            </label>
            <select
              value={venueId}
              onChange={e => setVenueId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
            >
              <option value="">Select venue...</option>
              {VENUES.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Venue Name */}
          {venueId === "other" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Custom Venue Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={customVenue}
                onChange={e => setCustomVenue(e.target.value)}
                placeholder="e.g. O'Leaver's, The Sydney"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
          )}

          {/* URLs */}
          <div className="pt-2">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Links
            </h3>
            <div className="space-y-3">
              <input
                type="url"
                value={eventUrl}
                onChange={e => setEventUrl(e.target.value)}
                placeholder="Event page URL"
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
              />
              <input
                type="url"
                value={ticketUrl}
                onChange={e => setTicketUrl(e.target.value)}
                placeholder="Ticket purchase URL"
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
              />
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Event image URL"
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="pt-2">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Price (e.g. $25, Free)"
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
              />
              <input
                type="text"
                value={ageRestriction}
                onChange={e => setAgeRestriction(e.target.value)}
                placeholder="Age (e.g. 21+, All Ages)"
                className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
              />
            </div>
            <input
              type="text"
              value={supportingArtists}
              onChange={e => setSupportingArtists(e.target.value)}
              placeholder="Supporting artists (comma-separated)"
              className="w-full mt-3 px-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-4">
            <button
              onClick={handleAddToQueue}
              disabled={!isValid}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                isValid
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-amber-500/20"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add to Queue
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </h2>

          {eventPreview ? (
            <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#0c0c0e] -mx-2 px-2">
              <EventCardCompact
                event={eventPreview}
                venueColors={VENUE_COLORS}
              />
            </div>
          ) : (
            <div className="bg-gray-900/30 border border-gray-800/50 border-dashed rounded-xl p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-sm">Fill out the form to see a preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Queue */}
      {submissions.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Queue ({submissions.length})
            </h2>
            <button
              onClick={handleExportAll}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy All
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            {submissions.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center bg-gray-800 rounded px-2 py-1 min-w-[45px]">
                    <div className="text-[10px] text-gray-500 uppercase">
                      {new Date(event.date + 'T00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {new Date(event.date + 'T00:00').getDate()}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium">{event.title}</p>
                    <p className="text-gray-500 text-sm">{event.venue}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromQueue(index)}
                  className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // For embedded mode, just return the content
  if (embedded) {
    return <div className="pb-4">{formContent}</div>;
  }

  // For standalone mode, wrap with full page layout
  return (
    <div className="min-h-screen bg-texture">
      <div className="md:py-8">
        <div className="mx-auto md:px-4 max-w-5xl">
          <div className="content-container md:rounded-2xl p-6">
            {/* Header */}
            <div className="text-center mb-8 -mx-6 -mt-6 px-6 pt-6 pb-6 bg-[#050506] md:rounded-t-2xl border-b border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                {onBack ? (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-amber-400 text-xs font-medium tracking-wide uppercase">Admin</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  Submit
                </span>
                <span className="text-white ml-2">Show</span>
              </h1>
              <p className="text-gray-500 mt-2 text-sm">Manually add shows to the database</p>
            </div>

            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
}
