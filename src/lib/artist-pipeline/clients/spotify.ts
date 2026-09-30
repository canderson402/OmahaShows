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

  async function token(): Promise<string> {
    if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;
    const res = await f("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${opts.clientId}:${opts.clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) throw new SpotifyError(`Spotify auth failed`, res.status);
    const data = (await res.json()) as { access_token: string; expires_in: number };
    cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return cached.token;
  }

  async function get<T>(path: string): Promise<T> {
    const res = await f(`https://api.spotify.com/v1/${path}`, { headers: { Authorization: `Bearer ${await token()}` } });
    if (!res.ok) throw new SpotifyError(`Spotify ${path} failed`, res.status);
    return (await res.json()) as T;
  }

  return {
    async searchArtists(query) {
      type R = { artists: { items: { id: string; name: string; genres?: string[]; images?: { url: string }[] }[] } };
      const data = await get<R>(`search?type=artist&limit=10&q=${encodeURIComponent(query)}`);
      return data.artists.items.map((a) => ({
        id: a.id, name: a.name, genres: a.genres ?? [], imageUrl: a.images?.[0]?.url ?? null,
      }));
    },
    async albumTitles(artistName) {
      type R = { albums: { items: { name: string; release_date?: string }[] } };
      const q = encodeURIComponent(`artist:"${artistName}"`);
      const data = await get<R>(`search?type=album&limit=5&q=${q}`);
      return data.albums.items.map((a) => `${a.name} (${(a.release_date ?? "").slice(0, 4) || "?"})`);
    },
  };
}
