import { describe, expect, test } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { createUsageMeter, withUsageMeter } from "./usage";

describe("createUsageMeter", () => {
  test("prices input, output, cache and web searches per model", () => {
    const m = createUsageMeter();
    m.record("claude-haiku-4-5", { input_tokens: 1_000_000, output_tokens: 100_000 });
    m.record("claude-sonnet-5-5", {
      input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1_000_000, cache_creation_input_tokens: 1_000_000,
      server_tool_use: { web_search_requests: 3 },
    });
    const t = m.totals();
    // haiku: $1 in + 0.1M * $5 = $1.50; sonnet: 1M cache read * $2 * 0.1 + 1M cache write * $2 * 1.25 = $2.70; 3 searches = $0.03
    expect(t.costUsd).toBeCloseTo(1.5 + 2.7 + 0.03, 6);
    expect(t.calls).toBe(2);
    expect(t.webSearches).toBe(3);
    expect(t.unpricedModels).toEqual([]);
  });

  test("unknown models are counted but flagged, never silently priced at zero", () => {
    const m = createUsageMeter();
    m.record("claude-mystery-9", { input_tokens: 10, output_tokens: 10 });
    expect(m.totals().unpricedModels).toEqual(["claude-mystery-9"]);
  });

  test("missing usage is ignored", () => {
    const m = createUsageMeter();
    m.record("claude-haiku-4-5", undefined);
    expect(m.totals().calls).toBe(0);
  });
});

describe("withUsageMeter", () => {
  test("records usage from messages.create and messages.parse, passes results through", async () => {
    const fake = {
      messages: {
        async create(p: any) { return { id: "c", usage: { input_tokens: 1_000_000, output_tokens: 0 }, model: p.model }; },
        async parse(p: any) { return { id: "p", usage: { input_tokens: 0, output_tokens: 1_000_000 }, parsed_output: { ok: true }, model: p.model }; },
      },
      other: 42,
    } as unknown as Anthropic;
    const m = createUsageMeter();
    const c = withUsageMeter(fake, m);
    expect((await c.messages.create({ model: "claude-haiku-4-5" } as any) as any).id).toBe("c");
    expect((await c.messages.parse({ model: "claude-haiku-4-5" } as any) as any).parsed_output).toEqual({ ok: true });
    expect((c as any).other).toBe(42);
    expect(m.totals().costUsd).toBeCloseTo(1 + 5, 6);
  });
});
