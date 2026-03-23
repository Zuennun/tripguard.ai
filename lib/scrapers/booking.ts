import * as cheerio from "cheerio";

export interface ScrapeResult {
  found: boolean;
  price: number | null;
  currency: string;
  bookingUrl: string;
}

// Rotiere User-Agents um Blocking zu reduzieren
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function scrapeBookingCom(params: {
  hotelName: string;
  city: string | null;
  checkinDate: string;
  checkoutDate: string;
  rooms: number;
  adults: number;
  currency: string;
}): Promise<ScrapeResult> {
  const { hotelName, city, checkinDate, checkoutDate, rooms, adults, currency } = params;

  const searchTerm = [hotelName, city].filter(Boolean).join(" ");
  const [ciYear, ciMonth, ciDay] = checkinDate.split("-");
  const [coYear, coMonth, coDay] = checkoutDate.split("-");

  const url =
    `https://www.booking.com/searchresults.html` +
    `?ss=${encodeURIComponent(searchTerm)}` +
    `&checkin_year=${ciYear}&checkin_month=${ciMonth}&checkin_monthday=${ciDay}` +
    `&checkout_year=${coYear}&checkout_month=${coMonth}&checkout_monthday=${coDay}` +
    `&no_rooms=${rooms}&group_adults=${adults}` +
    `&selected_currency=${currency}&lang=en-gb`;

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": randomUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return { found: false, price: null, currency, bookingUrl: url };
    html = await res.text();
  } catch {
    return { found: false, price: null, currency, bookingUrl: url };
  }

  const $ = cheerio.load(html);

  // Booking.com zeigt Preise in verschiedenen Strukturen — wir probieren alle
  const priceSelectors = [
    "[data-testid='price-and-discounted-price']",
    ".prco-valign-middle-helper",
    "[data-testid='recommended-units'] .bui-price-display__value",
    ".sr_price_type_total",
    ".bui-price-display__value",
    "[class*='price']",
  ];

  let rawPrice: string | null = null;

  for (const selector of priceSelectors) {
    const el = $(selector).first();
    if (el.length) {
      rawPrice = el.text().trim();
      break;
    }
  }

  if (!rawPrice) return { found: false, price: null, currency, bookingUrl: url };

  // Zahl extrahieren z.B. "€ 289" oder "EUR 289" → 289
  const match = rawPrice.match(/[\d.,]+/);
  if (!match) return { found: false, price: null, currency, bookingUrl: url };

  const price = parseFloat(match[0].replace(",", "."));
  if (isNaN(price) || price <= 0) return { found: false, price: null, currency, bookingUrl: url };

  return { found: true, price, currency, bookingUrl: url };
}
