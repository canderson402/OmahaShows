import { createClient } from '@supabase/supabase-js'
import type { Event, HistoricalShow, SourceStatus } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database row type (snake_case)
interface DbEvent {
  id: string
  title: string
  date: string
  time: string | null
  venue_id: string
  event_url: string | null
  ticket_url: string | null
  image_url: string | null
  price: string | null
  age_restriction: string | null
  supporting_artists: string[] | null
  source: string
  status: string
  added_at: string
}

interface DbVenue {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  website_url: string | null
  color_bg: string | null
  color_text: string | null
  color_border: string | null
  active: boolean
}

// Cache venues for mapping
let venuesCache: DbVenue[] | null = null

// Get all venues
export async function getVenues(): Promise<DbVenue[]> {
  if (venuesCache) return venuesCache

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  venuesCache = data || []
  return venuesCache
}

// Transform DB event to app Event type
function toAppEvent(dbEvent: DbEvent, venues: DbVenue[]): Event {
  const venue = venues.find(v => v.id === dbEvent.venue_id)
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    date: dbEvent.date,
    time: dbEvent.time || undefined,
    venue: venue?.name || dbEvent.venue_id,
    eventUrl: dbEvent.event_url || undefined,
    ticketUrl: dbEvent.ticket_url || undefined,
    imageUrl: dbEvent.image_url || undefined,
    price: dbEvent.price || undefined,
    ageRestriction: dbEvent.age_restriction || undefined,
    supportingArtists: dbEvent.supporting_artists || undefined,
    source: dbEvent.venue_id, // Use venue_id as source for filtering
    addedAt: dbEvent.added_at,
  }
}

// Transform DB event to HistoricalShow type
function toHistoricalShow(dbEvent: DbEvent, venues: DbVenue[]): HistoricalShow {
  const venue = venues.find(v => v.id === dbEvent.venue_id)
  return {
    date: dbEvent.date,
    title: dbEvent.title,
    venue: venue?.name || dbEvent.venue_id,
    supportingArtists: dbEvent.supporting_artists || undefined,
  }
}

// Get upcoming events (date >= today) with pagination
export async function getEvents(options?: { limit?: number; offset?: number }): Promise<{ events: Event[]; hasMore: boolean }> {
  const today = new Date().toISOString().split('T')[0]
  const venues = await getVenues()
  const limit = options?.limit || 20
  const offset = options?.offset || 0

  const { data, error, count } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .gte('date', today)
    .eq('status', 'approved')
    .order('date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error
  const events = (data || []).map(e => toAppEvent(e, venues))
  const hasMore = count ? offset + events.length < count : false

  return { events, hasMore }
}

// Get history (past events) with filter-based loading
export type HistoryFilter = '30days' | '90days' | 'year' | 'all'

export async function getHistory(options?: {
  filter?: HistoryFilter
  limit?: number
  offset?: number
}): Promise<{ shows: HistoricalShow[]; hasMore: boolean }> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const venues = await getVenues()

  const filter = options?.filter || '30days'
  const limit = options?.limit || 50
  const offset = options?.offset || 0

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

  return { shows, hasMore }
}

// Get sources (venues as SourceStatus for compatibility)
export async function getSources(): Promise<SourceStatus[]> {
  const venues = await getVenues()

  // Count events per venue
  const { data: counts } = await supabase
    .from('events')
    .select('venue_id')
    .gte('date', new Date().toISOString().split('T')[0])
    .eq('status', 'approved')

  const countMap: Record<string, number> = {}
  for (const row of counts || []) {
    countMap[row.venue_id] = (countMap[row.venue_id] || 0) + 1
  }

  return venues.map(v => ({
    id: v.id,
    name: v.name,
    url: v.website_url || '',
    status: 'ok' as const,
    lastScraped: new Date().toISOString(),
    eventCount: countMap[v.id] || 0,
  }))
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
  error_message: string | null
  events_data?: DbEvent[] | null
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

// Submit a new event (goes to pending status)
export interface SubmitEventData {
  title: string
  date: string
  time?: string
  venueId: string
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
