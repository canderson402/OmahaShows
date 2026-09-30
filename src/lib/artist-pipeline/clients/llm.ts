import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

export const MODELS = {
  extract: process.env.ARTIST_EXTRACT_MODEL ?? "claude-opus-5-5",
  judge: process.env.ARTIST_JUDGE_MODEL ?? "claude-opus-5-5",
  escalate: process.env.ARTIST_ESCALATE_MODEL ?? "claude-opus-5-5",
};

export class LLMError extends Error {
  constructor(public reason: "refusal" | "max_tokens" | "unparseable" | "api_error", detail?: string, cause?: unknown) {
    super(detail ? `LLM ${reason}: ${detail}` : `LLM ${reason}`, cause === undefined ? undefined : { cause });
  }
}

/** Transient API failures worth retrying next run: connection/timeout (no status), 408, 409, 429, >= 500. */
export function isRetryableApiError(e: unknown): e is InstanceType<typeof Anthropic.APIError> {
  if (!(e instanceof Anthropic.APIError)) return false;
  const s = e.status;
  return s === undefined || s === 408 || s === 409 || s === 429 || s >= 500;
}

export interface StructuredLLM {
  parse<T>(args: { model: string; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number }): Promise<T>;
}

// Haiku 4.5 does not accept `effort`; newer models do (Opus 5.5 defaults to medium).
export function effortParams(model: string): { effort?: "low" | "medium" | "high" } {
  return model.startsWith("claude-haiku") ? {} : { effort: "medium" };
}

export function createStructuredLLM(client: Anthropic = new Anthropic()): StructuredLLM {
  return {
    async parse({ model, system, user, schema, maxTokens = 8000 }) {
      let res;
      try {
        res = await client.messages.parse({
          model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: user }],
          output_config: { format: zodOutputFormat(schema), ...effortParams(model) },
        });
      } catch (err) {
        // APIError extends AnthropicError, so it must be checked first.
        if (err instanceof Anthropic.APIError) {
          if (!isRetryableApiError(err)) throw err;
          const body = err.error as { error?: { message?: string }; message?: string } | undefined;
          const msg = body?.error?.message ?? body?.message ?? err.message.replace(/^\d+\s+/, "");
          throw new LLMError("api_error", `${err.status ?? "no status"} ${msg}`, err);
        }
        // Non-API AnthropicError: the SDK's structured-output parse failure.
        if (err instanceof Anthropic.AnthropicError) throw new LLMError("unparseable");
        throw err;
      }
      if (res.stop_reason === "refusal") throw new LLMError("refusal");
      if (res.stop_reason === "max_tokens") throw new LLMError("max_tokens");
      if (res.parsed_output == null) throw new LLMError("unparseable");
      return res.parsed_output as z.infer<typeof schema>;
    },
  };
}
