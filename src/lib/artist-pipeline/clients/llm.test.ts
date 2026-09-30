import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createStructuredLLM, effortParams, isRetryableApiError, LLMError } from "./llm";

const schema = z.object({ a: z.string() });
const args = { model: "m", system: "s", user: "u", schema };

function llmWith(parse: () => unknown) {
  const client = { messages: { parse: async () => parse() } } as unknown as Anthropic;
  return createStructuredLLM(client);
}

async function reasonOf(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(LLMError);
    return (e as LLMError).reason;
  }
  throw new Error("expected rejection");
}

describe("createStructuredLLM", () => {
  test("returns parsed_output on success", async () => {
    const llm = llmWith(() => ({ stop_reason: "end_turn", parsed_output: { a: "x" } }));
    expect(await llm.parse(args)).toEqual({ a: "x" });
  });
  test("refusal stop_reason -> refusal", async () => {
    const llm = llmWith(() => ({ stop_reason: "refusal", parsed_output: null }));
    expect(await reasonOf(llm.parse(args))).toBe("refusal");
  });
  test("max_tokens stop_reason -> max_tokens", async () => {
    const llm = llmWith(() => ({ stop_reason: "max_tokens", parsed_output: null }));
    expect(await reasonOf(llm.parse(args))).toBe("max_tokens");
  });
  test("null parsed_output -> unparseable", async () => {
    const llm = llmWith(() => ({ stop_reason: "end_turn", parsed_output: null }));
    expect(await reasonOf(llm.parse(args))).toBe("unparseable");
  });
  test("thrown AnthropicError -> unparseable", async () => {
    const llm = llmWith(() => { throw new Anthropic.AnthropicError("Failed to parse structured output"); });
    expect(await reasonOf(llm.parse(args))).toBe("unparseable");
  });
  test("thrown APIError subclass -> api_error", async () => {
    const llm = llmWith(() => { throw new Anthropic.RateLimitError(429, {}, "slow down", new Headers()); });
    expect(await reasonOf(llm.parse(args))).toBe("api_error");
  });
  test("thrown 503 APIError -> api_error with cause and status in message", async () => {
    const err = new Anthropic.APIError(503, { error: { message: "Overloaded" } }, undefined, new Headers());
    const llm = llmWith(() => { throw err; });
    const e = await llm.parse(args).catch((x) => x);
    expect(e).toBeInstanceOf(LLMError);
    expect(e.reason).toBe("api_error");
    expect(e.cause).toBe(err);
    expect(e.message).toBe("LLM api_error: 503 Overloaded");
  });
  test("429 -> api_error with cause", async () => {
    const err = new Anthropic.RateLimitError(429, {}, "slow", new Headers());
    const e = await llmWith(() => { throw err; }).parse(args).catch((x) => x);
    expect(e).toBeInstanceOf(LLMError);
    expect(e.cause).toBe(err);
  });
  test("connection error (no status) -> api_error", async () => {
    const llm = llmWith(() => { throw new Anthropic.APIConnectionError({ message: "down" }); });
    expect(await reasonOf(llm.parse(args))).toBe("api_error");
  });
  test.each([400, 401, 403, 404, 422])("non-retryable %i is rethrown raw", async (status) => {
    const err = new Anthropic.APIError(status, {}, "nope", new Headers());
    await expect(llmWith(() => { throw err; }).parse(args)).rejects.toBe(err);
  });
  test("other errors are rethrown unchanged", async () => {
    const boom = new TypeError("bug");
    const llm = llmWith(() => { throw boom; });
    await expect(llm.parse(args)).rejects.toBe(boom);
  });
});

describe("effortParams", () => {
  test("no effort for haiku", () => expect(effortParams("claude-haiku-4-5")).toEqual({}));
  test("medium effort otherwise", () => expect(effortParams("claude-opus-5-5")).toEqual({ effort: "medium" }));
});

describe("isRetryableApiError", () => {
  const e = (s: number | undefined) => new Anthropic.APIError(s as any, {}, "m", new Headers());
  test("status rule", () => {
    for (const s of [undefined, 408, 409, 429, 500, 503, 529]) expect(isRetryableApiError(e(s))).toBe(true);
    for (const s of [400, 401, 403, 404, 422]) expect(isRetryableApiError(e(s))).toBe(false);
    expect(isRetryableApiError(new Error("x"))).toBe(false);
  });
});
