# SaveMyHoliday Scraper Service

Playwright-based hotel price scraper. Deploy to Railway.app.

## Setup on Railway

1. New Project → Deploy from GitHub repo
2. Root Directory: `scraper`
3. Add environment variable: `SCRAPER_TOKEN=your-secret-token`

## API

GET `/scrape?hotel=Marriott+Berlin&city=Berlin&checkin=2026-05-01&checkout=2026-05-03`

Header: `x-scraper-token: your-secret-token`
