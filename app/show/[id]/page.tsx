import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ShowPageClient from './ShowPageClient'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DbEvent {
  id: string
  title: string
  date: string
  time: string | null
  venue_id: string
  venue_name: string | null
  event_url: string | null
  ticket_url: string | null
  image_url: string | null
  price: string | null
  age_restriction: string | null
  supporting_artists: string[] | null
  status: string
}

interface DbVenue {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  zip: string | null
  website_url: string | null
  color_hex: string | null
}

interface DbArtist {
  id: string
  name: string
  spotify_url: string | null
  instagram_url: string | null
  website_url: string | null
  image_url: string | null
  genres: string[]
}

interface EventArtist {
  role: string
  billing_order: number
  artists: DbArtist
}

async function getEvent(id: string): Promise<{ event: DbEvent; venue: DbVenue | null; artists: EventArtist[] } | null> {
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (error || !event) return null

  // Get venue details
  let venue: DbVenue | null = null
  if (event.venue_id && event.venue_id !== 'other') {
    const { data: venueData } = await supabase
      .from('venues')
      .select('*')
      .eq('id', event.venue_id)
      .single()
    venue = venueData
  }

  // Get linked artists
  const { data: artistLinks } = await supabase
    .from('event_artists')
    .select('role, billing_order, artists(*)')
    .eq('event_id', id)
    .order('billing_order', { ascending: true })

  const artists = (artistLinks || []) as unknown as EventArtist[]

  return { event, venue, artists }
}

function getLocalDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await getEvent(id)

  if (!data) {
    return {
      title: 'Show Not Found | Omaha Shows',
    }
  }

  const { event, venue } = data
  const venueName = venue?.name || event.venue_name || 'TBA'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const title = `${event.title} | Omaha Shows`
  const description = `${formatDate(event.date)} at ${venueName}. ${event.price ? `Tickets: ${event.price}` : 'Get tickets now!'}`

  return {
    title,
    description,
    alternates: {
      canonical: `https://omahashows.com/show/${id}`,
    },
    openGraph: {
      title: event.title,
      description: `${formatDate(event.date)} at ${venueName}`,
      type: 'website',
      url: `https://omahashows.com/show/${id}`,
      images: event.image_url ? [{ url: event.image_url, width: 1200, height: 630 }] : [],
      siteName: 'Omaha Shows',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: `${formatDate(event.date)} at ${venueName}`,
      images: event.image_url ? [event.image_url] : [],
    },
  }
}

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getEvent(id)

  if (!data) {
    notFound()
  }

  const { event, venue, artists } = data

  // Redirect past events to history - use string comparison to avoid timezone issues
  const todayStr = getLocalDateString()
  if (event.date < todayStr) {
    redirect('/?view=history')
  }

  // Transform to the format the client component expects
  const venueName = venue?.name || event.venue_name || ''
  const venueUrl = venue?.website_url || undefined

  const eventData = {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time || undefined,
    venue: venueName,
    venueUrl,
    eventUrl: event.event_url || undefined,
    ticketUrl: event.ticket_url || undefined,
    imageUrl: event.image_url || undefined,
    price: event.price || undefined,
    ageRestriction: event.age_restriction || undefined,
    supportingArtists: event.supporting_artists || undefined,
    source: event.venue_id,
  }

  const venueData = venue ? {
    id: venue.id,
    name: venue.name,
    description: venue.description,
    address: venue.address,
    city: venue.city,
    state: venue.state,
    website_url: venue.website_url,
    color_hex: venue.color_hex,
  } : null

  // Transform artists for the client
  const artistsData = artists.map(a => ({
    name: a.artists.name,
    role: a.role as 'headliner' | 'supporting' | 'co-headliner',
    spotify_url: a.artists.spotify_url,
    instagram_url: a.artists.instagram_url,
    website_url: a.artists.website_url,
    image_url: a.artists.image_url,
    genres: a.artists.genres || [],
  }))

  // Generate JSON-LD structured data for Google Events
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    startDate: event.time
      ? `${event.date}T${event.time}`
      : event.date,
    url: `https://omahashows.com/show/${id}`,
    ...(event.image_url && { image: event.image_url }),
    ...(event.ticket_url && {
      offers: {
        '@type': 'Offer',
        url: event.ticket_url,
        ...(event.price && { price: event.price }),
        availability: 'https://schema.org/InStock',
      },
    }),
    location: {
      '@type': 'MusicVenue',
      name: venueName,
      ...(venue?.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: venue.address,
          addressLocality: venue.city,
          addressRegion: venue.state,
          ...(venue.zip && { postalCode: venue.zip }),
          addressCountry: 'US',
        },
      }),
    },
    performer: [
      {
        '@type': 'MusicGroup',
        name: event.title,
      },
      ...(event.supporting_artists || []).map(artist => ({
        '@type': 'MusicGroup',
        name: artist,
      })),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShowPageClient event={eventData} venue={venueData} artists={artistsData} />
    </>
  )
}
