export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkCurrentPrice } from "@/lib/checkPrice";
import { comparePrices } from "@/lib/priceComparison";
import { insertPriceCheckCompat } from "@/lib/priceChecks";
import { getSupabaseAdmin } from "@/lib/tokens";

function isAdmin() {
  return cookies().get("admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, hotel_name, city, country, room_type, meal_plan, checkin_date, checkout_date, currency, rooms, adults, price, booking_com_url")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const startedAt = Date.now();
    const result = await checkCurrentPrice({
      hotelName: booking.hotel_name,
      city: booking.city,
      country: booking.country,
      roomType: booking.room_type,
      mealPlan: booking.meal_plan,
      checkinDate: booking.checkin_date,
      checkoutDate: booking.checkout_date,
      currency: booking.currency,
      rooms: booking.rooms,
      adults: booking.adults,
      bookingComUrl: booking.booking_com_url,
    });
    const durationMs = Date.now() - startedAt;

    const priceCheck = await insertPriceCheckCompat({
      supabase,
      bookingId: booking.id,
      bookingCurrency: booking.currency,
      bookingPrice: booking.price ?? null,
      bookingComUrl: booking.booking_com_url,
      result,
      durationMs,
    });

    const comparison = await comparePrices({
      bookingPrice: booking.price,
      bookingCurrency: booking.currency,
      foundPrice: result.price,
      foundCurrency: result.currency,
    });

    const updates: Record<string, any> = {
      last_checked_at: new Date().toISOString(),
    };
    if (result.found && comparison.comparable && comparison.normalizedFoundPrice != null) {
      updates.lowest_found_price = comparison.normalizedFoundPrice;
    }
    if (!booking.booking_com_url && result.bookingUrl) {
      updates.booking_com_url = result.bookingUrl;
    }

    await supabase.from("bookings").update(updates).eq("id", booking.id);

    return NextResponse.json({
      ok: true,
      diagnostics: {
        scraperConfigured: Boolean(process.env.SCRAPER_URL),
        scraperUrl: process.env.SCRAPER_URL ?? null,
        durationMs,
      },
      booking: {
        id: booking.id,
        hotelName: booking.hotel_name,
        city: booking.city,
        country: booking.country,
        checkinDate: booking.checkin_date,
        checkoutDate: booking.checkout_date,
        bookingComUrl: booking.booking_com_url,
      },
      result,
      comparison,
      persisted: {
        priceCheckId: priceCheck.id,
        checkedAt: priceCheck.checkedAt,
        priceCheckError: priceCheck.error,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected admin test error" },
      { status: 500 }
    );
  }
}
