# ShowCal / Omaha Shows

A local music event aggregator that scrapes venue websites and displays upcoming shows in a unified interface.

## Workflow Rules

- **NEVER make decisions or take actions without asking first.** Always ask the user before implementing, creating, or changing anything. No exceptions.
- **NEVER commit without explicit user permission.** Wait for "commit" or similar approval.
- **NEVER deploy to production without explicit user permission.** Wait for "deploy" or similar approval.
- Run `npm run build` to verify changes compile, but let the user run `npm run dev` and test.
- Always confirm before taking destructive or irreversible actions.

**Live Site:** https://omahashows.com (hosted on Vercel)

## Architecture

### Frontend (Vercel)
- Next.js 16 (App Router) + React 19 + Tailwind
- Hosted on Vercel with custom domain
- Fetches data from Supabase
- Uses @supabase/ssr for proper SSR/client auth handling

### Backend (Supabase)
- PostgreSQL database for events, venues, scraper runs
- Storage bucket `uploads` for user-uploaded event images
- Edge Functions for email notifications (Resend API)
- Row Level Security (RLS) for access control

### Scrapers (GitHub Actions)
- Python scrapers run via GitHub Actions cron (3 AM Central daily)
- Can also be triggered manually from admin dashboard
- Results written directly to Supabase
- Tracks new/changed events per run

## Project Structure

```
ShowCal/
├── web/                    # Next.js App Router frontend
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Home page
│   │   ├── admin/page.tsx  # Admin dashboard
│   │   ├── login/page.tsx  # Login page
│   │   ├── submission/page.tsx  # Submit show form
│   │   ├── show/[id]/page.tsx   # Individual show page (dynamic)
│   │   ├── robots.ts       # SEO robots.txt
│   │   └── sitemap.ts      # SEO sitemap
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCardCompact.tsx # Compact event card (primary view)
│   │   │   ├── EventList.tsx        # Event list with infinite scroll
│   │   │   ├── AdminDashboard.tsx   # Admin panel (pending events, scrapers)
│   │   │   ├── ScraperDashboard.tsx # Scraper status and controls
│   │   │   ├── SubmitShowForm.tsx   # Public show submission form
│   │   │   └── Toast.tsx            # Toast notifications
│   │   ├── page-components/         # Page-level components
│   │   │   ├── AdminPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ShowPage.tsx
│   │   │   └── SubmissionPage.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts          # Supabase client and data fetching
│   │   │   └── supabase-browser.ts  # Browser-only Supabase client (singleton)
│   │   └── hooks/
│   │       └── useAuth.ts   # Authentication hook
│   ├── public/
│   │   └── images/astro/    # Downloaded Astro Theater images
│   └── vercel.json          # Vercel config for Next.js
│
├── scraper/                # Python scrapers
│   ├── scrapers/           # Individual venue scrapers
│   ├── run_scrape_supabase.py  # Main scraper script for GitHub Actions
│   └── api.py              # FastAPI for local dev
│
├── supabase/
│   ├── functions/
│   │   └── send-approval-email/  # Edge function for notifications
│   └── schema.sql          # Database schema
│
└── .github/workflows/
    └── scrape-supabase.yml # Scheduled scraper workflow
```

## Environment Variables

### Vercel (web project)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_GITHUB_OWNER=canderson402
NEXT_PUBLIC_GITHUB_REPO=OmahaShows
NEXT_PUBLIC_GITHUB_TOKEN=xxx  # For triggering scraper workflows
```

### GitHub Actions (repository secrets)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx  # Service role key for elevated access
```

### Supabase Edge Functions
```
RESEND_API_KEY=xxx  # For sending approval emails
```

## Key Features

### Public Features
- **Show Listings**: Browse upcoming shows with filters by venue, time, search
- **History**: View past shows with date range filters
- **Submit Shows**: Public form to submit shows for admin approval
- **Shareable Links**: Share events via URL hash (e.g., omahashows.com#event-id)

### Admin Features (`/admin`)
- **Pending Events**: Preview and edit submitted shows before approving
- **Event Management**: Edit/delete any event
- **Scraper Dashboard**:
  - View scraper status and last run times
  - Trigger scrapers via GitHub Actions
  - Shows "Pending" spinner while workflows run

### Supabase Storage
- Bucket: `uploads` (public)
- RLS Policies required for both `anon` and `authenticated` roles:
  ```sql
  -- INSERT policy
  CREATE POLICY "allow-uploads" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'uploads');

  -- SELECT policy
  CREATE POLICY "allow-read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'uploads');
  ```

## Current Venues

| Venue | Scraper Type | Notes |
|-------|--------------|-------|
| The Slowdown | BeautifulSoup | Standard HTML |
| Waiting Room | BeautifulSoup | RHP system |
| Reverb Lounge | BeautifulSoup | RHP system |
| Admiral | BeautifulSoup | RHP system |
| Bourbon Theatre | Playwright | JS-rendered |
| The Astro | Playwright | Downloads images locally |
| Steelhouse Omaha | BeautifulSoup | |

## Common Tasks

### Deploy to Production
```bash
cd web
npx vercel --prod --yes
```

### Trigger Scrapers Manually
1. Go to admin dashboard → Scrapers tab
2. Click "Run All Scrapers" or individual scraper buttons
3. Watch for "Pending" spinners, results appear in ~60s

### Add Supabase Storage Policy
```sql
CREATE POLICY "policy-name"
ON storage.objects
FOR INSERT  -- or SELECT, UPDATE, DELETE
TO anon     -- or authenticated, or both
WITH CHECK (bucket_id = 'uploads');
```

### Check Scraper Logs
```bash
gh run list --repo canderson402/OmahaShows --limit 5
gh run view RUN_ID --repo canderson402/OmahaShows --log
```

## Tips & Gotchas

### Timezone Issue
- Use `getLocalDateString()` helper (not `toISOString()`) to get local date
- Otherwise events disappear in evening when UTC advances to next day

### Supabase Storage RLS
- Must have policies for BOTH `anon` AND `authenticated` roles
- Testing while logged in uses `authenticated`, logged out uses `anon`
- Check policies with: `SELECT * FROM pg_policies WHERE schemaname = 'storage';`

### URL Normalization
- URLs without `http://` or `https://` are auto-prefixed with `https://`
- Handled in `SubmitShowForm.tsx` and `AdminDashboard.tsx`

### Vercel Environment Variables
- Must be prefixed with `NEXT_PUBLIC_` to be exposed to frontend (was VITE_ before migration)
- Changes require redeploy to take effect
- Make sure variables are enabled for "Production" environment

### Next.js Migration Notes
- Use `<Link href="/">` not `<Link to="/">` (Next.js vs React Router syntax)
- Auth pages (login, admin, submission) use `dynamic()` with `ssr: false` to avoid SSR issues
- Supabase client uses @supabase/ssr with createBrowserClient for proper hydration
- supabase-browser.ts is a singleton to prevent multiple GoTrueClient instances

### GitHub Actions Mode
- "View" button only works in local dev mode (fetches from localhost API)
- In production, view event counts and status from scraper_runs table

## Database Schema (key tables)

### events
- id, title, date, time, venue_id
- event_url, ticket_url, image_url
- price, age_restriction, supporting_artists
- status (pending/approved/rejected)
- submitter_email, source, added_at

### venues
- id, name, description, address, city, state
- website_url, color_bg, color_text, color_border
- active (boolean)

### scraper_runs
- scraper_id, scraper_name, status
- event_count, error_message
- started_at, finished_at
