const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.SCRAPER_TOKEN || "savemyholiday-secret";

// ── Improvement 1: Shared browser singleton ──────────────────────────────────
let sharedBrowser = null;

async function getBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) return sharedBrowser;
  sharedBrowser = await chromium.launch({
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
  sharedBrowser.on("disconnected", () => { sharedBrowser = null; });
  return sharedBrowser;
}

async function newPage() {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "de-DE",
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: { "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7" },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, "languages", { get: () => ["de-DE", "de", "en-US"] });
    window.chrome = { runtime: {} };
  });
  const page = await context.newPage();
  return { page, context };
}

// ── Auth middleware ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const token = req.headers["x-scraper-token"] || req.query.token;
  if (token !== AUTH_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Debug endpoint ───────────────────────────────────────────────────────────
app.get("/debug", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });
  let ctx;
  try {
    const { page, context } = await newPage();
    ctx = context;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await acceptConsent(page);
    try { await page.waitForSelector("[data-testid='property-card'], .sr_item, [data-hotelid]", { timeout: 6000 }); } catch {}
    await page.waitForTimeout(3000);
    const text = await page.innerText("body").catch(() => "");
    const title = await page.title().catch(() => "");
    const allHrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]")).map(a => a.href).filter(h => h.includes("booking.com") || h.includes("hotel"))
    ).catch(() => []);
    await ctx.close();
    res.json({ title, textSnippet: text.slice(0, 2000), prices: extractPrices(text), bookingHrefs: allHrefs.slice(0, 20) });
  } catch (e) {
    if (ctx) await ctx.close().catch(() => {});
    res.status(500).json({ error: String(e) });
  }
});

// ── Scrape endpoint ──────────────────────────────────────────────────────────
app.get("/scrape", async (req, res) => {
  const { hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl } = req.query;
  if (!hotel) return res.status(400).json({ error: "Missing hotel parameter" });

  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const nights = (checkin && checkout)
    ? Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
    : 1;

  const hotelWords = hotel.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
    .replace(/[òóôõöø]/g, "o").replace(/[ùúûü]/g, "u")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .split(/\s+/).filter(w => w.length > 3);

  const bookingResult = await scrapeBooking({ hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl, nights, hotelWords, norm })
    .catch(e => ({ source: "Booking.com", error: String(e), lowest: null }));

  const results = [bookingResult];
  const lowestFound = bookingResult.lowest ?? null;

  return res.json({
    hotel, city: city || "", checkin: checkin || "", checkout: checkout || "",
    roomType: roomType || null, mealPlan: mealPlan || null,
    nights, results, lowestFound, currency: "EUR",
  });
});

// ── Booking.com scraper ──────────────────────────────────────────────────────
async function scrapeBooking({ hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl, nights, hotelWords, norm }) {
  const { page, context } = await newPage();
  try {
    let hotelPageUrl = null;

    // ── Improvement 3: Use stored URL if provided (skip search entirely) ────
    if (bookingUrl) {
      const sep = bookingUrl.includes("?") ? "&" : "?";
      hotelPageUrl = `${bookingUrl.split("?")[0]}${sep}checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&group_children=0&selected_currency=EUR`;
    } else {
      // Search for hotel URL
      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const ciParts = (checkin || "").split("-");
      const coParts = (checkout || "").split("-");
      let searchUrl = `https://www.booking.com/search.html?ss=${q}&lang=de&sb=1&selected_currency=EUR`;
      if (ciParts.length === 3) searchUrl += `&checkin_year=${ciParts[0]}&checkin_month=${parseInt(ciParts[1])}&checkin_monthday=${parseInt(ciParts[2])}`;
      if (coParts.length === 3) searchUrl += `&checkout_year=${coParts[0]}&checkout_month=${parseInt(coParts[1])}&checkout_monthday=${parseInt(coParts[2])}`;
      searchUrl += `&group_adults=2&no_rooms=1&group_children=0`;

      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await acceptConsent(page);
      try { await page.waitForSelector("[data-testid='property-card'], .sr_item, [data-hotelid]", { timeout: 8000 }); } catch {}
      await page.waitForTimeout(2000);

      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map(a => a.href)
      ).catch(() => []);

      // Determine expected country code from city
      const cityLow = (city || "").toLowerCase();
      const expectedCc = cityLow.includes("budapest") ? "hu"
        : cityLow.includes("paris") ? "fr"
        : cityLow.includes("london") ? "gb"
        : cityLow.includes("wien") || cityLow.includes("vienna") ? "at"
        : cityLow.includes("amsterdam") ? "nl"
        : cityLow.includes("rome") || cityLow.includes("roma") || cityLow.includes("milan") ? "it"
        : cityLow.includes("barcelona") || cityLow.includes("madrid") ? "es"
        : cityLow.includes("zurich") || cityLow.includes("zürich") || cityLow.includes("geneva") ? "ch"
        : null;

      const isRightCountry = (href) => !expectedCc || href.includes(`/hotel/${expectedCc}/`);

      let foundUrl = null;
      // Best match: ALL words in URL + correct country
      for (const href of hrefs) {
        if (href.includes("booking.com/hotel/") && isRightCountry(href)) {
          const h = norm(href);
          if (hotelWords.length > 1 && hotelWords.every(w => h.includes(norm(w)))) {
            foundUrl = href.split("?")[0]; break;
          }
        }
      }
      // Fallback: ANY word + correct country
      if (!foundUrl) {
        for (const href of hrefs) {
          if (href.includes("booking.com/hotel/") && isRightCountry(href)) {
            const h = norm(href);
            if (hotelWords.some(w => h.includes(norm(w)))) {
              foundUrl = href.split("?")[0]; break;
            }
          }
        }
      }
      // Fallback: correct country, first link
      if (!foundUrl) {
        for (const href of hrefs) {
          if (href.includes("booking.com/hotel/") && isRightCountry(href)) {
            foundUrl = href.split("?")[0]; break;
          }
        }
      }
      // Last resort: any hotel link (only if no country expected)
      if (!foundUrl && !expectedCc) {
        for (const href of hrefs) {
          if (href.includes("booking.com/hotel/")) { foundUrl = href.split("?")[0]; break; }
        }
      }

      if (!foundUrl) {
        await context.close();
        return { source: "Booking.com", error: "Hotel not found", lowest: null };
      }
      hotelPageUrl = `${foundUrl}?checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&group_children=0&selected_currency=EUR`;
    }

    await page.goto(hotelPageUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    await acceptConsent(page);
    await page.waitForTimeout(3000);

    const pageText = await page.innerText("body").catch(() => "");
    const minTotal = nights * 70;
    let bookingPrice = null;

    if (roomType || mealPlan) {
      const roomWords = (roomType || "").toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
        .split(/\s+/).filter(w => w.length > 2);
      const mealKeywords = {
        "room_only":    ["ohne frühstück", "ohne verpflegung", "room only", "sans petit", "senza colazione"],
        "breakfast":    ["frühstück", "breakfast", "petit-déjeuner", "colazione"],
        "half_board":   ["halbpension", "half board", "demi-pension"],
        "full_board":   ["vollpension", "full board", "pension complète"],
        "all_inclusive":["all inclusive", "alles inklusive"],
      };
      const mealWords = mealPlan ? (mealKeywords[mealPlan] || []) : [];
      const lines = pageText.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const ln = norm(lines[i]);
        const roomMatch = roomWords.length === 0 || roomWords.some(w => ln.includes(norm(w)));
        const mealMatch = mealWords.length === 0 || mealWords.some(w => ln.includes(norm(w)));
        if (roomMatch && mealMatch) {
          const prices = extractEurPrices(lines.slice(i, i + 10).join(" ")).filter(p => p >= minTotal);
          if (prices.length > 0) { bookingPrice = prices[0]; break; }
        }
      }
    }

    if (!bookingPrice) {
      const allPrices = extractEurPrices(pageText).filter(p => p >= minTotal);
      bookingPrice = allPrices[0] || null;
    }

    await context.close();
    return { source: "Booking.com", lowest: bookingPrice, url: hotelPageUrl };
  } catch (e) {
    await context.close().catch(() => {});
    return { source: "Booking.com", error: String(e), lowest: null };
  }
}

// ── Kayak scraper ────────────────────────────────────────────────────────────
async function scrapeKayak({ hotel, city, checkin, checkout, nights, hotelWords, norm }) {
  const { page, context } = await newPage();
  try {
    const kayakQuery = encodeURIComponent(`${hotel}${city ? " " + city : ""}`);
    const kayakUrl = `https://www.kayak.de/hotels/${kayakQuery}/${checkin || ""}/${checkout || ""}/2adults`;

    await page.goto(kayakUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    await acceptConsent(page);
    try { await page.waitForSelector("[class*='price'], [class*='Price']", { timeout: 6000 }); } catch {}
    await page.waitForTimeout(3000);

    const title = await page.title().catch(() => "");
    if (title.toLowerCase().includes("bot") || title.toLowerCase().includes("captcha")) {
      await context.close();
      return { source: "Kayak", error: "Bot detection", lowest: null };
    }

    const pageText = await page.innerText("body").catch(() => "");
    let kayakPrice = null;

    const lines = pageText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const ln = norm(lines[i]);
      if (hotelWords.some(w => ln.includes(norm(w)))) {
        const p = extractEurPrices(lines.slice(i, i + 15).join(" "));
        if (p.length > 0) { kayakPrice = p[0]; break; }
      }
    }
    if (!kayakPrice) {
      const allPrices = extractEurPrices(pageText);
      kayakPrice = allPrices[0] || null;
    }
    if (kayakPrice) {
      kayakPrice = Math.round(kayakPrice * nights);
    }

    await context.close();
    return { source: "Kayak", lowest: kayakPrice, url: kayakUrl };
  } catch (e) {
    await context.close().catch(() => {});
    return { source: "Kayak", error: String(e), lowest: null };
  }
}

async function acceptConsent(page) {
  try {
    for (const txt of ["Alle akzeptieren", "Accept all", "Akzeptieren", "Ich stimme zu", "AGREE"]) {
      const btn = page.locator(`button:has-text('${txt}')`);
      if (await btn.count() > 0) { await btn.first().click(); await page.waitForTimeout(1500); return; }
    }
    const bc = page.locator("button#onetrust-accept-btn-handler");
    if (await bc.count() > 0) { await bc.first().click(); await page.waitForTimeout(1500); }
  } catch {}
}

function extractEurPrices(text) {
  const prices = [];
  const patterns = [/(\d{2,4})\s*€/g, /€\s*(\d{2,4})/g, /EUR\s*(\d{2,4})/g, /(\d{2,4})\s*EUR/g];
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const p = parseInt(m[1]);
      if (p >= 40 && p <= 9999) prices.push(p);
    }
  }
  return [...new Set(prices)].sort((a, b) => a - b);
}

function extractPrices(text) {
  const prices = [];
  const patterns = [/(\d{2,4})\s*€/g, /€\s*(\d{2,4})/g, /EUR\s*(\d{2,4})/g, /\$\s*(\d{2,4})/g, /(\d{2,4})\s*\$/g];
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
  return name.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

app.listen(PORT, () => console.log(`SaveMyHoliday Scraper running on port ${PORT}`));
