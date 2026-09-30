import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

export const MODELS = {
  extract: process.env.ARTIST_EXTRACT_MODEL ?? "claude-opus-5-5",
  judge: process.env.ARTIST_JUDGE_MODEL ?? "claude-opus-5-5",
  escalate: process.env.ARTIST_ESCALATE_MODEL ?? "claude-opus-5-5",
};

export class LLMError extends Error {
  constructor(public reason: "refusal" | "max_tokens" | "unparseable") { super(`LLM ${reason}`); }
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
      const res = await client.messages.parse({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
        output_config: { format: zodOutputFormat(schema), ...effortParams(model) },
      });
      if (res.stop_reason === "refusal") throw new LLMError("refusal");
      if (res.stop_reason === "max_tokens") throw new LLMError("max_tokens");
      if (res.parsed_output == null) throw new LLMError("unparseable");
      return res.parsed_output as z.infer<typeof schema>;
    },
  };
}
