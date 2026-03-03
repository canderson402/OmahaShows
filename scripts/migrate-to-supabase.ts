/**
 * Migration script to import existing events and history to Supabase
 * Run with: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    envVars[key] = valueParts.join('=')
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL
// Service role key - pass as argument or set in .env.local
const supabaseServiceKey = process.argv[2] || envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing configuration:')
  console.error('  VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING (check .env.local)')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'MISSING')
  console.error('')
  console.error('Run with:')
  console.error('  npx tsx scripts/migrate-to-supabase.ts YOUR_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map venue names to venue IDs
const VENUE_NAME_TO_ID: Record<string, string> = {
  'Reverb Lounge': 'reverblounge',
  'The Slowdown': 'theslowdown',
  'Slowdown': 'theslowdown',
  'Waiting Room': 'waitingroom',
  'Waiting Room Lounge': 'waitingroom',
  'The Waiting Room': 'waitingroom',
  'Bourbon Theatre': 'bourbontheatre',
  'Admiral': 'admiral',
  'The Admiral': 'admiral',
  'The Astro': 'astrotheater',
  'Astro Theater': 'astrotheater',
  'Steelhouse Omaha': 'steelhouse',
  'Holland Center': 'holland',
  'Holland Performing Arts Center': 'holland',
  'Orpheum Theater': 'orpheum',
  'Orpheum Theatre': 'orpheum',
  'Barnato': 'barnato',
}

function getVenueId(venueName: string, source?: string): string {
  // If source matches a known venue ID, use it
  if (source && ['reverblounge', 'theslowdown', 'waitingroom', 'bourbontheatre', 'admiral', 'astrotheater', 'steelhouse', 'holland', 'orpheum', 'barnato'].includes(source)) {
    return source
  }

  // Try to match venue name
  const id = VENUE_NAME_TO_ID[venueName]
  if (id) return id

  // Check if venue name contains known venue
  for (const [name, venueId] of Object.entries(VENUE_NAME_TO_ID)) {
    if (venueName.toLowerCase().includes(name.toLowerCase())) {
      return venueId
    }
  }

  return 'other'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}

async function migrateEvents() {
  console.log('Loading events.json...')
  const eventsPath = path.join(__dirname, '../public/events.json')
  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'))

  const events = eventsData.events.map((e: any) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time || null,
    venue_id: getVenueId(e.venue, e.source),
    event_url: e.eventUrl || null,
    ticket_url: e.ticketUrl || null,
    image_url: e.imageUrl || null,
    price: e.price || null,
    age_restriction: e.ageRestriction || null,
    supporting_artists: e.supportingArtists || null,
    source: e.source || 'manual',
    status: 'approved',
    added_at: e.addedAt || new Date().toISOString(),
  }))

  console.log(`Inserting ${events.length} events...`)

  // Insert in batches
  const batchSize = 50
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)
    const { error } = await supabase
      .from('events')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Error inserting batch ${i}-${i + batch.length}:`, error)
    } else {
      console.log(`  Inserted ${i + batch.length}/${events.length}`)
    }
  }

  return events.length
}

async function migrateHistory() {
  console.log('Loading history.json...')
  const historyPath = path.join(__dirname, '../public/history.json')

  if (!fs.existsSync(historyPath)) {
    console.log('No history.json found, skipping...')
    return 0
  }

  const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'))

  const historyEvents = historyData.shows.map((h: any) => {
    const venueId = getVenueId(h.venue)
    const slug = slugify(h.title)
    const id = `${venueId}-${h.date}-${slug}`

    return {
      id,
      title: h.title,
      date: h.date,
      time: null,
      venue_id: venueId,
      event_url: null,
      ticket_url: null,
      image_url: null,
      price: null,
      age_restriction: null,
      supporting_artists: h.supportingArtists || null,
      source: venueId,
      status: 'approved',
      added_at: h.archivedAt || new Date().toISOString(),
    }
  })

  console.log(`Inserting ${historyEvents.length} history events...`)

  // Insert in batches, ignoring duplicates
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < historyEvents.length; i += batchSize) {
    const batch = historyEvents.slice(i, i + batchSize)
    const { error, data } = await supabase
      .from('events')
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: true })

    if (error) {
      console.error(`Error inserting history batch ${i}-${i + batch.length}:`, error)
    } else {
      inserted += batch.length
      console.log(`  Inserted ${i + batch.length}/${historyEvents.length}`)
    }
  }

  return historyEvents.length
}

async function main() {
  console.log('=== Supabase Migration ===\n')

  // Test connection
  const { data: venues, error } = await supabase.from('venues').select('id, name')
  if (error) {
    console.error('Failed to connect to Supabase:', error)
    process.exit(1)
  }
  console.log(`Connected! Found ${venues.length} venues in database.\n`)

  const eventsCount = await migrateEvents()
  console.log(`\nMigrated ${eventsCount} current events.\n`)

  const historyCount = await migrateHistory()
  console.log(`\nMigrated ${historyCount} history events.\n`)

  // Verify
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  console.log(`=== Migration Complete ===`)
  console.log(`Total events in database: ${totalEvents}`)
}

main().catch(console.error)
