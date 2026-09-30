import { expect, test } from "vitest";
import { selectEventIds } from "./gate";

test("new ids always included; changed only when title or supporting_artists changed", () => {
  const { ids, trigger } = selectEventIds(
    [{ new_event_ids: ["n1"], changed_event_ids: ["c1", "c2"] }, { new_event_ids: null, changed_event_ids: ["c3"] }],
    [
      { event_id: "c1", change_type: "update", changed_fields: ["time", "price"] },
      { event_id: "c2", change_type: "update", changed_fields: ["title"] },
      { event_id: "c3", change_type: "update", changed_fields: ["supporting_artists", "price"] },
    ],
  );
  expect(ids.sort()).toEqual(["c2", "c3", "n1"]);
  expect(trigger.get("n1")).toBe("new");
  expect(trigger.get("c2")).toBe("changed");
});

test("empty runs select nothing", () => {
  expect(selectEventIds([], []).ids).toEqual([]);
  expect(selectEventIds([{ new_event_ids: [], changed_event_ids: null }], []).ids).toEqual([]);
});
