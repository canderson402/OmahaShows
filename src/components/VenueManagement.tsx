import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// Generate venue ID from name
function generateVenueId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/^-|-$/g, '');
}

// Color palette for auto-generation (warm/cool tones that work well together)
const COLOR_PALETTE = [
  "#f59e0b", // amber
  "#f97316", // orange
  "#f43f5e", // rose
  "#ec4899", // pink
  "#d946ef", // fuchsia
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#ef4444", // red
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
];

// Convert hex to rgba for background with opacity
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Venue type matching database schema
interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  website_url: string | null;
  color_bg: string | null;
  color_text: string | null;
  color_border: string | null;
  active: boolean;
}

// Form state for editing/creating venues
interface VenueForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  website_url: string;
  hexColor: string;
  active: boolean;
}

const DEFAULT_FORM: VenueForm = {
  name: "",
  description: "",
  address: "",
  city: "Omaha",
  state: "NE",
  website_url: "",
  hexColor: "#6b7280",
  active: true,
};

// Extract hex from existing Tailwind class or return default
function extractHexFromTailwind(colorClass: string | null): string {
  if (!colorClass) return "#6b7280";
  // Match arbitrary hex like bg-[#f59e0b]/20 or text-[#f59e0b]
  const match = colorClass.match(/#[0-9a-fA-F]{6}/);
  if (match) return match[0];
  // Map known Tailwind colors
  const tailwindToHex: Record<string, string> = {
    amber: "#f59e0b", orange: "#f97316", rose: "#f43f5e", pink: "#ec4899",
    fuchsia: "#d946ef", purple: "#a855f7", cyan: "#06b6d4", teal: "#14b8a6",
    indigo: "#6366f1", lime: "#84cc16", emerald: "#10b981", sky: "#0ea5e9",
    gray: "#6b7280", red: "#ef4444", yellow: "#eab308", green: "#22c55e",
    blue: "#3b82f6", violet: "#8b5cf6",
  };
  for (const [name, hex] of Object.entries(tailwindToHex)) {
    if (colorClass.includes(name)) return hex;
  }
  return "#6b7280";
}

export function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState<VenueForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all venues (including inactive)
  const fetchVenues = useCallback(async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("name");

    if (error) {
      console.error("Failed to fetch venues:", error);
      return;
    }

    setVenues(data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchVenues();
      setLoading(false);
    };
    load();
  }, [fetchVenues]);

  // Filter venues by search
  const filteredVenues = venues.filter((venue) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      venue.name.toLowerCase().includes(searchLower) ||
      venue.id.toLowerCase().includes(searchLower) ||
      venue.address?.toLowerCase().includes(searchLower) ||
      venue.city.toLowerCase().includes(searchLower)
    );
  });

  // Open modal for adding new venue
  const openAddModal = () => {
    setEditingVenue(null);
    setForm(DEFAULT_FORM);
    setError(null);
    setModalOpen(true);
  };

  // Open modal for editing existing venue
  const openEditModal = (venue: Venue) => {
    setEditingVenue(venue);
    setForm({
      name: venue.name,
      description: venue.description || "",
      address: venue.address || "",
      city: venue.city,
      state: venue.state,
      website_url: venue.website_url || "",
      hexColor: extractHexFromTailwind(venue.color_text),
      active: venue.active,
    });
    setError(null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingVenue(null);
    setForm(DEFAULT_FORM);
    setError(null);
  };

  // Update form field
  const updateForm = (field: keyof VenueForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Save venue (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    // Generate ID from name for new venues
    const venueId = editingVenue ? editingVenue.id : generateVenueId(form.name);
    // Use form hex color, generate Tailwind-style classes
    const hex = form.hexColor;

    const venueData = {
      id: venueId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      website_url: form.website_url.trim() || null,
      color_bg: `bg-[${hex}]/20`,
      color_text: `text-[${hex}]`,
      color_border: `border-[${hex}]`,
      active: form.active,
    };

    try {
      if (editingVenue) {
        // Update existing venue
        const { error } = await supabase
          .from("venues")
          .update({
            name: venueData.name,
            description: venueData.description,
            address: venueData.address,
            city: venueData.city,
            state: venueData.state,
            website_url: venueData.website_url,
            color_bg: venueData.color_bg,
            color_text: venueData.color_text,
            color_border: venueData.color_border,
            active: venueData.active,
          })
          .eq("id", editingVenue.id);

        if (error) throw error;
      } else {
        // Create new venue
        const { error } = await supabase.from("venues").insert(venueData);

        if (error) {
          if (error.code === "23505") {
            throw new Error(`A venue with ID "${venueId}" already exists`);
          }
          throw error;
        }
      }

      await fetchVenues();
      closeModal();
    } catch (err) {
      console.error("Failed to save venue:", err);
      setError(err instanceof Error ? err.message : "Failed to save venue");
    } finally {
      setSaving(false);
    }
  };

  // Get color classes for a venue
  const getVenueColors = (venue: Venue) => {
    return {
      bg: venue.color_bg || "bg-gray-500/20",
      text: venue.color_text || "text-gray-400",
      border: venue.color_border || "border-gray-500",
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">
          {venues.length} venue{venues.length !== 1 ? "s" : ""} total
        </p>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
        >
          + Add Venue
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {search ? "No venues match your search." : "No venues found."}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredVenues.map((venue) => {
            const colors = getVenueColors(venue);
            return (
              <div
                key={venue.id}
                onClick={() => openEditModal(venue)}
                className="flex items-center gap-3 py-3 px-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                {/* Venue ID badge with color */}
                <span
                  className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} flex-shrink-0 min-w-[100px] text-center`}
                >
                  {venue.id}
                </span>

                {/* Venue name */}
                <span className="text-white font-medium flex-1 truncate">
                  {venue.name}
                </span>

                {/* Address */}
                <span className="text-gray-500 text-sm truncate max-w-[200px] hidden md:block">
                  {venue.address ? `${venue.address}, ${venue.city}` : venue.city}
                </span>

                {/* Active status */}
                <span
                  className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                    venue.active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {venue.active ? "Active" : "Inactive"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] bg-gray-900 border border-gray-700 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {editingVenue ? "Edit Venue" : "Add Venue"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. The Slowdown"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
                {editingVenue && (
                  <p className="text-xs text-gray-500 mt-1">ID: {editingVenue.id}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="e.g. 729 N 14th St"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    placeholder="Omaha"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    placeholder="NE"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => updateForm("website_url", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Color</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="color"
                      value={form.hexColor}
                      onChange={(e) => updateForm("hexColor", e.target.value)}
                      className="w-12 h-10 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.hexColor}
                      onChange={(e) => updateForm("hexColor", e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => updateForm("hexColor", COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)])}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
                {/* Preview */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Preview:</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: hexToRgba(form.hexColor, 0.2),
                      color: form.hexColor,
                      borderColor: form.hexColor,
                    }}
                  >
                    {editingVenue?.id || generateVenueId(form.name) || "venue-id"}
                  </span>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="block text-sm text-white">Active</label>
                  <p className="text-xs text-gray-500">
                    Inactive venues are hidden from public view
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("active", !form.active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.active ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-800">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editingVenue ? "Save Changes" : "Create Venue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
