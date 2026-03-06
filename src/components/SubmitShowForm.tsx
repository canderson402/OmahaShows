import { useState, useMemo, useRef, useCallback } from "react";
import type { Event } from "../types";
import { VENUE_COLORS } from "../App";
import { EventCardCompact } from "./EventCardCompact";
import { submitEvent, supabase, type SubmitEventData } from "../lib/supabase";
import { Toast } from "./Toast";

const VENUES = [
  { id: "theslowdown", name: "The Slowdown", url: "https://theslowdown.com" },
  { id: "waitingroom", name: "Waiting Room Lounge", url: "https://waitingroomlounge.com" },
  { id: "reverblounge", name: "Reverb Lounge", url: "https://reverblounge.com/" },
  { id: "bourbontheatre", name: "Bourbon Theatre", url: "https://bourbontheatre.com" },
  { id: "admiral", name: "Admiral", url: "https://admiralomaha.com" },
  { id: "astrotheater", name: "The Astro", url: "https://theastrotheater.com/" },
  { id: "steelhouse", name: "Steelhouse Omaha", url: "https://steelhouseomaha.com" },
  { id: "holland", name: "Holland Center", url: "https://o-pa.org/visit-our-venues/holland/" },
  { id: "orpheum", name: "Orpheum Theater", url: "https://o-pa.org/visit-our-venues/orpheum/" },
  { id: "barnato", name: "Barnato", url: "https://barnatoomaha.com" },
  { id: "other", name: "Other Venue" },
];

type ImageMode = "url" | "upload";

interface ValidationErrors {
  title?: string;
  date?: string;
  venue?: string;
  customVenue?: string;
  eventUrl?: string;
  ticketUrl?: string;
  imageUrl?: string;
  email?: string;
}

function isValidEmail(email: string): boolean {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  if (!url) return true;
  // Accept anything that looks like a URL (has a dot and no spaces)
  return url.includes('.') && !url.includes(' ');
}

function normalizeUrl(url: string): string {
  if (!url) return url;
  url = url.trim();
  // If no protocol, add https://
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function isValidDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr) return { valid: false, error: "Date is required" };
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return { valid: false, error: "Date cannot be in the past" };
  }
  return { valid: true };
}

export function SubmitShowForm() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customTime, setCustomTime] = useState("19:00");
  const [selectedHour, setSelectedHour] = useState<number | null>(7);
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [isPM, setIsPM] = useState(true);
  const [venueId, setVenueId] = useState("");
  const [customVenue, setCustomVenue] = useState("");
  const [otherVenueWebsite, setOtherVenueWebsite] = useState("");
  const [otherVenueAddress, setOtherVenueAddress] = useState("");
  const [eventUrl, setEventUrl] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [supportingArtists, setSupportingArtists] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const selectedVenue = VENUES.find(v => v.id === venueId);
  const venueName = venueId === "other" ? customVenue : (selectedVenue?.name || "");
  const effectiveTime = time || customTime;
  const effectiveImageUrl = imageMode === "upload" ? uploadedImage : imageUrl;

  // Validation
  const errors = useMemo<ValidationErrors>(() => {
    const errs: ValidationErrors = {};

    if (touched.title && !title.trim()) {
      errs.title = "Artist/event name is required";
    } else if (title.trim().length > 200) {
      errs.title = "Title must be under 200 characters";
    }

    if (touched.date) {
      const dateValidation = isValidDate(date);
      if (!dateValidation.valid) {
        errs.date = dateValidation.error;
      }
    }

    if (touched.venue && !venueId) {
      errs.venue = "Please select a venue";
    }

    if (touched.customVenue && venueId === "other" && !customVenue.trim()) {
      errs.customVenue = "Custom venue name is required";
    }

    if (touched.eventUrl && eventUrl && !isValidUrl(eventUrl)) {
      errs.eventUrl = "Please enter a valid URL";
    }

    if (touched.ticketUrl && ticketUrl && !isValidUrl(ticketUrl)) {
      errs.ticketUrl = "Please enter a valid URL";
    }

    if (touched.imageUrl && imageMode === "url" && imageUrl && !isValidUrl(imageUrl)) {
      errs.imageUrl = "Please enter a valid URL";
    }

    if (touched.email && submitterEmail && !isValidEmail(submitterEmail)) {
      errs.email = "Please enter a valid email address";
    }

    return errs;
  }, [title, date, venueId, customVenue, eventUrl, ticketUrl, imageUrl, imageMode, submitterEmail, touched]);

  const hasErrors = Object.keys(errors).length > 0;

  const generateId = () => {
    if (!title || !date || !venueId) return "";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    return `manual-${date}-${slug}`;
  };

  const eventPreview: Event | null = useMemo(() => {
    if (!title || !date || !venueId) return null;

    // Get venue URL - for "other" venues use the entered website, otherwise use static list
    const venueUrl = venueId === "other"
      ? (otherVenueWebsite && isValidUrl(otherVenueWebsite) ? normalizeUrl(otherVenueWebsite) : undefined)
      : selectedVenue?.url;

    const event: Event = {
      id: generateId(),
      title: title.trim(),
      date,
      venue: venueName,
      venueUrl,
      source: venueId === "other" ? "other" : venueId,
    };

    if (effectiveTime) event.time = effectiveTime;
    if (eventUrl) event.eventUrl = eventUrl;
    if (ticketUrl) event.ticketUrl = ticketUrl;
    if (effectiveImageUrl) event.imageUrl = effectiveImageUrl;
    if (price) event.price = price;
    if (ageRestriction) event.ageRestriction = ageRestriction;
    if (supportingArtists.trim()) {
      event.supportingArtists = supportingArtists.split(",").map(s => s.trim()).filter(Boolean);
    }

    return event;
  }, [title, date, effectiveTime, venueId, venueName, selectedVenue, otherVenueWebsite, eventUrl, ticketUrl, effectiveImageUrl, price, ageRestriction, supportingArtists]);

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSubmitStatus({ type: "error", message: "Please upload an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitStatus({ type: "error", message: "Image must be under 5MB" });
      return;
    }

    setUploading(true);
    setSubmitStatus(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const path = `event-images/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(path);

      setUploadedImage(publicUrl);
      setImageMode("upload");
    } catch (err) {
      console.error("Upload failed:", err);
      setSubmitStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to upload image"
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleSubmit = async () => {
    // Touch all fields to show validation
    setTouched({
      title: true,
      date: true,
      venue: true,
      customVenue: true,
      eventUrl: true,
      ticketUrl: true,
      imageUrl: true,
    });

    if (!eventPreview || hasErrors) return;

    // Final validation
    const dateCheck = isValidDate(date);
    if (!dateCheck.valid) {
      setSubmitStatus({ type: "error", message: dateCheck.error || "Invalid date" });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const data: SubmitEventData = {
        title: title.trim(),
        date,
        venueId: venueId === "other" ? "other" : venueId,
      };

      if (effectiveTime) data.time = effectiveTime;
      if (venueId === "other" && customVenue.trim()) {
        data.venueName = customVenue.trim();
        if (otherVenueWebsite && isValidUrl(otherVenueWebsite)) {
          data.otherVenueWebsite = normalizeUrl(otherVenueWebsite);
        }
        if (otherVenueAddress.trim()) {
          data.otherVenueAddress = otherVenueAddress.trim();
        }
      }
      if (eventUrl && isValidUrl(eventUrl)) data.eventUrl = normalizeUrl(eventUrl);
      if (ticketUrl && isValidUrl(ticketUrl)) data.ticketUrl = normalizeUrl(ticketUrl);
      if (effectiveImageUrl) data.imageUrl = normalizeUrl(effectiveImageUrl);
      if (price) data.price = price;
      if (ageRestriction) data.ageRestriction = ageRestriction;
      if (supportingArtists.trim()) {
        data.supportingArtists = supportingArtists.split(",").map(s => s.trim()).filter(Boolean);
      }
      if (submitterEmail && isValidEmail(submitterEmail)) {
        data.submitterEmail = submitterEmail;
      }

      await submitEvent(data);

      // Notify admin of new submission
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin-pending`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            type: "user_submission",
            submission: {
              title: title.trim(),
              date,
              venue: venueName,
              submitterEmail: submitterEmail || undefined,
            },
          }),
        });
      } catch (notifyError) {
        // Don't fail the submission if notification fails
        console.error("Failed to send admin notification:", notifyError);
      }

      setRecentSubmissions(prev => [title, ...prev.slice(0, 4)]);
      setSubmitStatus({ type: "success", message: `"${title}" submitted for review` });

      // Reset form
      setTitle("");
      setDate("");
      setTime("");
      setCustomTime("19:00");
      setSelectedHour(7);
      setSelectedMinute("00");
      setIsPM(true);
      setVenueId("");
      setCustomVenue("");
      setOtherVenueWebsite("");
      setOtherVenueAddress("");
      setEventUrl("");
      setTicketUrl("");
      setImageUrl("");
      setUploadedImage(null);
      setPrice("");
      setAgeRestriction("");
      setSupportingArtists("");
      setSubmitterEmail("");
      setTouched({});
    } catch (err) {
      console.error("Failed to submit:", err);
      setSubmitStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit event"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Convert hour/minute/AM-PM to 24-hour format
  const updateTimeFromSelectors = (hour: number, minute: string, pm: boolean) => {
    let h24 = hour;
    if (pm && hour !== 12) h24 = hour + 12;
    if (!pm && hour === 12) h24 = 0;
    const timeStr = `${h24.toString().padStart(2, "0")}:${minute}`;
    setTime("");
    setCustomTime(timeStr);
  };

  const handleAmPmToggle = (pm: boolean) => {
    setIsPM(pm);
    if (selectedHour !== null) {
      updateTimeFromSelectors(selectedHour, selectedMinute, pm);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValid = title && date && venueId && (venueId !== "other" || customVenue) && !hasErrors;

  return (
    <>
      {/* Preview on top */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </h2>

        {eventPreview ? (
          <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#0c0c0e] p-3">
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

      {/* Form Header */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pb-4 mb-5 border-b border-gray-800 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Show Details
      </h2>

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
        {/* Column 1: Core Details */}
        <div className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Artist / Event Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => handleBlur("title")}
              placeholder="Event or artist name"
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-600 focus:outline-none transition-all ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Venue <span className="text-rose-400">*</span>
            </label>
            <select
              value={venueId}
              onChange={e => setVenueId(e.target.value)}
              onBlur={() => handleBlur("venue")}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none transition-all appearance-none cursor-pointer ${
                errors.venue
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              }`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
            >
              <option value="">Select venue...</option>
              {VENUES.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {errors.venue && (
              <p className="text-red-400 text-xs mt-1">{errors.venue}</p>
            )}
          </div>

          {/* Custom Venue Name */}
          {venueId === "other" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Custom Venue Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customVenue}
                  onChange={e => setCustomVenue(e.target.value)}
                  onBlur={() => handleBlur("customVenue")}
                  placeholder="Venue name"
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-600 focus:outline-none transition-all ${
                    errors.customVenue
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                      : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                  }`}
                />
                {errors.customVenue && (
                  <p className="text-red-400 text-xs mt-1">{errors.customVenue}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Venue Website
                </label>
                <input
                  type="url"
                  value={otherVenueWebsite}
                  onChange={e => setOtherVenueWebsite(e.target.value)}
                  placeholder="e.g. venuename.com"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Venue Address
                </label>
                <input
                  type="text"
                  value={otherVenueAddress}
                  onChange={e => setOtherVenueAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Omaha, NE"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              onBlur={() => handleBlur("date")}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none transition-all [color-scheme:dark] ${
                errors.date
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-gray-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              }`}
            />
            {errors.date && (
              <p className="text-red-400 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Time
            </label>
            <div className="flex items-center gap-1">
              {/* Hour */}
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={selectedHour?.toString() ?? ""}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  if (val === '') {
                    setSelectedHour(null);
                    setTime("");
                    setCustomTime("");
                    return;
                  }
                  const num = parseInt(val);
                  if (num >= 0 && num <= 12) {
                    setSelectedHour(num);
                    if (num > 0) updateTimeFromSelectors(num, selectedMinute, isPM);
                    // Auto-advance to minutes when hour is complete:
                    // - Two digits entered (10, 11, 12), or
                    // - Single digit 2-9 (can't form valid 2-digit hour)
                    if (val.length === 2 || (val.length === 1 && num >= 2)) {
                      setTimeout(() => {
                        minuteInputRef.current?.focus();
                        minuteInputRef.current?.select();
                      }, 0);
                    }
                  }
                }}
                onBlur={e => {
                  const val = e.target.value;
                  if (val === '') return; // Allow empty
                  let num = parseInt(val) || 1;
                  if (num < 1) num = 1;
                  if (num > 12) num = 12;
                  setSelectedHour(num);
                  updateTimeFromSelectors(num, selectedMinute, isPM);
                }}
                className="w-14 px-2 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-lg font-medium focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="7"
              />
              <span className="text-gray-500 text-2xl font-light">:</span>
              {/* Minute */}
              <input
                ref={minuteInputRef}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={selectedMinute}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setSelectedMinute(val);
                  if (selectedHour) updateTimeFromSelectors(selectedHour, val.padStart(2, '0'), isPM);
                }}
                onBlur={e => {
                  let num = parseInt(e.target.value) || 0;
                  if (num > 59) num = 59;
                  const padded = num.toString().padStart(2, '0');
                  setSelectedMinute(padded);
                  if (selectedHour) updateTimeFromSelectors(selectedHour, padded, isPM);
                }}
                className="w-14 px-2 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-center text-lg font-medium focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="00"
              />
              {/* AM/PM Toggle */}
              <button
                type="button"
                onClick={() => handleAmPmToggle(!isPM)}
                className="ml-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all min-w-[52px]"
              >
                {isPM ? "PM" : "AM"}
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Image, Links, Additional Info */}
        <div className="space-y-5">
          {/* Image Upload/URL */}
          <div>
            <div className="flex items-start justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event Image
              </label>
              <div className="flex gap-1 p-0.5 bg-gray-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    imageMode === "upload"
                      ? "bg-gray-700 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    imageMode === "url"
                      ? "bg-gray-700 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  URL
                </button>
              </div>
            </div>

            {imageMode === "upload" ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-amber-500 bg-amber-500/10"
                    : uploadedImage
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-gray-700 hover:border-gray-600 bg-gray-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Uploading...</p>
                  </div>
                ) : uploadedImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <p className="text-green-400 text-sm">Image uploaded</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                      }}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-400 text-sm">
                      <span className="text-amber-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-gray-600 text-xs">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  onBlur={() => handleBlur("imageUrl")}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${
                    errors.imageUrl
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-800 focus:border-gray-600"
                  }`}
                />
                {errors.imageUrl && (
                  <p className="text-red-400 text-xs mt-1">{errors.imageUrl}</p>
                )}
              </div>
            )}
          </div>

          {/* URLs */}
          <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Event URL
                </label>
                <input
                  type="url"
                  value={eventUrl}
                  onChange={e => setEventUrl(e.target.value)}
                  onBlur={() => handleBlur("eventUrl")}
                  placeholder="https://..."
                  className={`w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${
                    errors.eventUrl
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-800 focus:border-gray-600"
                  }`}
                />
                {errors.eventUrl && (
                  <p className="text-red-400 text-xs mt-1">{errors.eventUrl}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Ticket URL
                </label>
                <input
                  type="url"
                  value={ticketUrl}
                  onChange={e => setTicketUrl(e.target.value)}
                  onBlur={() => handleBlur("ticketUrl")}
                  placeholder="https://..."
                  className={`w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${
                    errors.ticketUrl
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-800 focus:border-gray-600"
                  }`}
                />
                {errors.ticketUrl && (
                  <p className="text-red-400 text-xs mt-1">{errors.ticketUrl}</p>
                )}
              </div>
          </div>

          {/* Additional Details */}
          <div>
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

          {/* Email Notification */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Email (Optional - get notified when approved)
            </label>
            <input
              type="email"
              value={submitterEmail}
              onChange={e => setSubmitterEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="your@email.com - we'll notify you when approved"
              className={`w-full px-4 py-2.5 bg-gray-900/50 border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none transition-all ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-800 focus:border-gray-600"
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                isValid && !submitting
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-amber-500/20"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Show"
              )}
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">
              Shows go to pending status and require admin approval
            </p>
          </div>
        </div>

        {/* Recent Submissions */}
        {recentSubmissions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Just Submitted
            </h3>
            <div className="space-y-2">
              {recentSubmissions.map((title, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-400">{title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {submitStatus && (
        <Toast
          message={submitStatus.message}
          type={submitStatus.type}
          onClose={() => setSubmitStatus(null)}
        />
      )}
    </>
  );
}
