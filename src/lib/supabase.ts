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

// Get upcoming events (date >= today)
export async function getEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  const venues = await getVenues()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .eq('status', 'approved')
    .order('date', { ascending: true })

  if (error) throw error
  return (data || []).map(e => toAppEvent(e, venues))
}

// Get history (past events)
export async function getHistory(): Promise<HistoricalShow[]> {
  const today = new Date().toISOString().split('T')[0]
  const venues = await getVenues()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('date', today)
    .eq('status', 'approved')
    .order('date', { ascending: false })

  if (error) throw error
  return (data || []).map(e => toHistoricalShow(e, venues))
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

// Helper to approve an event
export async function approveEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .update({ status: 'approved' })
    .eq('id', id)

  if (error) throw error
}

// Helper to reject an event
export async function rejectEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) throw error
}

// Helper to get recent scraper runs
export async function getScraperRuns(limit = 20) {
  const { data, error } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
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
