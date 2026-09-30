import { expect, test, vi } from "vitest";
import { createYouTubeClient, QuotaExceededError, YouTubeError } from "./youtube";

function fakeFetch() {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    if (u.includes("/search?")) {
      return new Response(JSON.stringify({ items: [{ id: { channelId: "UC1" } }, { id: { channelId: "UC2" } }] }));
    }
    if (u.includes("/channels?")) {
      return new Response(JSON.stringify({ items: [
        { id: "UC1", snippet: { title: "South Summit - Topic", description: "", customUrl: null }, statistics: { subscriberCount: "120" } },
        { id: "UC2", snippet: { title: "South Summit", description: "Omaha band", customUrl: "@southsummit" }, statistics: {} },
      ] }));
    }
    throw new Error(u);
  }) as unknown as typeof fetch;
}

test("search + channel details, units counted (100 + 1)", async () => {
  const yt = createYouTubeClient({ apiKey: "k", fetch: fakeFetch() });
  const res = await yt.searchChannels("South Summit");
  expect(res.map((c) => c.id)).toEqual(["UC1", "UC2"]);
  expect(res[0].subscriberCount).toBe(120);
  expect(res[1].subscriberCount).toBeNull();
  expect(yt.unitsUsed()).toBe(101);
});

test("throws QuotaExceededError before calling when budget would be exceeded", async () => {
  const f = fakeFetch();
  const yt = createYouTubeClient({ apiKey: "k", fetch: f, dailyBudgetUnits: 150 });
  await yt.searchChannels("a");
  await expect(yt.searchChannels("b")).rejects.toBeInstanceOf(QuotaExceededError);
  expect((f as any).mock.calls.length).toBe(2);
});

test("API quotaExceeded 403 becomes QuotaExceededError", async () => {
  const f = vi.fn(async () => new Response(JSON.stringify({ error: { errors: [{ reason: "quotaExceeded" }] } }), { status: 403 })) as unknown as typeof fetch;
  const yt = createYouTubeClient({ apiKey: "k", fetch: f });
  await expect(yt.searchChannels("a")).rejects.toBeInstanceOf(QuotaExceededError);
});

test("fetch rejection becomes YouTubeError with status 0", async () => {
  const f = vi.fn(async () => { throw new TypeError("network down"); }) as unknown as typeof fetch;
  const yt = createYouTubeClient({ apiKey: "k", fetch: f });
  const err = await yt.searchChannels("a").catch((e) => e);
  expect(err).toBeInstanceOf(YouTubeError);
  expect(err.status).toBe(0);
});

test("200 with malformed JSON becomes YouTubeError with status 0", async () => {
  const f = vi.fn(async () => new Response("<html>not json")) as unknown as typeof fetch;
  const yt = createYouTubeClient({ apiKey: "k", fetch: f });
  const err = await yt.searchChannels("a").catch((e) => e);
  expect(err).toBeInstanceOf(YouTubeError);
  expect(err.status).toBe(0);
});

test("200 with unexpected shape becomes YouTubeError with status 0", async () => {
  const f = vi.fn(async () => new Response(JSON.stringify({}))) as unknown as typeof fetch;
  const yt = createYouTubeClient({ apiKey: "k", fetch: f });
  const err = await yt.searchChannels("a").catch((e) => e);
  expect(err).toBeInstanceOf(YouTubeError);
  expect(err.status).toBe(0);
});
