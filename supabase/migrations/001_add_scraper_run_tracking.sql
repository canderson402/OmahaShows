-- Migration: Add new/changed event tracking to scraper_runs
-- Run this against your existing Supabase database

ALTER TABLE scraper_runs ADD COLUMN IF NOT EXISTS new_count INTEGER DEFAULT 0;
ALTER TABLE scraper_runs ADD COLUMN IF NOT EXISTS changed_count INTEGER DEFAULT 0;
ALTER TABLE scraper_runs ADD COLUMN IF NOT EXISTS new_event_ids TEXT[];
ALTER TABLE scraper_runs ADD COLUMN IF NOT EXISTS changed_event_ids TEXT[];
