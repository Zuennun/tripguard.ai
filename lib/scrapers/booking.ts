import * as cheerio from "cheerio";

export interface ScrapeResult {
  found: boolean;
  price: number | null;
  currency: string;
  bookingUrl: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Prüft den aktuellen Preis auf der gespeicherten Booking.com Property-URL.
 * Die URL wurde einmalig bei der Discovery gespeichert — z.B.:
 * https://www.booking.com/hotel/de/hotel-adlon-kempinski-berlin.html
 */
export async function scrapeBookingCom(params: {
  propertyUrl: string;
  checkinDate: string;
  checkoutDate: string;
  rooms: number;
  adults: number;
  currency: string;
}): Promise<ScrapeResult> {
  const { propertyUrl, checkinDate, checkoutDate, rooms, adults, currency } = params;

  const [ciYear, ciMonth, ciDay] = checkinDate.split("-");
  const [coYear, coMonth, coDay] = checkoutDate.split("-");

  const url =
    `${propertyUrl}` +
    `?checkin_year=${ciYear}&checkin_month=${ciMonth}&checkin_monthday=${ciDay}` +
    `&checkout_year=${coYear}&checkout_month=${coMonth}&checkout_monthday=${coDay}` +
    `&no_rooms=${rooms}&group_adults=${adults}` +
    `&selected_currency=${currency}&lang=en-gb`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": randomUA(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return { found: false, price: null, currency, bookingUrl: url };
    const html = await res.text();
    const $ = cheerio.load(html);

    const priceSelectors = [
      "[data-testid='price-and-discounted-price']",
      ".prco-valign-middle-helper",
      "[data-testid='recommended-units'] .bui-price-display__value",
      ".sr_price_type_total",
      ".bui-price-display__value",
    ];

    for (const selector of priceSelectors) {
      const text = $(selector).first().text().trim();
      if (!text) continue;
      const match = text.match(/[\d.,]+/);
      if (!match) continue;
      const price = parseFloat(match[0].replace(",", "."));
      if (!isNaN(price) && price > 0) {
        return { found: true, price, currency, bookingUrl: url };
      }
    }

    return { found: false, price: null, currency, bookingUrl: url };
  } catch {
    return { found: false, price: null, currency, bookingUrl: url };
  }
}
