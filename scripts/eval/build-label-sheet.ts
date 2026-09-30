import { writeFileSync } from "node:fs";
import { createSpotifyClient, type SpotifyArtist } from "../../src/lib/artist-pipeline/clients/spotify";
import { createYouTubeClient, type YouTubeChannel } from "../../src/lib/artist-pipeline/clients/youtube";
import { createSupabaseRepo, serviceClient } from "../../src/lib/artist-pipeline/repo";
import { GENRES } from "../../src/lib/genres";

const ARTIST_COUNT = Number(process.env.LABEL_ARTISTS ?? 50);
const EXTRA_EVENT_IDS = (process.env.LABEL_EVENTS ?? "").split(",").filter(Boolean); // tricky events chosen by the user

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

const sb = serviceClient();
const repo = createSupabaseRepo(sb);
const spotify = createSpotifyClient({ clientId: env("SPOTIFY_CLIENT_ID"), clientSecret: env("SPOTIFY_CLIENT_SECRET") });
const youtube = createYouTubeClient({ apiKey: env("YOUTUBE_API_KEY"), dailyBudgetUnits: 9000 });

interface Row {
  event_id: string;
  artists: { id: string; name: string; genres: string[] | null } | null;
  events: { title: string; date: string; venues: { name: string | null } | { name: string | null }[] | null } | null;
}

// Weight toward local/obscure: artists with fewer Spotify genres first (proxy for small acts), then the rest.
const { data: rows, error } = await sb.from("event_artists")
  .select("event_id, artists(id, name, genres), events(title, date, venues(name))");
if (error) throw error;
const byArtist = new Map<string, Row & { artists: NonNullable<Row["artists"]> }>();
for (const r of (rows ?? []) as unknown as Row[]) {
  if (r.artists && !byArtist.has(r.artists.id)) byArtist.set(r.artists.id, r as Row & { artists: NonNullable<Row["artists"]> });
}
const chosen = [...byArtist.values()]
  .sort((a, b) => (a.artists.genres?.length ?? 0) - (b.artists.genres?.length ?? 0))
  .slice(0, ARTIST_COUNT);

const artistItems = [];
for (const r of chosen) {
  const name = r.artists.name;
  const sp: SpotifyArtist[] = (await spotify.searchArtists(name)).slice(0, 5);
  let yt: YouTubeChannel[] = [];
  try { yt = (await youtube.searchChannels(name)).slice(0, 3); } catch { /* quota: label Spotify only */ }
  const venue = Array.isArray(r.events?.venues) ? r.events?.venues[0]?.name : r.events?.venues?.name;
  artistItems.push({ name, event_id: r.event_id, event: `${r.events?.title ?? ""} @ ${venue ?? ""} ${r.events?.date ?? ""}`, sp, yt });
}

const evs = await repo.loadEvents([...new Set([...chosen.map((c) => c.event_id), ...EXTRA_EVENT_IDS])]);

// Embedded in a <script> block: neutralise "<" (so "</script>" cannot appear) and the JS line separators.
const payload = JSON.stringify({ artistItems, events: evs, genres: GENRES })
  .replace(/</g, "\\u003c")
  .split(String.fromCharCode(0x2028)).join("\\u2028")
  .split(String.fromCharCode(0x2029)).join("\\u2029");

// The page script is plain string concatenation, so every interpolated value goes through esc()
// (scraped names and Spotify/YouTube titles are untrusted) and ids in URLs through enc().
const html = `<!doctype html><meta charset="utf-8"><title>Artist labels</title>
<style>body{font:14px system-ui;max-width:900px;margin:24px auto;padding:0 16px}fieldset{margin:12px 0;padding:8px 12px}
label{display:block;margin:2px 0}textarea{width:100%;height:120px;font:12px monospace}button{position:sticky;top:8px;padding:8px 16px}</style>
<button id="dl">Download labels.json</button>
<h2>Artists: choose the correct profile, or "none exists"</h2><div id="a"></div>
<h2>Events: fix the JSON to the true lineup/category</h2><div id="e"></div>
<script>
const D=${payload};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const enc=s=>encodeURIComponent(String(s==null?'':s));
const A=document.getElementById('a'),E=document.getElementById('e');
D.artistItems.forEach((it,i)=>{const f=document.createElement('fieldset');
 f.innerHTML='<legend><b>'+esc(it.name)+'</b> - '+esc(it.event)+'</legend><i>Spotify</i>'+
 it.sp.map(c=>'<label><input type=radio name=sp'+i+' value="'+esc(c.id)+'"> <a target=_blank rel="noopener noreferrer" href="https://open.spotify.com/artist/'+esc(enc(c.id))+'">'+esc(c.name)+'</a> '+esc((c.genres||[]).join(', '))+'</label>').join('')+
 '<label><input type=radio name=sp'+i+' value="" checked> none exists / not listed</label><label>or paste ID <input name=spx'+i+'></label><i>YouTube</i>'+
 it.yt.map(c=>'<label><input type=radio name=yt'+i+' value="'+esc(c.id)+'"> <a target=_blank rel="noopener noreferrer" href="https://www.youtube.com/channel/'+esc(enc(c.id))+'">'+esc(c.title)+'</a> ('+esc(c.subscriberCount??'?')+' subs)</label>').join('')+
 '<label><input type=radio name=yt'+i+' value="" checked> none exists / not listed</label><label>or paste ID <input name=ytx'+i+'></label>'+
 '<label>genres (comma, from list) <input name=g'+i+' size=40></label>';A.appendChild(f);});
D.events.forEach((ev,i)=>{const f=document.createElement('fieldset');
 const guess={event_id:ev.id,category:'music',acts:[{name:ev.title,role:'headliner',kind:'original_artist'}].concat((ev.supportingArtists||[]).map(n=>({name:n,role:'supporting',kind:'original_artist'}))),genres:[]};
 f.innerHTML='<legend><b>'+esc(ev.title)+'</b> - '+esc(ev.venueName||'')+' '+esc(ev.date)+'</legend><textarea id=ev'+i+'>'+esc(JSON.stringify(guess,null,1))+'</textarea>';E.appendChild(f);});
document.getElementById('dl').onclick=()=>{const v=n=>(document.querySelector('[name="'+n+'"]:checked')||{}).value||'';const t=n=>(document.querySelector('[name="'+n+'"]')||{}).value?.trim()||'';const pid=n=>{const x=t(n);const m=x.match(/(?:open\\.spotify\\.com\\/artist|youtube\\.com\\/channel)\\/([A-Za-z0-9_-]+)/);return m?m[1]:x;};
 const labels={artists:D.artistItems.map((it,i)=>({name:it.name,event_id:it.event_id,spotify_id:pid('spx'+i)||v('sp'+i)||null,youtube_channel_id:pid('ytx'+i)||v('yt'+i)||null,
  genres:t('g'+i).split(',').map(s=>s.trim().toLowerCase()).filter(g=>D.genres.includes(g))})),
  events:D.events.map((_,i)=>JSON.parse(document.getElementById('ev'+i).value))};
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(labels,null,2)],{type:'application/json'}));a.download='labels.json';a.click();};
</script>`;
writeFileSync("scripts/eval/label-sheet.html", html);
console.log(`Wrote scripts/eval/label-sheet.html (${artistItems.length} artists, ${evs.length} events, YouTube units ${youtube.unitsUsed()})`);
