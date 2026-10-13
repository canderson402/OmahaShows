import { describe, expect, test } from "vitest";
import { localFromHometown } from "./local";

describe("localFromHometown", () => {
  test("Nebraska and Omaha-metro hometowns are local", () => {
    for (const h of ["Omaha, NE", "Lincoln, NE", "Papillion NE", "Kearney, Nebraska", "Omaha", "Council Bluffs, IA", " omaha, ne. "]) {
      expect(localFromHometown(h)).toBe(true);
    }
  });

  test("anything else proves nothing", () => {
    for (const h of [null, "", "Lincoln, UK", "Chicago, IL", "Bellevue, WA", "Kansas City, MO", "New England"]) {
      expect(localFromHometown(h)).toBeNull();
    }
  });
});
