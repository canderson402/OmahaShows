// src/lib/spotify.ts

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
}

interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
}

export interface SpotifyArtistResult {
  spotify_url: string;
  image_url: string | null;
  spotify_genres: string[];
}

// Cache the token to avoid unnecessary requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function searchArtist(artistName: string): Promise<SpotifyArtistResult | null> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Spotify search failed for "${artistName}": ${response.status}`);
      return null;
    }

    const data = (await response.json()) as SpotifySearchResponse;

    if (data.artists.items.length === 0) {
      return null;
    }

    const artist = data.artists.items[0];

    return {
      spotify_url: artist.external_urls.spotify,
      image_url: artist.images.length > 0 ? artist.images[0].url : null,
      spotify_genres: artist.genres,
    };
  } catch (error) {
    console.error(`Spotify search error for "${artistName}":`, error);
    return null;
  }
}
