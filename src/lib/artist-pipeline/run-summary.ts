import type { PipelineEvent } from "./types";

export interface RunFailure { event_id: string; error: string; kind: "retry" | "unexpected" }

export function countFailures(failures: RunFailure[]) {
  return {
    retry: failures.filter((f) => f.kind === "retry").length,
    unexpected: failures.filter((f) => f.kind === "unexpected").length,
  };
}

/** Process exit code: 1 when any event hit an unexpected (non-retryable) error, else 0. */
export function exitCodeFor(failures: RunFailure[]): number {
  return countFailures(failures).unexpected > 0 ? 1 : 0;
}

/** Drops events dated before `today` (YYYY-MM-DD); string comparison is valid for ISO dates. */
export function dropPastEvents(events: PipelineEvent[], today: string): PipelineEvent[] {
  return events.filter((e) => e.date >= today);
}
