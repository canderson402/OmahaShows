# Artist Pipeline Foundation Implementation Plan (Plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the schema, the full artist-matching pipeline (extract → resolve → candidates → judge → escalate → score), a dry-run CLI, and the labeled eval/calibration loop that proves accuracy before anything reaches the approval queue.

**Architecture:** Pure, dependency-injected stage modules live in `src/lib/artist-pipeline/`. External services (Anthropic, Spotify, YouTube, venue pages, Supabase) sit behind small client interfaces, so every stage is unit-tested offline with fakes. The CLI (`scripts/analyze-artists.ts`) and the eval replay (`scripts/eval/replay.ts`) share one orchestrator, `analyzeEvent()`. This plan never writes proposals to the queue. Plan 2 (queue UI + accept RPC) and Plan 3 (nightly job + manual backfill) come after the eval hits its targets.

**Tech Stack:** TypeScript (ESM), Node 20+, `@anthropic-ai/sdk` (latest) + `zod`, `@supabase/supabase-js`, Vitest, `tsx` for scripts, Spotify Web API (client credentials, development mode), YouTube Data API v3.

**Spec:** `docs/specs/2026-09-30-artist-profiles-design.md`

## Global Constraints

- **Per `CLAUDE.md`:** never commit, push or deploy without the user's explicit go-ahead. Every "Checkpoint" step below means *stop and ask the user whether to commit*. Do not run `git commit` yourself.
- **Migrations:** run `npm run build` to verify compile; do not run the app. Migrations are applied by the user in the Supabase SQL editor. Never apply SQL to production yourself.
- **Paths:** all paths are relative to the git root `web/`.
- **Genres:** must come only from `GENRES` in `src/lib/genres.ts`. Code drops anything off-list.
- **Links:** AI output never contains URLs used as data. Code builds every URL from an external ID (`https://open.spotify.com/artist/{id}`, `https://www.youtube.com/channel/{id}`).
- **Guardrail:** a link whose name similarity is < 0.90 can never have final confidence ≥ 0.90.
- **Spotify development mode:** no `followers`/`popularity`/top-tracks. Search `limit` max is 10.
- **YouTube quota:** `search.list` = 100 units, `channels.list` = 1 unit, ~10,000 units/day.
- **Models:** configurable per stage via env (`ARTIST_EXTRACT_MODEL`, `ARTIST_JUDGE_MODEL`, `ARTIST_ESCALATE_MODEL`), defaulting to `claude-haiku-4-5` for extract/judge and `claude-sonnet-5-5` for escalation (cost-first, per the user, 2026-09-30). The eval compares `claude-haiku-4-5`, `claude-sonnet-5-5` and `claude-opus-5-5`, and the user picks per stage from the results.
- **Success criteria (from spec):**

  | Metric | Target |
  |---|---|
  | High-confidence (≥ 0.90) link precision | ≥ 98% |
  | Non-artist rejection | ≥ 95% |
  | Lineup fully correct | ≥ 95% of events |
  | Category | ≥ 97% |
  | Genre top-1 | ≥ 85% (tracked, not a blocker) |
  | Calibration | within ±5 points per bucket |

- **Scope:** this plan is dry-run only. Nothing writes to `pending_artist_analyses` (the current admin UI expects the old JSON shape).

## Review Focus

1. **Unusual names:** punctuation-only or unicode band names (`!!!`, `JOBY!`, `Donny Benét`, `Melo Vi8e5`, `Mumford & Sons`) must normalize to stable, non-empty keys. Pinned in Task 3.
2. **Lineups in the title:** openers present only in `supporting_artists`, or only in the title ("Plack Blague, Melo Vi8e5, Vempire"), must reach the model. Pinned in Task 9 (prompt contains both).
3. **Spotify failures:** Spotify returns 403/429/5xx, or the Premium lapses. The event must be recorded as a retryable failure, not crash the run or produce an empty "no match". Pinned in Task 14.
4. **YouTube quota:** quota exhausted mid-run means the remaining acts get `youtube: {chosen: null}` with a "deferred: quota" reason, and the run continues. Pinned in Tasks 7 and 14.
5. **Model misbehavior:** the model returns an external ID not in the candidate list, refuses, or hits `max_tokens`. That must become `null` or a retryable failure, never a fabricated link. Pinned in Tasks 9 and 11.

---

## File Structure

```
supabase/migrations/008_artist_profiles.sql      schema (tables, columns, view, constraint, RLS)
vitest.config.ts                                  test runner config
src/lib/artist-pipeline/
  types.ts            shared types (no logic)
  normalize.ts        normalizeArtistName()
  similarity.ts       jaroWinkler(), nameSimilarity()
  genre-map.ts        mapToGenres() (Spotify tags / free text → GENRES)
  evidence.ts         hasLocationEvidence(), spotifyIdInText()
  clients/spotify.ts  createSpotifyClient()
  clients/youtube.ts  createYouTubeClient(), QuotaExceededError
  clients/event-page.ts fetchEventPageText()
  clients/llm.ts      createStructuredLLM(), MODELS, LLMError
  stages/extract.ts   extractLineup()
  stages/resolve.ts   resolveAct()
  stages/candidates.ts gatherSpotifyCandidates(), gatherYouTubeCandidates()
  stages/judge.ts     judgeAct(), applyGuardrails()
  stages/escalate.ts  escalateAct()
  scoring.ts          rawLinkScore(), rawLineupScore(), Calibrator, fitIsotonic(), finalLinkConfidence()
  gate.ts             selectEventIds()
  pipeline.ts         analyzeEvent(), analyzeAct()
  repo.ts             createSupabaseRepo()  (Supabase-backed ArtistRepo + event loading)
scripts/
  analyze-artists.ts  dry-run CLI
  backfill-aliases.ts one-off: aliases + artist_links for existing artists
  eval/metrics.ts     pure metric functions
  eval/build-label-sheet.ts  generates label-sheet.html
  eval/replay.ts      runs pipeline on labels, reports metrics, fits calibration
  eval/labels.json    (created by the user via the label sheet)
  eval/calibration.json (written by replay --fit)
```

Tests sit next to their modules as `*.test.ts`.

---

### Task 1: Tooling (Vitest, tsx, zod, SDK upgrade)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/artist-pipeline/smoke.test.ts` (deleted in Step 5)

**Interfaces:**
- Produces: `npm test` runs Vitest over `src/**/*.test.ts` and `scripts/**/*.test.ts`

- [ ] **Step 1: Install dependencies**

```bash
npm install @anthropic-ai/sdk@latest zod
npm install -D vitest tsx
npm view @anthropic-ai/sdk peerDependencies
```

If the SDK lists a `zod` peer range, make sure the installed `zod` satisfies it (`npm install zod@<range>`).

- [ ] **Step 2: Add scripts to `package.json`**

In `"scripts"` add:

```json
"test": "vitest run",
"test:watch": "vitest",
"artists": "tsx scripts/analyze-artists.ts",
"eval:labels": "tsx scripts/eval/build-label-sheet.ts",
"eval:replay": "tsx scripts/eval/replay.ts"
```

- [ ] **Step 3: Create `vitest.config.ts`**

This must exist so Vitest doesn't pick up the legacy `vite.config.ts`.

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 4: Smoke test**

`src/lib/artist-pipeline/smoke.test.ts`:

```ts
import { expect, test } from "vitest";
test("vitest runs", () => expect(1 + 1).toBe(2));
```

Run: `npm test`. Expected: 1 passed.

- [ ] **Step 5: Delete the smoke test, verify the build still compiles**

```bash
rm src/lib/artist-pipeline/smoke.test.ts
npm run build
```

Expected: the build succeeds. The existing `src/lib/ai.ts` still compiles against the new SDK; if not, fix only type errors there without behavior changes.

- [ ] **Step 6: Checkpoint.** Ask the user whether to commit ("chore: add vitest, tsx, zod; upgrade anthropic sdk").

---

### Task 2: Schema migration 008

**Files:**
- Create: `supabase/migrations/008_artist_profiles.sql`

**Interfaces:**
- Produces:
  - tables `artist_links` and `artist_aliases`
  - new `artists` columns `spotify_id`, `youtube_channel_id`, `youtube_url`, `hometown`, `notes`
  - new `pending_artist_analyses` columns `schema_version`, `run_id`, `overall_confidence`, `trigger`, `event`
  - view `artist_appearances`
  - `events.category` now allows `'other'`

- [ ] **Step 1: Write the migration**

```sql
-- 008: Artist profiles, verified links, aliases, appearance history

-- artists: identity + profile fields
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS spotify_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS hometown TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- One row per candidate link; rejections are remembered
CREATE TABLE IF NOT EXISTS artist_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'youtube')),
  external_id TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('suggested', 'verified', 'rejected')),
  confidence NUMERIC(4,3),
  reason TEXT,
  source TEXT NOT NULL CHECK (source IN ('auto', 'manual')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artist_id, platform, external_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_links_one_verified
  ON artist_links (artist_id, platform) WHERE status = 'verified';
CREATE INDEX IF NOT EXISTS idx_artist_links_external ON artist_links (platform, external_id);

-- Aliases: normalized spelling -> artist
CREATE TABLE IF NOT EXISTS artist_aliases (
  alias_normalized TEXT PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_artist_aliases_artist ON artist_aliases (artist_id);

-- Event category gains 'other' (karaoke, bingo, trivia...)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events ADD CONSTRAINT events_category_check
  CHECK (category IN ('music', 'sports', 'theater', 'comedy', 'other'));

-- Queue: typed, versioned proposals
ALTER TABLE pending_artist_analyses
  ADD COLUMN IF NOT EXISTS schema_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS run_id TEXT,
  ADD COLUMN IF NOT EXISTS overall_confidence NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS trigger TEXT CHECK (trigger IN ('new', 'changed', 'backfill', 'manual')),
  ADD COLUMN IF NOT EXISTS event JSONB;

-- Queue is admin-only
DROP POLICY IF EXISTS "Anon read access" ON pending_artist_analyses;

-- Appearance history
CREATE OR REPLACE VIEW artist_appearances AS
SELECT ea.artist_id, e.id AS event_id, e.date, e.venue_id, v.name AS venue_name,
       ea.role, ea.billing_order
FROM event_artists ea
JOIN events e ON e.id = ea.event_id
LEFT JOIN venues v ON v.id = e.venue_id
WHERE e.status = 'approved';

-- RLS
ALTER TABLE artist_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access artist_links" ON artist_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access artist_links" ON artist_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access artist_aliases" ON artist_aliases
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access artist_aliases" ON artist_aliases
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Verify the constraint name before handing off**

Ask the user to run this in the Supabase SQL editor:

```sql
SELECT conname FROM pg_constraint WHERE conrelid = 'events'::regclass AND contype = 'c';
```

If the category constraint is not named `events_category_check`, edit the `DROP CONSTRAINT` line to the actual name.

- [ ] **Step 3: User applies the migration.** Ask the user to paste `008_artist_profiles.sql` into the SQL editor and run it, then run:

```sql
SELECT count(*) FROM artist_links;       -- 0
SELECT count(*) FROM artist_aliases;     -- 0
SELECT * FROM artist_appearances LIMIT 3;
INSERT INTO events (id, title, date, venue_id, category) VALUES ('tmp-cat-test','x','2099-01-01','other','other');
DELETE FROM events WHERE id = 'tmp-cat-test';
```

Expected: the counts are 0, the view returns rows, and the insert with `category='other'` succeeds. (`venue_id='other'` exists in live data.)

- [ ] **Step 4: Checkpoint.** Ask the user whether to commit ("feat(db): artist profiles schema (links, aliases, appearances)").

---

### Task 3: Types and name normalization

**Files:**
- Create: `src/lib/artist-pipeline/types.ts`
- Create: `src/lib/artist-pipeline/normalize.ts`
- Test: `src/lib/artist-pipeline/normalize.test.ts`

**Interfaces:**
- Produces: `normalizeArtistName(name: string): string`, plus every type in `types.ts` (used by all later tasks)

- [ ] **Step 1: Write `types.ts`** (types only)

```ts
import type { Genre } from "../genres";

export type Role = "headliner" | "co-headliner" | "supporting";
export type Rating = "high" | "medium" | "low";
export type Platform = "spotify" | "youtube";
export type EventCategory = "music" | "comedy" | "theater" | "sports" | "other";
export type NonArtistCategory = "tribute" | "orchestra_score" | "dj" | "comedian" | "event_name" | "other";
export type ActKind = "original_artist" | "not_an_artist" | "unknown";

export interface PipelineEvent {
  id: string;
  title: string;
  date: string;               // YYYY-MM-DD
  venueName: string;
  eventUrl: string | null;
  supportingArtists: string[];
}

export interface ExtractedAct {
  billed_as: string;
  clean_name: string;
  role: Role;
  billing_order: number;      // 1-based
  kind: ActKind;
  non_artist_category: NonArtistCategory | null;
  genres: Genre[];
  hometown: string | null;
  reason: string;
}

export interface Extraction {
  category: EventCategory;
  category_rating: Rating;
  event_genres: Genre[];
  lineup_rating: Rating;
  reason: string;
  acts: ExtractedAct[];
}

export interface Candidate {
  platform: Platform;
  external_id: string;
  url: string;
  display_name: string;
  name_similarity: number;    // 0..1, computed in code
  genres: string[];           // raw platform tags (Spotify) or []
  details: string[];          // human-readable evidence lines (albums, description, subscriber count)
  official: boolean;          // YouTube "- Topic" channel
  description: string;        // YouTube channel description, "" for Spotify
}

export interface LinkFeatures {
  judge_rating: Rating;
  name_similarity: number;
  corroborated: boolean;
  location_evidence: boolean;
  web_citation: boolean;
  same_name_count: number;
  official_channel: boolean;
}

export interface LinkProposal {
  external_id: string;
  url: string;
  display_name: string;
  evidence: string[];
  confidence: number;
  reason: string;
}

export interface LinkDecision {
  chosen: LinkProposal | null;
  alternatives: LinkProposal[];
  deferred?: "youtube_quota" | "escalation_budget";
}

export type LineupEntry =
  | { kind: "existing"; billed_as: string; artist_id: string; role: Role; billing_order: number;
      confidence: number; new_links?: { spotify?: LinkDecision; youtube?: LinkDecision } }
  | { kind: "new"; billed_as: string; clean_name: string; role: Role; billing_order: number;
      hometown: string | null; genres: Genre[]; confidence: number;
      spotify: LinkDecision; youtube: LinkDecision }
  | { kind: "not_an_artist"; billed_as: string; category: NonArtistCategory; reason: string; confidence: number };

export interface EventClassification {
  category: EventCategory;
  category_confidence: number;
  event_genres: Genre[];
  reason: string;
}

export interface Proposal {
  event_id: string;
  schema_version: 2;
  event: EventClassification;
  artists: LineupEntry[];
  lineup_confidence: number;
  overall_confidence: number;
}

export interface StoredArtist {
  id: string;
  name: string;
  genres: string[];
  spotify_id: string | null;
  youtube_channel_id: string | null;
  hometown: string | null;
}
```

- [ ] **Step 2: Write the failing test** (`normalize.test.ts`)

```ts
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
```

- [ ] **Step 3: Run it; expect a failure** (module not found): `npx vitest run src/lib/artist-pipeline/normalize.test.ts`

- [ ] **Step 4: Implement `normalize.ts`**

```ts
export function normalizeArtistName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (base === "") return name.trim().toLowerCase().replace(/\s+/g, " ");

  const stripped = base.replace(/^the\s+/, "");
  return stripped === "" ? base : stripped;
}
```

- [ ] **Step 5: Run it; expect a pass.** Same command. All pass.

- [ ] **Step 6: Checkpoint.** Ask whether to commit ("feat(artists): pipeline types and name normalization").

---

### Task 4: Name similarity

**Files:**
- Create: `src/lib/artist-pipeline/similarity.ts`
- Test: `src/lib/artist-pipeline/similarity.test.ts`

**Interfaces:**
- Consumes: `normalizeArtistName`
- Produces: `jaroWinkler(a: string, b: string): number`, `nameSimilarity(a: string, b: string): number` (1.0 only for an exact normalized match; otherwise ≤ 0.95), `HIGH_SIMILARITY = 0.9`

- [ ] **Step 1: Write the failing test**

```ts
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
});
```

- [ ] **Step 2: Run it; expect a failure.** `npx vitest run src/lib/artist-pipeline/similarity.test.ts`

- [ ] **Step 3: Implement**

```ts
import { normalizeArtistName } from "./normalize";

export const HIGH_SIMILARITY = 0.9;

export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatch = new Array(a.length).fill(false);
  const bMatch = new Array(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const lo = Math.max(0, i - range);
    const hi = Math.min(i + range + 1, b.length);
    for (let j = lo; j < hi; j++) {
      if (bMatch[j] || a[i] !== b[j]) continue;
      aMatch[i] = bMatch[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let t = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatch[i]) continue;
    while (!bMatch[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  const jaro = (matches / a.length + matches / b.length + (matches - t / 2) / matches) / 3;
  let prefix = 0;
  while (prefix < 4 && a[prefix] === b[prefix]) prefix++;
  return jaro + prefix * 0.1 * (1 - jaro);
}

function tokenDice(a: string, b: string): number {
  const ta = new Set(a.split(" "));
  const tb = new Set(b.split(" "));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return (2 * inter) / (ta.size + tb.size);
}

export function nameSimilarity(a: string, b: string): number {
  const na = normalizeArtistName(a);
  const nb = normalizeArtistName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  // Character similarity alone over-rates shared prefixes ("surfer girl" vs "surfer blood"),
  // so require token overlap too.
  return Math.min(0.95, Math.min(jaroWinkler(na, nb), 0.5 + tokenDice(na, nb) / 2));
}
```

- [ ] **Step 4: Run it; expect a pass.** If `"Wildwoods"/"Wildwood"` falls below 0.9, that's acceptable (it's a different string). Only the listed assertions matter.

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): name similarity").

---

### Task 5: Genre mapping and evidence helpers

**Files:**
- Create: `src/lib/artist-pipeline/genre-map.ts`, `src/lib/artist-pipeline/evidence.ts`
- Test: `src/lib/artist-pipeline/genre-map.test.ts`, `src/lib/artist-pipeline/evidence.test.ts`

**Interfaces:**
- Produces:
  - `mapToGenres(tags: string[], max?: number): Genre[]`
  - `filterGenres(values: string[]): Genre[]`
  - `hasLocationEvidence(texts: string[]): boolean`
  - `spotifyIdInText(spotifyId: string, text: string): boolean`

- [ ] **Step 1: Write the failing tests**

`genre-map.test.ts`:

```ts
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
```

`evidence.test.ts`:

```ts
import { expect, test } from "vitest";
import { hasLocationEvidence, spotifyIdInText } from "./evidence";

test("detects Omaha/Nebraska mentions", () => {
  expect(hasLocationEvidence(["Indie rock from Omaha, NE"])).toBe(true);
  expect(hasLocationEvidence(["Lincoln, Nebraska band"])).toBe(true);
  expect(hasLocationEvidence(["Based in Council Bluffs"])).toBe(true);
  expect(hasLocationEvidence(["From Austin, TX"])).toBe(false);
});
test("finds a Spotify artist id in a description", () => {
  const d = "Listen: https://open.spotify.com/artist/4eN6auE38LEQDQ1ntJkCtT?si=x";
  expect(spotifyIdInText("4eN6auE38LEQDQ1ntJkCtT", d)).toBe(true);
  expect(spotifyIdInText("0000000000000000000000", d)).toBe(false);
});
```

- [ ] **Step 2: Run them; expect a failure.** `npx vitest run src/lib/artist-pipeline/genre-map.test.ts src/lib/artist-pipeline/evidence.test.ts`

- [ ] **Step 3: Implement `genre-map.ts`**

```ts
import { GENRES, type Genre } from "../genres";

const GENRE_SET = new Set<string>(GENRES);

// Checked in order; first match wins for a tag.
const KEYWORDS: [RegExp, Genre][] = [
  [/\bhip[ -]?hop\b|\brap\b/, "hip-hop"],
  [/\br&b\b|\brnb\b/, "r&b"],
  [/\bbluegrass\b/, "americana"],
  [/\bedm\b|\belectronica\b|\bsynth/, "electronic"],
  [/\bdrum and bass\b|\bdnb\b/, "drum-and-bass"],
  [/\bsinger[- ]songwriter\b/, "singer-songwriter"],
  [/\bpost[- ]hardcore\b|\bmetalcore\b/, "hardcore"],
  [/\bshoegaze\b|\bdream pop\b/, "indie"],
  [/\bstand[- ]up\b/, "comedy"],
  [/\bworship\b|\bccm\b/, "christian"],
];

export function filterGenres(values: string[]): Genre[] {
  const out: Genre[] = [];
  for (const v of values) {
    const g = v.trim().toLowerCase();
    if (GENRE_SET.has(g) && !out.includes(g as Genre)) out.push(g as Genre);
  }
  return out;
}

export function mapToGenres(tags: string[], max = 3): Genre[] {
  const out: Genre[] = [];
  const add = (g: Genre) => { if (!out.includes(g) && out.length < max) out.push(g); };
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (GENRE_SET.has(tag)) { add(tag as Genre); continue; }
    const kw = KEYWORDS.find(([re]) => re.test(tag));
    if (kw) { add(kw[1]); continue; }
    // Compound tags ("pop punk", "nebraska indie"): the last recognized word is the head genre.
    const words = tag.split(/\s+/);
    for (let i = words.length - 1; i >= 0; i--) {
      if (GENRE_SET.has(words[i])) { add(words[i] as Genre); break; }
    }
  }
  return out;
}
```

- [ ] **Step 4: Implement `evidence.ts`**

```ts
const LOCATION = /\b(omaha|nebraska|lincoln,?\s*ne\b|council bluffs|benson)\b/i;

export function hasLocationEvidence(texts: string[]): boolean {
  return texts.some((t) => LOCATION.test(t));
}

export function spotifyIdInText(spotifyId: string, text: string): boolean {
  return text.includes(`open.spotify.com/artist/${spotifyId}`);
}
```

- [ ] **Step 5: Run the tests; expect a pass.**

- [ ] **Step 6: Checkpoint.** Ask whether to commit ("feat(artists): genre mapping and evidence helpers").

---

### Task 6: Spotify client

**Files:**
- Create: `src/lib/artist-pipeline/clients/spotify.ts`
- Test: `src/lib/artist-pipeline/clients/spotify.test.ts`

**Interfaces:**
- Produces:

```ts
export interface SpotifyArtist { id: string; name: string; genres: string[]; imageUrl: string | null }
export interface SpotifyClient {
  searchArtists(query: string): Promise<SpotifyArtist[]>;      // max 10 (dev-mode cap)
  albumTitles(artistName: string): Promise<string[]>;          // "Title (2023)" strings, max 5
}
export class SpotifyError extends Error { status: number }
export function createSpotifyClient(opts: { clientId: string; clientSecret: string; fetch?: typeof fetch }): SpotifyClient
export const spotifyArtistUrl = (id: string) => `https://open.spotify.com/artist/${id}`;
```

- [ ] **Step 1: Write the failing test** (fake `fetch`, no network)

```ts
import { describe, expect, test, vi } from "vitest";
import { createSpotifyClient, SpotifyError, spotifyArtistUrl } from "./spotify";

function fakeFetch(routes: Record<string, { status?: number; body: unknown }>) {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    const key = Object.keys(routes).find((k) => u.includes(k));
    if (!key) throw new Error(`unexpected ${u}`);
    const { status = 200, body } = routes[key];
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
}

const token = { access_token: "t", token_type: "bearer", expires_in: 3600 };

describe("spotify client", () => {
  test("searchArtists maps results and caps limit at 10", async () => {
    const f = fakeFetch({
      "accounts.spotify.com": { body: token },
      "type=artist": { body: { artists: { items: [
        { id: "a1", name: "Surfer Girl", genres: ["nebraska indie"], images: [{ url: "img", height: 1, width: 1 }] },
      ] } } },
    });
    const c = createSpotifyClient({ clientId: "id", clientSecret: "s", fetch: f });
    const res = await c.searchArtists("Surfer Girl");
    expect(res).toEqual([{ id: "a1", name: "Surfer Girl", genres: ["nebraska indie"], imageUrl: "img" }]);
    const searchUrl = String((f as any).mock.calls.find((c: any[]) => String(c[0]).includes("type=artist"))[0]);
    expect(searchUrl).toContain("limit=10");
  });

  test("albumTitles formats title and year", async () => {
    const f = fakeFetch({
      "accounts.spotify.com": { body: token },
      "type=album": { body: { albums: { items: [{ name: "Ocean", release_date: "2023-05-01" }] } } },
    });
    const c = createSpotifyClient({ clientId: "id", clientSecret: "s", fetch: f });
    expect(await c.albumTitles("Surfer Girl")).toEqual(["Ocean (2023)"]);
  });

  test("non-OK responses throw SpotifyError with status (not an empty result)", async () => {
    const f = fakeFetch({
      "accounts.spotify.com": { body: token },
      "type=artist": { status: 403, body: { error: { message: "premium required" } } },
    });
    const c = createSpotifyClient({ clientId: "id", clientSecret: "s", fetch: f });
    await expect(c.searchArtists("x")).rejects.toMatchObject({ status: 403 });
    await expect(c.searchArtists("x")).rejects.toBeInstanceOf(SpotifyError);
  });

  test("url builder", () => expect(spotifyArtistUrl("abc")).toBe("https://open.spotify.com/artist/abc"));
});
```

- [ ] **Step 2: Run it; expect a failure.**

- [ ] **Step 3: Implement**

```ts
export interface SpotifyArtist { id: string; name: string; genres: string[]; imageUrl: string | null }
export interface SpotifyClient {
  searchArtists(query: string): Promise<SpotifyArtist[]>;
  albumTitles(artistName: string): Promise<string[]>;
}

export class SpotifyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const spotifyArtistUrl = (id: string) => `https://open.spotify.com/artist/${id}`;

export function createSpotifyClient(opts: { clientId: string; clientSecret: string; fetch?: typeof fetch }): SpotifyClient {
  const f = opts.fetch ?? fetch;
  let cached: { token: string; expiresAt: number } | null = null;

  async function token(): Promise<string> {
    if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;
    const res = await f("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${opts.clientId}:${opts.clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) throw new SpotifyError(`Spotify auth failed`, res.status);
    const data = (await res.json()) as { access_token: string; expires_in: number };
    cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return cached.token;
  }

  async function get<T>(path: string): Promise<T> {
    const res = await f(`https://api.spotify.com/v1/${path}`, { headers: { Authorization: `Bearer ${await token()}` } });
    if (!res.ok) throw new SpotifyError(`Spotify ${path} failed`, res.status);
    return (await res.json()) as T;
  }

  return {
    async searchArtists(query) {
      type R = { artists: { items: { id: string; name: string; genres?: string[]; images?: { url: string }[] }[] } };
      const data = await get<R>(`search?type=artist&limit=10&q=${encodeURIComponent(query)}`);
      return data.artists.items.map((a) => ({
        id: a.id, name: a.name, genres: a.genres ?? [], imageUrl: a.images?.[0]?.url ?? null,
      }));
    },
    async albumTitles(artistName) {
      type R = { albums: { items: { name: string; release_date?: string }[] } };
      const q = encodeURIComponent(`artist:"${artistName}"`);
      const data = await get<R>(`search?type=album&limit=5&q=${q}`);
      return data.albums.items.map((a) => `${a.name} (${(a.release_date ?? "").slice(0, 4) || "?"})`);
    },
  };
}
```

- [ ] **Step 4: Run it; expect a pass.**

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): spotify client").

---

### Task 7: YouTube client with quota tracking

**Files:**
- Create: `src/lib/artist-pipeline/clients/youtube.ts`
- Test: `src/lib/artist-pipeline/clients/youtube.test.ts`

**Interfaces:**
- Produces:

```ts
export interface YouTubeChannel { id: string; title: string; description: string; customUrl: string | null; subscriberCount: number | null }
export interface YouTubeClient { searchChannels(query: string): Promise<YouTubeChannel[]>; unitsUsed(): number }
export class QuotaExceededError extends Error {}
export class YouTubeError extends Error { status: number }
export function createYouTubeClient(opts: { apiKey: string; dailyBudgetUnits?: number; fetch?: typeof fetch }): YouTubeClient
export const youtubeChannelUrl = (id: string) => `https://www.youtube.com/channel/${id}`;
```

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test, vi } from "vitest";
import { createYouTubeClient, QuotaExceededError } from "./youtube";

function fakeFetch() {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    if (u.includes("/search?")) {
      return new Response(JSON.stringify({ items: [{ id: { channelId: "UC1" } }, { id: { channelId: "UC2" } }] }));
    }
    if (u.includes("/channels?")) {
      return new Response(JSON.stringify({ items: [
        { id: "UC1", snippet: { title: "South Summit - Topic", description: "", customUrl: null }, statistics: { subscriberCount: "120" } },
        { id: "UC2", snippet: { title: "South Summit", description: "Omaha band", customUrl: "@southsummit" }, statistics: {} },
      ] }));
    }
    throw new Error(u);
  }) as unknown as typeof fetch;
}

test("search + channel details, units counted (100 + 1)", async () => {
  const yt = createYouTubeClient({ apiKey: "k", fetch: fakeFetch() });
  const res = await yt.searchChannels("South Summit");
  expect(res.map((c) => c.id)).toEqual(["UC1", "UC2"]);
  expect(res[0].subscriberCount).toBe(120);
  expect(res[1].subscriberCount).toBeNull();
  expect(yt.unitsUsed()).toBe(101);
});

test("throws QuotaExceededError before calling when budget would be exceeded", async () => {
  const f = fakeFetch();
  const yt = createYouTubeClient({ apiKey: "k", fetch: f, dailyBudgetUnits: 150 });
  await yt.searchChannels("a");
  await expect(yt.searchChannels("b")).rejects.toBeInstanceOf(QuotaExceededError);
  expect((f as any).mock.calls.length).toBe(2);
});

test("API quotaExceeded 403 becomes QuotaExceededError", async () => {
  const f = vi.fn(async () => new Response(JSON.stringify({ error: { errors: [{ reason: "quotaExceeded" }] } }), { status: 403 })) as unknown as typeof fetch;
  const yt = createYouTubeClient({ apiKey: "k", fetch: f });
  await expect(yt.searchChannels("a")).rejects.toBeInstanceOf(QuotaExceededError);
});
```

- [ ] **Step 2: Run it; expect a failure.**

- [ ] **Step 3: Implement**

```ts
export interface YouTubeChannel { id: string; title: string; description: string; customUrl: string | null; subscriberCount: number | null }
export interface YouTubeClient { searchChannels(query: string): Promise<YouTubeChannel[]>; unitsUsed(): number }

export class QuotaExceededError extends Error {}
export class YouTubeError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const youtubeChannelUrl = (id: string) => `https://www.youtube.com/channel/${id}`;

const SEARCH_COST = 100;
const CHANNELS_COST = 1;

export function createYouTubeClient(opts: { apiKey: string; dailyBudgetUnits?: number; fetch?: typeof fetch }): YouTubeClient {
  const f = opts.fetch ?? fetch;
  const budget = opts.dailyBudgetUnits ?? 9_000;
  let used = 0;

  async function get<T>(path: string, cost: number): Promise<T> {
    if (used + cost > budget) throw new QuotaExceededError(`YouTube budget ${budget} units reached`);
    const res = await f(`https://www.googleapis.com/youtube/v3/${path}&key=${opts.apiKey}`);
    used += cost;
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: { errors?: { reason?: string }[] } };
      if (body.error?.errors?.some((e) => e.reason === "quotaExceeded")) throw new QuotaExceededError("YouTube quota exceeded");
      throw new YouTubeError(`YouTube ${path.split("?")[0]} failed`, res.status);
    }
    return (await res.json()) as T;
  }

  return {
    unitsUsed: () => used,
    async searchChannels(query) {
      type S = { items: { id: { channelId: string } }[] };
      const s = await get<S>(`search?part=snippet&type=channel&maxResults=5&q=${encodeURIComponent(query)}`, SEARCH_COST);
      const ids = s.items.map((i) => i.id.channelId);
      if (ids.length === 0) return [];
      type C = { items: { id: string; snippet: { title: string; description?: string; customUrl?: string | null }; statistics?: { subscriberCount?: string } }[] };
      const c = await get<C>(`channels?part=snippet,statistics&id=${ids.join(",")}`, CHANNELS_COST);
      const byId = new Map(c.items.map((i) => [i.id, i]));
      return ids.flatMap((id) => {
        const i = byId.get(id);
        if (!i) return [];
        const subs = i.statistics?.subscriberCount;
        return [{
          id, title: i.snippet.title, description: i.snippet.description ?? "",
          customUrl: i.snippet.customUrl ?? null, subscriberCount: subs ? Number(subs) : null,
        }];
      });
    },
  };
}
```

- [ ] **Step 4: Run it; expect a pass.**

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): youtube client with quota tracking").

---

### Task 8: Venue event page text

**Files:**
- Create: `src/lib/artist-pipeline/clients/event-page.ts`
- Test: `src/lib/artist-pipeline/clients/event-page.test.ts`

**Interfaces:**
- Produces: `fetchEventPageText(url: string | null, opts?: { fetch?: typeof fetch; timeoutMs?: number; maxChars?: number }): Promise<string | null>`. It never throws, and returns `null` on any failure.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test, vi } from "vitest";
import { fetchEventPageText } from "./event-page";

const html = (body: string) =>
  new Response(`<html><head><style>.x{}</style><script>var a=1</script></head><body>${body}</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } });

test("strips tags/scripts/styles and decodes entities", async () => {
  const f = vi.fn(async () => html("<h1>Surfer Girl</h1><p>w/ South Summit &amp; JOBY!</p>")) as unknown as typeof fetch;
  expect(await fetchEventPageText("https://x", { fetch: f })).toBe("Surfer Girl w/ South Summit & JOBY!");
});

test("caps length", async () => {
  const f = vi.fn(async () => html("a".repeat(10_000))) as unknown as typeof fetch;
  expect((await fetchEventPageText("https://x", { fetch: f, maxChars: 100 }))!.length).toBe(100);
});

test.each([
  ["null url", null, async () => html("x")],
  ["http error", "https://x", async () => new Response("no", { status: 500 })],
  ["non-html", "https://x", async () => new Response("{}", { headers: { "content-type": "application/json" } })],
  ["network error", "https://x", async () => { throw new Error("ECONNRESET"); }],
])("returns null on %s", async (_n, url, impl) => {
  const f = vi.fn(impl) as unknown as typeof fetch;
  expect(await fetchEventPageText(url as string | null, { fetch: f })).toBeNull();
});
```

- [ ] **Step 2: Run it; expect a failure.**

- [ ] **Step 3: Implement**

```ts
const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

export async function fetchEventPageText(
  url: string | null,
  opts: { fetch?: typeof fetch; timeoutMs?: number; maxChars?: number } = {},
): Promise<string | null> {
  if (!url) return null;
  const f = opts.fetch ?? fetch;
  try {
    const res = await f(url, {
      signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OmahaShowsBot/1.0; +https://omahashows.com)" },
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null;
    const text = (await res.text())
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? " ")
      .replace(/\s+/g, " ")
      .trim();
    return text ? text.slice(0, opts.maxChars ?? 6000) : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run it; expect a pass.**

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): venue page text fetcher").

---

### Task 9: LLM wrapper and lineup extraction

**Files:**
- Create: `src/lib/artist-pipeline/clients/llm.ts`, `src/lib/artist-pipeline/stages/extract.ts`
- Test: `src/lib/artist-pipeline/stages/extract.test.ts`

**Interfaces:**
- Consumes: `filterGenres` (Task 5); types (Task 3)
- Produces:

```ts
// llm.ts
export const MODELS: { extract: string; judge: string; escalate: string };
export class LLMError extends Error { reason: "refusal" | "max_tokens" | "unparseable" }
export interface StructuredLLM {
  parse<T>(args: { model: string; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number }): Promise<T>;
}
export function createStructuredLLM(client?: Anthropic): StructuredLLM;
export function effortParams(model: string): { effort?: "low" | "medium" | "high" };

// extract.ts
export const ExtractionSchema: z.ZodType<...>;
export function buildExtractionPrompt(event: PipelineEvent, pageText: string | null): { system: string; user: string };
export async function extractLineup(event: PipelineEvent, pageText: string | null, llm: StructuredLLM, model: string): Promise<Extraction>;
```

- [ ] **Step 1: Implement `llm.ts`** (thin SDK wrapper; exercised via fakes and the eval)

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

export const MODELS = {
  extract: process.env.ARTIST_EXTRACT_MODEL ?? "claude-opus-5-5",
  judge: process.env.ARTIST_JUDGE_MODEL ?? "claude-opus-5-5",
  escalate: process.env.ARTIST_ESCALATE_MODEL ?? "claude-opus-5-5",
};

export class LLMError extends Error {
  constructor(public reason: "refusal" | "max_tokens" | "unparseable") { super(`LLM ${reason}`); }
}

export interface StructuredLLM {
  parse<T>(args: { model: string; system: string; user: string; schema: z.ZodType<T>; maxTokens?: number }): Promise<T>;
}

// Haiku 4.5 does not accept `effort`; newer models do (Opus 5.5 defaults to medium).
export function effortParams(model: string): { effort?: "low" | "medium" | "high" } {
  return model.startsWith("claude-haiku") ? {} : { effort: "medium" };
}

export function createStructuredLLM(client: Anthropic = new Anthropic()): StructuredLLM {
  return {
    async parse({ model, system, user, schema, maxTokens = 8000 }) {
      const res = await client.messages.parse({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
        output_config: { format: zodOutputFormat(schema), ...effortParams(model) },
      });
      if (res.stop_reason === "refusal") throw new LLMError("refusal");
      if (res.stop_reason === "max_tokens") throw new LLMError("max_tokens");
      if (res.parsed_output == null) throw new LLMError("unparseable");
      return res.parsed_output as z.infer<typeof schema>;
    },
  };
}
```

If `tsc` rejects the `output_config` shape for this SDK version, check the SDK's `helpers/zod` export and `MessageParseParams` type in `node_modules/@anthropic-ai/sdk` and adjust. Do not fall back to regex JSON parsing.

- [ ] **Step 2: Write the failing extraction test**

```ts
import { describe, expect, test } from "vitest";
import { buildExtractionPrompt, extractLineup } from "./extract";
import type { StructuredLLM } from "../clients/llm";
import type { PipelineEvent } from "../types";

const event: PipelineEvent = {
  id: "slowdown-1", title: "Surfer Girl", date: "2026-10-12", venueName: "The Slowdown",
  eventUrl: "https://x", supportingArtists: ["South Summit", "JOBY!"],
};

function fakeLLM(output: unknown): StructuredLLM & { calls: any[] } {
  const calls: any[] = [];
  return { calls, async parse(args) { calls.push(args); return output as any; } };
}

describe("buildExtractionPrompt", () => {
  test("includes title, supporting artists, venue, date and page text", () => {
    const { user } = buildExtractionPrompt(event, "Doors 7pm. South Summit is from Omaha.");
    expect(user).toContain("Surfer Girl");
    expect(user).toContain("South Summit");
    expect(user).toContain("JOBY!");
    expect(user).toContain("The Slowdown");
    expect(user).toContain("2026-10-12");
    expect(user).toContain("South Summit is from Omaha");
  });
  test("says so when no page text", () => {
    expect(buildExtractionPrompt(event, null).user).toContain("(venue page unavailable)");
  });
});

describe("extractLineup", () => {
  test("filters off-list genres and renumbers billing order", async () => {
    const llm = fakeLLM({
      category: "music", category_rating: "high", event_genres: ["indie", "nebraska indie"],
      lineup_rating: "high", reason: "concert",
      acts: [
        { billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 7, kind: "original_artist",
          non_artist_category: null, genres: ["rock", "space rock"], hometown: null, reason: "" },
        { billed_as: "Surfer Girl", clean_name: "Surfer Girl", role: "headliner", billing_order: 1, kind: "original_artist",
          non_artist_category: null, genres: ["indie"], hometown: "Omaha, NE", reason: "" },
        { billed_as: " ", clean_name: " ", role: "supporting", billing_order: 3, kind: "unknown",
          non_artist_category: null, genres: [], hometown: null, reason: "" },
      ],
    });
    const res = await extractLineup(event, null, llm, "m");
    expect(res.event_genres).toEqual(["indie"]);
    expect(res.acts.map((a) => [a.clean_name, a.billing_order])).toEqual([["Surfer Girl", 1], ["JOBY!", 2]]);
    expect(res.acts[1].genres).toEqual(["rock"]);
    expect(llm.calls[0].model).toBe("m");
  });
});
```

- [ ] **Step 3: Run it; expect a failure.** `npx vitest run src/lib/artist-pipeline/stages/extract.test.ts`

- [ ] **Step 4: Implement `extract.ts`**

```ts
import { z } from "zod";
import { GENRES } from "../../genres";
import { filterGenres } from "../genre-map";
import type { Extraction, PipelineEvent } from "../types";
import type { StructuredLLM } from "../clients/llm";

const rating = z.enum(["high", "medium", "low"]);

export const ExtractionSchema = z.object({
  category: z.enum(["music", "comedy", "theater", "sports", "other"]),
  category_rating: rating,
  event_genres: z.array(z.string()),
  lineup_rating: rating,
  reason: z.string(),
  acts: z.array(z.object({
    billed_as: z.string(),
    clean_name: z.string(),
    role: z.enum(["headliner", "co-headliner", "supporting"]),
    billing_order: z.number().int(),
    kind: z.enum(["original_artist", "not_an_artist", "unknown"]),
    non_artist_category: z.enum(["tribute", "orchestra_score", "dj", "comedian", "event_name", "other"]).nullable(),
    genres: z.array(z.string()),
    hometown: z.string().nullable(),
    reason: z.string(),
  })),
});

const SYSTEM = `You analyze listings from Omaha, NE music venues for a local show calendar.

For each listing decide:
1. category: music | comedy | theater | sports | other. Karaoke, bingo, trivia, markets, parties without named performers are "other". Tribute and cover nights are "music".
2. The billed acts, headliner first, in billing order. Use the title, the supporting-artist list and the venue page. Split multi-act titles ("A, B, C", "A w/ B", "A with B and C") into acts, but keep "&"/"and" when it is part of one band's name (e.g. "Mumford & Sons").
3. For each act, kind:
   - original_artist: a real band/musician performing their own music.
   - not_an_artist: tribute acts, "X performs the music of Y", orchestras/ensembles playing film, TV or game scores ("Star Wars in Concert"), karaoke hosts, DJ theme nights, DJs, comedians, and generic event names ("FREE PUNK SHOW", "Halloween Bash"). Set non_artist_category accordingly.
   - unknown: you cannot tell. Prefer unknown over guessing.
4. clean_name: the act's name without billing decorations ("(album release)", "- farewell tour", "live", "feat. ..." belongs to a separate act).
5. genres: 1-3 per original_artist and 0-3 event_genres, ONLY from: ${GENRES.join(", ")}. Tribute nights: "tribute" plus the tributed act's genre. Comedy: "comedy".
6. hometown only if the page says so.
7. Ratings: "high" only when the listing makes it unambiguous.`;

export function buildExtractionPrompt(event: PipelineEvent, pageText: string | null) {
  const user = [
    `Title: ${event.title}`,
    `Supporting artists (from the venue listing): ${event.supportingArtists.length ? event.supportingArtists.join(" | ") : "(none listed)"}`,
    `Venue: ${event.venueName}`,
    `Date: ${event.date}`,
    `Venue page text:`,
    pageText ?? "(venue page unavailable)",
  ].join("\n");
  return { system: SYSTEM, user };
}

export async function extractLineup(
  event: PipelineEvent, pageText: string | null, llm: StructuredLLM, model: string,
): Promise<Extraction> {
  const { system, user } = buildExtractionPrompt(event, pageText);
  const raw = await llm.parse({ model, system, user, schema: ExtractionSchema });
  const acts = raw.acts
    .filter((a) => a.clean_name.trim() !== "")
    .sort((a, b) => a.billing_order - b.billing_order)
    .map((a, i) => ({ ...a, clean_name: a.clean_name.trim(), billing_order: i + 1, genres: filterGenres(a.genres) }));
  return { ...raw, event_genres: filterGenres(raw.event_genres), acts };
}
```

- [ ] **Step 5: Run it; expect a pass.** Then `npm run build` to type-check `llm.ts`.

- [ ] **Step 6: Checkpoint.** Ask whether to commit ("feat(artists): llm wrapper and lineup extraction").

---

### Task 10: Resolve existing artists

**Files:**
- Create: `src/lib/artist-pipeline/stages/resolve.ts`
- Test: `src/lib/artist-pipeline/stages/resolve.test.ts`

**Interfaces:**
- Consumes: `normalizeArtistName`, `StoredArtist`
- Produces:

```ts
export interface ArtistRepo {
  findByAlias(aliasNormalized: string): Promise<StoredArtist | null>;
  rejectedExternalIds(artistId: string, platform: Platform): Promise<Set<string>>;
}
export interface Resolution { artist: StoredArtist | null; missing: Platform[] }
export async function resolveAct(cleanName: string, repo: ArtistRepo): Promise<Resolution>;
```

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run it; expect a failure.**

- [ ] **Step 3: Implement**

```ts
import { normalizeArtistName } from "../normalize";
import type { Platform, StoredArtist } from "../types";

export interface ArtistRepo {
  findByAlias(aliasNormalized: string): Promise<StoredArtist | null>;
  rejectedExternalIds(artistId: string, platform: Platform): Promise<Set<string>>;
}

export interface Resolution { artist: StoredArtist | null; missing: Platform[] }

export async function resolveAct(cleanName: string, repo: ArtistRepo): Promise<Resolution> {
  const artist = await repo.findByAlias(normalizeArtistName(cleanName));
  if (!artist) return { artist: null, missing: ["spotify", "youtube"] };
  const missing: Platform[] = [];
  if (!artist.spotify_id) missing.push("spotify");
  if (!artist.youtube_channel_id) missing.push("youtube");
  return { artist, missing };
}
```

- [ ] **Step 4: Run it; expect a pass.**

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): resolve existing artists by alias").

---

### Task 11: Candidates, judge and guardrails

**Files:**
- Create: `src/lib/artist-pipeline/stages/candidates.ts`, `src/lib/artist-pipeline/stages/judge.ts`
- Test: `src/lib/artist-pipeline/stages/candidates.test.ts`, `src/lib/artist-pipeline/stages/judge.test.ts`

**Interfaces:**
- Consumes: `SpotifyClient`, `YouTubeClient`, `nameSimilarity`, `spotifyArtistUrl`, `youtubeChannelUrl`, `StructuredLLM`, `hasLocationEvidence`, `spotifyIdInText`
- Produces:

```ts
// candidates.ts
export async function gatherSpotifyCandidates(act: { clean_name: string; billed_as: string }, spotify: SpotifyClient, rejected: Set<string>): Promise<Candidate[]>;
export async function gatherYouTubeCandidates(act: { clean_name: string }, youtube: YouTubeClient, rejected: Set<string>): Promise<Candidate[]>;

// judge.ts
export const PlatformPickSchema, JudgeSchema;              // zod
export type JudgeOutput = z.infer<typeof JudgeSchema>;
export interface JudgeContext { act: ExtractedAct; event: PipelineEvent; pageText: string | null; otherActs: string[];
                                spotify: Candidate[]; youtube: Candidate[] }
export interface GuardedPick { candidate: Candidate | null; rating: Rating; reason: string; evidence: string[]; features: LinkFeatures | null }
export interface JudgeResult { spotify: GuardedPick; youtube: GuardedPick; genres: Genre[]; hometown: string | null }
export async function judgeAct(ctx: JudgeContext, llm: StructuredLLM, model: string): Promise<JudgeResult>;
export function applyGuardrails(out: JudgeOutput, ctx: JudgeContext, extra?: { webCitations?: string[] }): JudgeResult;
```

- [ ] **Step 1: Write the failing candidates test**

```ts
import { expect, test } from "vitest";
import { gatherSpotifyCandidates, gatherYouTubeCandidates } from "./candidates";
import type { SpotifyClient } from "../clients/spotify";
import type { YouTubeClient } from "../clients/youtube";

const spotify: SpotifyClient = {
  async searchArtists(q) {
    return [
      { id: "s1", name: "Joby", genres: ["nebraska indie"], imageUrl: null },
      { id: "s2", name: "Joby Talbot", genres: ["soundtrack"], imageUrl: null },
      { id: "s1", name: "Joby", genres: [], imageUrl: null }, // duplicate across queries
      { id: "bad", name: "Joby", genres: [], imageUrl: null },
    ].filter(() => q.length > 0);
  },
  async albumTitles() { return ["Tape One (2024)"]; },
};

test("spotify: dedupes, drops rejected, sorts by similarity, adds album evidence", async () => {
  const c = await gatherSpotifyCandidates({ clean_name: "JOBY!", billed_as: "JOBY!" }, spotify, new Set(["bad"]));
  expect(c.map((x) => x.external_id)).toEqual(["s1", "s2"]);
  expect(c[0].name_similarity).toBe(1);
  expect(c[0].url).toBe("https://open.spotify.com/artist/s1");
  expect(c[0].details).toContain("albums: Tape One (2024)");
});

const youtube: YouTubeClient = {
  unitsUsed: () => 0,
  async searchChannels() {
    return [{ id: "UC1", title: "JOBY! - Topic", description: "", customUrl: null, subscriberCount: 40 }];
  },
};

test("youtube: marks Topic channels official and compares name without the suffix", async () => {
  const c = await gatherYouTubeCandidates({ clean_name: "JOBY!" }, youtube, new Set());
  expect(c[0]).toMatchObject({ external_id: "UC1", official: true, name_similarity: 1 });
  expect(c[0].url).toBe("https://www.youtube.com/channel/UC1");
});
```

- [ ] **Step 2: Write the failing judge test**

```ts
import { describe, expect, test } from "vitest";
import { applyGuardrails, type JudgeContext } from "./judge";
import type { Candidate } from "../types";

const cand = (p: Partial<Candidate>): Candidate => ({
  platform: "spotify", external_id: "s1", url: "https://open.spotify.com/artist/s1", display_name: "Joby",
  name_similarity: 1, genres: [], details: [], official: false, description: "", ...p,
});

const ctx = (spotify: Candidate[], youtube: Candidate[] = []): JudgeContext => ({
  act: { billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 2, kind: "original_artist",
         non_artist_category: null, genres: ["rock"], hometown: null, reason: "" },
  event: { id: "e", title: "Surfer Girl", date: "2026-10-12", venueName: "The Slowdown", eventUrl: null, supportingArtists: [] },
  pageText: null, otherActs: ["Surfer Girl"], spotify, youtube,
});

const pick = (external_id: string | null, rating: "high" | "medium" | "low" = "high") =>
  ({ external_id, rating, reason: "r", evidence: [] });

describe("applyGuardrails", () => {
  test("id not in candidate list becomes null (no fabricated links)", () => {
    const r = applyGuardrails({ spotify: pick("invented"), youtube: pick(null), genres: [], hometown: null }, ctx([cand({})]));
    expect(r.spotify.candidate).toBeNull();
    expect(r.spotify.features).toBeNull();
  });
  test("valid pick yields features incl. ambiguity count", () => {
    const r = applyGuardrails(
      { spotify: pick("s1"), youtube: pick(null), genres: ["rock", "space rock"], hometown: null },
      ctx([cand({}), cand({ external_id: "s2", display_name: "JOBY" })]),
    );
    expect(r.spotify.candidate?.external_id).toBe("s1");
    expect(r.spotify.features).toMatchObject({ judge_rating: "high", name_similarity: 1, same_name_count: 2, corroborated: false });
    expect(r.genres).toEqual(["rock"]);
  });
  test("youtube description linking the chosen spotify id marks both corroborated", () => {
    const yt = cand({ platform: "youtube", external_id: "UC1", url: "u", description: "open.spotify.com/artist/s1" });
    const r = applyGuardrails({ spotify: pick("s1"), youtube: pick("UC1"), genres: [], hometown: null }, ctx([cand({})], [yt]));
    expect(r.spotify.features?.corroborated).toBe(true);
    expect(r.youtube.features?.corroborated).toBe(true);
  });
  test("location evidence from page text or description", () => {
    const c = ctx([cand({})]);
    c.pageText = "JOBY! (Omaha)";
    const r = applyGuardrails({ spotify: pick("s1"), youtube: pick(null), genres: [], hometown: null }, c);
    expect(r.spotify.features?.location_evidence).toBe(true);
  });
});
```

- [ ] **Step 3: Run both; expect a failure.**

- [ ] **Step 4: Implement `candidates.ts`**

```ts
import { nameSimilarity } from "../similarity";
import { spotifyArtistUrl, type SpotifyClient } from "../clients/spotify";
import { youtubeChannelUrl, type YouTubeClient } from "../clients/youtube";
import type { Candidate } from "../types";

export async function gatherSpotifyCandidates(
  act: { clean_name: string; billed_as: string }, spotify: SpotifyClient, rejected: Set<string>,
): Promise<Candidate[]> {
  const queries = [...new Set([act.clean_name, `artist:"${act.clean_name}"`, act.billed_as])];
  const seen = new Map<string, Candidate>();
  for (const q of queries) {
    for (const a of await spotify.searchArtists(q)) {
      if (rejected.has(a.id) || seen.has(a.id)) continue;
      seen.set(a.id, {
        platform: "spotify", external_id: a.id, url: spotifyArtistUrl(a.id), display_name: a.name,
        name_similarity: nameSimilarity(act.clean_name, a.name), genres: a.genres,
        details: a.genres.length ? [`genres: ${a.genres.join(", ")}`] : [], official: false, description: "",
      });
    }
  }
  const top = [...seen.values()].sort((x, y) => y.name_similarity - x.name_similarity).slice(0, 8);
  for (const c of top.slice(0, 3)) {
    const albums = await spotify.albumTitles(c.display_name);
    if (albums.length) c.details.push(`albums: ${albums.join("; ")}`);
  }
  return top;
}

export async function gatherYouTubeCandidates(
  act: { clean_name: string }, youtube: YouTubeClient, rejected: Set<string>,
): Promise<Candidate[]> {
  const channels = await youtube.searchChannels(act.clean_name);
  return channels
    .filter((ch) => !rejected.has(ch.id))
    .map((ch) => {
      const official = / - Topic$/.test(ch.title);
      const bare = ch.title.replace(/ - Topic$/, "");
      const details = [
        ch.subscriberCount != null ? `subscribers: ${ch.subscriberCount}` : "subscribers: hidden",
        ...(ch.customUrl ? [`handle: ${ch.customUrl}`] : []),
        ...(ch.description ? [`description: ${ch.description.slice(0, 300)}`] : []),
      ];
      return {
        platform: "youtube" as const, external_id: ch.id, url: youtubeChannelUrl(ch.id), display_name: ch.title,
        name_similarity: nameSimilarity(act.clean_name, bare), genres: [], details, official, description: ch.description,
      };
    });
}
```

- [ ] **Step 5: Implement `judge.ts`**

```ts
import { z } from "zod";
import { filterGenres } from "../genre-map";
import { hasLocationEvidence, spotifyIdInText } from "../evidence";
import { normalizeArtistName } from "../normalize";
import type { StructuredLLM } from "../clients/llm";
import type { Candidate, ExtractedAct, LinkFeatures, PipelineEvent, Rating } from "../types";
import { GENRES, type Genre } from "../../genres";

export const PlatformPickSchema = z.object({
  external_id: z.string().nullable(),
  rating: z.enum(["high", "medium", "low"]),
  reason: z.string(),
  evidence: z.array(z.string()),
});

export const JudgeSchema = z.object({
  spotify: PlatformPickSchema,
  youtube: PlatformPickSchema,
  genres: z.array(z.string()),
  hometown: z.string().nullable(),
});
export type JudgeOutput = z.infer<typeof JudgeSchema>;

export interface JudgeContext {
  act: ExtractedAct; event: PipelineEvent; pageText: string | null; otherActs: string[];
  spotify: Candidate[]; youtube: Candidate[];
}
export interface GuardedPick { candidate: Candidate | null; rating: Rating; reason: string; evidence: string[]; features: LinkFeatures | null }
export interface JudgeResult { spotify: GuardedPick; youtube: GuardedPick; genres: Genre[]; hometown: string | null }

const SYSTEM = `You match a band playing an Omaha, NE show to its Spotify artist profile and official YouTube channel.
You may ONLY choose an external_id from the candidate lists given. If none is clearly the same act, return null.
A wrong match is much worse than no match: many small bands share names with others.
Rate "high" only when evidence ties the candidate to THIS act (exact name plus matching genre/era/location, cross-links, or a "- Topic" channel for the same name with consistent details).
Genres: 1-3 from the allowed list only.`;

function describe(cands: Candidate[]): string {
  if (!cands.length) return "(no candidates)";
  return cands.map((c) => `- id=${c.external_id} name="${c.display_name}" similarity=${c.name_similarity.toFixed(2)}${c.official ? " official-topic-channel" : ""}\n  ${c.details.join("\n  ")}`).join("\n");
}

export function buildJudgePrompt(ctx: JudgeContext, allowedGenres: readonly string[]): { system: string; user: string } {
  const user = [
    `Act: ${ctx.act.clean_name} (billed as "${ctx.act.billed_as}", ${ctx.act.role})`,
    `Show: "${ctx.event.title}" at ${ctx.event.venueName}, ${ctx.event.date}`,
    `Other acts on the bill: ${ctx.otherActs.join(", ") || "(none)"}`,
    `Genre guess from listing: ${ctx.act.genres.join(", ") || "(none)"}`,
    `Hometown from listing: ${ctx.act.hometown ?? "(unknown)"}`,
    `Venue page excerpt: ${ctx.pageText ? ctx.pageText.slice(0, 2000) : "(unavailable)"}`,
    `Allowed genres: ${allowedGenres.join(", ")}`,
    `\nSpotify candidates:\n${describe(ctx.spotify)}`,
    `\nYouTube candidates:\n${describe(ctx.youtube)}`,
  ].join("\n");
  return { system: SYSTEM, user };
}

function guard(
  platform: "spotify" | "youtube", p: JudgeOutput["spotify"], ctx: JudgeContext,
  partner: Candidate | null, webCitations: string[],
): GuardedPick {
  const pool = platform === "spotify" ? ctx.spotify : ctx.youtube;
  const candidate = p.external_id ? pool.find((c) => c.external_id === p.external_id) ?? null : null;
  if (!candidate) return { candidate: null, rating: p.rating, reason: p.reason, evidence: p.evidence, features: null };
  const target = normalizeArtistName(ctx.act.clean_name);
  const sameName = pool.filter((c) => normalizeArtistName(c.display_name.replace(/ - Topic$/, "")) === target).length;
  const spotifyCand = platform === "spotify" ? candidate : partner;
  const ytCand = platform === "youtube" ? candidate : partner;
  const corroborated = !!(spotifyCand && ytCand && spotifyIdInText(spotifyCand.external_id, ytCand.description));
  const features: LinkFeatures = {
    judge_rating: p.rating,
    name_similarity: candidate.name_similarity,
    corroborated,
    location_evidence: hasLocationEvidence([ctx.pageText ?? "", candidate.description, ...candidate.details, ...webCitations]),
    web_citation: webCitations.length > 0,
    same_name_count: sameName,
    official_channel: candidate.official,
  };
  return { candidate, rating: p.rating, reason: p.reason, evidence: p.evidence, features };
}

export function applyGuardrails(out: JudgeOutput, ctx: JudgeContext, extra: { webCitations?: string[] } = {}): JudgeResult {
  const cites = extra.webCitations ?? [];
  const sp = out.spotify.external_id ? ctx.spotify.find((c) => c.external_id === out.spotify.external_id) ?? null : null;
  const yt = out.youtube.external_id ? ctx.youtube.find((c) => c.external_id === out.youtube.external_id) ?? null : null;
  return {
    spotify: guard("spotify", out.spotify, ctx, yt, cites),
    youtube: guard("youtube", out.youtube, ctx, sp, cites),
    genres: filterGenres(out.genres).slice(0, 3),
    hometown: out.hometown,
  };
}

export async function judgeAct(ctx: JudgeContext, llm: StructuredLLM, model: string): Promise<JudgeResult> {
  const { system, user } = buildJudgePrompt(ctx, GENRES);
  const out = await llm.parse({ model, system, user, schema: JudgeSchema });
  return applyGuardrails(out, ctx);
}
```

- [ ] **Step 6: Run both tests; expect a pass.**

- [ ] **Step 7: Checkpoint.** Ask whether to commit ("feat(artists): candidate gathering, judge and guardrails").

---

### Task 12: Escalation agent

**Files:**
- Create: `src/lib/artist-pipeline/stages/escalate.ts`
- Test: `src/lib/artist-pipeline/stages/escalate.test.ts`

**Interfaces:**
- Consumes: `JudgeContext`, `JudgeResult`, `JudgeSchema`, `applyGuardrails`, `buildJudgePrompt`, `SpotifyClient`, `YouTubeClient`, candidate gatherers' mapping logic (via the tools), `effortParams`
- Produces:

```ts
export interface MessagesClient { messages: { create(p: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> } }
export async function escalateAct(ctx: JudgeContext, deps: { client: MessagesClient; spotify: SpotifyClient; youtube: YouTubeClient; model: string; maxTurns?: number }): Promise<JudgeResult | null>
```

It returns `null` if the agent never submits within `maxTurns` (default 6). Candidates found through tools are appended to `ctx.spotify`/`ctx.youtube`, so the guardrail still applies.

- [ ] **Step 1: Write the failing test** (scripted fake client)

```ts
import { expect, test } from "vitest";
import { escalateAct, type MessagesClient } from "./escalate";
import type { JudgeContext } from "./judge";

const ctx = (): JudgeContext => ({
  act: { billed_as: "Slumbering Sun", clean_name: "Slumbering Sun", role: "supporting", billing_order: 2, kind: "original_artist",
         non_artist_category: null, genres: ["rock"], hometown: null, reason: "" },
  event: { id: "e", title: "X", date: "2026-10-12", venueName: "Reverb Lounge", eventUrl: null, supportingArtists: [] },
  pageText: null, otherActs: [], spotify: [], youtube: [],
});

const spotify = { async searchArtists() { return [{ id: "sp9", name: "Slumbering Sun", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } };
const youtube = { unitsUsed: () => 0, async searchChannels() { return []; } };

function scripted(responses: any[]): MessagesClient & { calls: any[] } {
  const calls: any[] = [];
  return { calls, messages: { async create(p) { calls.push(structuredClone(p)); return responses.shift(); } } };
}

const msg = (content: any[], stop_reason: string) => ({ id: "m", type: "message", role: "assistant", model: "x", content, stop_reason, stop_sequence: null, usage: {} });

test("tool call adds candidates; submit_decision with cited URL is guarded and returned", async () => {
  const client = scripted([
    msg([{ type: "tool_use", id: "t1", name: "spotify_search", input: { query: "Slumbering Sun" } }], "tool_use"),
    msg([{ type: "tool_use", id: "t2", name: "submit_decision", input: {
      spotify: { external_id: "sp9", rating: "high", reason: "bandcamp says Omaha", evidence: ["bandcamp"] },
      youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
      genres: ["rock"], hometown: "Omaha, NE", citations: ["https://slumberingsun.bandcamp.com (Omaha, Nebraska)"],
    } }], "tool_use"),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.candidate?.external_id).toBe("sp9");
  expect(r?.spotify.features).toMatchObject({ web_citation: true, location_evidence: true });
  expect(client.calls[0].tools.map((t: any) => t.name)).toEqual(["web_search", "spotify_search", "youtube_search", "submit_decision"]);
});

test("submitted id that no tool ever returned is rejected by the guardrail", async () => {
  const client = scripted([
    msg([{ type: "tool_use", id: "t2", name: "submit_decision", input: {
      spotify: { external_id: "made-up", rating: "high", reason: "", evidence: [] },
      youtube: { external_id: null, rating: "low", reason: "", evidence: [] },
      genres: [], hometown: null, citations: ["https://x"],
    } }], "tool_use"),
  ]);
  const r = await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5" });
  expect(r?.spotify.candidate).toBeNull();
});

test("pause_turn is resumed; no submission within maxTurns returns null", async () => {
  const client = scripted([msg([{ type: "text", text: "..." }], "pause_turn"), msg([{ type: "text", text: "done" }], "end_turn")]);
  expect(await escalateAct(ctx(), { client, spotify, youtube, model: "claude-sonnet-5-5", maxTurns: 2 })).toBeNull();
  expect(client.calls).toHaveLength(2);
});
```

- [ ] **Step 2: Run it; expect a failure.**

- [ ] **Step 3: Implement**

```ts
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { GENRES } from "../../genres";
import { effortParams } from "../clients/llm";
import { nameSimilarity } from "../similarity";
import { spotifyArtistUrl, type SpotifyClient } from "../clients/spotify";
import { youtubeChannelUrl, type YouTubeClient } from "../clients/youtube";
import { applyGuardrails, buildJudgePrompt, JudgeSchema, type JudgeContext, type JudgeResult } from "./judge";

export interface MessagesClient {
  messages: { create(p: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message> };
}

const SubmitSchema = JudgeSchema.extend({ citations: z.array(z.string()) });

const pickJson = {
  type: "object", additionalProperties: false, required: ["external_id", "rating", "reason", "evidence"],
  properties: {
    external_id: { type: ["string", "null"] }, rating: { type: "string", enum: ["high", "medium", "low"] },
    reason: { type: "string" }, evidence: { type: "array", items: { type: "string" } },
  },
} as const;

function tools(model: string): Anthropic.ToolUnion[] {
  const webSearch = model.startsWith("claude-haiku")
    ? { type: "web_search_20250305", name: "web_search", max_uses: 5 }
    : { type: "web_search_20260209", name: "web_search", max_uses: 5 };
  return [
    webSearch as Anthropic.ToolUnion,
    { name: "spotify_search", description: "Search Spotify artists. Returns ids, names, genres.", strict: true,
      input_schema: { type: "object", additionalProperties: false, required: ["query"], properties: { query: { type: "string" } } } },
    { name: "youtube_search", description: "Search YouTube channels. Returns ids, titles, descriptions.", strict: true,
      input_schema: { type: "object", additionalProperties: false, required: ["query"], properties: { query: { type: "string" } } } },
    { name: "submit_decision", description: "Submit your final decision. Call exactly once when done.", strict: true,
      input_schema: {
        type: "object", additionalProperties: false, required: ["spotify", "youtube", "genres", "hometown", "citations"],
        properties: {
          spotify: pickJson, youtube: pickJson,
          genres: { type: "array", items: { type: "string", enum: [...GENRES] } },
          hometown: { type: ["string", "null"] },
          citations: { type: "array", items: { type: "string" }, description: "URLs (with a short quote) that tie the band to the chosen profiles" },
        },
      } },
  ] as Anthropic.ToolUnion[];
}

const SYSTEM = `You are resolving an ambiguous band for an Omaha, NE show calendar.
Use web_search to find the band's own pages (Bandcamp, Instagram, website, venue listings) and establish WHICH act this is (location, members, releases).
Use spotify_search / youtube_search to find their profiles. Only ids returned by those tools are valid.
Upgrade a match to "high" only if you can cite a URL tying this act to that profile (e.g. their Bandcamp/website links to it, or location + releases match).
If you cannot establish it, submit null. When done, call submit_decision exactly once.`;

export async function escalateAct(
  ctx: JudgeContext,
  deps: { client: MessagesClient; spotify: SpotifyClient; youtube: YouTubeClient; model: string; maxTurns?: number },
): Promise<JudgeResult | null> {
  const working: JudgeContext = { ...ctx, spotify: [...ctx.spotify], youtube: [...ctx.youtube] };
  const { user } = buildJudgePrompt(working, GENRES);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: user }];
  const maxTurns = deps.maxTurns ?? 6;

  for (let turn = 0; turn < maxTurns; turn++) {
    const res = await deps.client.messages.create({
      model: deps.model, max_tokens: 16000, system: SYSTEM, tools: tools(deps.model), messages,
      ...(effortParams(deps.model).effort ? { output_config: effortParams(deps.model) } : {}),
    });
    messages.push({ role: "assistant", content: res.content });
    if (res.stop_reason === "pause_turn") continue;
    if (res.stop_reason !== "tool_use") return null;

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      const input = block.input as Record<string, unknown>;
      if (block.name === "submit_decision") {
        const parsed = SubmitSchema.safeParse(input);
        if (!parsed.success) return null;
        const { citations, ...out } = parsed.data;
        return applyGuardrails(out, working, { webCitations: citations });
      }
      try {
        if (block.name === "spotify_search") {
          const found = await deps.spotify.searchArtists(String(input.query));
          for (const a of found) if (!working.spotify.some((c) => c.external_id === a.id)) working.spotify.push({
            platform: "spotify", external_id: a.id, url: spotifyArtistUrl(a.id), display_name: a.name,
            name_similarity: nameSimilarity(ctx.act.clean_name, a.name), genres: a.genres,
            details: a.genres.length ? [`genres: ${a.genres.join(", ")}`] : [], official: false, description: "",
          });
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(found) });
        } else if (block.name === "youtube_search") {
          const found = await deps.youtube.searchChannels(String(input.query));
          for (const ch of found) if (!working.youtube.some((c) => c.external_id === ch.id)) working.youtube.push({
            platform: "youtube", external_id: ch.id, url: youtubeChannelUrl(ch.id), display_name: ch.title,
            name_similarity: nameSimilarity(ctx.act.clean_name, ch.title.replace(/ - Topic$/, "")), genres: [],
            details: [`description: ${ch.description.slice(0, 300)}`], official: / - Topic$/.test(ch.title), description: ch.description,
          });
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(found) });
        }
      } catch (err) {
        results.push({ type: "tool_result", tool_use_id: block.id, content: String(err), is_error: true });
      }
    }
    if (results.length) messages.push({ role: "user", content: results });
  }
  return null;
}
```

- [ ] **Step 4: Run it; expect a pass.** Then `npm run build` to type-check against the SDK types. If `Anthropic.ToolUnion` or the `output_config` field is named differently in the installed SDK, fix the type names from the compiler errors.

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): bounded escalation agent with web search").

---

### Task 13: Scoring and calibration

**Files:**
- Create: `src/lib/artist-pipeline/scoring.ts`
- Test: `src/lib/artist-pipeline/scoring.test.ts`

**Interfaces:**
- Consumes: `LinkFeatures`, `Rating`, `HIGH_SIMILARITY`
- Produces:

```ts
export function rawLinkScore(f: LinkFeatures): number;           // 0..1
export function rawRatingScore(r: Rating): number;               // high .95, medium .75, low .45
export interface CalibrationPoint { x: number; y: number }
export class Calibrator { constructor(points?: CalibrationPoint[]); apply(x: number): number; toJSON(): CalibrationPoint[] }
export function fitIsotonic(samples: { score: number; correct: boolean }[]): Calibrator;
export function finalLinkConfidence(f: LinkFeatures, cal: Calibrator): number;   // enforces similarity cap
export function product(values: number[]): number;
export interface CalibrationSet { link: Calibrator; lineup: Calibrator; category: Calibrator }
export function loadCalibration(json: unknown | null): CalibrationSet;           // identity when null
```

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { Calibrator, finalLinkConfidence, fitIsotonic, loadCalibration, product, rawLinkScore } from "./scoring";
import type { LinkFeatures } from "./types";

const f = (p: Partial<LinkFeatures> = {}): LinkFeatures => ({
  judge_rating: "high", name_similarity: 1, corroborated: false, location_evidence: false,
  web_citation: false, same_name_count: 1, official_channel: false, ...p,
});

describe("rawLinkScore", () => {
  test("evidence raises, ambiguity lowers, bounded 0..1", () => {
    expect(rawLinkScore(f({ corroborated: true, location_evidence: true }))).toBeGreaterThan(rawLinkScore(f()));
    expect(rawLinkScore(f({ same_name_count: 3 }))).toBeLessThan(rawLinkScore(f()));
    expect(rawLinkScore(f({ corroborated: true, location_evidence: true, web_citation: true, official_channel: true }))).toBeLessThanOrEqual(1);
    expect(rawLinkScore(f({ judge_rating: "low", name_similarity: 0.3, same_name_count: 5 }))).toBeGreaterThanOrEqual(0);
  });
});

describe("finalLinkConfidence", () => {
  test("low similarity can never reach the high band, even if calibration says so", () => {
    const generous = new Calibrator([{ x: 0, y: 0.99 }, { x: 1, y: 0.99 }]);
    expect(finalLinkConfidence(f({ name_similarity: 0.85 }), generous)).toBeLessThan(0.9);
    expect(finalLinkConfidence(f({ name_similarity: 1 }), generous)).toBeCloseTo(0.99);
  });
});

describe("isotonic calibration", () => {
  test("identity when no points", () => expect(new Calibrator().apply(0.42)).toBeCloseTo(0.42));
  test("fit is monotone and matches bucket accuracy", () => {
    const samples = [
      ...Array.from({ length: 10 }, (_, i) => ({ score: 0.2, correct: i < 2 })),
      ...Array.from({ length: 10 }, (_, i) => ({ score: 0.9, correct: i < 9 })),
    ];
    const cal = fitIsotonic(samples);
    expect(cal.apply(0.2)).toBeCloseTo(0.2);
    expect(cal.apply(0.9)).toBeCloseTo(0.9);
    expect(cal.apply(0.55)).toBeGreaterThanOrEqual(cal.apply(0.2));
    expect(cal.apply(0.55)).toBeLessThanOrEqual(cal.apply(0.9));
  });
  test("violators are pooled", () => {
    const cal = fitIsotonic([{ score: 0.1, correct: true }, { score: 0.2, correct: false }]);
    expect(cal.apply(0.1)).toBeCloseTo(0.5);
    expect(cal.apply(0.2)).toBeCloseTo(0.5);
  });
  test("round-trips through JSON", () => {
    const set = loadCalibration({ link: [{ x: 0, y: 0.1 }, { x: 1, y: 0.8 }], lineup: [], category: [] });
    expect(set.link.apply(0.5)).toBeCloseTo(0.45);
    expect(set.lineup.apply(0.5)).toBeCloseTo(0.5);
  });
});

test("product", () => expect(product([0.9, 0.5, 1])).toBeCloseTo(0.45));
```

- [ ] **Step 2: Run it; expect a failure.**

- [ ] **Step 3: Implement**

```ts
import { HIGH_SIMILARITY } from "./similarity";
import type { LinkFeatures, Rating } from "./types";

const RATING_BASE: Record<Rating, number> = { high: 0.7, medium: 0.45, low: 0.15 };

export function rawLinkScore(f: LinkFeatures): number {
  let s = RATING_BASE[f.judge_rating];
  s += f.name_similarity >= 0.999 ? 0.1 : f.name_similarity >= HIGH_SIMILARITY ? 0.05 : -0.1;
  if (f.corroborated) s += 0.1;
  if (f.location_evidence) s += 0.08;
  if (f.web_citation) s += 0.04;
  if (f.official_channel) s += 0.03;
  if (f.same_name_count >= 3) s -= 0.15;
  else if (f.same_name_count === 2) s -= 0.07;
  return Math.max(0, Math.min(1, s));
}

export function rawRatingScore(r: Rating): number {
  return { high: 0.95, medium: 0.75, low: 0.45 }[r];
}

export interface CalibrationPoint { x: number; y: number }

export class Calibrator {
  private pts: CalibrationPoint[];
  constructor(points: CalibrationPoint[] = []) { this.pts = [...points].sort((a, b) => a.x - b.x); }
  apply(x: number): number {
    const p = this.pts;
    if (p.length === 0) return x;
    if (x <= p[0].x) return p[0].y;
    if (x >= p[p.length - 1].x) return p[p.length - 1].y;
    for (let i = 1; i < p.length; i++) {
      if (x <= p[i].x) {
        const t = (x - p[i - 1].x) / (p[i].x - p[i - 1].x || 1);
        return p[i - 1].y + t * (p[i].y - p[i - 1].y);
      }
    }
    return x;
  }
  toJSON(): CalibrationPoint[] { return this.pts; }
}

// Pool-adjacent-violators over samples grouped by score.
export function fitIsotonic(samples: { score: number; correct: boolean }[]): Calibrator {
  const groups = new Map<number, { sum: number; n: number }>();
  for (const s of samples) {
    const g = groups.get(s.score) ?? { sum: 0, n: 0 };
    g.sum += s.correct ? 1 : 0; g.n += 1;
    groups.set(s.score, g);
  }
  const blocks = [...groups.entries()].sort((a, b) => a[0] - b[0])
    .map(([x, g]) => ({ xs: [x], sum: g.sum, n: g.n }));
  for (let i = 1; i < blocks.length; ) {
    if (blocks[i - 1].sum / blocks[i - 1].n > blocks[i].sum / blocks[i].n) {
      const merged = { xs: [...blocks[i - 1].xs, ...blocks[i].xs], sum: blocks[i - 1].sum + blocks[i].sum, n: blocks[i - 1].n + blocks[i].n };
      blocks.splice(i - 1, 2, merged);
      i = Math.max(1, i - 1);
    } else i++;
  }
  return new Calibrator(blocks.flatMap((b) => b.xs.map((x) => ({ x, y: b.sum / b.n }))));
}

export function finalLinkConfidence(f: LinkFeatures, cal: Calibrator): number {
  const c = cal.apply(rawLinkScore(f));
  return f.name_similarity < HIGH_SIMILARITY ? Math.min(c, 0.89) : c;
}

export function product(values: number[]): number {
  return values.reduce((a, b) => a * b, 1);
}

export interface CalibrationSet { link: Calibrator; lineup: Calibrator; category: Calibrator }

export function loadCalibration(json: unknown | null): CalibrationSet {
  const j = (json ?? {}) as Partial<Record<keyof CalibrationSet, CalibrationPoint[]>>;
  return { link: new Calibrator(j.link ?? []), lineup: new Calibrator(j.lineup ?? []), category: new Calibrator(j.category ?? []) };
}
```

- [ ] **Step 4: Run it; expect a pass.**

- [ ] **Step 5: Checkpoint.** Ask whether to commit ("feat(artists): link scoring and isotonic calibration").

---

### Task 14: Orchestrator and gate

**Files:**
- Create: `src/lib/artist-pipeline/pipeline.ts`, `src/lib/artist-pipeline/gate.ts`
- Test: `src/lib/artist-pipeline/pipeline.test.ts`, `src/lib/artist-pipeline/gate.test.ts`

**Interfaces:**
- Consumes: everything above
- Produces:

```ts
// gate.ts
export interface RunRow { new_event_ids: string[] | null; changed_event_ids: string[] | null }
export interface ChangeRow { event_id: string; change_type: "new" | "update"; changed_fields: string[] | null }
export function selectEventIds(runs: RunRow[], changes: ChangeRow[]): { ids: string[]; trigger: Map<string, "new" | "changed"> };

// pipeline.ts
export interface PipelineDeps {
  llm: StructuredLLM; messages: MessagesClient; spotify: SpotifyClient; youtube: YouTubeClient;
  fetchPage: (url: string | null) => Promise<string | null>; repo: ArtistRepo;
  models: { extract: string; judge: string; escalate: string };
  calibration: CalibrationSet; escalationBudget: { remaining: number };
}
export class RetryableError extends Error { cause: unknown }
export async function analyzeEvent(event: PipelineEvent, deps: PipelineDeps): Promise<Proposal>;
export async function analyzeAct(act: ExtractedAct, event: PipelineEvent, pageText: string | null, otherActs: string[], deps: PipelineDeps): Promise<LineupEntry>;
export const HIGH_CONFIDENCE = 0.9;
```

`analyzeEvent` throws `RetryableError` when Spotify, YouTube (non-quota) or the LLM fails. The CLI records that event as "retry next run".

- [ ] **Step 1: Write the failing gate test**

```ts
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
```

- [ ] **Step 2: Write the failing pipeline test** (all fakes)

```ts
import { describe, expect, test } from "vitest";
import { analyzeEvent, RetryableError, type PipelineDeps } from "./pipeline";
import { loadCalibration } from "./scoring";
import { QuotaExceededError } from "./clients/youtube";
import { SpotifyError } from "./clients/spotify";
import { LLMError } from "./clients/llm";
import type { PipelineEvent, StoredArtist } from "./types";

const event: PipelineEvent = { id: "e1", title: "Surfer Girl", date: "2026-10-12", venueName: "The Slowdown", eventUrl: null, supportingArtists: ["JOBY!", "DJ Crab"] };
const surfer: StoredArtist = { id: "a1", name: "Surfer Girl", genres: ["indie"], spotify_id: "sp1", youtube_channel_id: "UC1", hometown: null };

const extraction = {
  category: "music", category_rating: "high", event_genres: [], lineup_rating: "high", reason: "",
  acts: [
    { billed_as: "Surfer Girl", clean_name: "Surfer Girl", role: "headliner", billing_order: 1, kind: "original_artist", non_artist_category: null, genres: ["indie"], hometown: null, reason: "" },
    { billed_as: "JOBY!", clean_name: "JOBY!", role: "supporting", billing_order: 2, kind: "original_artist", non_artist_category: null, genres: ["rock"], hometown: null, reason: "" },
    { billed_as: "DJ Crab", clean_name: "DJ Crab", role: "supporting", billing_order: 3, kind: "not_an_artist", non_artist_category: "dj", genres: [], hometown: null, reason: "DJ" },
  ],
};
const judge = {
  spotify: { external_id: "s-joby", rating: "high", reason: "exact", evidence: [] },
  youtube: { external_id: null, rating: "low", reason: "none", evidence: [] },
  genres: ["rock"], hometown: null,
};

function deps(over: Partial<PipelineDeps> = {}): PipelineDeps {
  return {
    llm: { async parse({ schema }) { return (schema as any).shape?.acts ? extraction : judge; } } as any,
    messages: { messages: { async create() { throw new Error("escalation should not run"); } } },
    spotify: { async searchArtists() { return [{ id: "s-joby", name: "Joby", genres: [], imageUrl: null }]; }, async albumTitles() { return []; } },
    youtube: { unitsUsed: () => 0, async searchChannels() { return []; } },
    fetchPage: async () => null,
    repo: { async findByAlias(n) { return n === "surfer girl" ? surfer : null; }, async rejectedExternalIds() { return new Set(); } },
    models: { extract: "m", judge: "m", escalate: "m" },
    calibration: loadCalibration(null),
    escalationBudget: { remaining: 0 },
    ...over,
  };
}

describe("analyzeEvent", () => {
  test("returning artist, new artist and non-artist in one proposal", async () => {
    const p = await analyzeEvent(event, deps());
    expect(p.schema_version).toBe(2);
    expect(p.artists.map((a) => a.kind)).toEqual(["existing", "new", "not_an_artist"]);
    const joby = p.artists[1] as Extract<typeof p.artists[number], { kind: "new" }>;
    expect(joby.spotify.chosen?.url).toBe("https://open.spotify.com/artist/s-joby");
    expect(joby.youtube.chosen).toBeNull();
    expect(p.overall_confidence).toBeGreaterThan(0);
    expect(p.overall_confidence).toBeLessThanOrEqual(1);
  });

  test("spotify outage is retryable, not an empty match", async () => {
    const d = deps({ spotify: { async searchArtists() { throw new SpotifyError("down", 503); }, async albumTitles() { return []; } } });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("LLM refusal / max_tokens is retryable, never a silent empty result", async () => {
    const d = deps({ llm: { async parse() { throw new LLMError("refusal"); } } as any });
    await expect(analyzeEvent(event, d)).rejects.toBeInstanceOf(RetryableError);
  });

  test("youtube quota exhaustion defers youtube but keeps going", async () => {
    const d = deps({ youtube: { unitsUsed: () => 0, async searchChannels() { throw new QuotaExceededError("q"); } } });
    const p = await analyzeEvent(event, d);
    const joby = p.artists[1] as any;
    expect(joby.youtube).toMatchObject({ chosen: null, deferred: "youtube_quota" });
    expect(joby.spotify.chosen).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run both; expect a failure.**

- [ ] **Step 4: Implement `gate.ts`**

```ts
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
```

- [ ] **Step 5: Implement `pipeline.ts`**

```ts
import type { Genre } from "../genres";
import { LLMError, type StructuredLLM } from "./clients/llm";
import { SpotifyError, type SpotifyClient } from "./clients/spotify";
import { QuotaExceededError, YouTubeError, type YouTubeClient } from "./clients/youtube";
import { extractLineup } from "./stages/extract";
import { resolveAct, type ArtistRepo } from "./stages/resolve";
import { gatherSpotifyCandidates, gatherYouTubeCandidates } from "./stages/candidates";
import { judgeAct, type GuardedPick, type JudgeContext, type JudgeResult } from "./stages/judge";
import { escalateAct, type MessagesClient } from "./stages/escalate";
import { finalLinkConfidence, product, rawRatingScore, type CalibrationSet } from "./scoring";
import type { Candidate, ExtractedAct, LineupEntry, LinkDecision, LinkProposal, PipelineEvent, Proposal } from "./types";

export const HIGH_CONFIDENCE = 0.9;

export interface PipelineDeps {
  llm: StructuredLLM; messages: MessagesClient; spotify: SpotifyClient; youtube: YouTubeClient;
  fetchPage: (url: string | null) => Promise<string | null>; repo: ArtistRepo;
  models: { extract: string; judge: string; escalate: string };
  calibration: CalibrationSet; escalationBudget: { remaining: number };
}

export class RetryableError extends Error {
  constructor(message: string, public cause: unknown) { super(message); }
}

function proposal(c: Candidate, conf: number, reason: string, evidence: string[]): LinkProposal {
  return { external_id: c.external_id, url: c.url, display_name: c.display_name, evidence: [...evidence, ...c.details], confidence: conf, reason };
}

function decision(pick: GuardedPick, pool: Candidate[], cal: CalibrationSet): LinkDecision {
  const chosen = pick.candidate && pick.features
    ? proposal(pick.candidate, finalLinkConfidence(pick.features, cal.link), pick.reason, pick.evidence)
    : null;
  const alternatives = pool
    .filter((c) => c.external_id !== chosen?.external_id)
    .slice(0, 3)
    .map((c) => proposal(c, 0, "alternative candidate", []));
  return { chosen, alternatives };
}

function needsEscalation(r: JudgeResult, cal: CalibrationSet, want: ("spotify" | "youtube")[]): boolean {
  return want.some((p) => {
    const pick = r[p];
    return !pick.features || finalLinkConfidence(pick.features, cal.link) < 0.6;
  });
}

async function gather(act: ExtractedAct, artistId: string | null, want: ("spotify" | "youtube")[], deps: PipelineDeps) {
  const rejected = async (p: "spotify" | "youtube") => (artistId ? deps.repo.rejectedExternalIds(artistId, p) : new Set<string>());
  const spotify = want.includes("spotify") ? await gatherSpotifyCandidates(act, deps.spotify, await rejected("spotify")) : [];
  let youtube: Candidate[] = [];
  let ytDeferred = false;
  if (want.includes("youtube")) {
    try { youtube = await gatherYouTubeCandidates(act, deps.youtube, await rejected("youtube")); }
    catch (e) { if (e instanceof QuotaExceededError) ytDeferred = true; else throw e; }
  }
  return { spotify, youtube, ytDeferred };
}

export async function analyzeAct(
  act: ExtractedAct, event: PipelineEvent, pageText: string | null, otherActs: string[], deps: PipelineDeps,
): Promise<LineupEntry> {
  if (act.kind !== "original_artist") {
    return {
      kind: "not_an_artist", billed_as: act.billed_as,
      category: act.kind === "unknown" ? "other" : (act.non_artist_category ?? "other"),
      reason: act.kind === "unknown" ? `unsure: ${act.reason}` : act.reason,
      confidence: act.kind === "unknown" ? 0.5 : 0.95,
    };
  }

  const { artist, missing } = await resolveAct(act.clean_name, deps.repo);
  if (artist && missing.length === 0) {
    return { kind: "existing", billed_as: act.billed_as, artist_id: artist.id, role: act.role, billing_order: act.billing_order, confidence: 1 };
  }

  const want = missing;
  const { spotify, youtube, ytDeferred } = await gather(act, artist?.id ?? null, want, deps);
  const ctx: JudgeContext = { act, event, pageText, otherActs, spotify, youtube };
  let result = await judgeAct(ctx, deps.llm, deps.models.judge);

  if (needsEscalation(result, deps.calibration, want) && deps.escalationBudget.remaining > 0) {
    deps.escalationBudget.remaining--;
    const escalated = await escalateAct(ctx, { client: deps.messages, spotify: deps.spotify, youtube: deps.youtube, model: deps.models.escalate });
    if (escalated) result = escalated;
  }

  const sp = decision(result.spotify, spotify, deps.calibration);
  const yt: LinkDecision = ytDeferred ? { chosen: null, alternatives: [], deferred: "youtube_quota" } : decision(result.youtube, youtube, deps.calibration);
  const linkConfs = [sp, yt].filter((d) => d.chosen).map((d) => d.chosen!.confidence);

  if (artist) {
    return {
      kind: "existing", billed_as: act.billed_as, artist_id: artist.id, role: act.role, billing_order: act.billing_order,
      confidence: product(linkConfs),
      new_links: { ...(want.includes("spotify") ? { spotify: sp } : {}), ...(want.includes("youtube") ? { youtube: yt } : {}) },
    };
  }
  const genres: Genre[] = result.genres.length ? result.genres : act.genres;
  return {
    kind: "new", billed_as: act.billed_as, clean_name: act.clean_name, role: act.role, billing_order: act.billing_order,
    hometown: result.hometown ?? act.hometown, genres, confidence: product(linkConfs), spotify: sp, youtube: yt,
  };
}

export async function analyzeEvent(event: PipelineEvent, deps: PipelineDeps): Promise<Proposal> {
  try {
    const pageText = await deps.fetchPage(event.eventUrl);
    const ex = await extractLineup(event, pageText, deps.llm, deps.models.extract);
    const artists: LineupEntry[] = [];
    for (const act of ex.acts) {
      const others = ex.acts.filter((a) => a !== act).map((a) => a.clean_name);
      artists.push(await analyzeAct(act, event, pageText, others, deps));
    }
    const category_confidence = deps.calibration.category.apply(rawRatingScore(ex.category_rating));
    const lineup_confidence = deps.calibration.lineup.apply(rawRatingScore(ex.lineup_rating));
    return {
      event_id: event.id,
      schema_version: 2,
      event: { category: ex.category, category_confidence, event_genres: ex.event_genres, reason: ex.reason },
      artists,
      lineup_confidence,
      overall_confidence: product([lineup_confidence, category_confidence, ...artists.map((a) => a.confidence)]),
    };
  } catch (e) {
    if (e instanceof SpotifyError || e instanceof YouTubeError || e instanceof LLMError) {
      throw new RetryableError(`${event.id}: ${(e as Error).message}`, e);
    }
    throw e;
  }
}
```

Note: the pipeline test's fake `llm.parse` detects the extraction call via `schema.shape.acts`. Keep `ExtractionSchema` a plain `z.object` so `.shape` exists.

- [ ] **Step 6: Run the whole suite; expect a pass.** `npm test`

- [ ] **Step 7: Checkpoint.** Ask whether to commit ("feat(artists): pipeline orchestrator and run gate").

---

### Task 15: Supabase repo, alias backfill and dry-run CLI

**Files:**
- Create: `src/lib/artist-pipeline/repo.ts`, `scripts/backfill-aliases.ts`, `scripts/analyze-artists.ts`
- Modify: `.gitignore` (add `reports/`)

**Interfaces:**
- Consumes: `ArtistRepo`, `PipelineEvent`, `selectEventIds`, `analyzeEvent`, all client factories, `loadCalibration`
- Produces:

```ts
export function createSupabaseRepo(sb: SupabaseClient): ArtistRepo & {
  loadEvents(ids: string[]): Promise<PipelineEvent[]>;
  runsSince(iso: string): Promise<RunRow[]>;
  changesSince(iso: string, ids: string[]): Promise<ChangeRow[]>;
  upcomingEventIds(limit: number, offset?: number): Promise<string[]>;
};
export function serviceClient(): SupabaseClient;   // reads SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY|SUPABASE_SERVICE_ROLE_KEY
```

CLI usage:

```
npx tsx scripts/analyze-artists.ts --event <id> [--event <id>...]
npx tsx scripts/analyze-artists.ts --since <ISO timestamp>     # gate mode (Plan 3 wires this into the workflow)
npx tsx scripts/analyze-artists.ts --upcoming 10 [--offset 0]
```

It always runs in dry-run mode in this plan. It writes `reports/artist-run-<timestamp>.json` and prints a markdown summary. If `GITHUB_STEP_SUMMARY` is set, the summary is appended there.

- [ ] **Step 1: Implement `repo.ts`**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArtistRepo } from "./stages/resolve";
import type { ChangeRow, RunRow } from "./gate";
import type { PipelineEvent, Platform, StoredArtist } from "./types";

export function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function createSupabaseRepo(sb: SupabaseClient) {
  return {
    async findByAlias(alias: string): Promise<StoredArtist | null> {
      const { data, error } = await sb.from("artist_aliases")
        .select("artists(id, name, genres, spotify_id, youtube_channel_id, hometown)")
        .eq("alias_normalized", alias).maybeSingle();
      if (error) throw error;
      return (data?.artists as unknown as StoredArtist) ?? null;
    },
    async rejectedExternalIds(artistId: string, platform: Platform): Promise<Set<string>> {
      const { data, error } = await sb.from("artist_links").select("external_id")
        .eq("artist_id", artistId).eq("platform", platform).eq("status", "rejected");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.external_id as string));
    },
    async loadEvents(ids: string[]): Promise<PipelineEvent[]> {
      if (!ids.length) return [];
      const { data, error } = await sb.from("events")
        .select("id, title, date, event_url, supporting_artists, venue_name, venues(name)").in("id", ids);
      if (error) throw error;
      return (data ?? []).map((e: any) => ({
        id: e.id, title: e.title, date: e.date, eventUrl: e.event_url ?? null,
        supportingArtists: e.supporting_artists ?? [], venueName: e.venues?.name ?? e.venue_name ?? "Unknown venue",
      }));
    },
    async runsSince(iso: string): Promise<RunRow[]> {
      const { data, error } = await sb.from("scraper_runs").select("new_event_ids, changed_event_ids").gte("started_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async changesSince(iso: string, ids: string[]): Promise<ChangeRow[]> {
      if (!ids.length) return [];
      const { data, error } = await sb.from("event_changes").select("event_id, change_type, changed_fields")
        .gte("created_at", iso).in("event_id", ids);
      if (error) throw error;
      return (data ?? []) as ChangeRow[];
    },
    async upcomingEventIds(limit: number, offset = 0): Promise<string[]> {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
      const { data, error } = await sb.from("events").select("id").eq("status", "approved").gte("date", today)
        .order("date").order("id").range(offset, offset + limit - 1);
      if (error) throw error;
      return (data ?? []).map((r) => r.id as string);
    },
  };
}

// Compile-time check that the repo fulfils the pipeline's interface.
const _repoCheck: (sb: SupabaseClient) => ArtistRepo = createSupabaseRepo;
void _repoCheck;
```

- [ ] **Step 2: Implement `scripts/backfill-aliases.ts`**

This is one-off and idempotent. It inserts an alias for each existing artist, and records existing Spotify URLs as `suggested` links (they were never verified).

```ts
import { serviceClient } from "../src/lib/artist-pipeline/repo";
import { normalizeArtistName } from "../src/lib/artist-pipeline/normalize";

const sb = serviceClient();
const { data: artists, error } = await sb.from("artists").select("id, name, spotify_url");
if (error) throw error;

let aliases = 0, links = 0, collisions: string[] = [];
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
```

- [ ] **Step 3: Implement `scripts/analyze-artists.ts`**

```ts
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { createStructuredLLM, MODELS } from "../src/lib/artist-pipeline/clients/llm";
import { createSpotifyClient } from "../src/lib/artist-pipeline/clients/spotify";
import { createYouTubeClient } from "../src/lib/artist-pipeline/clients/youtube";
import { fetchEventPageText } from "../src/lib/artist-pipeline/clients/event-page";
import { createSupabaseRepo, serviceClient } from "../src/lib/artist-pipeline/repo";
import { selectEventIds } from "../src/lib/artist-pipeline/gate";
import { analyzeEvent, HIGH_CONFIDENCE, RetryableError, type PipelineDeps } from "../src/lib/artist-pipeline/pipeline";
import { loadCalibration } from "../src/lib/artist-pipeline/scoring";
import type { Proposal } from "../src/lib/artist-pipeline/types";

function args() {
  const a = process.argv.slice(2);
  const all = (flag: string) => a.flatMap((v, i) => (v === flag ? [a[i + 1]] : []));
  const one = (flag: string) => all(flag)[0];
  return { events: all("--event"), since: one("--since"), upcoming: one("--upcoming"), offset: one("--offset") };
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

const opts = args();
const repo = createSupabaseRepo(serviceClient());

let ids: string[] = opts.events;
if (opts.since) {
  const runs = await repo.runsSince(opts.since);
  const candidateIds = runs.flatMap((r) => [...(r.new_event_ids ?? []), ...(r.changed_event_ids ?? [])]);
  ids = selectEventIds(runs, await repo.changesSince(opts.since, candidateIds)).ids;
  if (ids.length === 0) { console.log("No new or lineup-changed events since", opts.since, "- nothing to do."); process.exit(0); }
} else if (opts.upcoming) {
  ids = await repo.upcomingEventIds(Number(opts.upcoming), Number(opts.offset ?? 0));
}
if (ids.length === 0) { console.error("Usage: --event <id> | --since <iso> | --upcoming <n> [--offset <n>]"); process.exit(1); }

const events = await repo.loadEvents(ids);
const youtube = createYouTubeClient({ apiKey: env("YOUTUBE_API_KEY") });
const calPath = "scripts/eval/calibration.json";
const deps: PipelineDeps = {
  llm: createStructuredLLM(),
  messages: new Anthropic(),
  spotify: createSpotifyClient({ clientId: env("SPOTIFY_CLIENT_ID"), clientSecret: env("SPOTIFY_CLIENT_SECRET") }),
  youtube,
  fetchPage: (url) => fetchEventPageText(url),
  repo,
  models: MODELS,
  calibration: loadCalibration(existsSync(calPath) ? JSON.parse(readFileSync(calPath, "utf8")) : null),
  escalationBudget: { remaining: Number(process.env.ARTIST_MAX_ESCALATIONS ?? 20) },
};

const proposals: Proposal[] = [];
const failures: { event_id: string; error: string }[] = [];
for (const ev of events) {
  try {
    proposals.push(await analyzeEvent(ev, deps));
    console.log(`✓ ${ev.id}`);
  } catch (e) {
    if (!(e instanceof RetryableError)) throw e;
    failures.push({ event_id: ev.id, error: e.message });
    console.log(`↻ ${ev.id} (retry next run): ${e.message}`);
  }
}

mkdirSync("reports", { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const path = `reports/artist-run-${stamp}.json`;
writeFileSync(path, JSON.stringify({ models: MODELS, youtubeUnits: youtube.unitsUsed(), proposals, failures }, null, 2));

const lines = [
  `## Artist analysis (dry run)`,
  `Events: ${events.length} · proposals: ${proposals.length} · retry: ${failures.length} · YouTube units: ${youtube.unitsUsed()} · escalations left: ${deps.escalationBudget.remaining}`,
  ``,
  `| Event | All correct | Lineup |`,
  `|---|---|---|`,
  ...proposals.map((p) => {
    const ev = events.find((e) => e.id === p.event_id)!;
    const acts = p.artists.map((a) => {
      if (a.kind === "not_an_artist") return `~~${a.billed_as}~~ (${a.category})`;
      if (a.kind === "existing") return `${a.billed_as} ↺`;
      const sp = a.spotify.chosen ? `${Math.round(a.spotify.chosen.confidence * 100)}%${a.spotify.chosen.confidence >= HIGH_CONFIDENCE ? "✓" : ""}` : "—";
      return `${a.billed_as} [sp ${sp}]`;
    }).join(", ");
    return `| ${ev.title} (${p.event.category}) | ${Math.round(p.overall_confidence * 100)}% | ${acts} |`;
  }),
  ``,
  `Full report: \`${path}\``,
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
```

- [ ] **Step 4: Add `reports/` to `.gitignore`**

- [ ] **Step 5: Type-check.** `npm run build`. Expected: success. (Scripts aren't part of the Next build; also run `npx tsc --noEmit --module esnext --moduleResolution bundler --target es2022 --skipLibCheck scripts/analyze-artists.ts scripts/backfill-aliases.ts` and fix any errors.)

- [ ] **Step 6: User runs the alias backfill** (after Task 2's migration is applied):

```bash
set -a; source .env.local; set +a
npx tsx scripts/backfill-aliases.ts
```

Expected: `aliases inserted: ~146`, spotify links recorded ≈ the number of artists with a URL, and any collisions listed (possible duplicate artists to merge later).

- [ ] **Step 7: User adds credentials to `.env.local`:** `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` (from the existing Spotify app; the owner account must have Premium) and `YOUTUBE_API_KEY` (Google Cloud → enable YouTube Data API v3 → API key).

- [ ] **Step 8: Smoke run on 3 real events** (with the user's OK, since this spends API credit, roughly cents):

```bash
npx tsx scripts/analyze-artists.ts --event <surfer-girl-id> --event <snarky-puppy-id> --event <tribute-doors-id>
```

Expected: 3 ✓ lines; the tribute event shows a struck-through `not_an_artist`; `reports/…json` exists. Show the summary to the user.

- [ ] **Step 9: Checkpoint.** Ask whether to commit ("feat(artists): supabase repo, alias backfill, dry-run CLI").

---

### Task 16: Eval (metrics, label sheet, replay)

**Files:**
- Create: `scripts/eval/metrics.ts`, `scripts/eval/metrics.test.ts`, `scripts/eval/build-label-sheet.ts`, `scripts/eval/replay.ts`
- Created by the user: `scripts/eval/labels.json`

**Interfaces:**
- Consumes: `analyzeEvent`, `PipelineDeps`, `rawLinkScore`, `fitIsotonic`, `Calibrator`, `repo`
- Produces:

```ts
// labels.json shape
export interface Labels {
  artists: { name: string; event_id: string; spotify_id: string | null; youtube_channel_id: string | null; genres: Genre[] }[];
  events: { event_id: string; category: EventCategory; acts: { name: string; role: Role; kind: "original_artist" | "not_an_artist" }[]; genres: Genre[] }[];
}
// metrics.ts
export interface LinkOutcome { platform: Platform; confidence: number; rawScore: number; correct: boolean }
export function highConfidencePrecision(o: LinkOutcome[], threshold?: number): { precision: number; n: number };
export function coverage(o: LinkOutcome[], labeledWithProfile: number, threshold?: number): number;
export function calibrationTable(o: { confidence: number; correct: boolean }[], edges?: number[]): { bucket: string; n: number; stated: number; observed: number }[];
export function lineupCorrect(pred: { name: string; role: Role; kind: string }[], gold: Labels["events"][number]["acts"]): boolean;
export function twoFold<T>(items: T[], key: (t: T) => string): [T[], T[]];
```

- [ ] **Step 1: Write the failing metrics test**

```ts
import { expect, test } from "vitest";
import { calibrationTable, coverage, highConfidencePrecision, lineupCorrect, twoFold } from "./metrics";

const o = (confidence: number, correct: boolean) => ({ platform: "spotify" as const, confidence, rawScore: confidence, correct });

test("precision only counts links at/above threshold", () => {
  expect(highConfidencePrecision([o(0.95, true), o(0.92, false), o(0.5, false)])).toEqual({ precision: 0.5, n: 2 });
  expect(highConfidencePrecision([o(0.5, false)])).toEqual({ precision: 1, n: 0 });
});

test("coverage = correct high-confidence links / labeled artists that have a profile", () => {
  expect(coverage([o(0.95, true), o(0.95, false), o(0.4, true)], 4)).toBeCloseTo(0.25);
});

test("calibration buckets", () => {
  const t = calibrationTable([
    { confidence: 0.95, correct: true }, { confidence: 0.91, correct: false }, { confidence: 0.3, correct: false },
  ], [0, 0.6, 0.9, 1.0001]);
  expect(t.find((b) => b.bucket === "0.90-1.00")).toMatchObject({ n: 2, observed: 0.5 });
});

test("lineup match is order-sensitive and ignores case/punctuation", () => {
  const gold = [{ name: "Surfer Girl", role: "headliner" as const, kind: "original_artist" as const }, { name: "JOBY!", role: "supporting" as const, kind: "original_artist" as const }];
  expect(lineupCorrect([{ name: "surfer girl", role: "headliner", kind: "original_artist" }, { name: "Joby", role: "supporting", kind: "original_artist" }], gold)).toBe(true);
  expect(lineupCorrect([{ name: "Joby", role: "supporting", kind: "original_artist" }, { name: "Surfer Girl", role: "headliner", kind: "original_artist" }], gold)).toBe(false);
});

test("twoFold is deterministic and complete", () => {
  const items = ["a", "b", "c", "d", "e"];
  const [x, y] = twoFold(items, (s) => s);
  expect([...x, ...y].sort()).toEqual(items);
  expect(twoFold(items, (s) => s)).toEqual([x, y]);
});
```

- [ ] **Step 2: Run it; expect a failure.** `npx vitest run scripts/eval/metrics.test.ts`

- [ ] **Step 3: Implement `metrics.ts`**

```ts
import { createHash } from "node:crypto";
import { normalizeArtistName } from "../../src/lib/artist-pipeline/normalize";
import type { EventCategory, Platform, Role } from "../../src/lib/artist-pipeline/types";
import type { Genre } from "../../src/lib/genres";

export interface Labels {
  artists: { name: string; event_id: string; spotify_id: string | null; youtube_channel_id: string | null; genres: Genre[] }[];
  events: { event_id: string; category: EventCategory; acts: { name: string; role: Role; kind: "original_artist" | "not_an_artist" }[]; genres: Genre[] }[];
}

export interface LinkOutcome { platform: Platform; confidence: number; rawScore: number; correct: boolean }

export function highConfidencePrecision(o: LinkOutcome[], threshold = 0.9) {
  const hi = o.filter((x) => x.confidence >= threshold);
  return { precision: hi.length ? hi.filter((x) => x.correct).length / hi.length : 1, n: hi.length };
}

export function coverage(o: LinkOutcome[], labeledWithProfile: number, threshold = 0.9): number {
  return labeledWithProfile ? o.filter((x) => x.confidence >= threshold && x.correct).length / labeledWithProfile : 0;
}

export function calibrationTable(o: { confidence: number; correct: boolean }[], edges = [0, 0.3, 0.6, 0.8, 0.9, 1.0001]) {
  const out = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const inB = o.filter((x) => x.confidence >= edges[i] && x.confidence < edges[i + 1]);
    const label = `${edges[i].toFixed(2)}-${Math.min(1, edges[i + 1]).toFixed(2)}`;
    out.push({
      bucket: label, n: inB.length,
      stated: inB.length ? inB.reduce((s, x) => s + x.confidence, 0) / inB.length : 0,
      observed: inB.length ? inB.filter((x) => x.correct).length / inB.length : 0,
    });
  }
  return out;
}

export function lineupCorrect(pred: { name: string; role: Role; kind: string }[], gold: Labels["events"][number]["acts"]): boolean {
  if (pred.length !== gold.length) return false;
  return gold.every((g, i) =>
    normalizeArtistName(g.name) === normalizeArtistName(pred[i].name) &&
    (g.kind === "not_an_artist" ? pred[i].kind !== "original_artist" : pred[i].kind === "original_artist" && g.role === pred[i].role));
}

export function twoFold<T>(items: T[], key: (t: T) => string): [T[], T[]] {
  const a: T[] = [], b: T[] = [];
  for (const it of items) (createHash("sha1").update(key(it)).digest()[0] % 2 === 0 ? a : b).push(it);
  return [a, b];
}
```

- [ ] **Step 4: Run it; expect a pass.**

- [ ] **Step 5: Implement `build-label-sheet.ts`**

This generates a self-contained `scripts/eval/label-sheet.html`: for each chosen artist it shows Spotify (top 5) and YouTube (top 3) candidates as links with radio buttons, plus "none exists" and "paste ID". For each chosen event it has a JSON textarea prefilled with a best-guess lineup. A button downloads `labels.json`.

```ts
import { writeFileSync } from "node:fs";
import { createSpotifyClient } from "../../src/lib/artist-pipeline/clients/spotify";
import { createYouTubeClient } from "../../src/lib/artist-pipeline/clients/youtube";
import { serviceClient } from "../../src/lib/artist-pipeline/repo";
import { GENRES } from "../../src/lib/genres";

const ARTIST_COUNT = Number(process.env.LABEL_ARTISTS ?? 50);
const EXTRA_EVENT_IDS = (process.env.LABEL_EVENTS ?? "").split(",").filter(Boolean); // tricky events chosen by the user

const sb = serviceClient();
const spotify = createSpotifyClient({ clientId: process.env.SPOTIFY_CLIENT_ID!, clientSecret: process.env.SPOTIFY_CLIENT_SECRET! });
const youtube = createYouTubeClient({ apiKey: process.env.YOUTUBE_API_KEY!, dailyBudgetUnits: 9000 });

// Weight toward local/obscure: artists with fewer Spotify genres first (proxy for small acts), then the rest.
const { data: rows, error } = await sb.from("event_artists")
  .select("event_id, artists(id, name, genres), events(title, date, venues(name))");
if (error) throw error;
const byArtist = new Map<string, any>();
for (const r of rows ?? []) if (r.artists && !byArtist.has((r.artists as any).id)) byArtist.set((r.artists as any).id, r);
const chosen = [...byArtist.values()]
  .sort((a, b) => (a.artists.genres?.length ?? 0) - (b.artists.genres?.length ?? 0))
  .slice(0, ARTIST_COUNT);

const artistItems = [];
for (const r of chosen) {
  const name = r.artists.name as string;
  const sp = (await spotify.searchArtists(name)).slice(0, 5);
  let yt: any[] = [];
  try { yt = (await youtube.searchChannels(name)).slice(0, 3); } catch { /* quota: label Spotify only */ }
  artistItems.push({ name, event_id: r.event_id, event: `${r.events.title} @ ${r.events.venues?.name} ${r.events.date}`, sp, yt });
}

const { data: evs } = await sb.from("events").select("id, title, date, supporting_artists, venues(name)")
  .in("id", [...new Set([...chosen.map((c) => c.event_id), ...EXTRA_EVENT_IDS])]);

const payload = JSON.stringify({ artistItems, events: evs ?? [], genres: GENRES });
const html = `<!doctype html><meta charset="utf-8"><title>Artist labels</title>
<style>body{font:14px system-ui;max-width:900px;margin:24px auto;padding:0 16px}fieldset{margin:12px 0;padding:8px 12px}
label{display:block;margin:2px 0}textarea{width:100%;height:120px;font:12px monospace}button{position:sticky;top:8px;padding:8px 16px}</style>
<button id="dl">Download labels.json</button>
<h2>Artists: choose the correct profile, or "none exists"</h2><div id="a"></div>
<h2>Events: fix the JSON to the true lineup/category</h2><div id="e"></div>
<script>
const D=${payload};
const A=document.getElementById('a'),E=document.getElementById('e');
D.artistItems.forEach((it,i)=>{const f=document.createElement('fieldset');
 f.innerHTML='<legend><b>'+it.name+'</b> - '+it.event+'</legend><i>Spotify</i>'+
 it.sp.map(c=>'<label><input type=radio name=sp'+i+' value="'+c.id+'"> <a target=_blank href="https://open.spotify.com/artist/'+c.id+'">'+c.name+'</a> '+(c.genres||[]).join(', ')+'</label>').join('')+
 '<label><input type=radio name=sp'+i+' value="" checked> none exists / not listed</label><label>or paste ID <input name=spx'+i+'></label><i>YouTube</i>'+
 it.yt.map(c=>'<label><input type=radio name=yt'+i+' value="'+c.id+'"> <a target=_blank href="https://www.youtube.com/channel/'+c.id+'">'+c.title+'</a> ('+(c.subscriberCount??'?')+' subs)</label>').join('')+
 '<label><input type=radio name=yt'+i+' value="" checked> none exists / not listed</label><label>or paste ID <input name=ytx'+i+'></label>'+
 '<label>genres (comma, from list) <input name=g'+i+' size=40></label>';A.appendChild(f);});
D.events.forEach((ev,i)=>{const f=document.createElement('fieldset');
 const guess={event_id:ev.id,category:'music',acts:[{name:ev.title,role:'headliner',kind:'original_artist'}].concat((ev.supporting_artists||[]).map(n=>({name:n,role:'supporting',kind:'original_artist'}))),genres:[]};
 f.innerHTML='<legend><b>'+ev.title+'</b> - '+(ev.venues?.name||'')+' '+ev.date+'</legend><textarea id=ev'+i+'>'+JSON.stringify(guess,null,1)+'</textarea>';E.appendChild(f);});
document.getElementById('dl').onclick=()=>{const v=n=>(document.querySelector('[name="'+n+'"]:checked')||{}).value||'';const t=n=>(document.querySelector('[name="'+n+'"]')||{}).value?.trim()||'';
 const labels={artists:D.artistItems.map((it,i)=>({name:it.name,event_id:it.event_id,spotify_id:t('spx'+i)||v('sp'+i)||null,youtube_channel_id:t('ytx'+i)||v('yt'+i)||null,
  genres:t('g'+i).split(',').map(s=>s.trim().toLowerCase()).filter(g=>D.genres.includes(g))})),
  events:D.events.map((_,i)=>JSON.parse(document.getElementById('ev'+i).value))};
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(labels,null,2)],{type:'application/json'}));a.download='labels.json';a.click();};
</script>`;
writeFileSync("scripts/eval/label-sheet.html", html);
console.log(`Wrote scripts/eval/label-sheet.html (${artistItems.length} artists, ${(evs ?? []).length} events, YouTube units ${youtube.unitsUsed()})`);
```

- [ ] **Step 6: Implement `replay.ts`**

It runs the pipeline on every labeled event with an **empty artist repo**, so every act is treated as new and link matching is actually tested. It scores against the labels, does 2-fold calibration so the reported percents are out-of-sample, prints the metrics, and with `--fit` writes `calibration.json` fitted on all data.

```ts
import { readFileSync, writeFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { createStructuredLLM, MODELS } from "../../src/lib/artist-pipeline/clients/llm";
import { createSpotifyClient } from "../../src/lib/artist-pipeline/clients/spotify";
import { createYouTubeClient } from "../../src/lib/artist-pipeline/clients/youtube";
import { fetchEventPageText } from "../../src/lib/artist-pipeline/clients/event-page";
import { createSupabaseRepo, serviceClient } from "../../src/lib/artist-pipeline/repo";
import { analyzeEvent, RetryableError, type PipelineDeps } from "../../src/lib/artist-pipeline/pipeline";
import { fitIsotonic, loadCalibration, rawRatingScore } from "../../src/lib/artist-pipeline/scoring";
import { normalizeArtistName } from "../../src/lib/artist-pipeline/normalize";
import type { LineupEntry, Proposal } from "../../src/lib/artist-pipeline/types";
import { calibrationTable, coverage, highConfidencePrecision, lineupCorrect, twoFold, type Labels, type LinkOutcome } from "./metrics";

const fit = process.argv.includes("--fit");
const labels: Labels = JSON.parse(readFileSync("scripts/eval/labels.json", "utf8"));
const sbRepo = createSupabaseRepo(serviceClient());
const youtube = createYouTubeClient({ apiKey: process.env.YOUTUBE_API_KEY! });

const deps: PipelineDeps = {
  llm: createStructuredLLM(), messages: new Anthropic(),
  spotify: createSpotifyClient({ clientId: process.env.SPOTIFY_CLIENT_ID!, clientSecret: process.env.SPOTIFY_CLIENT_SECRET! }),
  youtube, fetchPage: (u) => fetchEventPageText(u),
  repo: { async findByAlias() { return null; }, async rejectedExternalIds() { return new Set(); } },
  models: MODELS, calibration: loadCalibration(null), // raw scores; calibrated below
  escalationBudget: { remaining: Number(process.env.ARTIST_MAX_ESCALATIONS ?? 1000) },
};

const eventIds = [...new Set([...labels.events.map((e) => e.event_id), ...labels.artists.map((a) => a.event_id)])];
const events = await sbRepo.loadEvents(eventIds);
const proposals = new Map<string, Proposal>();
const t0 = Date.now();
for (const ev of events) {
  try { proposals.set(ev.id, await analyzeEvent(ev, deps)); process.stdout.write("."); }
  catch (e) { if (e instanceof RetryableError) process.stdout.write("x"); else throw e; }
}
console.log(`\n${proposals.size}/${events.length} events analyzed in ${Math.round((Date.now() - t0) / 1000)}s, YouTube units ${youtube.unitsUsed()}`);

// Link outcomes: with identity calibration, confidence == raw score (after the similarity cap).
const outcomes: (LinkOutcome & { key: string })[] = [];
let withProfile = 0;
for (const a of labels.artists) {
  const p = proposals.get(a.event_id);
  const entry = p?.artists.find((x): x is Extract<LineupEntry, { kind: "new" }> =>
    x.kind === "new" && normalizeArtistName(x.clean_name) === normalizeArtistName(a.name));
  for (const [platform, gold] of [["spotify", a.spotify_id], ["youtube", a.youtube_channel_id]] as const) {
    if (gold) withProfile++;
    const chosen = entry?.[platform].chosen;
    if (!chosen) continue;
    outcomes.push({ key: `${a.name}:${platform}`, platform, confidence: chosen.confidence, rawScore: chosen.confidence, correct: chosen.external_id === gold });
  }
}

// Out-of-sample calibration: fit on one fold, apply to the other.
const [f1, f2] = twoFold(outcomes, (o) => o.key);
const cal1 = fitIsotonic(f1.map((o) => ({ score: o.rawScore, correct: o.correct })));
const cal2 = fitIsotonic(f2.map((o) => ({ score: o.rawScore, correct: o.correct })));
const calibrated = [...f1.map((o) => ({ ...o, confidence: cal2.apply(o.rawScore) })), ...f2.map((o) => ({ ...o, confidence: cal1.apply(o.rawScore) }))];

// Event-level metrics
let lineupOk = 0, catOk = 0, genreOk = 0, genreN = 0, nonArtistOk = 0, nonArtistN = 0;
const lineupSamples: { score: number; correct: boolean }[] = [];
const catSamples: { score: number; correct: boolean }[] = [];
for (const g of labels.events) {
  const p = proposals.get(g.event_id);
  if (!p) continue;
  const pred = p.artists.map((x) => ({ name: x.kind === "new" ? x.clean_name : x.billed_as, role: x.kind === "not_an_artist" ? "supporting" as const : x.role, kind: x.kind === "not_an_artist" ? "not_an_artist" : "original_artist" }));
  const ok = lineupCorrect(pred, g.acts);
  lineupOk += ok ? 1 : 0;
  lineupSamples.push({ score: p.lineup_confidence, correct: ok });
  const cOk = p.event.category === g.category;
  catOk += cOk ? 1 : 0;
  catSamples.push({ score: p.event.category_confidence, correct: cOk });
  for (const act of g.acts.filter((a) => a.kind === "not_an_artist")) {
    nonArtistN++;
    const m = p.artists.find((x) => normalizeArtistName(x.billed_as) === normalizeArtistName(act.name));
    if (!m || m.kind === "not_an_artist") nonArtistOk++;
  }
}
for (const a of labels.artists.filter((a) => a.genres.length)) {
  const e = proposals.get(a.event_id)?.artists.find((x) => x.kind === "new" && normalizeArtistName(x.clean_name) === normalizeArtistName(a.name));
  if (e && e.kind === "new") { genreN++; if (a.genres.includes(e.genres[0])) genreOk++; }
}

const hp = highConfidencePrecision(calibrated);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
console.log(`
models: ${JSON.stringify(MODELS)}
high-confidence link precision: ${pct(hp.precision)} (n=${hp.n})   target ≥ 98%
coverage (correct high-conf / labeled profiles): ${pct(coverage(calibrated, withProfile))}
non-artist rejection: ${pct(nonArtistN ? nonArtistOk / nonArtistN : 1)} (n=${nonArtistN})   target ≥ 95%
lineup fully correct: ${pct(lineupOk / labels.events.length)}   target ≥ 95%
category: ${pct(catOk / labels.events.length)}   target ≥ 97%
genre top-1: ${pct(genreN ? genreOk / genreN : 0)} (n=${genreN})   target ≥ 85% (not a blocker)
calibration (out-of-sample):`);
console.table(calibrationTable(calibrated));
console.log("wrong high-confidence links:");
for (const o of calibrated.filter((o) => o.confidence >= 0.9 && !o.correct)) console.log("  ✗", o.key, pct(o.confidence));

if (fit) {
  const all = outcomes.map((o) => ({ score: o.rawScore, correct: o.correct }));
  writeFileSync("scripts/eval/calibration.json", JSON.stringify({
    link: fitIsotonic(all).toJSON(),
    lineup: fitIsotonic(lineupSamples).toJSON(),
    category: fitIsotonic(catSamples).toJSON(),
  }, null, 2));
  console.log("wrote scripts/eval/calibration.json");
}
void rawRatingScore;
```

- [ ] **Step 7: Type-check** the scripts (same `npx tsc --noEmit …` command as Task 15 Step 5, with the eval files).

- [ ] **Step 8: Checkpoint.** Ask whether to commit ("feat(artists): eval metrics, label sheet, replay").

---

### Task 17: Label, replay, tune (user-in-the-loop)

This task gates Plans 2 and 3. It's procedural and involves no new code except prompt and threshold edits.

- [ ] **Step 1: Pick ~20 tricky events** with the user: tributes, "in Concert" film scores, karaoke/bingo, comedians, DJ nights, multi-band titles, "&" band names. Collect their IDs.

- [ ] **Step 2: Generate the label sheet** (about 5,000 YouTube units):

```bash
set -a; source .env.local; set +a
LABEL_EVENTS=id1,id2,... npm run eval:labels
open scripts/eval/label-sheet.html
```

The user labels, clicks Download, and moves the file to `scripts/eval/labels.json`.

- [ ] **Step 3: Baseline replay per model.** Get the user's OK on the spend first. Each full replay is roughly $1–5 depending on the model.

```bash
npm run eval:replay                                                   # opus-5-5 everywhere
ARTIST_EXTRACT_MODEL=claude-sonnet-5-5 ARTIST_JUDGE_MODEL=claude-sonnet-5-5 ARTIST_ESCALATE_MODEL=claude-sonnet-5-5 npm run eval:replay
ARTIST_EXTRACT_MODEL=claude-haiku-4-5 ARTIST_JUDGE_MODEL=claude-haiku-4-5 ARTIST_ESCALATE_MODEL=claude-sonnet-5-5 npm run eval:replay
```

Record each run's metrics in a table and present it to the user. The user picks the model per stage.

- [ ] **Step 4: Tune until targets are met.** For each wrong high-confidence link or missed non-artist:
  - adjust the extract/judge prompt wording or the `rawLinkScore` weights (Task 13; update its tests if the weights change)
  - re-run the replay

  Change one thing per iteration and log what changed and the resulting metrics. Stop when every blocker target is met, or report to the user if progress plateaus.

- [ ] **Step 5: Fit calibration.** `npm run eval:replay -- --fit` writes `scripts/eval/calibration.json`.

- [ ] **Step 6: Existing-data spot check.** `npx tsx scripts/analyze-artists.ts --upcoming 10` with the fitted calibration. Review the summary with the user.

- [ ] **Step 7: Checkpoint.** Ask whether to commit ("chore(artists): eval labels, calibration, tuned prompts"). Then write Plan 2 (queue UI + `accept_artist_analysis` RPC + history protection) against the now-proven proposal shape.
