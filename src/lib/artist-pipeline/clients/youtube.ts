export interface YouTubeChannel { id: string; title: string; description: string; customUrl: string | null; subscriberCount: number | null }
export interface YouTubeClient { searchChannels(query: string): Promise<YouTubeChannel[]>; unitsUsed(): number }

export class QuotaExceededError extends Error {}
export class YouTubeError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const youtubeChannelUrl = (id: string) => `https://www.youtube.com/channel/${id}`;

const SEARCH_COST = 100;
const CHANNELS_COST = 1;

// Network, parse, and shape failures are typed (status 0) so callers can retry instead of crashing.
const unexpected = (what: string) => new YouTubeError(`YouTube ${what}`, 0);

export function createYouTubeClient(opts: { apiKey: string; dailyBudgetUnits?: number; fetch?: typeof fetch }): YouTubeClient {
  const f = opts.fetch ?? fetch;
  const budget = opts.dailyBudgetUnits ?? 9_000;
  let used = 0;

  async function get<T>(path: string, cost: number): Promise<T> {
    if (used + cost > budget) throw new QuotaExceededError(`YouTube budget ${budget} units reached`);
    const name = path.split("?")[0];
    let res: Response;
    try {
      res = await f(`https://www.googleapis.com/youtube/v3/${path}&key=${opts.apiKey}`);
    } catch {
      throw unexpected(`${name} request failed (network)`);
    }
    used += cost;
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: { errors?: { reason?: string }[] } };
      if (body.error?.errors?.some((e) => e.reason === "quotaExceeded")) throw new QuotaExceededError("YouTube quota exceeded");
      throw new YouTubeError(`YouTube ${name} failed`, res.status);
    }
    try {
      return (await res.json()) as T;
    } catch {
      throw unexpected(`${name} returned unparseable JSON`);
    }
  }

  return {
    unitsUsed: () => used,
    async searchChannels(query) {
      type S = { items: { id: { channelId: string } }[] };
      const s = await get<S>(`search?part=snippet&type=channel&maxResults=5&q=${encodeURIComponent(query)}`, SEARCH_COST);
      if (!Array.isArray(s?.items)) throw unexpected("search returned unexpected shape");
      const ids = s.items.map((i) => i?.id?.channelId);
      if (ids.some((id) => typeof id !== "string")) throw unexpected("search returned unexpected shape");
      if (ids.length === 0) return [];
      type C = { items: { id: string; snippet: { title: string; description?: string; customUrl?: string | null }; statistics?: { subscriberCount?: string } }[] };
      const c = await get<C>(`channels?part=snippet,statistics&id=${ids.join(",")}`, CHANNELS_COST);
      if (!Array.isArray(c?.items) || c.items.some((i) => typeof i?.snippet?.title !== "string")) {
        throw unexpected("channels returned unexpected shape");
      }
      const byId = new Map(c.items.map((i) => [i.id, i]));
      return ids.flatMap((id) => {
        const i = byId.get(id);
        if (!i) return [];
        const subs = i.statistics?.subscriberCount;
        return [{
          id, title: i.snippet.title, description: i.snippet.description ?? "",
          customUrl: i.snippet.customUrl ?? null, subscriberCount: subs ? Number(subs) : null,
        }];
      });
    },
  };
}
