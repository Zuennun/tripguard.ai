require("dotenv").config();
const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.SCRAPER_TOKEN;
if (!AUTH_TOKEN) { console.error("FATAL: SCRAPER_TOKEN env var not set"); process.exit(1); }

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
  // SSRF protection: only allow booking.com URLs
  if (!url.startsWith("https://www.booking.com/")) {
    return res.status(400).json({ error: "Only booking.com URLs allowed" });
  }
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

  const [bookingResult, hotelsResult] = await Promise.allSettled([
    scrapeBooking({ hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl, nights, hotelWords, norm }),
    scrapeHotels({ hotel, city, checkin, checkout, nights, hotelWords, norm }),
  ]);

  const results = [
    bookingResult.status === "fulfilled" ? bookingResult.value : { source: "Booking.com", error: String(bookingResult.reason), lowest: null },
    hotelsResult.status === "fulfilled" ? hotelsResult.value : { source: "Hotels.com", error: String(hotelsResult.reason), lowest: null },
  ];

  const validPrices = results.map(r => r.lowest).filter(p => p != null);
  const lowestFound = validPrices.length > 0 ? Math.min(...validPrices) : null;

  return res.json({
    hotel, city: city || "", checkin: checkin || "", checkout: checkout || "",
    roomType: roomType || null, mealPlan: mealPlan || null,
    nights, results, lowestFound, currency: "EUR",
  });
});

// ── Expedia scraper ───────────────────────────────────────────────────────────
async function scrapeHotels({ hotel, city, checkin, checkout, nights, hotelWords, norm }) {
  const { page, context } = await newPage();
  try {
    const q = encodeURIComponent(`${hotel} ${city || ""}`);
    const searchUrl = `https://www.expedia.de/Hotel-Search?destination=${q}&startDate=${checkin}&endDate=${checkout}&adults=2&rooms=1&currency=EUR`;

    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    await acceptConsent(page);
    try { await page.waitForSelector("[data-stid='property-listing'], [class*='uitk-card'], [data-testid='property-card']", { timeout: 8000 }); } catch {}
    await page.waitForTimeout(3000);

    const minTotal = nights * 70;
    const pageText = await page.innerText("body").catch(() => "");
    const lines = pageText.split("\n");

    // Find lines containing hotel name, then look for prices nearby
    let expediaPrice = null;
    for (let i = 0; i < lines.length; i++) {
      const ln = norm(lines[i]);
      if (hotelWords.every(w => ln.includes(norm(w)))) {
        const chunk = lines.slice(i, i + 20).join(" ");
        const prices = extractEurPrices(chunk).filter(p => p >= minTotal);
        if (prices.length > 0) { expediaPrice = prices[0]; break; }
      }
    }

    await context.close();
    if (!expediaPrice) return { source: "Expedia", error: "Hotel not found in results", lowest: null };
    return { source: "Expedia", lowest: expediaPrice, url: searchUrl };
  } catch (e) {
    await context.close().catch(() => {});
    return { source: "Expedia", error: String(e), lowest: null };
  }
}

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
    // Wait for room table to render
    try { await page.waitForSelector(".hprt-table, [data-block='property_room_type_row'], .js-rt-block-row", { timeout: 8000 }); } catch {}
    await page.waitForTimeout(2000);

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

      // Try DOM-based extraction: find room rows and their prices
      const domPrices = await page.evaluate(({ roomWords, mealWords, minTotal }) => {
        const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const parsePrice = txt => {
          // Match "1.178,00" "1.178" "1178" etc.
          const m = txt.match(/(\d{1,2}[.,]\d{3}|\d{3,4})(?:[.,]\d{1,2})?/);
          if (!m) return null;
          const raw = parseInt(m[1].replace(/[.,](\d{3})$/, "$1").replace(/[.,]/g, ""));
          return raw >= minTotal && raw <= 99999 ? raw : null;
        };

        const results = [];
        const debug = [];
        // Try room table rows
        const rows = document.querySelectorAll("tr.js-rt-block-row, tr[data-block-id], .hprt-table tbody tr");
        debug.push("rows_found:" + rows.length);
        for (const row of rows) {
          const nameEl = row.querySelector(".hprt-roomtype-name, .room-info .js-rt-room-title, [class*='roomtype']");
          const rowName = nameEl ? normalize(nameEl.textContent || "") : "";
          // All words must match (AND logic) for multi-word room types like "Junior Suite"
          const roomMatch = roomWords.length === 0 || roomWords.every(w => rowName.includes(normalize(w)));
          if (rowName) debug.push("row_name:" + rowName + " match:" + roomMatch);
          if (!roomMatch) continue;
          // Also check full row text — both "1.178 €" and "€ 1.178" formats
          const rowText = row.textContent || "";
          const pricePatterns = [
            /(\d{1,2}[.,]\d{3}|\d{3,4})(?:[.,]\d{1,2})?\s*€/g,
            /€\s*(\d{1,2}[.,]\d{3}|\d{3,4})(?:[.,]\d{1,2})?/g,
          ];
          for (const pattern of pricePatterns) {
            for (const m of [...rowText.matchAll(pattern)]) {
              const raw = parseInt(m[1].replace(/[.,](\d{3})$/, "$1").replace(/[.,]/g, ""));
              if (raw >= minTotal && raw <= 99999) { results.push(raw); debug.push("price:" + raw); }
            }
          }
        }
        return { results, debug };
      }, { roomWords, mealWords, minTotal }).catch(() => []);

      const domPricesArr = domPrices?.results || [];
      console.log("[DOM debug]", JSON.stringify(domPrices?.debug || []));
      if (domPricesArr.length > 0) {
        bookingPrice = Math.min(...domPricesArr);
      } else {
        console.log("[DOM debug] no DOM prices found, falling back to text");
        // Fallback: text-based search
        const pageText = await page.innerText("body").catch(() => "");
        const lines = pageText.split("\n");
        const candidatePrices = [];
        for (let i = 0; i < lines.length; i++) {
          const ln = norm(lines[i]);
          const roomMatch = roomWords.length === 0 || roomWords.every(w => ln.includes(norm(w)));
          const mealMatch = mealWords.length === 0 || mealWords.some(w => ln.includes(norm(w)));
          if (roomMatch && mealMatch) {
            const prices = extractEurPrices(lines.slice(i, i + 30).join(" ")).filter(p => p >= minTotal);
            candidatePrices.push(...prices);
          }
        }
        if (candidatePrices.length > 0) bookingPrice = Math.min(...candidatePrices);
      }
    }

    if (!bookingPrice) {
      const pageText = await page.innerText("body").catch(() => "");
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

// ── OpenAI Web Search scraper ─────────────────────────────────────────────────
// Nutzt gpt-4o-search-preview um Preise von Booking.com, Expedia, Trip.com etc. zu finden
async function scrapeViaOpenAI({ hotel, city, checkin, checkout, nights }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [{ source: "OpenAI Search", error: "No API key", lowest: null }];

  const location = city ? ` in ${city}` : "";
  const prompt = `Search for the EXACT hotel "${hotel}"${location}. Do NOT return other hotels or hotels in other cities.
Find the total price in EUR for a stay from ${checkin} to ${checkout} (${nights} nights, 2 adults) on multiple booking sites.
Return a JSON array ONLY for this specific hotel:
[{"source": "Booking.com", "price": 838, "url": "https://..."}, {"source": "Expedia", "price": 900, "url": "https://..."}, ...]
Rules:
- Only include results for the exact hotel "${hotel}"${location}
- Price must be in EUR (convert if needed) and must be the TOTAL for all ${nights} nights (not per night)
- Typical total price range for this stay: €${nights * 70} – €${nights * 500}
- Include sources: Booking.com, Expedia, Trip.com, Hotels.com, Agoda, HRS if found
- Return ONLY the JSON array, no other text`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
      }),
    });

    if (!res.ok) return [{ source: "OpenAI Search", error: `HTTP ${res.status}`, lowest: null }];

    const data = await res.json();
    const text = data?.output
      ?.filter(o => o.type === "message")
      ?.flatMap(o => o.content)
      ?.filter(c => c.type === "output_text")
      ?.map(c => c.text)
      ?.join("") ?? "";

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [{ source: "OpenAI Search", error: "No JSON in response", lowest: null }];

    const parsed = JSON.parse(match[0]);
    const minTotal = nights * 70;
    const maxTotal = nights * 500;

    return parsed
      .filter(r => r.price && r.price >= minTotal && r.price <= maxTotal)
      .map(r => ({ source: r.source, lowest: Math.round(r.price), url: addDatesToUrl(r.url ?? "", r.source, checkin, checkout) }));
  } catch (e) {
    return [{ source: "OpenAI Search", error: String(e), lowest: null }];
  }
}

function addDatesToUrl(url, source, checkin, checkout) {
  if (!url || !checkin || !checkout) return url;
  try {
    const u = new URL(url);
    const src = source.toLowerCase();
    if (src.includes("expedia") || src.includes("hotels.com") || src.includes("orbitz") || src.includes("ebookers")) {
      u.searchParams.set("chkin", checkin);
      u.searchParams.set("chkout", checkout);
    } else if (src.includes("hrs")) {
      u.searchParams.set("arrivalDate", checkin);
      u.searchParams.set("departureDate", checkout);
      u.searchParams.set("roomQuantity", "1");
      u.searchParams.set("adults", "2");
    } else if (src.includes("trip.com")) {
      u.searchParams.set("checkin", checkin);
      u.searchParams.set("checkout", checkout);
    } else if (src.includes("agoda")) {
      u.searchParams.set("checkIn", checkin);
      u.searchParams.set("checkOut", checkout);
      u.searchParams.set("adults", "2");
    } else if (src.includes("booking.com")) {
      u.searchParams.set("checkin", checkin);
      u.searchParams.set("checkout", checkout);
      u.searchParams.set("group_adults", "2");
      u.searchParams.set("no_rooms", "1");
    }
    return u.toString();
  } catch {
    return url;
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
  // Match formats: "1.178,00 €", "1.178 €", "1178 €", "€ 1.178", "1,178.00 €"
  const patterns = [
    /(\d{1,2}[.,]\d{3}|\d{2,4})(?:[.,]\d{1,2})?\s*€/g,
    /€\s*(\d{1,2}[.,]\d{3}|\d{2,4})(?:[.,]\d{1,2})?/g,
    /EUR\s*(\d{1,2}[.,]\d{3}|\d{2,4})(?:[.,]\d{1,2})?/g,
    /(\d{1,2}[.,]\d{3}|\d{2,4})(?:[.,]\d{1,2})?\s*EUR/g,
  ];
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      // Normalize: strip thousands separator (dot or comma before 3 digits)
      const raw = m[1].replace(/[.,](\d{3})$/, "$1").replace(/[.,]/g, "");
      const p = parseInt(raw);
      if (p >= 40 && p <= 99999) prices.push(p);
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
