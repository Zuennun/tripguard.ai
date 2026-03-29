const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3001;

const AUTH_TOKEN = process.env.SCRAPER_TOKEN || "savemyholiday-secret";

app.use((req, res, next) => {
  const token = req.headers["x-scraper-token"] || req.query.token;
  if (token !== AUTH_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Debug: see raw page text ────────────────────────────────────────────────
app.get("/debug", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      locale: "de-DE",
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });

    // Try consent
    try {
      const btn = page.locator("button:has-text('Alle akzeptieren'), button:has-text('Accept all'), button:has-text('Akzeptieren')");
      if (await btn.count() > 0) {
        await btn.first().click();
        await page.waitForTimeout(3000);
      }
    } catch {}

    await page.waitForTimeout(4000);
    const text = await page.innerText("body").catch(() => "");
    const title = await page.title().catch(() => "");
    await browser.close();

    res.json({ title, textSnippet: text.slice(0, 2000), prices: extractPrices(text) });
  } catch (e) {
    if (browser) await browser.close().catch(() => {});
    res.status(500).json({ error: String(e) });
  }
});

app.get("/scrape", async (req, res) => {
  const { hotel, city, checkin, checkout } = req.query;

  if (!hotel) return res.status(400).json({ error: "Missing hotel parameter" });

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      locale: "de-DE",
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();
    const results = [];

    // ── Google Hotels ────────────────────────────────────────────────────────
    try {
      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const url = `https://www.google.com/travel/hotels?q=${q}&checkin=${checkin || ""}&checkout=${checkout || ""}&hl=de&gl=de&curr=EUR`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });

      // Accept consent — try multiple selectors
      try {
        for (const txt of ["Alle akzeptieren", "Accept all", "Akzeptieren", "Ich stimme zu"]) {
          const btn = page.locator(`button:has-text('${txt}')`);
          if (await btn.count() > 0) {
            await btn.first().click();
            await page.waitForTimeout(3000);
            break;
          }
        }
      } catch {}

      // Wait for prices to load
      await page.waitForTimeout(5000);

      const pageText = await page.innerText("body").catch(() => "");
      const prices = extractPrices(pageText);

      // Try to find hotel-specific price from cards
      let hotelPrice = null;
      try {
        const cards = page.locator("[data-hveid], [jsname='hotel-card'], .hotel-card, [class*='hotel']");
        const count = await cards.count();
        for (let i = 0; i < Math.min(count, 10); i++) {
          const cardText = await cards.nth(i).innerText().catch(() => "");
          const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (norm(cardText).includes(norm(hotel).substring(0, 6))) {
            const p = extractPrices(cardText);
            if (p.length > 0) { hotelPrice = p[0]; break; }
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

    // ── Booking.com ──────────────────────────────────────────────────────────
    try {
      const ciParts = (checkin || "").split("-");
      const coParts = (checkout || "").split("-");
      const q = encodeURIComponent(`${hotel} ${city || ""}`);

      let bookingUrl = `https://www.booking.com/search.html?ss=${q}&lang=de&sb=1&src=index&src_elem=sb`;
      if (ciParts.length === 3) {
        bookingUrl += `&checkin_year=${ciParts[0]}&checkin_month=${parseInt(ciParts[1])}&checkin_monthday=${parseInt(ciParts[2])}`;
      }
      if (coParts.length === 3) {
        bookingUrl += `&checkout_year=${coParts[0]}&checkout_month=${parseInt(coParts[1])}&checkout_monthday=${parseInt(coParts[2])}`;
      }

      await page.goto(bookingUrl, { waitUntil: "domcontentloaded", timeout: 25000 });

      // Accept consent
      try {
        for (const sel of [
          "button#onetrust-accept-btn-handler",
          "button[data-gdpr-consent='accept']",
          "button:has-text('Alle akzeptieren')",
          "button:has-text('Akzeptieren')",
        ]) {
          const btn = page.locator(sel);
          if (await btn.count() > 0) {
            await btn.first().click();
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch {}

      await page.waitForTimeout(3000);

      // Try price selectors
      const priceSelectors = [
        "[data-testid='price-and-discounted-price']",
        "[data-testid='recommended-units'] span[class*='price']",
        ".prco-valign-middle-helper",
        ".bui-price-display__value",
        "span[class*='Price']",
        "[class*='priceWrapper'] span",
      ];

      let bookingPrice = null;
      for (const sel of priceSelectors) {
        try {
          const els = page.locator(sel);
          const count = await els.count();
          for (let i = 0; i < Math.min(count, 5); i++) {
            const text = await els.nth(i).innerText().catch(() => "");
            const match = text.match(/(\d[\d.,]+)/);
            if (match) {
              const price = parseFloat(match[1].replace(/[.,](?=\d{3})/g, "").replace(",", "."));
              if (price >= 40 && price <= 9999) { bookingPrice = price; break; }
            }
          }
          if (bookingPrice) break;
        } catch {}
      }

      // Fallback: page text regex
      if (!bookingPrice) {
        const pageText = await page.innerText("body").catch(() => "");
        const prices = extractPrices(pageText);
        bookingPrice = prices[0] || null;
      }

      results.push({ source: "Booking.com", lowest: bookingPrice, url: bookingUrl });
    } catch (e) {
      results.push({ source: "Booking.com", error: String(e) });
    }

    await browser.close();

    const allPrices = results.map(r => r.lowest).filter(p => p !== null && p !== undefined);
    const lowestFound = allPrices.length ? Math.min(...allPrices) : null;

    return res.json({ hotel, city: city || "", checkin: checkin || "", checkout: checkout || "", results, lowestFound, currency: "EUR" });

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
    /\$\s*(\d{2,4})/g,
    /(\d{2,4})\s*\$/g,
    /USD\s*(\d{2,4})/g,
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
