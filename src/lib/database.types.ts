export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          city: string
          state: string
          zip: string | null
          website_url: string | null
          image_url: string | null
          capacity: number | null
          color_bg: string | null
          color_text: string | null
          color_border: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          address?: string | null
          city?: string
          state?: string
          zip?: string | null
          website_url?: string | null
          image_url?: string | null
          capacity?: number | null
          color_bg?: string | null
          color_text?: string | null
          color_border?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          city?: string
          state?: string
          zip?: string | null
          website_url?: string | null
          image_url?: string | null
          capacity?: number | null
          color_bg?: string | null
          color_text?: string | null
          color_border?: string | null
          active?: boolean
          created_at?: string
        }
      }
      events: {
        Row: {
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
          status: 'pending' | 'approved' | 'rejected'
          added_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          date: string
          time?: string | null
          venue_id: string
          event_url?: string | null
          ticket_url?: string | null
          image_url?: string | null
          price?: string | null
          age_restriction?: string | null
          supporting_artists?: string[] | null
          source?: string
          status?: 'pending' | 'approved' | 'rejected'
          added_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string | null
          venue_id?: string
          event_url?: string | null
          ticket_url?: string | null
          image_url?: string | null
          price?: string | null
          age_restriction?: string | null
          supporting_artists?: string[] | null
          source?: string
          status?: 'pending' | 'approved' | 'rejected'
          added_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      scraper_runs: {
        Row: {
          id: number
          scraper_id: string
          scraper_name: string
          status: 'running' | 'success' | 'error'
          event_count: number
          error_message: string | null
          started_at: string
          finished_at: string | null
        }
        Insert: {
          id?: number
          scraper_id: string
          scraper_name: string
          status: 'running' | 'success' | 'error'
          event_count?: number
          error_message?: string | null
          started_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: number
          scraper_id?: string
          scraper_name?: string
          status?: 'running' | 'success' | 'error'
          event_count?: number
          error_message?: string | null
          started_at?: string
          finished_at?: string | null
        }
      }
      subscribers: {
        Row: {
          id: number
          email: string
          verified: boolean
          subscribed_at: string
          unsubscribed_at: string | null
          preferences: Record<string, unknown>
        }
        Insert: {
          id?: number
          email: string
          verified?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          preferences?: Record<string, unknown>
        }
        Update: {
          id?: number
          email?: string
          verified?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          preferences?: Record<string, unknown>
        }
      }
    }
  }
}

// Convenience types
export type Venue = Database['public']['Tables']['venues']['Row']
export type VenueInsert = Database['public']['Tables']['venues']['Insert']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

// History is just past events - use Event type
export type HistoryEvent = Event

// Event with joined venue data
export type EventWithVenue = Event & { venue: Venue }

export type ScraperRun = Database['public']['Tables']['scraper_runs']['Row']

export type Subscriber = Database['public']['Tables']['subscribers']['Row']
