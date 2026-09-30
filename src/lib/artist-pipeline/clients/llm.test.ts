import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createStructuredLLM, effortParams, LLMError } from "./llm";

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
  test("thrown APIError -> api_error", async () => {
    const llm = llmWith(() => { throw new Anthropic.APIError(500, {}, "boom", new Headers()); });
    expect(await reasonOf(llm.parse(args))).toBe("api_error");
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
