import type Anthropic from "@anthropic-ai/sdk";

// USD per million tokens (first-party API list prices). Cache reads bill at 0.1x input, cache writes at 1.25x.
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-opus-5-5": { input: 4, output: 20 },
};
const WEB_SEARCH_USD = 0.01; // $10 per 1,000 searches

interface UsageLike {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null } | null;
}

export interface UsageTotals {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  webSearches: number;
  costUsd: number;
  unpricedModels: string[];
}

export interface UsageMeter {
  record(model: string, usage: UsageLike | null | undefined): void;
  totals(): UsageTotals;
}

export function createUsageMeter(): UsageMeter {
  const t = { calls: 0, inputTokens: 0, outputTokens: 0, webSearches: 0, costUsd: 0 };
  const unpriced = new Set<string>();
  return {
    record(model, usage) {
      if (!usage) return;
      const input = usage.input_tokens ?? 0;
      const output = usage.output_tokens ?? 0;
      const cacheRead = usage.cache_read_input_tokens ?? 0;
      const cacheWrite = usage.cache_creation_input_tokens ?? 0;
      const searches = usage.server_tool_use?.web_search_requests ?? 0;
      t.calls++;
      t.inputTokens += input + cacheRead + cacheWrite;
      t.outputTokens += output;
      t.webSearches += searches;
      t.costUsd += searches * WEB_SEARCH_USD;
      const price = PRICES[model];
      if (!price) { unpriced.add(model); return; }
      t.costUsd += ((input + cacheRead * 0.1 + cacheWrite * 1.25) * price.input + output * price.output) / 1_000_000;
    },
    totals: () => ({ ...t, unpricedModels: [...unpriced] }),
  };
}

/** Wraps a client so every messages.create / messages.parse call records its usage. */
export function withUsageMeter(client: Anthropic, meter: UsageMeter): Anthropic {
  const inner = client.messages;
  const wrap = <F extends (...args: any[]) => any>(fn: F) =>
    (async (params: { model: string }, ...rest: unknown[]) => {
      const res = await fn.call(inner, params, ...rest);
      meter.record(params.model, (res as { usage?: UsageLike }).usage);
      return res;
    }) as unknown as F;
  const messages = Object.create(inner, {
    create: { value: wrap(inner.create) },
    parse: { value: wrap(inner.parse) },
  });
  return new Proxy(client, { get: (target, prop, receiver) => (prop === "messages" ? messages : Reflect.get(target, prop, receiver)) });
}
