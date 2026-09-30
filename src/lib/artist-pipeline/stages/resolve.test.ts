import { expect, test } from "vitest";
import { resolveAct, type ArtistRepo } from "./resolve";
import type { StoredArtist } from "../types";

const surfer: StoredArtist = { id: "a1", name: "Surfer Girl", genres: ["indie"], spotify_id: "sp1", youtube_channel_id: null, hometown: "Omaha, NE" };
const repo: ArtistRepo = {
  async findByAlias(n) { return n === "surfer girl" ? surfer : null; },
  async rejectedExternalIds() { return new Set(); },
};

test("existing artist found via normalized alias; reports missing platforms", async () => {
  expect(await resolveAct("SURFER GIRL!", repo)).toEqual({ artist: surfer, missing: ["youtube"] });
});
test("unknown artist needs both platforms", async () => {
  expect(await resolveAct("JOBY!", repo)).toEqual({ artist: null, missing: ["spotify", "youtube"] });
});
