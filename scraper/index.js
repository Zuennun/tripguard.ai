require("dotenv").config();
const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3001;
const AUTH_TOKEN = process.env.SCRAPER_TOKEN;
const TWO_CAPTCHA_API_KEY = process.env.TWO_CAPTCHA_API_KEY || "";
const DATADOME_PROXY = process.env.DATADOME_PROXY || "";
const DATADOME_PROXY_TYPE = String(process.env.DATADOME_PROXY_TYPE || "http").toUpperCase();
if (!AUTH_TOKEN) { console.error("FATAL: SCRAPER_TOKEN env var not set"); process.exit(1); }
let activeRequests = 0;
const MAX_CONCURRENT = 2;

const CURRENCY_CONFIG = {
  EUR: { symbols: ["€"], codes: ["EUR"] },
  USD: { symbols: ["US$", "$"], codes: ["USD", "US$"] },
  GBP: { symbols: ["£"], codes: ["GBP"] },
  CAD: { symbols: ["C$", "CA$"], codes: ["CAD", "C$"] },
  CHF: { symbols: ["CHF"], codes: ["CHF"] },
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function normalizeCurrency(currency) {
  const code = String(currency || "EUR").trim().toUpperCase();
  return CURRENCY_CONFIG[code] ? code : "EUR";
}

function buildBookingHotelUrl(rawUrl, { checkin, checkout, currency }) {
  const base = String(rawUrl || "").trim();
  if (!base) return "";

  try {
    const url = new URL(base);
    url.search = "";
    url.searchParams.set("checkin", checkin || "");
    url.searchParams.set("checkout", checkout || "");
    url.searchParams.set("group_adults", "2");
    url.searchParams.set("no_rooms", "1");
    url.searchParams.set("group_children", "0");
    url.searchParams.set("selected_currency", currency);
    return url.toString();
  } catch {
    const clean = base.split("?")[0];
    return `${clean}?checkin=${checkin || ""}&checkout=${checkout || ""}&group_adults=2&no_rooms=1&group_children=0&selected_currency=${currency}`;
  }
}

function normalizeComparableText(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bblue\b/g, "blu")
    .replace(/\bsaint\b/g, "st")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]/g, "");
}

function buildComparableVariants(word) {
  const base = normalizeComparableText(word);
  const variants = new Set([base]);
  if (base.endsWith("blu")) variants.add(`${base}e`);
  if (base.endsWith("blue")) variants.add(base.replace(/blue$/, "blu"));
  return Array.from(variants).filter(Boolean);
}

function tokenMatches(text, token) {
  return buildComparableVariants(token).some((variant) => text.includes(variant));
}

function scoreBookingCandidate(candidate, hotelWords, cityWords, expectedCc) {
  const titleNorm = normalizeComparableText(candidate.title || "");
  const hrefNorm = normalizeComparableText(candidate.href || "");
  const haystack = `${titleNorm} ${hrefNorm}`;
  const hotelMatches = hotelWords.filter((word) => tokenMatches(haystack, word)).length;
  const cityMatches = cityWords.filter((word) => tokenMatches(haystack, word)).length;
  const rightCountry = !expectedCc || String(candidate.href || "").includes(`/hotel/${expectedCc}/`);
  const exactTitleHit = hotelWords.length > 1 && hotelWords.every((word) => tokenMatches(titleNorm, word));

  let score = 0;
  score += hotelMatches * 6;
  score += cityMatches * 2;
  if (exactTitleHit) score += 12;
  if (rightCountry) score += 3;
  if (/airport|hostel|apartments|residence/i.test(candidate.title || "")) score -= 2;
  if (!rightCountry) score -= 5;

  return { score, hotelMatches, cityMatches, rightCountry, exactTitleHit };
}

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
  const userAgent = pickRandom(USER_AGENTS);
  const context = await browser.newContext({
    userAgent,
    locale: "de-DE",
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: { "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7" },
  });
  await context.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "media" || type === "font") {
      return route.abort();
    }
    return route.continue();
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, "languages", { get: () => ["de-DE", "de", "en-US"] });
    window.chrome = { runtime: {} };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  page.setDefaultNavigationTimeout(25000);
  return { page, context, userAgent };
}

async function humanPause(page, min = 400, max = 1100) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  try {
    await page.waitForTimeout(ms);
  } catch {}
}

async function looksBlocked(page) {
  try {
    const title = (await page.title().catch(() => "")).toLowerCase();
    const body = ((await page.innerText("body").catch(() => "")) || "").toLowerCase().slice(0, 6000);
    const url = page.url().toLowerCase();
    const signals = [
      "captcha",
      "verify you are human",
      "verify you're human",
      "unusual traffic",
      "access denied",
      "robot or human",
      "security check",
      "just a moment",
      "cloudflare",
      "forbidden",
      "temporarily blocked",
    ];
    const hit = signals.find((signal) => title.includes(signal) || body.includes(signal) || url.includes(signal));
    return hit ? hit : null;
  } catch {
    return null;
  }
}

async function guardedGoto(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
  await humanPause(page, 500, 1200);
  await acceptConsent(page);
  await humanPause(page, 600, 1400);
  const blocked = await looksBlocked(page);
  if (blocked) {
    throw new Error(`Bot protection detected: ${blocked}`);
  }
}

function extractCookieValue(cookieHeader, name) {
  const match = String(cookieHeader || "").match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : "";
}

function findDataDomeCaptchaUrl(networkHits, page) {
  const hit = (networkHits || []).find((entry) => /geo\.captcha-delivery\.com\/captcha/i.test(entry.url));
  if (hit) return hit.url;
  const currentUrl = page?.url?.() || "";
  if (/geo\.captcha-delivery\.com\/captcha/i.test(currentUrl)) return currentUrl;
  return "";
}

async function submitDataDomeCaptchaTask({ captchaUrl, pageUrl, userAgent }) {
  if (!TWO_CAPTCHA_API_KEY) {
    return { ok: false, reason: "2Captcha API key missing" };
  }
  if (!DATADOME_PROXY) {
    return { ok: false, reason: "DataDome proxy missing" };
  }
  if (/\bt=bv\b/i.test(captchaUrl)) {
    return { ok: false, reason: "Proxy IP banned by DataDome (t=bv)" };
  }

  const createBody = new URLSearchParams({
    key: TWO_CAPTCHA_API_KEY,
    method: "datadome",
    captcha_url: captchaUrl,
    pageurl: pageUrl,
    userAgent,
    proxy: DATADOME_PROXY,
    proxytype: DATADOME_PROXY_TYPE,
    json: "1",
  });
  const createRes = await fetch("https://2captcha.com/in.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: createBody,
  });
  const createData = await createRes.json().catch(() => null);
  if (!createData || createData.status !== 1 || !createData.request) {
    return { ok: false, reason: `2Captcha create failed: ${createData?.request || createRes.status}` };
  }

  const taskId = createData.request;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 12000 : 5000));
    const pollUrl = new URL("https://2captcha.com/res.php");
    pollUrl.searchParams.set("key", TWO_CAPTCHA_API_KEY);
    pollUrl.searchParams.set("action", "get");
    pollUrl.searchParams.set("id", String(taskId));
    pollUrl.searchParams.set("json", "1");

    const pollRes = await fetch(pollUrl.toString(), { method: "GET" });
    const pollData = await pollRes.json().catch(() => null);
    if (!pollData) continue;
    if (pollData.status === 1 && pollData.request) {
      return { ok: true, cookieHeader: pollData.request };
    }
    if (pollData.request !== "CAPCHA_NOT_READY") {
      return { ok: false, reason: `2Captcha result failed: ${pollData.request}` };
    }
  }

  return { ok: false, reason: "2Captcha timeout waiting for DataDome solution" };
}

async function trySolveDataDome({ context, page, pageUrl, userAgent, networkHits }) {
  const captchaUrl = findDataDomeCaptchaUrl(networkHits, page);
  if (!captchaUrl) {
    return { ok: false, reason: "No DataDome captcha URL detected" };
  }

  const solve = await submitDataDomeCaptchaTask({ captchaUrl, pageUrl, userAgent });
  if (!solve.ok) {
    return { ok: false, reason: solve.reason, captchaUrl };
  }

  const datadomeValue = extractCookieValue(solve.cookieHeader, "datadome");
  if (!datadomeValue) {
    return { ok: false, reason: "2Captcha returned no datadome cookie", captchaUrl };
  }

  const domain = new URL(pageUrl).hostname;
  await context.addCookies([{
    name: "datadome",
    value: datadomeValue,
    domain,
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
  }]);

  return { ok: true, captchaUrl };
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
  if (activeRequests >= MAX_CONCURRENT) {
    return res.status(503).json({ error: "Scraper busy, retry in 30s" });
  }
  activeRequests++;

  try {
  const { hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl } = req.query;
  const currency = normalizeCurrency(req.query.currency);
  if (!hotel) return res.status(400).json({ error: "Missing hotel parameter" });

  // Validate bookingUrl: only allow booking.com hotel URLs
  if (bookingUrl && !String(bookingUrl).match(/^https:\/\/www\.booking\.com\/hotel\//)) {
    return res.status(400).json({ error: "Invalid bookingUrl" });
  }
  // Validate date format
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (checkin && !dateRe.test(checkin)) return res.status(400).json({ error: "Invalid checkin date" });
  if (checkout && !dateRe.test(checkout)) return res.status(400).json({ error: "Invalid checkout date" });

  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const nights = (checkin && checkout)
    ? Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
    : 1;

  const hotelWords = hotel.toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
    .replace(/[òóôõöø]/g, "o").replace(/[ùúûü]/g, "u")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .split(/\s+/).filter(w => w.length > 3);

  const bookingResult = await scrapeBooking({ hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl, nights, hotelWords, norm, currency })
    .catch(e => ({ source: "Booking.com", error: String(e), lowest: null }));

  // const expediaResult = await scrapeExpedia({ hotel, city, checkin, checkout, currency, nights })
  //   .catch(e => ({ source: "Expedia", lowest: null, error: String(e) }));
  // const hotelsResult = await scrapeHotels({ hotel, city, checkin, checkout, currency, nights })
  //   .catch(e => ({ source: "Hotels.com", lowest: null, error: String(e) }));
  // const hrsResult = await scrapeHRS({ hotel, city, checkin, checkout, currency, nights })
  //   .catch(e => ({ source: "HRS", lowest: null, error: String(e) }));
  // const tripResult = await scrapeTrip({ hotel, city, checkin, checkout, currency, nights })
  //   .catch(e => ({ source: "Trip.com", lowest: null, error: String(e) }));

  const results = [bookingResult];

  const validPrices = results.map(r => r.lowest).filter(p => p != null);
  const lowestFound = validPrices.length > 0 ? Math.min(...validPrices) : null;

  return res.json({
    hotel, city: city || "", checkin: checkin || "", checkout: checkout || "",
    roomType: roomType || null, mealPlan: mealPlan || null,
    nights, results, lowestFound, currency,
  });
  } finally {
    activeRequests--;
  }
});

app.get("/multi-debug", async (req, res) => {
  const { hotel, city, checkin, checkout, currency, tripadvisorUrl } = req.query;
  if (!hotel) return res.status(400).json({ error: "Missing hotel" });
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (checkin && !dateRe.test(checkin)) return res.status(400).json({ error: "Invalid checkin" });
  if (checkout && !dateRe.test(checkout)) return res.status(400).json({ error: "Invalid checkout" });

  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nights = (checkin && checkout)
    ? Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)))
    : 1;
  const cur = normalizeCurrency(currency);
  const hotelWords = hotel.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const bk = await scrapeBooking({ hotel, city, checkin, checkout, roomType: null, mealPlan: null, bookingUrl: null, nights, hotelWords, norm, currency: cur })
    .catch(e => ({ source: "Booking.com", lowest: null, error: String(e) }));
  // const ex = await scrapeExpedia({ hotel, city, checkin, checkout, currency: cur, nights })
  //   .catch(e => ({ source: "Expedia", lowest: null, error: String(e) }));
  // const ht = await scrapeHotels({ hotel, city, checkin, checkout, currency: cur, nights })
  //   .catch(e => ({ source: "Hotels.com", lowest: null, error: String(e) }));
  // const hrs = await scrapeHRS({ hotel, city, checkin, checkout, currency: cur, nights })
  //   .catch(e => ({ source: "HRS", lowest: null, error: String(e) }));
  // const tr = await scrapeTrip({ hotel, city, checkin, checkout, currency: cur, nights })
  //   .catch(e => ({ source: "Trip.com", lowest: null, error: String(e) }));

  const ta = await scrapeTripadvisor({ hotel, city, checkin, checkout, currency: cur, nights, tripadvisorUrl })
    .catch(e => ({ source: "Tripadvisor", lowest: null, error: String(e) }));

  res.json({ hotel, city, checkin, checkout, currency: cur, nights, results: [bk, ta] });
});


// ── Booking.com scraper ──────────────────────────────────────────────────────
async function scrapeBooking({ hotel, city, checkin, checkout, roomType, mealPlan, bookingUrl, nights, hotelWords, norm, currency }) {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { page, context } = await newPage();
    try {
      if (attempt === 2) {
        await humanPause(page, 1200, 2200);
      }
    let hotelPageUrl = null;

    // ── Improvement 3: Use stored URL if provided (skip search entirely) ────
    if (bookingUrl) {
      hotelPageUrl = buildBookingHotelUrl(bookingUrl, { checkin, checkout, currency });
    } else {
      // Search for hotel URL
      const q = encodeURIComponent(`${hotel} ${city || ""}`);
      const ciParts = (checkin || "").split("-");
      const coParts = (checkout || "").split("-");
      let searchUrl = `https://www.booking.com/search.html?ss=${q}&lang=de&sb=1&selected_currency=${currency}`;
      if (ciParts.length === 3) searchUrl += `&checkin_year=${ciParts[0]}&checkin_month=${parseInt(ciParts[1])}&checkin_monthday=${parseInt(ciParts[2])}`;
      if (coParts.length === 3) searchUrl += `&checkout_year=${coParts[0]}&checkout_month=${parseInt(coParts[1])}&checkout_monthday=${parseInt(coParts[2])}`;
      searchUrl += `&group_adults=2&no_rooms=1&group_children=0`;

      await guardedGoto(page, searchUrl);
      try { await page.waitForSelector("[data-testid='property-card'], .sr_item, [data-hotelid]", { timeout: 8000 }); } catch {}
      await humanPause(page, 1500, 2600);

      const candidates = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-testid='property-card'], .sr_property_block, .sr_item"))
          .map((card) => {
            const link =
              card.querySelector("a[data-testid='title-link'], a[href*='/hotel/'], a");
            const titleNode =
              card.querySelector("[data-testid='title'], div[data-testid='title-link'], .fcab3ed991, h3, h4");
            return {
              href: link?.href || "",
              title: (titleNode?.textContent || link?.textContent || "").trim(),
            };
          })
          .filter((entry) => entry.href.includes("booking.com/hotel/"))
      ).catch(() => []);

      const hrefs = candidates.map((entry) => entry.href);

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

      const cityWords = String(city || "")
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2);

      let foundUrl = null;
      const scoredCandidates = candidates
        .map((candidate) => ({
          ...candidate,
          ...scoreBookingCandidate(candidate, hotelWords, cityWords, expectedCc),
        }))
        .sort((a, b) => b.score - a.score);

      const bestCandidate = scoredCandidates[0] ?? null;
      const strongEnough =
        bestCandidate &&
        bestCandidate.score >= Math.max(10, hotelWords.length * 6) &&
        (bestCandidate.hotelMatches >= Math.max(1, Math.min(2, hotelWords.length)) || bestCandidate.exactTitleHit);

      if (strongEnough) {
        foundUrl = bestCandidate.href.split("?")[0];
      }

      if (!foundUrl) {
        for (const href of hrefs) {
          if (href.includes("booking.com/hotel/") && isRightCountry(href)) {
            const h = norm(href);
            if (hotelWords.length > 1 && hotelWords.every(w => h.includes(norm(w)))) {
              foundUrl = href.split("?")[0]; break;
            }
          }
        }
      }
      if (!foundUrl) {
        for (const href of hrefs) {
          if (href.includes("booking.com/hotel/") && isRightCountry(href)) {
            const h = norm(href);
            const matchedWords = hotelWords.filter((w) => h.includes(norm(w)));
            if (matchedWords.length >= Math.max(1, Math.min(2, hotelWords.length))) {
              foundUrl = href.split("?")[0]; break;
            }
          }
        }
      }

      if (!foundUrl) {
        await context.close();
        return { source: "Booking.com", error: "Hotel not found", lowest: null };
      }
      hotelPageUrl = buildBookingHotelUrl(foundUrl, { checkin, checkout, currency });
    }

    await guardedGoto(page, hotelPageUrl);
    // Wait for room table to render
    try { await page.waitForSelector(".hprt-table, [data-block='property_room_type_row'], .js-rt-block-row", { timeout: 8000 }); } catch {}
    await humanPause(page, 1400, 2400);

    // Use nights*100 as minimum to filter out per-night prices shown alongside totals
    const minTotal = nights * 100;
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
        const domPrices = await page.evaluate(({ roomWords, mealWords, minTotal, currency }) => {
        const currencyConfig = {
          EUR: { symbols: ["€"], codes: ["EUR"] },
          USD: { symbols: ["US$", "$"], codes: ["USD", "US$"] },
          GBP: { symbols: ["£"], codes: ["GBP"] },
          CAD: { symbols: ["C$", "CA$"], codes: ["CAD", "C$"] },
          CHF: { symbols: ["CHF"], codes: ["CHF"] },
        };
        const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const parsePrice = txt => {
          const cfg = currencyConfig[currency] || currencyConfig.EUR;
          const markers = [...cfg.symbols, ...cfg.codes];
          const patterns = markers.flatMap((marker) => {
            const escaped = escapeRegExp(marker);
            return [
              new RegExp(`(\\d{1,3}(?:[.,]\\d{3})+|\\d{2,5})(?:[.,]\\d{1,2})?\\s*${escaped}`, "g"),
              new RegExp(`${escaped}\\s*(\\d{1,3}(?:[.,]\\d{3})+|\\d{2,5})(?:[.,]\\d{1,2})?`, "g"),
            ];
          });
          const values = [];
          for (const pattern of patterns) {
            for (const match of [...txt.matchAll(pattern)]) {
              const raw = parseInt(match[1].replace(/[.,](\d{3})$/, "$1").replace(/[.,]/g, ""));
              if (raw >= minTotal && raw <= 99999) values.push(raw);
            }
          }
          return values;
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
          const rowPrices = parsePrice(rowText);
          for (const raw of rowPrices) {
            results.push(raw);
            debug.push("price:" + raw);
          }
        }
        return { results, debug };
      }, { roomWords, mealWords, minTotal, currency }).catch(() => []);

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
            const prices = extractCurrencyPrices(lines.slice(i, i + 30).join(" "), currency).filter(p => p >= minTotal);
            candidatePrices.push(...prices);
          }
        }
        if (candidatePrices.length > 0) bookingPrice = Math.min(...candidatePrices);
      }
    }

    if (!bookingPrice) {
      const pageText = await page.innerText("body").catch(() => "");
      const allPrices = extractCurrencyPrices(pageText, currency).filter(p => p >= minTotal);
      bookingPrice = allPrices[0] || null;
    }

      await context.close();
      return { source: "Booking.com", lowest: bookingPrice, url: hotelPageUrl };
    } catch (e) {
      lastError = String(e);
      await context.close().catch(() => {});
      if (!/bot protection/i.test(lastError) || attempt === 2) {
        return { source: "Booking.com", error: lastError, lowest: null };
      }
    }
  }
  return { source: "Booking.com", error: lastError || "Unknown scraper error", lowest: null };
}

async function scrapeExpedia({ hotel, city, checkin, checkout, currency, nights }) {
  let context = null;
  try {
    const ctx = await newPage();
    const page = ctx.page;
    context = ctx.context;
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(20000);
    const pageUrl = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(`${hotel} ${city || ""}`.trim())}&startDate=${checkin}&endDate=${checkout}&adults=2&rooms=1&selected_currency=${currency}`;
    await guardedGoto(page, pageUrl);
    try { await page.waitForSelector(".uitk-price-summary, [data-stid='price-summary'], .price-summary", { timeout: 8000 }); } catch {}
    await humanPause(page, 900, 1800);
    const pageText = await page.innerText("body").catch(() => "");
    const prices = extractCurrencyPrices(pageText, currency).filter((p) => p >= nights * 150 && p <= 99999);
    const minPrice = prices.length ? Math.min(...prices) : null;
    return { source: "Expedia", lowest: minPrice, url: pageUrl, error: null };
  } catch (e) {
    return { source: "Expedia", lowest: null, error: String(e) };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

async function scrapeHotels({ hotel, city, checkin, checkout, currency, nights }) {
  let context = null;
  try {
    const ctx = await newPage();
    const page = ctx.page;
    context = ctx.context;
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(20000);
    const pageUrl = `https://www.hotels.com/Hotel-Search?destination=${encodeURIComponent(`${hotel} ${city || ""}`.trim())}&startDate=${checkin}&endDate=${checkout}&adults=2&rooms=1`;
    await guardedGoto(page, pageUrl);
    try { await page.waitForSelector(".uitk-price-summary, [data-stid='price-summary'], .price-summary", { timeout: 8000 }); } catch {}
    await humanPause(page, 900, 1800);
    const pageText = await page.innerText("body").catch(() => "");
    const prices = extractCurrencyPrices(pageText, currency).filter((p) => p >= nights * 150 && p <= 99999);
    const minPrice = prices.length ? Math.min(...prices) : null;
    return { source: "Hotels.com", lowest: minPrice, url: pageUrl, error: null };
  } catch (e) {
    return { source: "Hotels.com", lowest: null, error: String(e) };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

async function scrapeHRS({ hotel, city, checkin, checkout, currency, nights }) {
  let context = null;
  try {
    const ctx = await newPage();
    const page = ctx.page;
    context = ctx.context;
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(20000);
    const pageUrl = `https://www.hrs.com/web3/search/hotel?destination=${encodeURIComponent(`${hotel} ${city || ""}`.trim())}&arrivalDate=${checkin}&departureDate=${checkout}&roomQuantity=1&adults=2`;
    await guardedGoto(page, pageUrl);
    try { await page.waitForSelector(".rate-price, .price-value, [class*='price']", { timeout: 8000 }); } catch {}
    await humanPause(page, 900, 1800);
    const pageText = await page.innerText("body").catch(() => "");
    const prices = extractCurrencyPrices(pageText, currency).filter((p) => p >= nights * 150 && p <= 99999);
    const minPrice = prices.length ? Math.min(...prices) : null;
    return { source: "HRS", lowest: minPrice, url: pageUrl, error: null };
  } catch (e) {
    return { source: "HRS", lowest: null, error: String(e) };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

async function scrapeTrip({ hotel, city, checkin, checkout, currency, nights }) {
  let context = null;
  try {
    const ctx = await newPage();
    const page = ctx.page;
    context = ctx.context;
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(20000);
    const pageUrl = `https://www.trip.com/hotels/list?city=${encodeURIComponent(city || "")}&hotelName=${encodeURIComponent(hotel)}&checkin=${checkin}&checkout=${checkout}&curr=${currency}`;
    await guardedGoto(page, pageUrl);
    try { await page.waitForSelector(".price-box, [class*='price'], .product-price", { timeout: 8000 }); } catch {}
    await humanPause(page, 900, 1800);
    const pageText = await page.innerText("body").catch(() => "");
    const prices = extractCurrencyPrices(pageText, currency).filter((p) => p >= nights * 150 && p <= 99999);
    const minPrice = prices.length ? Math.min(...prices) : null;
    return { source: "Trip.com", lowest: minPrice, url: pageUrl, error: null };
  } catch (e) {
    return { source: "Trip.com", lowest: null, error: String(e) };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

async function scrapeTripadvisor({ hotel, city, checkin, checkout, currency, nights, tripadvisorUrl }) {
  let context = null;
  try {
    const ctx = await newPage();
    const page = ctx.page;
    context = ctx.context;
    const userAgent = ctx.userAgent;
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(20000);
    const networkHits = [];
    page.on("response", (response) => {
      const url = response.url();
      if (/tripadvisor|graphql|api|price|offer|hotel/i.test(url)) {
        networkHits.push({
          url,
          status: response.status(),
        });
      }
    });

    let hotelUrl = String(tripadvisorUrl || "").trim();
    let debugUrl = hotelUrl || null;

    if (!hotelUrl) {
      const hotelTerms = tokenizeTripadvisorQuery(hotel);
      const cityTerms = tokenizeTripadvisorQuery(city || "");
      const queries = [
        `${hotel} ${city || ""}`.trim(),
        hotel.trim(),
        `${hotel} ${city || ""} hotel`.trim(),
      ].filter(Boolean);

      let foundUrl = null;
      let finalSearchUrl = null;
      for (const query of queries) {
        finalSearchUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(query)}`;
        await guardedGoto(page, finalSearchUrl);
        try { await page.waitForSelector("a[href], [data-automation], [class*='result']", { timeout: 8000 }); } catch {}
        await humanPause(page, 900, 1800);

        foundUrl = await page.evaluate(({ hotelTerms, cityTerms }) => {
          const stopWords = ["restaurant", "restaurants", "flight", "flights", "vacation rental", "things to do", "forum"];
          const norm = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const textOf = (node) => (node.textContent || "").trim();
          const candidates = Array.from(document.querySelectorAll("a[href]"))
            .map((a) => ({
              href: a.getAttribute("href") || "",
              text: textOf(a),
              aria: a.getAttribute("aria-label") || "",
              title: a.getAttribute("title") || "",
            }))
            .filter((c) => c.href);

          let best = null;
          let bestScore = -1;

          for (const candidate of candidates) {
            const raw = `${candidate.text} ${candidate.aria} ${candidate.title} ${candidate.href}`.toLowerCase();
            if (!candidate.href.includes("Hotel_Review")) continue;
            if (stopWords.some((word) => raw.includes(word))) continue;

            const combined = norm(raw);
            let score = 5;
            for (const term of hotelTerms) {
              if (combined.includes(term)) score += 4;
            }
            for (const term of cityTerms) {
              if (combined.includes(term)) score += 2;
            }
            if (candidate.href.startsWith("/Hotel_Review-")) score += 3;
            if (candidate.text && hotelTerms.some((term) => norm(candidate.text).includes(term))) score += 2;

            if (score > bestScore) {
              best = candidate.href;
              bestScore = score;
            }
          }

          return bestScore >= 9 ? best : null;
        }, { hotelTerms, cityTerms }).catch(() => null);

        if (foundUrl) {
          hotelUrl = new URL(foundUrl, "https://www.tripadvisor.com").toString();
          debugUrl = finalSearchUrl;
          break;
        }
      }
    }

    if (!hotelUrl) {
      return { source: "Tripadvisor", lowest: null, url: debugUrl, error: "Hotel page not found" };
    }

    await guardedGoto(page, hotelUrl);
    try { await page.waitForSelector("button, a, [class*='price'], [data-automation]", { timeout: 8000 }); } catch {}
    await humanPause(page, 1200, 2200);

    const hasDataDome = networkHits.some((entry) => /geo\.captcha-delivery\.com\/captcha/i.test(entry.url))
      || networkHits.some((entry) => /tripadvisor/i.test(entry.url) && entry.status === 403);
    if (hasDataDome) {
      const solve = await trySolveDataDome({ context, page, pageUrl: hotelUrl, userAgent, networkHits });
      if (solve.ok) {
        await guardedGoto(page, hotelUrl);
        try { await page.waitForSelector("button, a, [class*='price'], [data-automation]", { timeout: 8000 }); } catch {}
        await humanPause(page, 1200, 2200);
      } else {
        return {
          source: "Tripadvisor",
          lowest: null,
          url: hotelUrl,
          error: `DataDome blocked: ${solve.reason}`,
          debug: {
            captchaUrl: solve.captchaUrl || null,
            networkHits: networkHits.slice(0, 25),
          },
        };
      }
    }

    const pageTitle = await page.title().catch(() => "");
    const pageText = await page.innerText("body").catch(() => "");
    const prices = extractCurrencyPrices(pageText, currency).filter((p) => p >= nights * 150 && p <= 99999);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const providerMentions = ["booking.com", "expedia", "trip.com", "hotels.com", "stayforlong", "vio", "zenhotels", "fairmont"]
      .filter((name) => pageText.toLowerCase().includes(name));
    const priceLines = pageText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /(\$|€|USD|EUR|GBP|CAD)/i.test(line))
      .slice(0, 15);
    const offerSnippets = await page.evaluate(() => {
      const textOf = (node) => (node.textContent || "").replace(/\s+/g, " ").trim();
      return Array.from(document.querySelectorAll("button, a, div, span"))
        .map((node) => ({
          text: textOf(node),
          cls: node.className || "",
          href: node.getAttribute && node.getAttribute("href"),
          automation: node.getAttribute && node.getAttribute("data-automation"),
        }))
        .filter((entry) => entry.text)
        .filter((entry) => /angebot|offer|booking\.com|expedia|trip\.com|hotels\.com|stayforlong|vio|zenhotels|verfugbarkeit|availability|price|preis/i.test(`${entry.text} ${entry.cls} ${entry.automation || ""}`))
        .slice(0, 25);
    }).catch(() => []);
    const scriptSnippets = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[type='application/ld+json'], script[type='application/json'], script"))
        .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .filter((text) => /price|offer|booking\.com|expedia|trip\.com|hotels\.com|stayforlong|vio|zenhotels/i.test(text))
        .slice(0, 5)
        .map((text) => text.slice(0, 700))
    ).catch(() => []);

    return {
      source: "Tripadvisor",
      lowest: minPrice,
      url: hotelUrl,
      error: null,
      debug: {
        title: pageTitle,
        providerMentions,
        priceLines,
        offerSnippets,
        scriptSnippets,
        networkHits: networkHits.slice(0, 25),
      },
    };
  } catch (e) {
    return { source: "Tripadvisor", lowest: null, error: String(e) };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

function tokenizeTripadvisorQuery(value) {
  return (value || "")
    .toLowerCase()
    .split(/[\s,/-]+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ""))
    .filter((part) => part.length > 2)
    .filter((part) => !["hotel", "the", "and", "city"].includes(part));
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
  return extractCurrencyPrices(text, "EUR");
}

function extractCurrencyPrices(text, currency) {
  const cfg = CURRENCY_CONFIG[normalizeCurrency(currency)] || CURRENCY_CONFIG.EUR;
  const prices = [];
  const markers = [...cfg.symbols, ...cfg.codes];
  const patterns = markers.flatMap((marker) => {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [
      new RegExp(`(\\d{1,3}(?:[.,]\\d{3})+|\\d{2,5})(?:[.,]\\d{1,2})?\\s*${escaped}`, "g"),
      new RegExp(`${escaped}\\s*(\\d{1,3}(?:[.,]\\d{3})+|\\d{2,5})(?:[.,]\\d{1,2})?`, "g"),
    ];
  });
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
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
