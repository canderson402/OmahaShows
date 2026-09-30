export interface SpotifyArtist { id: string; name: string; genres: string[]; imageUrl: string | null }
export interface SpotifyClient {
  searchArtists(query: string): Promise<SpotifyArtist[]>;
  albumTitles(artistName: string): Promise<string[]>;
}

export class SpotifyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const spotifyArtistUrl = (id: string) => `https://open.spotify.com/artist/${id}`;

export function createSpotifyClient(opts: { clientId: string; clientSecret: string; fetch?: typeof fetch }): SpotifyClient {
  const f = opts.fetch ?? fetch;
  let cached: { token: string; expiresAt: number } | null = null;

  // Network and parse failures are typed (status 0) so callers can retry instead of crashing.
  async function request<T>(url: string, init: RequestInit, what: string): Promise<T> {
    let res: Response;
    try {
      res = await f(url, init);
    } catch {
      throw new SpotifyError(`Spotify ${what} request failed (network)`, 0);
    }
    if (!res.ok) throw new SpotifyError(`Spotify ${what} failed`, res.status);
    try {
      return (await res.json()) as T;
    } catch {
      throw new SpotifyError(`Spotify ${what} returned unparseable JSON`, 0);
    }
  }

  async function token(): Promise<string> {
    if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;
    const data = await request<{ access_token: string; expires_in: number }>("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${opts.clientId}:${opts.clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    }, "auth");
    if (typeof data?.access_token !== "string" || typeof data.expires_in !== "number") {
      throw new SpotifyError("Spotify auth returned unexpected shape", 0);
    }
    cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return cached.token;
  }

  async function get<T>(path: string): Promise<T> {
    return request<T>(`https://api.spotify.com/v1/${path}`, { headers: { Authorization: `Bearer ${await token()}` } }, path);
  }

  return {
    async searchArtists(query) {
      type R = { artists: { items: { id: string; name: string; genres?: string[]; images?: { url: string }[] }[] } };
      const data = await get<R>(`search?type=artist&limit=10&q=${encodeURIComponent(query)}`);
      if (!Array.isArray(data?.artists?.items)) throw new SpotifyError("Spotify artist search returned unexpected shape", 0);
      return data.artists.items.map((a) => ({
        id: a.id, name: a.name, genres: a.genres ?? [], imageUrl: a.images?.[0]?.url ?? null,
      }));
    },
    async albumTitles(artistName) {
      type R = { albums: { items: { name: string; release_date?: string }[] } };
      const q = encodeURIComponent(`artist:"${artistName}"`);
      const data = await get<R>(`search?type=album&limit=5&q=${q}`);
      if (!Array.isArray(data?.albums?.items)) throw new SpotifyError("Spotify album search returned unexpected shape", 0);
      return data.albums.items.map((a) => `${a.name} (${(a.release_date ?? "").slice(0, 4) || "?"})`);
    },
  };
}
