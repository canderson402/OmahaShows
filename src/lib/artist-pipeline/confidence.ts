import type { LineupEntry } from "./types";

/**
 * A show's confidence comes from its headliner(s) only; openers don't lower it.
 * With several headliners/co-headliners the lowest counts; with none marked, the first-billed act.
 */
export function headlinerConfidence(acts: LineupEntry[]): number | null {
  if (!acts.length) return null;
  const heads = acts.filter((a) => a.kind !== "not_an_artist" && (a.role === "headliner" || a.role === "co-headliner"));
  const counted = heads.length ? heads : [acts[0]];
  return Math.min(...counted.map((a) => a.confidence));
}
