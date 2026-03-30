#!/bin/bash
set -e

echo "=== TripGuard Scraper Setup ==="

# Node.js 20
echo "--- Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Playwright system dependencies
echo "--- Installing Playwright dependencies..."
apt-get install -y wget curl git \
  libglib2.0-0 libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 \
  libx11-6 libxcb1 libxext6 libx11-xcb1 libxss1 fonts-liberation

# Clone repo
echo "--- Cloning repo..."
cd /root
rm -rf tripguard-scraper
git clone https://github.com/Zuennun/tripguard.ai.git tripguard-scraper
cd tripguard-scraper/scraper

# Install npm packages
echo "--- Installing npm packages..."
npm install

# Install Playwright Chromium
echo "--- Installing Playwright Chromium..."
npx playwright install chromium
npx playwright install-deps chromium

# PM2
echo "--- Installing PM2..."
npm install -g pm2

# .env prompt
echo ""
echo "=== Bitte SCRAPER_TOKEN eingeben (mindestens 16 Zeichen) ==="
read -p "SCRAPER_TOKEN: " SCRAPER_TOKEN
echo "SCRAPER_TOKEN=${SCRAPER_TOKEN}" > /root/tripguard-scraper/scraper/.env
echo "PORT=3001" >> /root/tripguard-scraper/scraper/.env

# Start
echo "--- Starting scraper with PM2..."
pm2 start index.js --name scraper
pm2 startup systemd -u root --hp /root
pm2 save

echo ""
echo "=== FERTIG! Scraper läuft auf Port 3001 ==="
echo "SCRAPER_URL für Vercel: http://159.195.77.149:3001"
