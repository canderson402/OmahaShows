# Performance Optimization Testing Plan

This document outlines how to verify the performance optimizations work correctly.

## Prerequisites

1. Run the SQL indexes in Supabase (see below)
2. Deploy the updated code
3. Have Chrome DevTools or similar ready for network timing

---

## Step 1: Apply Database Indexes

Run this SQL in the Supabase SQL Editor:

```sql
-- Copy contents of /supabase/indexes.sql and run in Supabase SQL Editor
```

**Verification:**
1. Go to Supabase Dashboard → Database → Indexes
2. Verify these indexes exist on the `events` table:
   - `idx_events_approved_upcoming`
   - `idx_events_approved_history`
   - `idx_events_added_at`
   - `idx_events_pending`
   - `idx_events_search` (if full-text search column was added)

---

## Step 2: Test Initial Page Load

**Before (baseline):**
- Note current load time in DevTools Network tab

**Test Steps:**
1. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
2. Open https://omahashows.com
3. Open DevTools → Network tab
4. Refresh the page
5. Look at the Supabase API calls

**Expected Results:**
- Should only see 2 initial API calls:
  - `GET /rest/v1/events` (upcoming events)
  - `GET /rest/v1/venues` (venue list)
- Should NOT see a history API call on initial load
- Total load time should be reduced

**Metrics to Record:**
- Time to first contentful paint
- Time until events appear
- Number of API calls

---

## Step 3: Test Client-Side Caching

**Test Steps:**
1. Load the home page
2. Click a time filter (e.g., "Today")
3. Click back to "All Upcoming"
4. Open DevTools Network tab

**Expected Results:**
- Second click to "All Upcoming" should NOT trigger a new API call
- Events should appear instantly from cache
- Cache TTL is 1 minute, so after 1 minute it will refresh

**Verification:**
1. Open browser console
2. The cache stores data for 60 seconds
3. After 60 seconds, changing filters will trigger a fresh API call

---

## Step 4: Test Lazy History Loading

**Test Steps:**
1. Load the home page (Events view)
2. Open DevTools Network tab
3. Click "History" tab
4. Observe network requests

**Expected Results:**
- History API call should only happen when clicking "History"
- Should see a loading spinner briefly
- After first load, switching away and back should use cached data (for 5 minutes)

**Edge Cases:**
- Changing history time filter should trigger a new API call
- Cached history should update after filter change

---

## Step 5: Test Admin Cache Invalidation

**Test Steps:**
1. Open admin dashboard at /admin
2. Approve or reject a pending event
3. Go back to the home page
4. Check if the event list reflects the change

**Expected Results:**
- After approving/rejecting, the cache should be invalidated
- Home page should show fresh data reflecting the change
- You should see a new API call for events

---

## Step 6: Test Search (No Caching)

**Test Steps:**
1. Type a search query (e.g., artist name)
2. Observe network requests
3. Type a different query
4. Observe network requests

**Expected Results:**
- Each unique search should trigger an API call
- Search queries are NOT cached (too unique)
- Clearing search should return to cached "all events"

---

## Step 7: Measure Overall Improvement

**Before/After Comparison:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial page load (ms) | | | |
| API calls on load | 3+ | 2 | |
| Filter change (cached) | ~300ms | ~0ms | |
| History tab first load | 0ms (preloaded) | ~200ms (lazy) | Trade-off |
| Repeated filter changes | ~300ms each | ~0ms | |

---

## Troubleshooting

### Cache Not Working
1. Check browser console for errors
2. Verify the cache module is imported correctly
3. Check if cache TTL has expired (1 minute for events)

### Indexes Not Helping
1. Run `EXPLAIN ANALYZE` on your queries in Supabase SQL Editor
2. Verify indexes are being used (look for "Index Scan" in explain output)
3. Run `ANALYZE events;` to update PostgreSQL statistics

### History Still Loading on Page Load
1. Check that `fetchData` no longer calls `getHistory`
2. Verify the lazy loading effect checks `view === 'history'`

---

## Performance Monitoring (Optional)

For ongoing monitoring, consider:

1. **Supabase Dashboard:** Check API usage and response times
2. **Vercel Analytics:** Enable Web Vitals tracking
3. **Browser DevTools:** Lighthouse performance audits

---

## Rollback Plan

If issues arise, the changes can be rolled back:

1. **Indexes:** Indexes can be dropped without affecting functionality
   ```sql
   DROP INDEX IF EXISTS idx_events_approved_upcoming;
   -- etc.
   ```

2. **Caching:** Set cache TTL to 0 or remove cache calls
   ```typescript
   // In cache.ts, change TTL to 0 to effectively disable
   export const eventCache = new QueryCache(0);
   ```

3. **Lazy Loading:** Restore `getHistory` call in `fetchData` function
