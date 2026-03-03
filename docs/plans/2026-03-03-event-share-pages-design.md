# Event Share Pages Design

## Overview

Enable users to share individual events via dedicated URLs with rich social previews.

## URL Structure

`omahashows.com/show/{event-id}`

Example: `omahashows.com/show/manual-2026-03-15-artist-name`

## Share Page Layout

- Dark background (matches main site)
- Centered event card using existing `EventCardCompact` component
- "View all shows →" link below card
- Minimal design - no header, no filters

## OG Meta Tags

Dynamic meta tags for social previews:

```html
<meta property="og:title" content="Artist Name at Venue" />
<meta property="og:description" content="Sat Mar 15 · 8:00 PM · $35" />
<meta property="og:image" content="[event image or fallback]" />
<meta property="og:url" content="https://omahashows.com/show/..." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

## Share Button on Event Cards

- Small share icon in top-right area of each card
- Mobile: Native share sheet (Web Share API)
- Desktop: Copy link to clipboard + "Link copied!" toast

## Error Handling

- Invalid/missing event ID: Show "Show not found" message with link to homepage
- Past events: Still display (users may reference old shows)

## Components

1. **ShowPage** - New page component at `/show/:id`
2. **ShareButton** - Reusable share icon button for event cards
3. **Route** - Add `/show/:id` route in App.tsx
