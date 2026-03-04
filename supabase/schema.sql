-- Omaha Shows Database Schema
-- Run this in Supabase SQL Editor

-- Venues table - normalized venue information
CREATE TABLE venues (
  id TEXT PRIMARY KEY,              -- e.g., 'theslowdown', 'waitingroom'
  name TEXT NOT NULL,               -- e.g., 'The Slowdown', 'Waiting Room'
  description TEXT,                 -- Venue info, age policy, parking, etc.
  address TEXT,
  city TEXT DEFAULT 'Omaha',
  state TEXT DEFAULT 'NE',
  zip TEXT,
  website_url TEXT,
  image_url TEXT,                   -- Venue photo
  capacity INTEGER,
  color_bg TEXT,                    -- Tailwind class e.g., 'bg-amber-500/20'
  color_text TEXT,                  -- Tailwind class e.g., 'text-amber-400'
  color_border TEXT,                -- Tailwind class e.g., 'border-amber-500'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers (for future use)
CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb  -- favorite venues, artists, frequency, etc.
);

-- Events table - stores ALL events (past and upcoming)
-- History is just a query: SELECT * FROM events WHERE date < CURRENT_DATE
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  venue_id TEXT NOT NULL REFERENCES venues(id),
  event_url TEXT,
  ticket_url TEXT,
  image_url TEXT,
  price TEXT,
  age_restriction TEXT,
  supporting_artists TEXT[],
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  category TEXT CHECK (category IN ('music', 'sports', 'theater', 'comedy')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraper status tracking
CREATE TABLE scraper_runs (
  id SERIAL PRIMARY KEY,
  scraper_id TEXT NOT NULL,
  scraper_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error')),
  event_count INTEGER DEFAULT 0,
  new_count INTEGER DEFAULT 0,
  changed_count INTEGER DEFAULT 0,
  new_event_ids TEXT[],
  changed_event_ids TEXT[],
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Index for common queries
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_scraper_runs_started ON scraper_runs(started_at DESC);
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Seed venue data
INSERT INTO venues (id, name, address, city, state, website_url, color_bg, color_text, color_border) VALUES
  ('theslowdown', 'The Slowdown', '729 N 14th St', 'Omaha', 'NE', 'https://theslowdown.com', 'bg-amber-500/20', 'text-amber-400', 'border-amber-500'),
  ('waitingroom', 'Waiting Room', '6212 Maple St', 'Omaha', 'NE', 'https://waitingroomlounge.com', 'bg-orange-500/20', 'text-orange-400', 'border-orange-500'),
  ('reverblounge', 'Reverb Lounge', '6121 Military Ave', 'Omaha', 'NE', 'https://reverbloungeomaha.com', 'bg-rose-500/20', 'text-rose-400', 'border-rose-500'),
  ('bourbontheatre', 'Bourbon Theatre', '1415 O St', 'Lincoln', 'NE', 'https://bourbontheatre.com', 'bg-pink-500/20', 'text-pink-400', 'border-pink-500'),
  ('admiral', 'The Admiral', '1516 S St', 'Omaha', 'NE', 'https://admiralomaha.com', 'bg-fuchsia-500/20', 'text-fuchsia-400', 'border-fuchsia-500'),
  ('astrotheater', 'The Astro', '2001 N 72nd St', 'Omaha', 'NE', 'https://astrotheateromaha.com', 'bg-purple-500/20', 'text-purple-400', 'border-purple-500'),
  ('steelhouse', 'Steelhouse Omaha', '2002 N 72nd St', 'Omaha', 'NE', 'https://steelhouseomaha.com', 'bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500'),
  ('holland', 'Holland Center', '1200 Douglas St', 'Omaha', 'NE', 'https://omahaperformingarts.org', 'bg-teal-500/20', 'text-teal-400', 'border-teal-500'),
  ('orpheum', 'Orpheum Theater', '409 S 16th St', 'Omaha', 'NE', 'https://omahaperformingarts.org', 'bg-indigo-500/20', 'text-indigo-400', 'border-indigo-500'),
  ('barnato', 'Barnato', '6209 Maple St', 'Omaha', 'NE', 'https://barnatoomaha.com', 'bg-lime-500/20', 'text-lime-400', 'border-lime-500'),
  ('other', 'Other', NULL, 'Omaha', 'NE', NULL, 'bg-emerald-500/20', 'text-emerald-400', 'border-emerald-500');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security Policies

-- Events: Anyone can read approved events, only authenticated can write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved events"
  ON events FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Service role can do everything (for scrapers)
CREATE POLICY "Service role full access"
  ON events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Venues: Anyone can read, only authenticated can modify
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view venues"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage venues"
  ON venues FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Scraper runs: Only authenticated can view/manage
ALTER TABLE scraper_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view scraper runs"
  ON scraper_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage scraper runs"
  ON scraper_runs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Subscribers: Public can subscribe, only authenticated/service can view list
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers"
  ON subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage subscribers"
  ON subscribers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
