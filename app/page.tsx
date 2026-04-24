'use client'

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import type { Event, HistoricalShow, SourceStatus } from "../src/types"
import { EventList } from "../src/components/EventList"
import { EventCardCompact } from "../src/components/EventCardCompact"
import { HistoryList } from "../src/components/HistoryList"
import { FiltersDropdown, type HistoryTimeFilter } from "../src/components/FiltersDropdown"
import { ContactModal } from "../src/components/ContactModal"
import { CalendarView } from "../src/components/CalendarView"
import { SeoStructuredData } from "../src/components/SeoStructuredData"
import { SubmitShowForm } from "../src/components/SubmitShowForm"
import { useDebounce } from "../src/hooks/useDebounce"
import { useSavedShows } from "../src/hooks/useSavedShows"
import { trackViewChange } from "../src/analytics"
import { getEvents, getHistory, getSources, getEventById, getFullEventsByIds, getTotalEventCount, type HistoryFilter } from "../src/lib/supabase"
import { DEFAULT_VENUE_COLORS, type VenueColors } from "../src/lib/constants"

type View = "events" | "history" | "calendar" | "submit" | "myshows"
type Layout = "compact" | "full"
type TimeFilter = "all" | "today" | "week" | "just-added"

// Build a set of recently added event IDs (within last 7 days, after launch date)
const getRecentlyAddedIds = (events: Event[]): Set<string> => {
  // Launch date - don't show "New" for events seeded before this date
  const LAUNCH_DATE = new Date('2026-03-03T00:00:00Z').getTime()
  const SEVEN_DAYS_AGO = Date.now() - 7 * 24 * 60 * 60 * 1000
  const cutoff = Math.max(LAUNCH_DATE, SEVEN_DAYS_AGO)

  const recentIds = events
    .filter(e => e.addedAt && new Date(e.addedAt).getTime() > cutoff)
    .map(e => e.id)

  return new Set(recentIds)
}

const EVENTS_PER_PAGE = 20

// My Shows list component
function MyShowsList({
  savedIds,
  venueColors,
  onToggleSave,
}: {
  savedIds: string[]
  venueColors: VenueColors
  onToggleSave: (id: string) => void
}) {
  const [savedEvents, setSavedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Get today's date string for comparison
  const today = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // Fetch saved events directly from database when savedIds change
  useEffect(() => {
    if (savedIds.length === 0) {
      setSavedEvents([])
      setLoading(false)
      return
    }

    const fetchSavedEvents = async () => {
      setLoading(true)
      try {
        const events = await getFullEventsByIds(savedIds)
        setSavedEvents(events)
      } catch (err) {
        console.error("Failed to fetch saved events:", err)
        setSavedEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchSavedEvents()
  }, [savedIds])

  // Check if an event is expired
  const isExpired = useCallback((event: Event) => event.date < today, [today])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (savedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No saved shows.</p>
        <p className="text-gray-500 text-sm mt-2">
          Click the + button on any event to add it here.
        </p>
      </div>
    )
  }

  // Split into upcoming and past shows
  const upcomingShows = savedEvents.filter((e) => !isExpired(e))
  const pastShows = savedEvents.filter((e) => isExpired(e))

  return (
    <div>
      <div className="mb-4 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-sm">
          Saved shows are stored in your browser. They won't appear on other devices and will be cleared if you clear your browser data.
        </p>
      </div>

      {/* Upcoming shows - full cards */}
      {upcomingShows.length > 0 && (
        <div className="divide-y divide-gray-700">
          {upcomingShows.map((event) => (
            <EventCardCompact
              key={event.id}
              event={event}
              venueColors={venueColors}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}

      {/* Past shows - compact list */}
      {pastShows.length > 0 && (
        <div className={upcomingShows.length > 0 ? "mt-6" : ""}>
          <div className="text-sm text-gray-500 font-medium mb-2">Past Shows</div>
          <div className="divide-y divide-gray-800/50">
            {pastShows.map((event) => {
              const venueHex = venueColors[event.source] || "#9ca3af"
              const formatDate = (dateStr: string) => {
                const date = new Date(dateStr + "T00:00:00")
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              return (
                <div key={event.id} className="py-2 flex items-center gap-3 opacity-60">
                  <span className="text-xs text-gray-500 w-14 flex-shrink-0">{formatDate(event.date)}</span>
                  <span className="text-white flex-1 truncate">{event.title}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: venueHex }}>{event.venue}</span>
                  <button
                    onClick={() => onToggleSave(event.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/90 text-white"
                    title="Remove from My Shows"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [hasMoreEvents, setHasMoreEvents] = useState(true)
  const [filteredTotalCount, setFilteredTotalCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [historyShows, setHistoryShows] = useState<HistoricalShow[]>([])
  const [historyTotalCount, setHistoryTotalCount] = useState(0)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false)
  const [sources, setSources] = useState<SourceStatus[]>([])
  const [view, setView] = useState<View>("events")
  const [layout] = useState<Layout>("compact")
  const [enabledVenues, setEnabledVenues] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [historyTimeFilter, setHistoryTimeFilter] = useState<HistoryTimeFilter>("30days")
  const [historySearch, setHistorySearch] = useState("")
  const [eventSearch, setEventSearch] = useState("")
  const [showContact, setShowContact] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [totalEventCount, setTotalEventCount] = useState<number | null>(null)

  const debouncedEventSearch = useDebounce(eventSearch, 300)
  const { savedIds, isSaved, toggleSave } = useSavedShows()
  const [showSaveToast, setShowSaveToast] = useState(false)

  // Wrap toggleSave to show toast when adding
  const handleToggleSave = useCallback((id: string) => {
    const wasAlreadySaved = isSaved(id)
    toggleSave(id)
    if (!wasAlreadySaved) {
      setShowSaveToast(true)
    }
  }, [isSaved, toggleSave])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showSaveToast) {
      const timer = setTimeout(() => setShowSaveToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSaveToast])

  // Read URL query params on mount for view parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    if (viewParam && ['events', 'history', 'calendar', 'submit', 'myshows'].includes(viewParam)) {
      setView(viewParam as View)
      // Clear the query param from URL
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])



  // Read URL hash on mount and on hash change - prefill search
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash.slice(1) // Remove the #
      if (hash) {
        setView("events") // Switch to events view
        // Fetch the specific event and search for it directly
        const event = await getEventById(hash)
        if (event) {
          setEventSearch(event.title)
          // Search directly, don't wait for debounce
          const result = await getEvents({ limit: EVENTS_PER_PAGE, offset: 0, search: event.title })
          setEvents(result.events)
          setHasMoreEvents(result.hasMore)
          setFilteredTotalCount(result.totalCount)
        }
        // Clear the hash from URL
        window.history.replaceState(null, "", window.location.pathname)
      }
    }
    handleHash()
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])
  const debouncedHistorySearch = useDebounce(historySearch, 300)

  const fetchData = useCallback(async () => {
    try {
      const [eventsResult, sourcesData, totalCount] = await Promise.all([
        getEvents({ limit: EVENTS_PER_PAGE, offset: 0 }),
        getSources(),
        getTotalEventCount(),
      ])
      setEvents(eventsResult.events)
      setHasMoreEvents(eventsResult.hasMore)
      setFilteredTotalCount(eventsResult.totalCount)
      setSources(sourcesData)
      setEnabledVenues(new Set(sourcesData.map(s => s.id)))
      setTotalEventCount(totalCount)
      setDataLoaded(true)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load events")
    }
  }, [])

  // Convert enabledVenues Set to array for API calls
  const enabledVenueIds = useMemo(() => Array.from(enabledVenues), [enabledVenues])

  const loadMoreEvents = useCallback(async () => {
    if (loadingMore || !hasMoreEvents) return
    setLoadingMore(true)
    try {
      const result = await getEvents({
        limit: EVENTS_PER_PAGE,
        offset: events.length,
        search: debouncedEventSearch || undefined,
        timeFilter: timeFilter,
        venueIds: enabledVenueIds.length > 0 ? enabledVenueIds : undefined,
      })
      // Deduplicate when merging to avoid duplicate keys
      setEvents(prev => {
        const existingIds = new Set(prev.map(e => e.id))
        const newEvents = result.events.filter(e => !existingIds.has(e.id))
        return [...prev, ...newEvents]
      })
      setHasMoreEvents(result.hasMore)
    } catch (err) {
      console.error("Failed to load more events:", err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMoreEvents, events.length, debouncedEventSearch, timeFilter, enabledVenueIds])

  // Refetch events when search, time filter, or venue filter changes
  useEffect(() => {
    if (!dataLoaded) return
    const searchEvents = async () => {
      try {
        const result = await getEvents({
          limit: EVENTS_PER_PAGE,
          offset: 0,
          search: debouncedEventSearch || undefined,
          timeFilter: timeFilter,
          venueIds: enabledVenueIds.length > 0 ? enabledVenueIds : undefined,
        })
        setEvents(result.events)
        setHasMoreEvents(result.hasMore)
        setFilteredTotalCount(result.totalCount)
      } catch (err) {
        console.error("Failed to search events:", err)
      }
    }
    searchEvents()
  }, [debouncedEventSearch, timeFilter, enabledVenueIds, dataLoaded])

  const loadMoreHistory = useCallback(async () => {
    if (loadingMoreHistory || !hasMoreHistory) return
    setLoadingMoreHistory(true)
    try {
      const result = await getHistory({
        filter: historyTimeFilter as HistoryFilter,
        limit: 50,
        offset: historyShows.length
      })
      setHistoryShows(prev => [...prev, ...result.shows])
      setHasMoreHistory(result.hasMore)
      setHistoryTotalCount(result.totalCount)
    } catch (err) {
      console.error("Failed to load more history:", err)
    } finally {
      setLoadingMoreHistory(false)
    }
  }, [loadingMoreHistory, hasMoreHistory, historyShows.length, historyTimeFilter])

  // Lazy load history when on history view
  useEffect(() => {
    if (!dataLoaded) return
    if (view !== 'history') return

    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        const result = await getHistory({
          filter: historyTimeFilter as HistoryFilter,
          limit: 10000,
          offset: 0
        })
        setHistoryShows(result.shows)
        setHasMoreHistory(result.hasMore)
        setHistoryTotalCount(result.totalCount)
        setHistoryLoaded(true)
      } catch (err) {
        console.error("Failed to load history:", err)
      } finally {
        setLoadingHistory(false)
      }
    }
    loadHistory()
  }, [historyTimeFilter, dataLoaded, view])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (dataLoaded && !ready) {
      const timer = setTimeout(() => setReady(true), 300)
      return () => clearTimeout(timer)
    }
  }, [dataLoaded, ready])

  useEffect(() => {
    const titles: Record<View, string> = {
      events: "Omaha Shows | Live Music in Omaha, NE",
      calendar: "Calendar | Omaha Shows",
      history: "Past Shows | Omaha Shows",
      submit: "Submit Show | Omaha Shows",
      myshows: "My Shows | Omaha Shows",
    }
    document.title = titles[view]
  }, [view])

  const venues = useMemo(() => {
    const list = sources.map((s) => ({ id: s.id, name: s.name }))
    return list.sort((a, b) => {
      if (a.id === "other") return 1
      if (b.id === "other") return -1
      return 0
    })
  }, [sources])

  const venueUrls = useMemo(() => {
    const urls: Record<string, string> = {}
    for (const s of sources) {
      if (s.url) urls[s.id] = s.url
    }
    return urls
  }, [sources])

  // Build venue colors from database (with fallback to defaults)
  const venueColors = useMemo(() => {
    const colors: VenueColors = { ...DEFAULT_VENUE_COLORS }
    for (const s of sources) {
      if (s.colorHex) colors[s.id] = s.colorHex
    }
    return colors
  }, [sources])

  const justAddedIds = useMemo(() => getRecentlyAddedIds(events), [events])
  const isJustAdded = useCallback((event: Event) => justAddedIds.has(event.id), [justAddedIds])
  const justAddedCount = justAddedIds.size

  const toggleVenue = (venueId: string) => {
    setEnabledVenues((prev) => {
      const next = new Set(prev)
      if (next.has(venueId)) next.delete(venueId)
      else next.add(venueId)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-texture">
      {!ready && (
        <div
          className="fixed inset-0 z-50 bg-[#0d0d0f] flex flex-col items-center justify-center gap-6 transition-opacity duration-500"
          style={{ opacity: dataLoaded ? 0 : 1, pointerEvents: dataLoaded ? "none" : "auto" }}
        >
          {error ? (
            <div className="text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-6 py-3">{error}</div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">OMAHA</span>
                <span className="text-white ml-3">SHOWS</span>
              </h1>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {dataLoaded && (
        <main className="md:py-8">
          <div className={`mx-auto md:px-4 ${layout === "compact" ? "max-w-4xl" : "max-w-xl"}`}>
            <div className="content-container md:rounded-2xl p-6">
              <div className="text-center mb-6 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-[#050506] md:rounded-t-2xl">
                <button
                  onClick={() => { setView("events"); setEventSearch(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="cursor-pointer"
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
                </button>

                <div className="flex justify-center flex-wrap gap-2 mt-4">
                  {(["events", "calendar", "history", "submit"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => { setView(v); trackViewChange(v === "events" ? "shows" : v); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        view === v
                          ? v === "submit"
                            ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-white/10 text-white"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {v === "events" ? "Shows" : v === "submit" ? "Submit" : v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                  {savedIds.length > 0 && (
                    <button
                      onClick={() => { setView("myshows"); trackViewChange("myshows"); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        view === "myshows"
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      My Shows ({savedIds.length})
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300">{error}</div>
              )}

              {(view === "events" || view === "history" || view === "calendar" || view === "myshows") && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    {/* Event count */}
                    <div className="text-sm text-gray-400">
                      {view === "events" && (() => {
                        const hasFilters = debouncedEventSearch || timeFilter !== "all" || enabledVenues.size !== sources.length
                        if (hasFilters) {
                          return (
                            <span>
                              <span className="font-medium text-white">{filteredTotalCount}</span> shows
                            </span>
                          )
                        }
                        return totalEventCount !== null ? (
                          <span>
                            <span className="font-medium text-white">{totalEventCount}</span> shows
                          </span>
                        ) : null
                      })()}
                      {view === "history" && historyLoaded && (
                        <span>
                          <span className="font-medium text-white">{historyTotalCount}</span> shows
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(view === "events" || view === "history") && (
                        <div className="relative">
                          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search..."
                            value={view === "events" ? eventSearch : historySearch}
                            onChange={(e) => view === "events" ? setEventSearch(e.target.value) : setHistorySearch(e.target.value)}
                            className="w-44 sm:w-56 pl-8 pr-8 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                          />
                          {(view === "events" ? eventSearch : historySearch) && (
                            <button
                              onClick={() => view === "events" ? setEventSearch("") : setHistorySearch("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                      {view === "history" ? (
                        <FiltersDropdown mode="history" venues={venues} enabledVenues={enabledVenues} toggleVenue={toggleVenue} venueColors={venueColors} timeFilter={historyTimeFilter} setTimeFilter={setHistoryTimeFilter} isOpen={filtersOpen} onOpenChange={setFiltersOpen} />
                      ) : (
                        <FiltersDropdown venues={venues} enabledVenues={enabledVenues} toggleVenue={toggleVenue} venueColors={venueColors} timeFilter={timeFilter} setTimeFilter={setTimeFilter} justAddedCount={justAddedCount} isOpen={filtersOpen} onOpenChange={setFiltersOpen} />
                      )}
                    </div>
                  </div>

                  <div className="mb-6 -mx-6 flex items-center">
                    <svg viewBox="0 0 800 24" className="w-full h-4 text-gray-500" preserveAspectRatio="none">
                      <path d="M0,12 C40,12 60,12 80,12 C100,12 110,4 130,4 C145,4 150,8 155,12 C160,16 170,20 185,20 C200,20 210,16 220,12 C235,6 250,4 270,4 C290,4 310,8 330,12 L360,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <path d="M0,12 C40,12 60,12 80,12 C100,12 110,20 130,20 C145,20 150,16 155,12 C160,8 170,4 185,4 C200,4 210,8 220,12 C235,18 250,20 270,20 C290,20 310,16 330,12 L360,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <ellipse cx="400" cy="12" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <circle cx="400" cy="12" r="2" fill="currentColor"/>
                      <path d="M360,12 Q380,5 392,12" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M360,12 Q380,19 392,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <path d="M440,12 Q420,5 408,12" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M440,12 Q420,19 408,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <path d="M800,12 C760,12 740,12 720,12 C700,12 690,4 670,4 C655,4 650,8 645,12 C640,16 630,20 615,20 C600,20 590,16 580,12 C565,6 550,4 530,4 C510,4 490,8 470,12 L440,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <path d="M800,12 C760,12 740,12 720,12 C700,12 690,20 670,20 C655,20 650,16 645,12 C640,8 630,4 615,4 C600,4 590,8 580,12 C565,18 550,20 530,20 C510,20 490,16 470,12 L440,12" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  </div>

                  {view === "events" ? (
                    <EventList events={events} layout={layout} filter={{ enabledVenues, showPast: false, timeFilter, searchQuery: debouncedEventSearch }} venueColors={venueColors} isJustAdded={isJustAdded} hasMore={hasMoreEvents} loadingMore={loadingMore} onLoadMore={loadMoreEvents} isSaved={isSaved} onToggleSave={handleToggleSave} />
                  ) : view === "myshows" ? (
                    <MyShowsList savedIds={savedIds} venueColors={venueColors} onToggleSave={handleToggleSave} />
                  ) : view === "history" ? (
                    loadingHistory && !historyLoaded ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <HistoryList shows={historyShows} enabledVenues={enabledVenues} searchQuery={debouncedHistorySearch} venueColors={venueColors} venueUrls={venueUrls} timeFilter={historyTimeFilter} hasMore={hasMoreHistory} loadingMore={loadingMoreHistory} onLoadMore={loadMoreHistory} />
                    )
                  ) : (
                    <CalendarView venueColors={venueColors} enabledVenues={enabledVenues} />
                  )}
                </>
              )}

              {view === "submit" && <SubmitShowForm />}
              <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
            </div>
          </div>
          <SeoStructuredData events={events} />
        </main>
      )}

      <div className="fixed bottom-4 left-4 z-40">
        <button onClick={() => setShowContact(true)} className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </button>
      </div>

      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3">
        <button onClick={() => setFiltersOpen(true)} className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center justify-center w-12 h-12 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all shadow-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
      </div>

      {/* Toast for saved shows */}
      <div
        className={`fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 transition-all duration-300 ${
          showSaveToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm md:text-base">
          <span>Added to My Shows</span>
          <button
            onClick={() => { setView("myshows"); setShowSaveToast(false); }}
            className="underline hover:no-underline font-medium"
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}
