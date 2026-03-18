'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSavedShows } from '../../../src/hooks/useSavedShows'
import { outboundClickProps } from '../../../src/analytics'

interface Event {
  id: string
  title: string
  date: string
  time?: string
  venue: string
  venueUrl?: string
  eventUrl?: string
  ticketUrl?: string
  imageUrl?: string
  price?: string
  ageRestriction?: string
  supportingArtists?: string[]
  source: string
}

interface Venue {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  website_url: string | null
  color_hex: string | null
}

interface Artist {
  name: string
  role: 'headliner' | 'supporting' | 'co-headliner'
  spotify_url: string | null
  instagram_url: string | null
  website_url: string | null
  image_url: string | null
  genres: string[]
}

interface ShowPageClientProps {
  event: Event
  venue: Venue | null
  artists?: Artist[]
}

// Extract Spotify artist ID from URL
function getSpotifyEmbedUrl(spotifyUrl: string): string | null {
  const match = spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/)
  if (!match) return null
  return `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator&theme=0`
}

export default function ShowPageClient({ event, venue, artists = [] }: ShowPageClientProps) {
  const headliner = artists.find(a => a.role === 'headliner')
  const headlinerSpotifyEmbed = headliner?.spotify_url ? getSpotifyEmbedUrl(headliner.spotify_url) : null
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)
  const { savedIds, isSaved, toggleSave } = useSavedShows()
  const saved = isSaved(event.id)

  // Track mount state to avoid hydration mismatch with localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle save with toast
  const handleToggleSave = useCallback(() => {
    const wasAlreadySaved = isSaved(event.id)
    toggleSave(event.id)
    if (!wasAlreadySaved) {
      setShowSaveToast(true)
    }
  }, [isSaved, toggleSave, event.id])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showSaveToast) {
      const timer = setTimeout(() => setShowSaveToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSaveToast])

  // Navigate to My Shows
  const goToMyShows = useCallback(() => {
    setShowSaveToast(false)
    router.push('/?view=myshows')
  }, [router])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      day: date.getDate(),
      year: date.getFullYear(),
    }
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = event.title

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const getGoogleMapsUrl = () => {
    if (!venue?.address) return null
    const query = encodeURIComponent(`${event.venue}, ${venue.address}, ${venue.city}, ${venue.state}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  const dateInfo = formatDate(event.date)
  const venueColor = venue?.color_hex || '#9ca3af'

  return (
    <div className="min-h-screen bg-texture flex flex-col">
      <main className="md:pt-8 flex-1 flex flex-col">
        <div className="mx-auto md:px-4 max-w-4xl w-full flex-1 flex flex-col">
          <div className="content-container md:rounded-t-2xl p-6 flex-1">
            {/* Header - matches main page exactly */}
            <div className="text-center mb-6 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-[#050506] md:rounded-t-2xl">
              <Link
                href="/"
                className="cursor-pointer inline-block"
              >
                <h1 className="text-5xl md:text-6xl font-black tracking-tight select-none">
                  <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">OMAHA</span>
                  <span className="text-white ml-3">SHOWS</span>
                </h1>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-600"></div>
                  <span className="text-gray-500 text-sm tracking-widest uppercase">Live Music</span>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-600"></div>
                </div>
              </Link>

              <div className="flex justify-center flex-wrap gap-2 mt-4">
                <Link
                  href="/"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-gray-500 hover:text-gray-300"
                >
                  Shows
                </Link>
                <Link
                  href="/?view=calendar"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-gray-500 hover:text-gray-300"
                >
                  Calendar
                </Link>
                <Link
                  href="/?view=history"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-gray-500 hover:text-gray-300"
                >
                  History
                </Link>
                <Link
                  href="/?view=submit"
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-gray-500 hover:text-gray-300"
                >
                  Submit
                </Link>
                {mounted && savedIds.length > 0 && (
                  <Link
                    href="/?view=myshows"
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-gray-500 hover:text-gray-300"
                  >
                    My Shows ({savedIds.length})
                  </Link>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-full transition-all border border-white/10 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                View All Shows
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1 md:px-2.5 md:py-0.5 rounded-full transition-all text-sm md:text-xs ${
                    mounted && saved
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {mounted && saved ? (
                    <>
                      <svg className="w-3.5 h-3.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1 md:px-2.5 md:py-0.5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-full transition-all border border-white/10 text-sm md:text-xs"
                >
                  <svg className="w-3.5 h-3.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* Event content */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
              {/* Event image */}
              <div className="lg:w-1/2">
                {/* Date banner */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl px-6 py-4">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold">
                    <span className="text-amber-400 uppercase tracking-wider">{dateInfo.weekday}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white">{dateInfo.month} {dateInfo.day}, {dateInfo.year}</span>
                  </div>
                </div>

                <div className="rounded-b-2xl overflow-hidden bg-gray-900 shadow-2xl shadow-black/50">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gray-800">
                      <span className="text-gray-600 text-9xl">&#9834;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event details */}
              <div className="lg:w-1/2 flex flex-col justify-center">
                {/* Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                  {event.title}
                </h2>

                {/* Supporting artists */}
                {event.supportingArtists && event.supportingArtists.length > 0 && (
                  <p className="text-lg md:text-xl text-gray-400 mt-3">
                    with {event.supportingArtists.join(', ')}
                  </p>
                )}

                {/* Time and price */}
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  {event.time && (
                    <div className="flex items-center gap-2 text-white">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg font-medium">{formatTime(event.time)}</span>
                    </div>
                  )}
                  {event.price && (
                    <div className="flex items-center gap-2 text-white">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg font-medium">{event.price}</span>
                    </div>
                  )}
                  {event.ageRestriction && (
                    <span className="text-gray-400">{event.ageRestriction}</span>
                  )}
                </div>

                {/* Venue section */}
                <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    {event.venueUrl ? (
                        <a
                          href={event.venueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-bold hover:underline"
                          style={{ color: venueColor }}
                        >
                          {event.venue}
                        </a>
                      ) : (
                        <span className="text-xl font-bold" style={{ color: venueColor }}>
                          {event.venue}
                        </span>
                      )}
                      {venue?.address && (
                        <p className="text-gray-400 mt-1">
                          {venue.address}, {venue.city}, {venue.state}
                        </p>
                      )}
                      {venue?.description && (
                        <p className="text-gray-500 mt-2 text-sm">{venue.description}</p>
                      )}
                      {getGoogleMapsUrl() && (
                        <a
                          href={getGoogleMapsUrl()!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mt-3 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Get Directions
                        </a>
                      )}
                  </div>
                </div>

                {/* Artist section with Spotify */}
                {artists.length > 0 && (
                  <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Artists</h3>
                    <div className="space-y-4">
                      {artists.map((artist, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {/* Artist image or placeholder */}
                          {artist.image_url && (
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden">
                              <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{artist.name}</p>
                            <p className="text-gray-500 text-xs capitalize">{artist.role}</p>
                          </div>
                          {/* Social links */}
                          <div className="flex gap-2">
                            {artist.spotify_url && (
                              <a
                                href={artist.spotify_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center hover:bg-green-600/30 transition-colors"
                                title="Spotify"
                              >
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                </svg>
                              </a>
                            )}
                            {artist.instagram_url && (
                              <a
                                href={artist.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-pink-600/20 flex items-center justify-center hover:bg-pink-600/30 transition-colors"
                                title="Instagram"
                              >
                                <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                            )}
                            {artist.website_url && (
                              <a
                                href={artist.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center hover:bg-blue-600/30 transition-colors"
                                title="Website"
                              >
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Spotify embed for headliner */}
                    {headlinerSpotifyEmbed && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <iframe
                          src={headlinerSpotifyEmbed}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex flex-col gap-3 mt-6">
                  {event.ticketUrl && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...outboundClickProps(event.venue, event.title, 'tickets', event.ticketUrl)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-rose-400 transition-all shadow-lg shadow-amber-500/25"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Get Tickets
                    </a>
                  )}
                  {event.eventUrl && event.eventUrl !== event.ticketUrl && (
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...outboundClickProps(event.venue, event.title, 'info', event.eventUrl)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      More Info
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast for saved shows */}
      <div
        className={`fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 transition-all duration-300 ${
          showSaveToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm md:text-base">
          <span>Added to My Shows</span>
          <button
            onClick={goToMyShows}
            className="underline hover:no-underline font-medium"
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}
