import { describe, expect, it } from "vitest";
import { countFailures, dropPastEvents, exitCodeFor, type RunFailure } from "./run-summary";
import type { PipelineEvent } from "./types";

const f = (kind: RunFailure["kind"]): RunFailure => ({ event_id: "e", error: "x", kind });
const ev = (id: string, date: string): PipelineEvent => ({ id, title: id, date, venueName: "v", eventUrl: null, supportingArtists: [] });

describe("run summary helpers", () => {
  it("counts failures by kind", () => {
    expect(countFailures([f("retry"), f("unexpected"), f("retry")])).toEqual({ retry: 2, unexpected: 1 });
  });
  it("exits 0 with no failures or only retryable ones", () => {
    expect(exitCodeFor([])).toBe(0);
    expect(exitCodeFor([f("retry")])).toBe(0);
  });
  it("exits 1 when any failure is unexpected", () => {
    expect(exitCodeFor([f("retry"), f("unexpected")])).toBe(1);
  });
  it("drops events before today but keeps today and later", () => {
    const out = dropPastEvents([ev("past", "2026-09-29"), ev("today", "2026-09-30"), ev("future", "2026-10-01")], "2026-09-30");
    expect(out.map((e) => e.id)).toEqual(["today", "future"]);
  });
});
