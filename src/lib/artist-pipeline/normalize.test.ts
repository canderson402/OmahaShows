import { describe, expect, test } from "vitest";
import { normalizeArtistName } from "./normalize";

describe("normalizeArtistName", () => {
  test.each([
    ["The Wildwoods", "wildwoods"],
    ["  THE   WILDWOODS ", "wildwoods"],
    ["JOBY!", "joby"],
    ["Donny Benét", "donny benet"],
    ["Mumford & Sons", "mumford and sons"],
    ["Melo Vi8e5", "melo vi8e5"],
    ["Here Come the Mummies", "here come the mummies"],
    ["Sigur Rós", "sigur ros"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizeArtistName(input)).toBe(expected);
  });

  test("punctuation-only names stay non-empty and distinct", () => {
    expect(normalizeArtistName("!!!")).toBe("!!!");
    expect(normalizeArtistName("!!!")).not.toBe(normalizeArtistName("???"));
  });

  test("'The The' keeps a name", () => {
    expect(normalizeArtistName("The The")).toBe("the");
  });
});
