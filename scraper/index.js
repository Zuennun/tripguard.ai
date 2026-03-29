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

// ── Debug endpoint ──────────────────────────────────────────────────────────
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
    await acceptConsent(page);
    await page.waitForTimeout(4000);
    const text = await page.innerText("body").catch(() => "");
    const title = await page.title().catch(() => "");
    await browser.close();
    res.json({ title, textSnippet: text.slice(0, 3000), prices: extractPrices(text) });
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

    // ── Step 1: Build Booking.com hotel URL from name ──────────────────────
    let bookingHotelUrl = null;
    try {
      const slug = hotelNameToSlug(hotel);
      const countryCode = "de"; // default Germany
      // Try Booking.com search with the hotel name directly
      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const ciParts = (checkin || "").split("-");
      const coParts = (checkout || "").split("-");
      let searchUrl = `https://www.booking.com/searchresults.html?ss=${q}&lang=de&sb=1&src=index`;
      if (ciParts.length === 3) {
        searchUrl += `&checkin=${checkin}`;
      }
      if (coParts.length === 3) {
        searchUrl += `&checkout=${checkout}`;
      }
      searchUrl += `&group_adults=2&no_rooms=1&group_children=0`;

      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await acceptConsent(page);
      await page.waitForTimeout(5000);

      // Find hotel card by name, then get its link
      const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const hotelKey = norm(hotel).substring(0, 8);

      // Try: find element containing hotel name, then find closest link
      try {
        const cards = page.locator("[data-testid='property-card'], .sr_item, [data-hotelid]");
        const cardCount = await cards.count();
        for (let i = 0; i < Math.min(cardCount, 10); i++) {
          const cardText = await cards.nth(i).innerText().catch(() => "");
          if (norm(cardText).includes(hotelKey)) {
            const link = cards.nth(i).locator("a[href*='/hotel/']").first();
            const href = await link.getAttribute("href").catch(() => "");
            if (href) {
              bookingHotelUrl = href.startsWith("http") ? href.split("?")[0] : `https://www.booking.com${href.split("?")[0]}`;
              break;
            }
          }
        }
      } catch {}

      // Fallback: first /hotel/ link on page
      if (!bookingHotelUrl) {
        const allLinks = page.locator("a[href*='/hotel/']");
        const total = await allLinks.count();
        for (let i = 0; i < Math.min(total, 5); i++) {
          const href = await allLinks.nth(i).getAttribute("href").catch(() => "");
          if (href && href.includes("/hotel/")) {
            bookingHotelUrl = href.startsWith("http") ? href.split("?")[0] : `https://www.booking.com${href.split("?")[0]}`;
            break;
          }
        }
      }
    } catch (e) {
      results.push({ source: "Booking.com search", error: String(e) });
    }

    // ── Step 2: Open hotel page and get price ───────────────────────────────
    let bookingPrice = null;
    if (bookingHotelUrl) {
      try {
        // Add dates to hotel URL
        const ciParts = (checkin || "").split("-");
        const coParts = (checkout || "").split("-");
        let hotelPageUrl = bookingHotelUrl;
        if (ciParts.length === 3 && coParts.length === 3) {
          const sep = hotelPageUrl.includes("?") ? "&" : "?";
          hotelPageUrl += `${sep}checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&group_children=0`;
        }

        await page.goto(hotelPageUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
        await acceptConsent(page);
        await page.waitForTimeout(4000);

        // Try price selectors on hotel detail page
        const priceSelectors = [
          "[data-testid='price-and-discounted-price']",
          "[class*='prco-'] span[class*='price']",
          "span[data-testid='price-and-discounted-price']",
          ".hprt-price-price",
          ".bui-price-display__value",
          "[class*='Price'] span",
          "td.hprt-table-cell-price span",
          ".prco-inline-block-maker-helper",
        ];

        for (const sel of priceSelectors) {
          try {
            const els = page.locator(sel);
            const c = await els.count();
            for (let i = 0; i < Math.min(c, 10); i++) {
              const text = await els.nth(i).innerText().catch(() => "");
              const p = parsePrice(text);
              if (p) { bookingPrice = p; break; }
            }
            if (bookingPrice) break;
          } catch {}
        }

        // Fallback: page text
        if (!bookingPrice) {
          const pageText = await page.innerText("body").catch(() => "");
          const prices = extractPrices(pageText);
          bookingPrice = prices[0] || null;
        }

        results.push({
          source: "Booking.com",
          lowest: bookingPrice,
          url: hotelPageUrl,
        });
      } catch (e) {
        results.push({ source: "Booking.com", error: String(e) });
      }
    } else {
      results.push({ source: "Booking.com", error: "Hotel not found in search results" });
    }

    // ── Step 3: Google Hotels for this specific hotel ───────────────────────
    try {
      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const url = `https://www.google.com/travel/hotels?q=${q}&checkin=${checkin || ""}&checkout=${checkout || ""}&hl=de&gl=de&curr=EUR`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
      await acceptConsent(page);
      await page.waitForTimeout(5000);

      const pageText = await page.innerText("body").catch(() => "");

      // Try to find the specific hotel card
      let hotelPrice = null;
      try {
        const cards = page.locator("[data-hveid], [jscontroller], li[class*='hotel']");
        const count = await cards.count();
        const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const hotelKey = norm(hotel).substring(0, 8);

        for (let i = 0; i < Math.min(count, 20); i++) {
          const cardText = await cards.nth(i).innerText().catch(() => "");
          if (norm(cardText).includes(hotelKey) || norm(cardText).includes("jorg") || norm(cardText).includes("joerg") || norm(cardText).includes("muller")) {
            const p = extractPrices(cardText);
            if (p.length > 0) { hotelPrice = p[0]; break; }
          }
        }
      } catch {}

      results.push({
        source: "Google Hotels",
        hotelSpecificPrice: hotelPrice,
        lowest: hotelPrice,
      });
    } catch (e) {
      results.push({ source: "Google Hotels", error: String(e) });
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

async function acceptConsent(page) {
  try {
    for (const txt of ["Alle akzeptieren", "Accept all", "Akzeptieren", "Ich stimme zu", "AGREE"]) {
      const btn = page.locator(`button:has-text('${txt}')`);
      if (await btn.count() > 0) {
        await btn.first().click();
        await page.waitForTimeout(2000);
        return;
      }
    }
    // Booking.com specific
    const bc = page.locator("button#onetrust-accept-btn-handler");
    if (await bc.count() > 0) {
      await bc.first().click();
      await page.waitForTimeout(2000);
    }
  } catch {}
}

function hotelNameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePrice(text) {
  if (!text) return null;
  const match = text.match(/(\d[\d.,]+)/);
  if (!match) return null;
  const price = parseFloat(match[1].replace(/[.,](?=\d{3})/g, "").replace(",", "."));
  return price >= 40 && price <= 9999 ? price : null;
}

function extractPrices(text) {
  const prices = [];
  const patterns = [
    /(\d{2,4})\s*€/g,
    /€\s*(\d{2,4})/g,
    /EUR\s*(\d{2,4})/g,
    /\$\s*(\d{2,4})/g,
    /(\d{2,4})\s*\$/g,
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
