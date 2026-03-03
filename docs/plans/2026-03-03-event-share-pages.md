# Event Share Pages - Implementation Notes

## Status: In Progress (branch: `share`)

## What We Built

### 1. Dedicated Share Page (`/show/:id`)
- Route: `omahashows.com/show/{event-id}`
- Centered event card on dark background
- "View all shows →" link below
- Loading spinner while fetching
- "Show Not Found" error page for invalid IDs

### 2. ShareButton Component
- Added to all event cards (mobile + desktop, top-right corner)
- Tap = copies link to clipboard
- Shows checkmark icon for 2 seconds after copy

### 3. OG Meta Tags (for social previews)
- Dynamic title: "Artist at Venue | Omaha Shows"
- Dynamic description: "Sat Mar 15 · 8:00 PM · $35"
- Event image as og:image
- Twitter card support

## Files Changed

**New Files:**
- `src/components/ShareButton.tsx` - Copy link button
- `src/pages/ShowPage.tsx` - Share page component
- `docs/plans/` - Planning docs

**Modified Files:**
- `src/main.tsx` - Added HelmetProvider wrapper
- `src/App.tsx` - Added `/show/:id` route, imported ShowPage
- `src/components/EventCardCompact.tsx` - Added ShareButton to cards
- `src/components/SubmitShowForm.tsx` - Fixed placeholder text
- `package.json` - Added react-helmet-async dependency

## Dependencies Added
- `react-helmet-async` - For dynamic meta tags

## Decisions Made

1. **Copy-only share button** - Originally planned native share sheet on mobile, but user requested simple "copy link" behavior. Cleaner UX.

2. **Minimal share page** - No header, just centered card + "view all" link. Keeps focus on the event.

3. **Past events still viewable** - Share links work for past events too (users may want to reference old shows).

## Known Issues / Future Work

1. **OG meta tags may not work with client-side rendering** - Social crawlers (Facebook, Twitter) don't execute JavaScript. May need:
   - Vercel Edge Functions to inject meta tags server-side
   - Or a prerendering service
   - Test with https://opengraph.xyz after deploy

2. **Share button positioning** - Currently top-right of card. May need adjustment based on user feedback.

3. **No toast notification** - Just icon change. Could add a floating toast for better feedback.

## How to Test

```bash
npm run dev
# Visit http://localhost:5173/show/[any-event-id]
# Click share button on any event card
```

## To Deploy

1. Merge `share` branch to `main`
2. Run `npx vercel --prod --yes`
3. Test OG tags at https://opengraph.xyz with a share URL
