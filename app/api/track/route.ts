export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { customerConfirmationEmail, founderNotificationEmail } from "@/lib/emails";
import { discoverHotelUrl } from "@/lib/scrapers/discover";

let resend: Resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Proper email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// Allowed currencies
const ALLOWED_CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD", "SEK", "NOK", "DKK", "AED"];

// Allowed meal plans
const ALLOWED_MEAL_PLANS = ["room_only", "breakfast", "half_board", "full_board", "all_inclusive", ""];

// Rate limiter: max 3 requests per IP per 10 minutes
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const max = 3;
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

const ALLOWED_ORIGINS = new Set([
  "https://trip-guard.ai",
  "https://www.trip-guard.ai",
  "https://savemyholiday.com",
  "https://www.savemyholiday.com",
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
]);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) return true;
  return ALLOWED_ORIGINS.has(origin);
}

export async function POST(req: NextRequest) {
  // CORS check
  const origin = req.headers.get("origin") || "";
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": "600" },
      }
    );
  }

  try {
    const body = await req.json();

    const {
      hotelName,
      city,
      country,
      roomType,
      rooms,
      adults,
      children,
      mealPlan,
      checkin,
      checkout,
      price,
      currency,
      email,
    } = body;

    // Required fields
    if (!email || !hotelName) {
      return NextResponse.json({ error: "Hotel name and email are required" }, { status: 400 });
    }

    // Email validation (proper regex)
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // String length limits
    if (hotelName.length < 2 || hotelName.length > 200) {
      return NextResponse.json({ error: "Hotel name must be 2–200 characters" }, { status: 400 });
    }
    if (city && city.length > 100) {
      return NextResponse.json({ error: "City name too long" }, { status: 400 });
    }
    if (country && country.length > 100) {
      return NextResponse.json({ error: "Country name too long" }, { status: 400 });
    }
    if (roomType && roomType.length > 100) {
      return NextResponse.json({ error: "Room type too long" }, { status: 400 });
    }

    // Numeric bounds
    const parsedRooms = Math.min(Math.max(parseInt(rooms) || 1, 1), 20);
    const parsedAdults = Math.min(Math.max(parseInt(adults) || 1, 0), 20);
    const parsedChildren = Math.min(Math.max(parseInt(children) || 0, 0), 20);
    const parsedPrice = price ? Math.round(parseFloat(price) * 100) / 100 : null;
    if (parsedPrice !== null && (parsedPrice < 0 || parsedPrice > 100000)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Whitelist currency
    const safeCurrency = ALLOWED_CURRENCIES.includes(currency) ? currency : "EUR";

    // Whitelist meal plan
    const safeMealPlan = ALLOWED_MEAL_PLANS.includes(mealPlan) ? mealPlan : null;

    // Discovery: Hotel-URL auf Booking.com finden (im Hintergrund, blockiert nicht)
    let bookingComUrl: string | null = null;
    if (checkin && checkout) {
      bookingComUrl = await discoverHotelUrl({
        hotelName: hotelName.trim(),
        city: city?.trim() || null,
        country: country?.trim() || null,
        checkinDate: checkin,
        checkoutDate: checkout,
        rooms: parsedRooms,
        adults: parsedAdults,
      }).catch(() => null);
    }

    const { error } = await getSupabase().from("bookings").insert([
      {
        hotel_name: hotelName.trim(),
        city: city?.trim() || null,
        country: country?.trim() || null,
        room_type: roomType?.trim() || null,
        rooms: parsedRooms,
        adults: parsedAdults,
        children: parsedChildren,
        meal_plan: safeMealPlan,
        checkin_date: checkin || null,
        checkout_date: checkout || null,
        price: parsedPrice,
        currency: safeCurrency,
        email: email.toLowerCase().trim(),
        status: "active",
        booking_com_url: bookingComUrl,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.code);
      return NextResponse.json({ error: "Could not save booking. Please try again." }, { status: 500 });
    }

    const from = process.env.RESEND_FROM!;
    const notifyEmail = process.env.NOTIFY_EMAIL!;
    const xLocale = req.headers.get("x-locale") ?? "";
    const acceptLang = req.headers.get("accept-language") ?? "";
    const isDE = xLocale === "de" || (!xLocale && acceptLang.toLowerCase().startsWith("de"));
    const locale = (isDE ? "de" : "en") as "de" | "en";

    const emailData = {
      hotelName, city, country, roomType, checkin, checkout,
      parsedPrice, safeCurrency, parsedRooms, parsedAdults, parsedChildren, email, locale,
    };

    const customerSubject = locale === "de"
      ? `✅ Wir überwachen deinen Hotelpreis — SaveMyHoliday`
      : `✅ We're watching your hotel price — SaveMyHoliday`;

    // User confirmation
    await getResend().emails.send({
      from,
      to: email.toLowerCase().trim(),
      subject: customerSubject,
      html: customerConfirmationEmail(emailData),
    });

    // Notify founder
    const r2 = await getResend().emails.send({
      from,
      to: notifyEmail,
      subject: `🆕 New booking: ${hotelName}`,
      html: founderNotificationEmail(emailData),
    });

    console.log("Resend notify email:", r2.error || "OK", r2.data?.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API error:", err?.message);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
