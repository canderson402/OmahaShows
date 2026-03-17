import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { GENRES, GENRE_LABELS, Genre } from "../lib/genres";

interface Artist {
  id: string;
  name: string;
  normalized_name: string;
  genres: string[];
  spotify_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  image_url: string | null;
  created_at: string;
}

interface ArtistForm {
  name: string;
  genres: string[];
  spotify_url: string;
  instagram_url: string;
  website_url: string;
  image_url: string;
}

const DEFAULT_FORM: ArtistForm = {
  name: "",
  genres: [],
  spotify_url: "",
  instagram_url: "",
  website_url: "",
  image_url: "",
};

function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/i, "")
    .trim();
}

export function ArtistManagement() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [form, setForm] = useState<ArtistForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .order("name");

    if (error) {
      console.error("Failed to fetch artists:", error);
      return;
    }

    setArtists(data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchArtists();
      setLoading(false);
    };
    load();
  }, [fetchArtists]);

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch = !search.trim() ||
      artist.name.toLowerCase().includes(search.toLowerCase()) ||
      artist.normalized_name.includes(search.toLowerCase());

    const matchesGenre = !genreFilter || artist.genres?.includes(genreFilter);

    return matchesSearch && matchesGenre;
  });

  const openAddModal = () => {
    setEditingArtist(null);
    setForm(DEFAULT_FORM);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setForm({
      name: artist.name,
      genres: artist.genres || [],
      spotify_url: artist.spotify_url || "",
      instagram_url: artist.instagram_url || "",
      website_url: artist.website_url || "",
      image_url: artist.image_url || "",
    });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingArtist(null);
    setForm(DEFAULT_FORM);
    setError(null);
  };

  const updateForm = (field: keyof ArtistForm, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre: string) => {
    if (form.genres.includes(genre)) {
      updateForm("genres", form.genres.filter((g) => g !== genre));
    } else {
      updateForm("genres", [...form.genres, genre]);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingArtist) {
        const { error } = await supabase
          .from("artists")
          .update({
            name: form.name.trim(),
            normalized_name: normalizeArtistName(form.name),
            genres: form.genres,
            spotify_url: form.spotify_url.trim() || null,
            instagram_url: form.instagram_url.trim() || null,
            website_url: form.website_url.trim() || null,
            image_url: form.image_url.trim() || null,
          })
          .eq("id", editingArtist.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("artists").insert({
          name: form.name.trim(),
          normalized_name: normalizeArtistName(form.name),
          genres: form.genres,
          spotify_url: form.spotify_url.trim() || null,
          instagram_url: form.instagram_url.trim() || null,
          website_url: form.website_url.trim() || null,
          image_url: form.image_url.trim() || null,
        });

        if (error) {
          if (error.code === "23505") {
            throw new Error(`An artist with this name already exists`);
          }
          throw error;
        }
      }

      await fetchArtists();
      closeModal();
    } catch (err) {
      console.error("Failed to save artist:", err);
      setError(err instanceof Error ? err.message : "Failed to save artist");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingArtist || !confirm("Are you sure you want to delete this artist?")) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("artists")
        .delete()
        .eq("id", editingArtist.id);

      if (error) throw error;

      await fetchArtists();
      closeModal();
    } catch (err) {
      console.error("Failed to delete artist:", err);
      setError(err instanceof Error ? err.message : "Failed to delete artist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">
          {artists.length} artist{artists.length !== 1 ? "s" : ""} total
        </p>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg hover:from-amber-400 hover:to-rose-400 transition-all"
        >
          + Add Artist
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
        </div>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500"
        >
          <option value="">All Genres</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {GENRE_LABELS[genre]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {search || genreFilter ? "No artists match your search." : "No artists found."}
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => openEditModal(artist)}
              className="flex items-center gap-3 py-3 hover:bg-white/5 cursor-pointer transition-colors -mx-2 px-2"
            >
              {/* Image */}
              <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {artist.image_url ? (
                  <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-600 text-lg">&#9834;</span>
                )}
              </div>

              {/* Name */}
              <span className="text-white font-medium flex-1 truncate">
                {artist.name}
              </span>

              {/* Genres */}
              <div className="hidden sm:flex gap-1 flex-shrink-0">
                {artist.genres?.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded"
                  >
                    {GENRE_LABELS[genre as Genre] || genre}
                  </span>
                ))}
                {artist.genres?.length > 3 && (
                  <span className="text-xs text-gray-500">+{artist.genres.length - 3}</span>
                )}
              </div>

              {/* Links indicator */}
              <div className="flex gap-1 flex-shrink-0">
                {artist.spotify_url && (
                  <span className="w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center" title="Spotify">
                    <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </span>
                )}
                {artist.instagram_url && (
                  <span className="w-5 h-5 rounded-full bg-pink-600/20 flex items-center justify-center" title="Instagram">
                    <svg className="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </span>
                )}
                {artist.website_url && (
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center" title="Website">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80"
          onClick={closeModal}
        >
          <div
            className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-gray-900 border-t sm:border border-gray-700 rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {editingArtist ? "Edit Artist" : "Add Artist"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
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
                  placeholder="e.g. The Killers"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Genres */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Genres</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        form.genres.includes(genre)
                          ? "bg-amber-500/30 text-amber-400 border border-amber-500/50"
                          : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {GENRE_LABELS[genre]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spotify URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Spotify URL</label>
                <input
                  type="url"
                  value={form.spotify_url}
                  onChange={(e) => updateForm("spotify_url", e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Instagram URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={form.instagram_url}
                  onChange={(e) => updateForm("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => updateForm("website_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => updateForm("image_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                />
                {form.image_url && (
                  <div className="mt-2">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-full bg-gray-800"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>

              {editingArtist && (
                <div className="text-xs text-gray-500">
                  ID: {editingArtist.id}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              {editingArtist ? (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
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
                  {saving ? "Saving..." : editingArtist ? "Save Changes" : "Create Artist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
