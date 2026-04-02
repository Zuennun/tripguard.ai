type FxCache = {
  fetchedAt: number;
  rates: Record<string, number>;
};

const ECB_DAILY_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let fxCache: FxCache | null = null;

function normalizeCurrencyCode(currency: string | null | undefined) {
  return (currency ?? "").trim().toUpperCase();
}

export async function getEcbRates() {
  const now = Date.now();

  if (fxCache && now - fxCache.fetchedAt < CACHE_TTL_MS) {
    return fxCache.rates;
  }

  const res = await fetch(ECB_DAILY_URL, {
    next: { revalidate: 60 * 60 },
  });

  if (!res.ok) {
    throw new Error(`ECB FX fetch failed with ${res.status}`);
  }

  const xml = await res.text();
  const rates: Record<string, number> = { EUR: 1 };
  const matches = Array.from(xml.matchAll(/currency='([A-Z]{3})'\s+rate='([0-9.]+)'/g));

  for (const match of matches) {
    const code = match[1];
    const rate = Number(match[2]);
    if (code && Number.isFinite(rate) && rate > 0) {
      rates[code] = rate;
    }
  }

  fxCache = {
    fetchedAt: now,
    rates,
  };

  return rates;
}

export async function convertAmount(amount: number, from: string, to: string) {
  if (from === to) return amount;

  const rates = await getEcbRates();
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    return null;
  }

  const eurAmount = from === "EUR" ? amount : amount / fromRate;
  const converted = to === "EUR" ? eurAmount : eurAmount * toRate;

  return Number(converted.toFixed(2));
}

export async function comparePrices(params: {
  bookingPrice: number | null | undefined;
  bookingCurrency: string | null | undefined;
  foundPrice: number | null | undefined;
  foundCurrency: string | null | undefined;
}) {
  const bookingCurrency = normalizeCurrencyCode(params.bookingCurrency);
  const foundCurrency = normalizeCurrencyCode(params.foundCurrency);
  const bookingPrice = params.bookingPrice ?? null;
  const foundPrice = params.foundPrice ?? null;

  if (bookingPrice == null || foundPrice == null) {
    return {
      comparable: false,
      cheaper: false,
      savings: null as number | null,
      reason: "missing_price",
      comparisonCurrency: bookingCurrency || foundCurrency || null,
      normalizedFoundPrice: null as number | null,
      converted: false,
    };
  }

  if (!bookingCurrency || !foundCurrency) {
    return {
      comparable: false,
      cheaper: false,
      savings: null as number | null,
      reason: "missing_currency",
      comparisonCurrency: bookingCurrency || foundCurrency || null,
      normalizedFoundPrice: null as number | null,
      converted: false,
    };
  }

  if (bookingCurrency === foundCurrency) {
    const savings = Number((bookingPrice - foundPrice).toFixed(2));
    return {
      comparable: true,
      cheaper: foundPrice < bookingPrice,
      savings,
      reason: null as string | null,
      comparisonCurrency: bookingCurrency,
      normalizedFoundPrice: foundPrice,
      converted: false,
    };
  }

  try {
    const normalizedFoundPrice = await convertAmount(foundPrice, foundCurrency, bookingCurrency);

    if (normalizedFoundPrice == null) {
      return {
        comparable: false,
        cheaper: false,
        savings: null as number | null,
        reason: "unsupported_currency",
        comparisonCurrency: bookingCurrency,
        normalizedFoundPrice: null as number | null,
        converted: false,
      };
    }

    const savings = Number((bookingPrice - normalizedFoundPrice).toFixed(2));

    return {
      comparable: true,
      cheaper: normalizedFoundPrice < bookingPrice,
      savings,
      reason: null as string | null,
      comparisonCurrency: bookingCurrency,
      normalizedFoundPrice,
      converted: true,
    };
  } catch {
    return {
      comparable: false,
      cheaper: false,
      savings: null as number | null,
      reason: "fx_unavailable",
      comparisonCurrency: bookingCurrency,
      normalizedFoundPrice: null as number | null,
      converted: false,
    };
  }
}
