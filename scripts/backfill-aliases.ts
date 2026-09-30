import { serviceClient } from "../src/lib/artist-pipeline/repo";
import { normalizeArtistName } from "../src/lib/artist-pipeline/normalize";

const sb = serviceClient();
const { data: artists, error } = await sb.from("artists").select("id, name, spotify_url");
if (error) throw error;

let aliases = 0, links = 0;
const collisions: string[] = [];
for (const a of artists ?? []) {
  const alias = normalizeArtistName(a.name);
  const { data: existing } = await sb.from("artist_aliases").select("artist_id").eq("alias_normalized", alias).maybeSingle();
  if (existing && existing.artist_id !== a.id) { collisions.push(`${a.name} (${alias})`); continue; }
  if (!existing) { const { error: e } = await sb.from("artist_aliases").insert({ alias_normalized: alias, artist_id: a.id }); if (e) throw e; aliases++; }

  const m = a.spotify_url?.match(/open\.spotify\.com\/artist\/([A-Za-z0-9]+)/);
  if (m) {
    const { error: e } = await sb.from("artist_links").upsert(
      { artist_id: a.id, platform: "spotify", external_id: m[1], url: `https://open.spotify.com/artist/${m[1]}`,
        status: "suggested", source: "auto", reason: "pre-2026 unverified match" },
      { onConflict: "artist_id,platform,external_id", ignoreDuplicates: true });
    if (e) throw e;
    links++;
  }
}
console.log(`aliases inserted: ${aliases}, spotify links recorded: ${links}`);
if (collisions.length) console.log(`alias collisions (review manually, possible duplicates):\n  ${collisions.join("\n  ")}`);
