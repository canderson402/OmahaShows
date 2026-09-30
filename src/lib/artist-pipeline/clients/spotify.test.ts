import { describe, expect, test, vi } from "vitest";
import { createSpotifyClient, SpotifyError, spotifyArtistUrl } from "./spotify";

function fakeFetch(routes: Record<string, { status?: number; body: unknown }>) {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    const key = Object.keys(routes).find((k) => u.includes(k));
    if (!key) throw new Error(`unexpected ${u}`);
    const { status = 200, body } = routes[key];
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
}

const token = { access_token: "t", token_type: "bearer", expires_in: 3600 };

describe("spotify client", () => {
  test("searchArtists maps results and caps limit at 10", async () => {
    const f = fakeFetch({
      "accounts.spotify.com": { body: token },
      "type=artist": { body: { artists: { items: [
        { id: "a1", name: "Surfer Girl", genres: ["nebraska indie"], images: [{ url: "img", height: 1, width: 1 }] },
      ] } } },
    });
    const c = createSpotifyClient({ clientId: "id", clientSecret: "s", fetch: f });
    const res = await c.searchArtists("Surfer Girl");
    expect(res).toEqual([{ id: "a1", name: "Surfer Girl", genres: ["nebraska indie"], imageUrl: "img" }]);
    const searchUrl = String((f as any).mock.calls.find((c: any[]) => String(c[0]).includes("type=artist"))[0]);
    expect(searchUrl).toContain("limit=10");
  });

  test("albumTitles formats title and year", async () => {
    const f = fakeFetch({
      "accounts.spotify.com": { body: token },
      "type=album": { body: { albums: { items: [{ name: "Ocean", release_date: "2023-05-01" }] } } },
    });
    const c = createSpotifyClient({ clientId: "id", clientSecret: "s", fetch: f });
    expect(await c.albumTitles("Surfer Girl")).toEqual(["Ocean (2023)"]);
  });

  test("non-OK responses throw SpotifyError with status (not an empty result)", async () => {
    const f = fakeFetch({
      "accounts.spotify.com": { body: token },
      "type=artist": { status: 403, body: { error: { message: "premium required" } } },
    });
    const c = createSpotifyClient({ clientId: "id", clientSecret: "s", fetch: f });
    await expect(c.searchArtists("x")).rejects.toMatchObject({ status: 403 });
    await expect(c.searchArtists("x")).rejects.toBeInstanceOf(SpotifyError);
  });

  test("url builder", () => expect(spotifyArtistUrl("abc")).toBe("https://open.spotify.com/artist/abc"));
});
