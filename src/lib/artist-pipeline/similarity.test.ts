import { describe, expect, test } from "vitest";
import { jaroWinkler, nameSimilarity, HIGH_SIMILARITY } from "./similarity";

describe("jaroWinkler", () => {
  test("identical is 1", () => expect(jaroWinkler("abc", "abc")).toBe(1));
  test("MARTHA/MARHTA classic value", () => expect(jaroWinkler("martha", "marhta")).toBeCloseTo(0.961, 3));
  test("disjoint is 0", () => expect(jaroWinkler("abc", "xyz")).toBe(0));
});

describe("nameSimilarity", () => {
  test("exact after normalization is 1", () => {
    expect(nameSimilarity("The Wildwoods", "Wildwoods")).toBe(1);
    expect(nameSimilarity("JOBY!", "Joby")).toBe(1);
  });
  test("non-exact never reaches 1", () => {
    expect(nameSimilarity("Wildwoods", "Wildwood")).toBeLessThanOrEqual(0.95);
  });
  test("different bands sharing a word stay below the high threshold", () => {
    expect(nameSimilarity("Surfer Girl", "Surfer Blood")).toBeLessThan(HIGH_SIMILARITY);
    expect(nameSimilarity("Slumbering Sun", "The Sun")).toBeLessThan(HIGH_SIMILARITY);
  });
  test("empty input is 0", () => expect(nameSimilarity("", "abc")).toBe(0));
  test("symmetry", () => {
    expect(nameSimilarity("Surfer Girl", "Surfer Blood")).toBe(
      nameSimilarity("Surfer Blood", "Surfer Girl")
    );
  });
  test("single-token near-miss stays below high threshold", () => {
    expect(nameSimilarity("Wildwoods", "Wildwood")).toBeLessThan(HIGH_SIMILARITY);
  });
  test("punctuation/case/the variant is exact", () => {
    expect(nameSimilarity("The Mumford & Sons", "mumford and sons")).toBe(1);
  });
  test("both empty is 0", () => expect(nameSimilarity("", "")).toBe(0));
});
