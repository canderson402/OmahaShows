# My Shows (Saved Events) Design

**Date:** 2026-03-09
**Status:** Approved

## Overview

Users can save events to browser localStorage for quick access. A + icon on event cards toggles to a checkmark when saved. A "My Shows" tab appears (right of Submit) only when saved shows exist.

## Components

### 1. Event Card Save Button

- Small icon button in bottom-right corner of EventCardCompact
- Default state: + icon (gray/muted)
- Saved state: checkmark icon (green)
- Click toggles save/unsave

### 2. useSavedShows Hook

Custom React hook for managing saved shows in localStorage.

```typescript
interface UseSavedShowsReturn {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  removeSave: (id: string) => void;
}
```

- Storage key: `"savedShows"`
- Value: JSON array of event IDs
- Syncs across tabs via `storage` event listener

### 3. My Shows Tab

- Position: Right of "Submit" tab
- Visibility: Only shown when `savedIds.length > 0`
- Content: List of saved events using EventCardCompact
- Each card shows checkmark (can click to unsave)
- When all shows removed, tab disappears

## Data Flow

```
User clicks + on event card
    ↓
toggleSave(eventId) called
    ↓
localStorage.savedShows updated
    ↓
useSavedShows hook triggers re-render
    ↓
- Card icon updates to checkmark
- If first save: My Shows tab appears
```

## Storage Format

```json
// localStorage key: "savedShows"
["reverblounge-2026-04-15-band-name", "slowdown-2026-04-20-artist"]
```

## UI Details

### Save Button on Event Card
- Position: Bottom-right corner, inside the card
- Size: Small (w-8 h-8)
- Style: Semi-transparent background, visible on hover/always
- Icons: Plus (+) for unsaved, Checkmark (✓) for saved

### My Shows Tab
- Tab label: "My Shows" with count badge (e.g., "My Shows (3)")
- Same event card layout as Events view
- No filters needed (simple list)
- Sort by date ascending (soonest first)

## Edge Cases

- Event deleted from DB but still in savedIds: Filter out missing events, clean up localStorage
- localStorage disabled/full: Graceful fallback, button still visible but non-functional
- Multiple browser tabs: Sync via storage event listener

## Files to Modify/Create

1. `src/hooks/useSavedShows.ts` - New hook
2. `src/components/EventCardCompact.tsx` - Add save button
3. `src/App.tsx` - Add My Shows tab and view
