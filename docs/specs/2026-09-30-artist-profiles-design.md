# Artist Profiles & Verified Link Matching

**Date:** 2026-09-30
**Status:** Approved
**Supersedes:** the artist/Spotify parts of `2026-03-17-ai-event-analysis-design.md`

## Overview

Every night, after the scrapers find new or changed shows, categorize each event (music, comedy, theater, sports, other), assign genres from our fixed genre list, analyze the show's lineup, identify the headliner and openers, and match each real artist to a persistent artist profile with **verified** Spotify and YouTube links. Returning artists are reused, so each artist accumulates a history of Omaha appearances. Everything lands in the admin approval queue with a calibrated confidence percent before it is applied.

## Why the current system fails

Findings from the current code and live data (146 artists, 147 event links):

1. **Blind Spotify matching.** `searchArtist()` (`src/lib/spotify.ts`) takes the first search result with `limit=1` and never checks it. Local bands and generic names get the wrong artist. "Star Wars in Concert"-style events return an unrelated band.
2. **Openers dropped.** Scrapers capture `events.supporting_artists`, but `analyzeEvent()` (`src/lib/ai.ts`) only receives the title.
3. **No evidence.** The model never sees the venue event page, existing artists, or candidate metadata.
4. **Weak identity.** Artists are matched only on `normalized_name`. There are no aliases, and namesakes can't be told apart.
5. **Non-artists slip through.** For example, comedian Becky Robinson is stored with a Spotify link and a "comedy" genre.
6. **Opaque review.** The queue stores an untyped JSON blob with no confidence or reasoning.
7. **Non-transactional accept.** `accept-analysis` does 5–6 separate writes, so a mid-way failure leaves partial data.

## Goals

- Extract headliner + openers from new/changed events, using all available evidence.
- Only real, original artists get profiles and links. Tributes, orchestras performing film scores, karaoke, DJ theme nights, comedians and generic event names do not.
- **Public Spotify links (shown on event cards) must be verified.** A wrong link is worse than no link.
- Reuse existing artists and build appearance history.
- Everything goes through the approval queue with a calibrated confidence percent per item and per event.
- Every event gets an **event category** (`music` / `comedy` / `theater` / `sports` / `other`). Today `events.category` is null for all 309 upcoming events.
- Artists and events get **genres from the fixed list** in `src/lib/genres.ts`, grounded in evidence (Spotify genre tags, venue page text) rather than guesses, for categorization and reports.
- Runs nightly and unattended, gated on the scrape actually producing new or changed events.

## Non-Goals (v1)

- Public artist pages (profiles are admin-only for now; only the Spotify link is public, on cards).
- Comedian (or other non-band) profiles. Comedy is tracked at the event level only (`category = 'comedy'`). The profile model is performer-agnostic, so this is an easy follow-up.
- Changing the genre list itself (the AI only picks from `GENRES`; list changes stay a manual code change).
- Instagram, Bandcamp and website auto-matching (these can still be added manually in `ArtistManagement`).
- Genre filtering UI changes (genres keep flowing to `events.genres` as today).
- Auto-approval of any kind.

## Success Criteria

Measured on the labeled test set (see Evaluation):

| Metric | Target |
|---|---|
| Precision of links scored high confidence (≥ 90%) | ≥ 98% |
| Non-artist rejection (tributes, film-score orchestras, karaoke, comedians, event names) | ≥ 95% |
| Lineup extraction (correct names + roles) | ≥ 95% of events fully correct |
| Event category correct | ≥ 97% |
| Genres: artist's top genre in labeled set | ≥ 85% (genres are fuzzier; tracked, but not a go-live blocker) |
| Calibration: stated % vs observed accuracy, per bucket | within ±5 points |

The nightly job is not enabled until these are met.

## Data Model

### `artists` (extend)

```sql
ALTER TABLE artists
  ADD COLUMN spotify_id TEXT UNIQUE,
  ADD COLUMN youtube_channel_id TEXT UNIQUE,
  ADD COLUMN youtube_url TEXT,
  ADD COLUMN hometown TEXT,          -- e.g. "Omaha, NE"; strong evidence for later matches
  ADD COLUMN notes TEXT;             -- admin-only
```

- `spotify_url` / `youtube_url` remain the denormalized fields the UI reads. **They are only ever written from an `artist_links` row with `status = 'verified'`.**
- `name` keeps its UNIQUE constraint for now. Namesake bands get disambiguated display names (e.g. "Wildwoods (Omaha)"), set by the admin at approval time.

### `artist_links` (new)

One row per candidate link, whatever its status. This is how rejections are remembered.

```sql
CREATE TABLE artist_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'youtube')),
  external_id TEXT NOT NULL,         -- Spotify artist ID / YouTube channel ID
  url TEXT NOT NULL,                 -- built by code from external_id, never from AI output
  status TEXT NOT NULL CHECK (status IN ('suggested', 'verified', 'rejected')),
  confidence NUMERIC(4,3),           -- calibrated 0..1 at time of suggestion
  reason TEXT,                       -- one-line justification shown in the queue
  source TEXT NOT NULL CHECK (source IN ('auto', 'manual')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (artist_id, platform, external_id)
);

-- At most one verified link per platform per artist
CREATE UNIQUE INDEX idx_artist_links_one_verified
  ON artist_links (artist_id, platform) WHERE status = 'verified';
```

The pipeline excludes any `(artist_id, platform, external_id)` with `status = 'rejected'` from candidates.

### `artist_aliases` (new)

```sql
CREATE TABLE artist_aliases (
  alias_normalized TEXT PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- Every artist's own normalized name is inserted as an alias.
- A merge in the queue ("this is the same as existing artist X") adds the new spelling as an alias of X.
- Normalization is improved over the current `normalizeArtistName()`:
  - lowercase and NFKD accent-strip
  - strip a leading "the"
  - `&` → `and`
  - collapse whitespace and punctuation
  - strip billing suffixes such as "(album release)", "- farewell tour" or "live"

  The suffix stripping lives in extraction (the model returns a `clean_name`); normalization stays purely mechanical.

### `events` (category + genres)

```sql
ALTER TABLE events DROP CONSTRAINT events_category_check;
ALTER TABLE events ADD CONSTRAINT events_category_check
  CHECK (category IN ('music', 'sports', 'theater', 'comedy', 'other'));
```

- `events.category` is set from the approved analysis.
- `events.genres` becomes the **union of the approved lineup's artist genres** (headliner's first, deduped, max 5), not just the headliner's. For events with no artist profiles, it is set from event-level genres (e.g. `tribute`, `cover-band`, `comedy`), so tribute nights and comedy shows still count in reports.
- `artists.genres` is the source of truth for an artist; a returning artist carries its approved genres forward automatically.

### `artist_appearances` (new view)

```sql
CREATE VIEW artist_appearances AS
SELECT ea.artist_id, e.id AS event_id, e.date, e.venue_id, v.name AS venue_name,
       ea.role, ea.billing_order
FROM event_artists ea
JOIN events e ON e.id = ea.event_id
LEFT JOIN venues v ON v.id = e.venue_id
WHERE e.status = 'approved';
```

### Protecting history

`event_artists` cascades on event delete, and `AdminDashboard.tsx` hard-deletes events. Rules:

- **Duplicate merges** move `event_artists` rows to the surviving event before deleting.
- **Deleting an approved event that has linked artists** is replaced by setting `status = 'rejected'`, which keeps the row and removes it from the public site and the view. Pending/unanalyzed events can still be hard-deleted.

### Approval queue: `pending_artist_analyses` (evolve)

Keep one row per event. Add:

```sql
ALTER TABLE pending_artist_analyses
  ADD COLUMN schema_version INT NOT NULL DEFAULT 1,
  ADD COLUMN run_id TEXT,                 -- GitHub Actions run ID, or 'manual'
  ADD COLUMN overall_confidence NUMERIC(4,3),
  ADD COLUMN trigger TEXT CHECK (trigger IN ('new', 'changed', 'backfill', 'manual')),
  ADD COLUMN event JSONB;                 -- EventClassification
```

Also tighten RLS: drop the `anon` read policy (the queue is admin-only).

`artists` JSONB at `schema_version = 2` (typed in `src/lib/artist-pipeline/types.ts`), plus event-level fields in a new `event` JSONB column:

```ts
type EventClassification = {
  category: "music" | "comedy" | "theater" | "sports" | "other";
  category_confidence: number;
  event_genres: Genre[];             // used when the lineup has no artist profiles (tribute, comedy, …)
  reason: string;
};

type LineupEntry =
  | { kind: "existing"; billed_as: string; artist_id: string; role: Role; billing_order: number;
      confidence: number; new_links?: LinkProposal[] }          // new_links: fills gaps, e.g. missing YouTube
  | { kind: "new"; billed_as: string; clean_name: string; role: Role; billing_order: number;
      hometown: string | null; genres: Genre[]; confidence: number;
      spotify: LinkDecision; youtube: LinkDecision }
  | { kind: "not_an_artist"; billed_as: string;
      category: "tribute" | "orchestra_score" | "dj" | "comedian" | "event_name" | "other";
      reason: string; confidence: number };

type LinkDecision = {
  chosen: LinkProposal | null;       // null = no confident match (leave blank)
  alternatives: LinkProposal[];      // top 3 other candidates for the "other candidates" dropdown
};

type LinkProposal = {
  external_id: string; url: string; display_name: string;
  evidence: string[];                // e.g. ["exact name", "Topic channel links to same Spotify", "bandcamp: Omaha, NE"]
  confidence: number; reason: string;
};

type Role = "headliner" | "co-headliner" | "supporting";
```

## Pipeline

Code lives in `src/lib/artist-pipeline/`. It is shared by the nightly script, the replay/eval script, and the manual "re-analyze" API route.

```
gate → extract lineup → resolve existing → gather candidates → judge → escalate → score → write proposal
```

### 0. Gate

- Script entry point: `scripts/analyze-artists.ts`.
- It reads the `scraper_runs` rows for this workflow run and unions `new_event_ids` and `changed_event_ids`.
- Changed events are only kept if `title` or `supporting_artists` changed (per `event_changes`).
- Drop past events and events already holding a pending analysis.
- **If the set is empty, exit 0 without any API calls.**

### 1. Lineup extraction

- **Model:** chosen by eval (start with Haiku 4.5, compare against Sonnet 5.5).
- **Output:** JSON via structured outputs, so there is no regex JSON parsing.
- **Input:**
  - title, `supporting_artists`, venue name, date, category
  - venue event page text: fetch `event_url`, strip it to readable text, cap at ~6k chars, skip on fetch failure
- **Output per event:** `EventClassification`. That is the category (music / comedy / theater / sports / other; karaoke, bingo and trivia nights are `other`), and event-level genres chosen **only from `GENRES`** (a tribute night gets `tribute` + the tributed act's genre, a comedy show gets `comedy`).
- **Output per name:** `billed_as`, `clean_name`, `role`, `billing_order`, `kind`, `reason`, and a preliminary genre guess.
- **Prompt rules:**
  - Only an `original_artist` gets matched.
  - Tribute acts, "X performs the music of Y", orchestras playing film/game scores, karaoke, DJ theme nights, comedians and generic event names ("FREE PUNK SHOW") are `not_an_artist`.
  - A named DJ billed as a performer (e.g. "DJ Crabrangucci") is `dj`, which is v1 `not_an_artist`.
  - When unsure, return `unknown`, and it surfaces for review.

### 2. Resolve existing

- Look up `normalize(clean_name)` in `artist_aliases`.
- **Hit, and the artist has verified links for both platforms:** `existing`, and done.
- **Hit, but the artist is missing a platform:** `existing`, plus a candidate search for the missing platform only.
- **Miss:** continue to the candidate search.

### 3. Gather candidates (deterministic code, no AI)

**Spotify**
- Search `type=artist` with up to 3 query variants: `clean_name`, `artist:"clean_name"`, and `billed_as` if it differs.
- Dedupe results and keep the top ~8.
- Per candidate, collect: name, genres, image, and album/single titles with years (via `search type=album q=artist:"name"`).
- **Spotify development mode (Feb 2026 changes):** `followers`, `popularity` and `/artists/{id}/top-tracks` are no longer available, search `limit` is capped at 10, and the app owner must keep an active Premium subscription. Scoring therefore leans on name similarity, genres, album titles, YouTube corroboration and web citations. If we later get Extended Quota Mode, audience size can be added as a feature.

**YouTube** (Data API v3)
- `search.list type=channel`, then `channels.list` for the top ~5 (title, description, subscriber count, custom URL).
- Official "Artist – Topic" channels and verified artist channels are strong signals.
- The link stored is the channel, not a video.

**Filtering and name similarity**
- Remove previously rejected IDs.
- Compute name similarity in code for every candidate: normalized exact match, token-set ratio, and Jaro-Winkler.

### 4. Judge

One model call per artist. It receives:
- the event context: venue, other acts on the bill, and venue page snippets mentioning the artist
- the stage 1 genre guess
- the candidate list with evidence

It returns, per platform: `external_id | null`, a raw rating (`high | medium | low`), a reason, and evidence tags.

It also returns **final artist genres** (1–3, from `GENRES` only; code drops anything off-list). Evidence for these: the chosen Spotify candidate's genre tags (mapped onto our list, e.g. "nebraska indie" → `indie`), YouTube channel description, venue page text, and the stage 1 guess. If no link was matched, genres fall back to the stage 1 guess and are marked lower confidence. It also cross-checks platforms, since a YouTube channel description linking to the chosen Spotify ID is corroboration.

**Guardrails (code-enforced, the AI can't override them)**
- The returned ID must be in the candidate list; otherwise it is treated as `null`.
- The URL is built by code from the ID.
- A name similarity below threshold caps the score below the high-confidence band.

### 5. Escalate

- **Runs for:** `original_artist` entries where either platform is still `null`/`low`.
- **Agent tools:** Anthropic server-side web search, plus `spotify_search` and `youtube_search` tool wrappers around the stage 3 code.
- **Bounds:** max ~5 tool turns, and max ~20 escalations per run (the rest are deferred to the next night).
- **Rule:** any upgrade must cite a URL tying the band to the candidate. Examples: Bandcamp/Instagram bio with location, the band's site linking to Spotify, the venue page linking to Spotify.
- The cited URL is stored in `evidence`.

### 6. Score & calibrate

- **Features per link:**
  - judge rating
  - name similarity
  - cross-platform corroboration
  - hometown or location evidence
  - web citation present
  - candidate count with the same normalized name (ambiguity)
  - Topic/verified channel
- **Score to percent:** combine the features into a raw score (simple logistic model), then map it to a percent with isotonic calibration fit on the labeled test set.
- **Refits:** calibration is refit periodically from approval/rejection outcomes (`artist_links.status` after review).
- **Lineup confidence:** from stage 1, calibrated the same way.
- **Per event:** `overall_confidence` = lineup confidence × category confidence × every link confidence in the event. Genres are shown but excluded from the product, since they are subjective and would drag every score down. `not_an_artist` entries contribute their own confidence. `existing` artists with verified links contribute 1.0.

### 7. Write proposal

- Insert the `pending_artist_analyses` row (v2 schema, `run_id`, `trigger`, `overall_confidence`).
- No `artist_links` rows are written at this stage. Candidates live only in the proposal JSON until review, and the accept flow writes them as `verified` or `rejected`. This keeps unreviewed suggestions out of the tables.
- Events that are entirely `not_an_artist` still get a row. The queue shows them in a collapsed "Skipped" section.

## Approval Queue UI

Replaces the current pending-analyses view in `AdminDashboard.tsx`. It is a new component, `ArtistReviewQueue.tsx`, to avoid growing the 2,169-line dashboard.

```
Surfer Girl w/ South Summit, JOBY!   Slowdown · Oct 12        All correct: 38%
 ☑ Surfer Girl    headliner  RETURNING · 4 prior shows                      100%
 ☑ South Summit   opener     NEW  Spotify ✓ South Summit (Omaha) · 1.2k      96%
                                  YouTube ✓ South Summit - Topic             93%
 ☐ JOBY!          opener     NEW  Spotify ? 3 artists named "Joby",           41%
                                  none tied to Nebraska   [other candidates ▾] [paste link]
 Skipped (1): —
 [Approve checked]  [Edit lineup]  [Reject]
```

**Display**
- Event header shows **category** and **genres** chips, each editable (genres limited to `GENRES`), with the category's confidence percent.
- Each new artist shows its genres, editable. Returning artists show their stored genres; editing them updates the artist.
- Per-link and per-event calibrated percent, color-banded (≥ 90 green, 60–89 amber, < 60 red).
- Evidence tags and the reason, available on expand.

**Pre-checking**
- Links ≥ 90% are pre-checked; the rest are shown unchecked.
- `null` decisions show "no confident match".

**Actions**
- approve checked
- edit lineup (names, roles, order, add/remove an act)
- pick an alternative candidate
- paste a link manually (becomes `source = 'manual'`, verified)
- reject a link (remembered)
- merge a new artist into an existing one (adds an alias)
- mark the whole event as not music

**Queue navigation**
- Default sort: lowest `overall_confidence` first.
- Filter "all ≥ 95%" with **bulk approve**.
- Tabs: New / Changed / Backfill / Skipped.

## Accept Flow

A single Postgres function `accept_artist_analysis(p_analysis_id UUID, p_decisions JSONB)` called via RPC does everything in one transaction:

1. **Artists:** create new artists and their aliases, or apply merges (alias insert).
2. **Links:** upsert `artist_links`. Approved links become `verified`, which also demotes any previously verified link on that platform to `rejected` and updates `artists.spotify_url`/`youtube_url`/IDs. Explicitly rejected ones become `rejected`.
3. **Event links:** replace `event_artists` for the event with the approved lineup, with roles and billing order.
4. **Category & genres:** set `events.category`; set `artists.genres` for new or edited artists; set `events.genres` to the union of lineup genres (or event-level genres when there's no lineup).
5. **Bookkeeping:** set `events.analyzed_at`, and mark the analysis `approved`.

The existing `app/api/admin/accept-analysis/route.ts` becomes a thin authenticated wrapper around this RPC. Rejecting marks the analysis `rejected`, and the event is not re-proposed unless its lineup changes.

## Nightly Job

New step in `.github/workflows/scrape-supabase.yml`, after "Run scrapers":

```yaml
- name: Analyze artists
  if: always() && steps.scrape.outcome != 'skipped'  # scrape step ran (even if one scraper failed)
  continue-on-error: true
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    SPOTIFY_CLIENT_ID: ${{ secrets.SPOTIFY_CLIENT_ID }}
    SPOTIFY_CLIENT_SECRET: ${{ secrets.SPOTIFY_CLIENT_SECRET }}
    YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
    RUN_ID: ${{ github.run_id }}
  run: npx tsx scripts/analyze-artists.ts
```

- The step runs whenever scraping ran, even if one scraper failed, because the others may still have found new events. The **script** does the real gating (stage 0) and exits immediately when there is nothing new or changed.
- Scraper runs record the GitHub run ID so stage 0 can select exactly this run's `scraper_runs` rows. If there is no reliable link today, add a `run_id` column to `scraper_runs` (small change in `run_scrape_supabase.py`).
- A `DRY_RUN=true` env writes a report to the job summary instead of the queue. This stays on until the success criteria are met.
- **Job summary:** events considered, proposals written, escalations, deferrals, API failures, token cost.

**Failures**
- A failed API call for an event leaves it without `analyzed_at` and without a pending row, so it retries the next night.
- After 3 consecutive failures (tracked in a small `artist_analysis_attempts` counter on the event, or in the job's own log table), it surfaces in the queue as "analysis failed".

**Budgets**
- YouTube Data API free quota is ~10k units/day, and `search.list` costs 100, so about 100 searches/day. That is ample nightly because returning artists skip search.
- Manual backfill batches are capped by the remaining daily YouTube quota.

## Backfill

Backfill is **manual only**. The nightly job never processes backfill work.

- **Trigger:** a "Backfill" control in the admin queue with a batch size (default 10) and scope:
  - upcoming events without an approved v2 analysis (oldest date first)
  - past events (for history)
  - existing artists whose links aren't verified
- **Execution:** the button dispatches the GitHub Actions workflow with inputs `mode=backfill`, `limit=N`, `scope=…` (reusing the existing workflow-dispatch pattern from the scraper dashboard). This avoids Vercel function timeouts. The same thing works locally via `npx tsx scripts/analyze-artists.ts --backfill --limit 10 --scope upcoming`.
- **Progress:** the control shows "X of Y remaining" per scope. Items are picked deterministically (by date, then ID), so batches don't overlap or skip. An event with a pending backfill proposal is excluded from the next batch.
- **Budgets:** YouTube searches per batch are capped at the remaining daily quota. If the cap is hit, the rest of the batch is deferred with a clear message.
- **Tuning loop:** because backfill proposals go through the same queue, each reviewed batch also adds approval/rejection outcomes that recalibrate the confidence percents.

## Manual Re-analyze

`app/api/admin/analyze-event/route.ts` calls the same pipeline for one event (`trigger = 'manual'`). The old `bulk-analyze` route and dashboard button are removed in the final phase.

## Evaluation

### Test set (`scripts/eval/`)

- **~50 artists** from the existing 146, weighted toward local and ambiguous-name bands, plus **~20 tricky events** (tributes, "in Concert" film scores, karaoke, DJ nights, comedians, multi-band lineups in the title).
- **Labeling tool:** a small admin-only page (or local script UI) shows each artist with pipeline candidates. The admin marks the correct Spotify and YouTube or "none exists", and marks event lineups, category and genres correct or fixes them. Stored in `artist_eval_labels` (or a committed JSON fixture; decide in planning).

### Replay

`scripts/eval/replay.ts` runs the pipeline against the labels and reports:
- the Success Criteria metrics
- a calibration table
- per-stage model comparison (Haiku 4.5 vs Sonnet 5.5)
- cost per event

Prompts, thresholds and model choices are tuned until the criteria are met, and the replay is re-run on any pipeline change.

## Rollout

1. **Schema.** Migrations `008`+: tables, columns, view, RLS changes, `accept_artist_analysis` function. Backfill aliases and migrate existing `spotify_url`s into `artist_links` as `suggested`, since they were never verified. `artists.spotify_url` stays populated so cards don't change yet.
2. **Pipeline (dry-run).** `src/lib/artist-pipeline/` stages + `scripts/analyze-artists.ts` with `DRY_RUN`.
3. **Test set + calibration.** Admin labels, replay, tune until criteria met.
4. **Backfill (manual, batched).** Never automatic. The admin runs it on demand for N events at a time (see Backfill below), reviews the batch in the queue, adjusts prompts or thresholds if needed, and runs the next batch. Covers existing artists and all upcoming events with `trigger = 'backfill'`, and also fills `category` for the 309 upcoming events that have none. Disagreements with stored links become queue items. Existing links not re-verified stay `suggested`.
5. **Queue UI.** `ArtistReviewQueue.tsx` + accept RPC wiring. History-protection changes in `AdminDashboard.tsx` delete flows.
6. **Nightly.** Add the workflow step (dry-run first, then live). Remove `bulk-analyze` and the old button.

## Configuration

New secrets:
- **GitHub Actions:** `ANTHROPIC_API_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `YOUTUBE_API_KEY`
- **Vercel:** `YOUTUBE_API_KEY` (for manual re-analyze)

Spotify credentials are not in `.env.local` today; confirm they exist in Vercel.

## Cost Estimate

Assumes ~10–30 new or changed events/day, with most artists eventually returning:

- **Extraction + judge:** ~$0.005–0.02 per event, depending on the model chosen in eval.
- **Escalation:** ~$0.05–0.15 per escalated artist, with maybe 3–8/night early on, dropping as the database fills.
- **Rough total:** $5–25/month at the start, trending down. The replay measures the real number before go-live.

## Testing

- **Unit:**
  - normalization
  - name-similarity scoring
  - guardrails (ID not in candidates → null; low similarity caps score)
  - overall-confidence math
  - stage 0 gating (empty run → no API calls; changed-but-lineup-unchanged → skipped)
- **Contract:** recorded Spotify/YouTube/Anthropic fixtures for pipeline stages, so tests run offline.
- **DB:** `accept_artist_analysis` rollback on mid-way failure; merge adds alias; verifying a link demotes the prior verified one; rejected IDs excluded from later candidates.
- **Eval replay** as the accuracy gate (above).
- **Manual:** queue actions end-to-end on a staging copy of a few events; RLS (anon cannot read the queue or write artists).

## Open Questions (resolve in planning)

- Resolved in planning: stage 0 selects `scraper_runs` with `started_at >=` a `SCRAPE_STARTED_AT` timestamp the workflow records before scraping, so no schema change is needed. Eval labels are a committed JSON fixture (`scripts/eval/labels.json`). The `accept_artist_analysis` function ships with the queue UI (plan 2), not phase 1.
