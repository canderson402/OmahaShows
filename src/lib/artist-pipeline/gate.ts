export interface RunRow { new_event_ids: string[] | null; changed_event_ids: string[] | null }
export interface ChangeRow { event_id: string; change_type: "new" | "update"; changed_fields: string[] | null }

const LINEUP_FIELDS = new Set(["title", "supporting_artists"]);

export function selectEventIds(runs: RunRow[], changes: ChangeRow[]) {
  const trigger = new Map<string, "new" | "changed">();
  for (const r of runs) for (const id of r.new_event_ids ?? []) trigger.set(id, "new");
  const lineupChanged = new Set(
    changes.filter((c) => c.change_type === "update" && (c.changed_fields ?? []).some((f) => LINEUP_FIELDS.has(f))).map((c) => c.event_id),
  );
  for (const r of runs) for (const id of r.changed_event_ids ?? []) {
    if (!trigger.has(id) && lineupChanged.has(id)) trigger.set(id, "changed");
  }
  return { ids: [...trigger.keys()], trigger };
}
