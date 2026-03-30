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
    try { await page.waitForSelector("[data-testid='property-card'], .sr_item, [data-hotelid]", { timeout: 6000 }); } catch {}
    await page.waitForTimeout(3000);
    const text = await page.innerText("body").catch(() => "");
    const title = await page.title().catch(() => "");
    const allHrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]")).map(a => a.href).filter(h => h.includes("booking.com") || h.includes("hotel"))
    ).catch(() => []);
    await browser.close();
    res.json({ title, textSnippet: text.slice(0, 2000), prices: extractPrices(text), bookingHrefs: allHrefs.slice(0, 20) });
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
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "de-DE",
      viewport: { width: 1366, height: 768 },
      extraHTTPHeaders: {
        "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    // Hide webdriver flag
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, "languages", { get: () => ["de-DE", "de", "en-US"] });
      window.chrome = { runtime: {} };
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
      let searchUrl = `https://www.booking.com/search.html?ss=${q}&lang=de&sb=1&selected_currency=EUR`;
      if (ciParts.length === 3) {
        searchUrl += `&checkin_year=${ciParts[0]}&checkin_month=${parseInt(ciParts[1])}&checkin_monthday=${parseInt(ciParts[2])}`;
      }
      if (coParts.length === 3) {
        searchUrl += `&checkout_year=${coParts[0]}&checkout_month=${parseInt(coParts[1])}&checkout_monthday=${parseInt(coParts[2])}`;
      }
      searchUrl += `&group_adults=2&no_rooms=1&group_children=0`;

      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await acceptConsent(page);

      // Wait for hotel cards to appear
      try {
        await page.waitForSelector("[data-testid='property-card'], .sr_item, [data-hotelid]", { timeout: 8000 });
      } catch {}
      await page.waitForTimeout(2000);

      const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const hotelKey = norm(hotel).substring(0, 8);

      // Get all hrefs after cards loaded
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map(a => a.href)
      ).catch(() => []);

      // Find hotel-specific link first
      for (const href of hrefs) {
        if (href.includes("/hotel/") && (norm(href).includes(hotelKey) || norm(href).includes("joerg") || norm(href).includes("jorg") || norm(href).includes("muller"))) {
          bookingHotelUrl = href.split("?")[0];
          break;
        }
      }
      // Fallback: first /hotel/ link
      if (!bookingHotelUrl) {
        for (const href of hrefs) {
          if (href.includes("booking.com/hotel/")) {
            bookingHotelUrl = href.split("?")[0];
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
          hotelPageUrl += `${sep}checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&group_children=0&selected_currency=EUR`;
        }

        await page.goto(hotelPageUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
        await acceptConsent(page);
        await page.waitForTimeout(4000);

        // Extract EUR prices from page text (currency forced via selected_currency=EUR)
        const pageText = await page.innerText("body").catch(() => "");
        const prices = extractEurPrices(pageText);
        bookingPrice = prices[0] || null;

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

    // ── Step 4: Trivago (aggregates Expedia, Hotels.com, Booking etc.) ───────
    try {
      const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const hotelKey = norm(hotel).substring(0, 8);

      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const searchUrl = `https://www.trivago.de/?search[ridotto]=1&search[queryType]=0&search[query]=${q}&search[ci]=${checkin || ""}&search[co]=${checkout || ""}&search[rc]=2&tfc[currency]=EUR`;

      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await acceptConsent(page);
      await page.waitForTimeout(5000);

      const title = await page.title().catch(() => "");
      if (title.toLowerCase().includes("bot") || title.toLowerCase().includes("captcha")) {
        results.push({ source: "Trivago", error: "Bot detection triggered", lowest: null });
      } else {
        const pageText = await page.innerText("body").catch(() => "");
        let trivagoPrice = null;

        // Find price near hotel name
        const lines = pageText.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (norm(lines[i]).includes(hotelKey) || norm(lines[i]).includes("joerg") || norm(lines[i]).includes("muller")) {
            const nearby = lines.slice(i, i + 15).join(" ");
            const p = extractEurPrices(nearby);
            if (p.length > 0) { trivagoPrice = p[0]; break; }
          }
        }

        // Fallback: lowest price on page
        if (!trivagoPrice) {
          const allPrices = extractEurPrices(pageText);
          trivagoPrice = allPrices[0] || null;
        }

        results.push({ source: "Trivago", lowest: trivagoPrice, url: searchUrl });
      }
    } catch (e) {
      results.push({ source: "Trivago", error: String(e) });
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

function extractEurPrices(text) {
  const prices = [];
  const patterns = [
    /(\d{2,4})\s*€/g,
    /€\s*(\d{2,4})/g,
    /EUR\s*(\d{2,4})/g,
    /(\d{2,4})\s*EUR/g,
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
