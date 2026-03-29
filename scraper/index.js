const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3001;

// Simple auth token check
const AUTH_TOKEN = process.env.SCRAPER_TOKEN || "savemyholiday-secret";

app.use((req, res, next) => {
  const token = req.headers["x-scraper-token"] || req.query.token;
  if (token !== AUTH_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/scrape", async (req, res) => {
  const { hotel, city, checkin, checkout } = req.query;

  if (!hotel) return res.status(400).json({ error: "Missing hotel parameter" });

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      locale: "de-DE",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();
    const results = [];

    // ── Google Hotels ───────────────────────────────────────────────────────
    try {
      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const url = `https://www.google.com/travel/hotels?q=${q}&checkin=${checkin || ""}&checkout=${checkout || ""}&hl=de&gl=de&curr=EUR`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Accept consent if present
      try {
        const consent = page.locator("button:has-text('Alle akzeptieren'), button:has-text('Accept all')");
        if (await consent.count() > 0) {
          await consent.first().click();
          await page.waitForTimeout(2000);
        }
      } catch {}

      await page.waitForTimeout(3000);

      const pageText = await page.innerText("body");

      // Extract prices from page text
      const prices = extractPrices(pageText);

      // Also try to find specific hotel price
      let hotelPrice = null;
      try {
        // Look for price near hotel name
        const hotelCards = page.locator("[data-hveid], [jsname], .hotels-hotel-card");
        const count = await hotelCards.count();
        for (let i = 0; i < Math.min(count, 5); i++) {
          const cardText = await hotelCards.nth(i).innerText().catch(() => "");
          const normalizedHotel = hotel.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normalizedCard = cardText.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (normalizedCard.includes(normalizedHotel.substring(0, 8))) {
            const cardPrices = extractPrices(cardText);
            if (cardPrices.length > 0) {
              hotelPrice = cardPrices[0];
              break;
            }
          }
        }
      } catch {}

      results.push({
        source: "Google Hotels",
        prices: prices.slice(0, 10),
        hotelSpecificPrice: hotelPrice,
        lowest: hotelPrice || prices[0] || null,
      });
    } catch (e) {
      results.push({ source: "Google Hotels", error: String(e) });
    }

    // ── Booking.com ─────────────────────────────────────────────────────────
    try {
      const ciParts = (checkin || "").split("-");
      const coParts = (checkout || "").split("-");
      const q = encodeURIComponent(`${hotel} ${city || ""}`);

      let bookingUrl = `https://www.booking.com/search.html?ss=${q}&lang=de`;
      if (ciParts.length === 3) {
        bookingUrl += `&checkin_year=${ciParts[0]}&checkin_month=${parseInt(ciParts[1])}&checkin_monthday=${parseInt(ciParts[2])}`;
      }
      if (coParts.length === 3) {
        bookingUrl += `&checkout_year=${coParts[0]}&checkout_month=${parseInt(coParts[1])}&checkout_monthday=${parseInt(coParts[2])}`;
      }

      await page.goto(bookingUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Handle cookie consent
      try {
        const accept = page.locator("button#onetrust-accept-btn-handler, button:has-text('Alle akzeptieren')");
        if (await accept.count() > 0) {
          await accept.first().click();
          await page.waitForTimeout(1500);
        }
      } catch {}

      await page.waitForTimeout(2000);

      // Try price selectors
      const priceSelectors = [
        "[data-testid='price-and-discounted-price']",
        ".prco-valign-middle-helper",
        ".bui-price-display__value",
        "[data-testid='recommended-units'] [class*='price']",
      ];

      let bookingPrice = null;
      for (const sel of priceSelectors) {
        try {
          const el = page.locator(sel).first();
          if (await el.count() > 0) {
            const text = await el.innerText();
            const match = text.match(/(\d[\d.,]+)/);
            if (match) {
              const price = parseFloat(match[1].replace(/[.,](?=\d{3})/g, "").replace(",", "."));
              if (price >= 40 && price <= 9999) {
                bookingPrice = price;
                break;
              }
            }
          }
        } catch {}
      }

      // Fallback: extract from page text
      if (!bookingPrice) {
        const pageText = await page.innerText("body");
        const prices = extractPrices(pageText);
        bookingPrice = prices[0] || null;
      }

      results.push({
        source: "Booking.com",
        lowest: bookingPrice,
        url: bookingUrl,
      });
    } catch (e) {
      results.push({ source: "Booking.com", error: String(e) });
    }

    await browser.close();

    const allPrices = results.map(r => r.lowest).filter(p => p !== null && p !== undefined);
    const lowestFound = allPrices.length ? Math.min(...allPrices) : null;

    return res.json({
      hotel,
      city: city || "",
      checkin: checkin || "",
      checkout: checkout || "",
      results,
      lowestFound,
      currency: "EUR",
    });

  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    return res.status(500).json({ error: String(e) });
  }
});

function extractPrices(text) {
  const prices = [];
  const patterns = [
    /(\d{2,4})\s*€/g,
    /€\s*(\d{2,4})/g,
    /EUR\s*(\d{2,4})/g,
  ];
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const p = parseInt(m[1]);
      if (p >= 40 && p <= 9999) prices.push(p);
    }
  }
  return [...new Set(prices)].sort((a, b) => a - b);
}

app.listen(PORT, () => {
  console.log(`SaveMyHoliday Scraper running on port ${PORT}`);
});
