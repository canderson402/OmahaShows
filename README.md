# Omaha Shows

Live music event aggregator for Omaha venues.

**Site:** [omahashows.com](https://omahashows.com)

## Tech Stack

- **Frontend:** React + Vite + Tailwind
- **Scrapers:** Python + BeautifulSoup + Playwright
- **Hosting:** GitHub Pages
- **Automation:** GitHub Actions (daily at 3 AM Central)

## Venues

The Slowdown, Waiting Room, Reverb Lounge, Bourbon Theatre, Admiral, The Astro, Steel House

## Local Dev

```bash
# Frontend
npm install && npm run dev

# Scrapers
cd scraper
pip install -r requirements.txt
python run_scrape.py
```

## Deploy

Push to `main` → auto-deploys to GitHub Pages.
