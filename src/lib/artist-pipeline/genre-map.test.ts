import { expect, test } from "vitest";
import { mapToGenres, filterGenres } from "./genre-map";

test("exact list members pass through", () => {
  expect(mapToGenres(["indie", "rock"])).toEqual(["indie", "rock"]);
});
test("regional/compound Spotify tags map onto our list", () => {
  expect(mapToGenres(["nebraska indie"])).toEqual(["indie"]);
  expect(mapToGenres(["hip hop", "southern hip hop"])).toEqual(["hip-hop"]);
  expect(mapToGenres(["progressive bluegrass"])).toEqual(["americana"]);
  expect(mapToGenres(["edm"])).toEqual(["electronic"]);
});
test("dedupes and caps", () => {
  expect(mapToGenres(["punk", "pop punk", "skate punk", "emo", "rock"], 3)).toEqual(["punk", "emo", "rock"]);
});
test("unknown tags are dropped", () => expect(mapToGenres(["vaporwave-adjacent"])).toEqual([]));
test("filterGenres keeps only list members, lowercased", () => {
  expect(filterGenres(["Rock", "nebraska indie", "comedy"])).toEqual(["rock", "comedy"]);
});
