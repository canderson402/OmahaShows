import { createClient } from '@supabase/supabase-js'
import type { Event, EventCategory, HistoricalShow, SourceStatus } from '../types'
import {
  eventCache,
  historyCache,
  venueCache,
  sourcesCache,
  getCacheKey,
  withCache,
  invalidateEventCaches,
} from './cache'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export cache invalidation for use in admin actions
export { invalidateEventCaches }

// Database row type (snake_case)
interface DbEvent {
  id: string
  title: string
  date: string
  time: string | null
  venue_id: string
  venue_name: string | null
  other_venue_website: string | null
  other_venue_address: string | null
  event_url: string | null
  ticket_url: string | null
  image_url: string | null
  price: string | null
  age_restriction: string | null
  supporting_artists: string[] | null
  source: string
  status: string
  added_at: string
  category: string | null
}

interface DbVenue {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  website_url: string | null
  color_hex: string | null
  active: boolean
}

// Get all venues (cached for 10 minutes)
export async function getVenues(): Promise<DbVenue[]> {
  const cacheKey = 'venues:active'

  return withCache(venueCache, cacheKey, async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
  })
}

// Transform DB event to app Event type
function toAppEvent(dbEvent: DbEvent, venues: DbVenue[]): Event {
  const venue = venues.find(v => v.id === dbEvent.venue_id)
  // For "other" events, use venue_name field; otherwise use venue lookup
  const venueName = dbEvent.venue_id === 'other'
    ? (dbEvent.venue_name || '')  // empty if not set - don't show "Other"
    : (venue?.name || dbEvent.venue_id)
  // For "other" events, use other_venue_website; otherwise use venue's website_url
  const venueUrl = dbEvent.venue_id === 'other'
    ? (dbEvent.other_venue_website || undefined)
    : (venue?.website_url || undefined)
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    date: dbEvent.date,
    time: dbEvent.time || undefined,
    venue: venueName,
    venueUrl,
    eventUrl: dbEvent.event_url || undefined,
    ticketUrl: dbEvent.ticket_url || undefined,
    imageUrl: dbEvent.image_url || undefined,
    price: dbEvent.price || undefined,
    ageRestriction: dbEvent.age_restriction || undefined,
    supportingArtists: dbEvent.supporting_artists || undefined,
    source: dbEvent.venue_id, // Use venue_id as source for filtering
    addedAt: dbEvent.added_at,
    category: dbEvent.category as EventCategory | undefined,
  }
}

// Transform DB event to HistoricalShow type
function toHistoricalShow(dbEvent: DbEvent, venues: DbVenue[]): HistoricalShow {
  const venue = venues.find(v => v.id === dbEvent.venue_id)
  const venueName = dbEvent.venue_id === 'other'
    ? dbEvent.venue_name
    : (venue?.name || dbEvent.venue_id)
  return {
    date: dbEvent.date,
    title: dbEvent.title,
    venue: venueName || '',
    supportingArtists: dbEvent.supporting_artists || undefined,
  }
}

// Get local date string (not UTC) to prevent timezone issues
function getLocalDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Time filter type
export type TimeFilter = 'all' | 'today' | 'week' | 'just-added'

// Get recently added cutoff date
function getRecentlyAddedCutoff(): string {
  const LAUNCH_DATE = new Date('2026-03-03T00:00:00Z').getTime()
  const SEVEN_DAYS_AGO = Date.now() - 7 * 24 * 60 * 60 * 1000
  const cutoff = Math.max(LAUNCH_DATE, SEVEN_DAYS_AGO)
  return new Date(cutoff).toISOString()
}

// Get upcoming events (date >= today) with pagination and search
export async function getEvents(options?: { limit?: number; offset?: number; search?: string; timeFilter?: TimeFilter; venueIds?: string[] }): Promise<{ events: Event[]; hasMore: boolean }> {
  const today = getLocalDateString()
  const venues = await getVenues()
  const limit = options?.limit || 20
  const offset = options?.offset || 0
  const timeFilter = options?.timeFilter || 'all'
  const search = options?.search?.trim() || ''
  const venueIds = options?.venueIds

  // Cache non-search, non-venue-filtered queries
  const cacheKey = (search || venueIds)
    ? null
    : getCacheKey('events', { today, limit, offset, timeFilter })

  if (cacheKey) {
    const cached = eventCache.get<{ events: Event[]; hasMore: boolean }>(cacheKey)
    if (cached) return cached
  }

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .gte('date', today)
    .eq('status', 'approved')

  // Apply time filter
  if (timeFilter === 'today') {
    query = query.eq('date', today)
  } else if (timeFilter === 'week') {
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const weekDateStr = `${weekFromNow.getFullYear()}-${String(weekFromNow.getMonth() + 1).padStart(2, '0')}-${String(weekFromNow.getDate()).padStart(2, '0')}`
    query = query.lte('date', weekDateStr)
  } else if (timeFilter === 'just-added') {
    const cutoff = getRecentlyAddedCutoff()
    query = query.gt('added_at', cutoff)
  }

  // Filter by venue IDs if provided
  if (venueIds && venueIds.length > 0) {
    query = query.in('venue_id', venueIds)
  }

  // Sort by added_at for recently added, otherwise by date
  if (timeFilter === 'just-added') {
    query = query.order('added_at', { ascending: false })
  } else {
    query = query.order('date', { ascending: true })
  }

  // Add search filter if provided - search both title and venue_name
  if (search) {
    // Check if search matches a known venue name
    const matchingVenue = venues.find(v =>
      v.name.toLowerCase().includes(search.toLowerCase())
    )
    if (matchingVenue) {
      // Search by title OR venue_id OR venue_name (for "other" venues)
      query = query.or(`title.ilike.%${search}%,venue_id.eq.${matchingVenue.id},venue_name.ilike.%${search}%,supporting_artists_text.ilike.%${search}%`)
    } else {
      query = query.or(`title.ilike.%${search}%,venue_name.ilike.%${search}%,supporting_artists_text.ilike.%${search}%`)
    }
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error
  const events = (data || []).map(e => toAppEvent(e, venues))
  const hasMore = count ? offset + events.length < count : false

  const result = { events, hasMore }

  // Cache the result if this was a cacheable query
  if (cacheKey) {
    eventCache.set(cacheKey, result)
  }

  return result
}

// Get history (past events) with filter-based loading
export type HistoryFilter = '30days' | '90days' | 'year' | 'all'

export async function getHistory(options?: {
  filter?: HistoryFilter
  limit?: number
  offset?: number
}): Promise<{ shows: HistoricalShow[]; hasMore: boolean }> {
  const today = new Date()
  const todayStr = getLocalDateString()

  const filter = options?.filter || '30days'
  const limit = options?.limit || 50
  const offset = options?.offset || 0

  // Check cache first (history is cached for 5 minutes)
  const cacheKey = getCacheKey('history', { todayStr, filter, limit, offset })
  const cached = historyCache.get<{ shows: HistoricalShow[]; hasMore: boolean }>(cacheKey)
  if (cached) return cached

  const venues = await getVenues()

  // Calculate date range based on filter
  let startDate: string | null = null
  if (filter === '30days') {
    const d = new Date(today)
    d.setDate(d.getDate() - 30)
    startDate = d.toISOString().split('T')[0]
  } else if (filter === '90days') {
    const d = new Date(today)
    d.setDate(d.getDate() - 90)
    startDate = d.toISOString().split('T')[0]
  } else if (filter === 'year') {
    const d = new Date(today)
    d.setFullYear(d.getFullYear() - 1)
    startDate = d.toISOString().split('T')[0]
  }
  // 'all' = no startDate filter

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .lt('date', todayStr)
    .eq('status', 'approved')
    .order('date', { ascending: false })

  // Apply date filter if not "all"
  if (startDate) {
    query = query.gte('date', startDate)
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  const shows = (data || []).map(e => toHistoricalShow(e, venues))
  const hasMore = count ? offset + shows.length < count : false
  const result = { shows, hasMore }

  // Cache the result
  historyCache.set(cacheKey, result)

  return result
}

// Get sources (venues as SourceStatus for compatibility)
// Cached for 1 minute since event counts don't change frequently
export async function getSources(): Promise<SourceStatus[]> {
  const today = getLocalDateString()
  const cacheKey = getCacheKey('sources', { today })

  const cached = sourcesCache.get<SourceStatus[]>(cacheKey)
  if (cached) return cached

  // Fetch venues and event counts in parallel
  const [venues, countsResult] = await Promise.all([
    getVenues(),
    supabase
      .from('events')
      .select('venue_id')
      .gte('date', today)
      .eq('status', 'approved')
  ])

  const countMap: Record<string, number> = {}
  for (const row of countsResult.data || []) {
    countMap[row.venue_id] = (countMap[row.venue_id] || 0) + 1
  }

  const result = venues.map(v => ({
    id: v.id,
    name: v.name,
    url: v.website_url || '',
    status: 'ok' as const,
    lastScraped: new Date().toISOString(),
    eventCount: countMap[v.id] || 0,
    colorHex: v.color_hex || '#6b7280',
  }))

  sourcesCache.set(cacheKey, result)
  return result
}

// Helper to get pending events (admin only)
export async function getPendingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Send approval notification email via Edge Function
async function sendApprovalEmail(event: {
  title: string
  date: string
  venue_id: string
  submitter_email: string
}) {
  // Get current session to ensure we have auth
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.error('No active session - cannot send email')
    return
  }

  // Call the Edge Function
  // Pass anon key in Authorization header (gateway accepts HS256)
  // Pass user's access token in body (function verifies ES256 inside)
  const functionUrl = `${supabaseUrl}/functions/v1/send-approval-email`

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      title: event.title,
      date: event.date,
      venue: event.venue_id,
      submitterEmail: event.submitter_email,
      accessToken: session.access_token,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to send email:', error)
  }
}

// Helper to approve an event
export async function approveEvent(id: string) {
  // First get the event details for the email
  const { data: event } = await supabase
    .from('events')
    .select('title, date, venue_id, submitter_email')
    .eq('id', id)
    .single()

  // Update status
  const { error } = await supabase
    .from('events')
    .update({ status: 'approved' })
    .eq('id', id)

  if (error) throw error

  // Invalidate caches since event list changed
  invalidateEventCaches()

  // Send notification email if submitter provided email
  if (event?.submitter_email) {
    try {
      await sendApprovalEmail(event as {
        title: string
        date: string
        venue_id: string
        submitter_email: string
      })
    } catch (err) {
      console.error('Failed to send approval email:', err)
      // Don't throw - event was approved, email is secondary
    }
  }
}

// Helper to reject an event
export async function rejectEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) throw error

  // Invalidate caches since event list changed
  invalidateEventCaches()
}

// Auth helpers
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Scraper run types
export interface ScraperRun {
  id: number
  scraper_id: string
  scraper_name: string
  status: 'running' | 'success' | 'error'
  event_count: number
  new_count: number
  changed_count: number
  new_event_ids: string[] | null
  changed_event_ids: string[] | null
  error_message: string | null
  started_at: string
  finished_at: string | null
}

// Get recent scraper runs
export async function getScraperRuns(scraperId?: string, limit = 10): Promise<ScraperRun[]> {
  let query = supabase
    .from('scraper_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (scraperId) {
    query = query.eq('scraper_id', scraperId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Get latest run for each scraper
export async function getLatestScraperRuns(): Promise<Record<string, ScraperRun>> {
  const { data, error } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('started_at', { ascending: false })

  if (error) throw error

  const latest: Record<string, ScraperRun> = {}
  for (const run of data || []) {
    if (!latest[run.scraper_id]) {
      latest[run.scraper_id] = run
    }
  }
  return latest
}

// Create a new scraper run (marks it as running)
export async function createScraperRun(scraperId: string, scraperName: string): Promise<ScraperRun> {
  const { data, error } = await supabase
    .from('scraper_runs')
    .insert({
      scraper_id: scraperId,
      scraper_name: scraperName,
      status: 'running',
      event_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a scraper run with results
export async function updateScraperRun(
  runId: number,
  status: 'success' | 'error',
  eventCount: number,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase
    .from('scraper_runs')
    .update({
      status,
      event_count: eventCount,
      error_message: errorMessage || null,
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId)

  if (error) throw error
}

// Get events by IDs (for scraper dashboard)
export async function getEventsByIds(ids: string[]): Promise<{ id: string; title: string; date: string }[]> {
  if (!ids.length) return []

  const { data, error } = await supabase
    .from('events')
    .select('id, title, date')
    .in('id', ids)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

// Get full events by IDs (for My Shows - includes all event data)
export async function getFullEventsByIds(ids: string[]): Promise<Event[]> {
  if (!ids.length) return []

  const venues = await getVenues()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('id', ids)
    .order('date', { ascending: true })

  if (error) throw error
  return (data || []).map(e => toAppEvent(e, venues))
}

// Minimal event type for calendar (no image loading)
export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string | undefined
  venue: string
  venueUrl: string | undefined
  source: string
  eventUrl: string | undefined
  ticketUrl: string | undefined
  price: string | undefined
  supportingArtists: string[] | undefined
}

// Get events for a specific month (lightweight, for calendar view)
export async function getEventsForMonth(year: number, month: number): Promise<CalendarEvent[]> {
  const venues = await getVenues()

  // Build date range for the month
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = month === 11
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 2).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('events')
    .select('id, title, date, time, venue_id, venue_name, other_venue_website, event_url, ticket_url, price, supporting_artists')
    .gte('date', startDate)
    .lt('date', endDate)
    .eq('status', 'approved')
    .order('date', { ascending: true })

  if (error) throw error

  return (data || []).map(e => {
    const venue = venues.find(v => v.id === e.venue_id)
    const venueName = e.venue_id === 'other'
      ? (e.venue_name || '')
      : (venue?.name || e.venue_id)
    const venueUrl = e.venue_id === 'other'
      ? (e.other_venue_website || undefined)
      : (venue?.website_url || undefined)
    return {
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time || undefined,
      venue: venueName,
      venueUrl,
      source: e.venue_id,
      eventUrl: e.event_url || undefined,
      ticketUrl: e.ticket_url || undefined,
      price: e.price || undefined,
      supportingArtists: e.supporting_artists || undefined,
    }
  })
}

// Get a single event by ID
export async function getEventById(id: string): Promise<Event | null> {
  const venues = await getVenues()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (error || !data) return null
  return toAppEvent(data, venues)
}

// Submit a new event (goes to pending status)
export interface SubmitEventData {
  title: string
  date: string
  time?: string
  venueId: string
  venueName?: string  // For "other" venues
  otherVenueWebsite?: string  // For "other" venues
  otherVenueAddress?: string  // For "other" venues
  eventUrl?: string
  ticketUrl?: string
  imageUrl?: string
  price?: string
  ageRestriction?: string
  supportingArtists?: string[]
  submitterEmail?: string
}

export async function submitEvent(data: SubmitEventData): Promise<void> {
  // Generate ID: manual-YYYY-MM-DD-slug
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  const id = `manual-${data.date}-${slug}`

  const { error } = await supabase
    .from('events')
    .insert({
      id,
      title: data.title,
      date: data.date,
      time: data.time || null,
      venue_id: data.venueId,
      venue_name: data.venueName || null,
      other_venue_website: data.otherVenueWebsite || null,
      other_venue_address: data.otherVenueAddress || null,
      event_url: data.eventUrl || null,
      ticket_url: data.ticketUrl || null,
      image_url: data.imageUrl || null,
      price: data.price || null,
      age_restriction: data.ageRestriction || null,
      supporting_artists: data.supportingArtists?.length ? data.supportingArtists : null,
      submitter_email: data.submitterEmail || null,
      source: 'manual',
      status: 'pending',
    })

  if (error) throw error
}
