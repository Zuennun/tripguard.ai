export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/tokens";
import { createAffiliateClickCompat } from "@/lib/affiliateClicks";
import { insertAlertCompat } from "@/lib/alerts";
import { priceAlertEmail } from "@/lib/emails";

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
      .select("id,hotel_name,email,city,country,checkin_date,checkout_date,price,currency,locale,lowest_found_price,booking_com_url")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.lowest_found_price == null || booking.price == null || booking.lowest_found_price >= booking.price) {
      return NextResponse.json({ error: "No cheaper comparable price available for this booking" }, { status: 400 });
    }

    const { data: latestCheck } = await supabase
      .from("price_checks")
      .select("price,currency,source,booking_url,checked_at")
      .eq("booking_id", booking.id)
      .eq("found", true)
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const destination = latestCheck?.booking_url || booking.booking_com_url;
    if (!destination) {
      return NextResponse.json({ error: "No destination URL available yet" }, { status: 400 });
    }

    const { data: manageTokenRow } = await supabase
      .from("booking_tokens")
      .select("token")
      .eq("booking_id", booking.id)
      .eq("purpose", "manage")
      .single();

    const manageUrl = manageTokenRow
      ? `https://savemyholiday.com/manage/${manageTokenRow.token}`
      : "https://savemyholiday.com";

    const savings = Number((booking.price - booking.lowest_found_price).toFixed(2));

    const alert = await insertAlertCompat({
      supabase,
      bookingId: booking.id,
      newPrice: booking.lowest_found_price,
      oldPrice: booking.price,
      savings,
      currency: booking.currency,
      provider: latestCheck?.source ?? "Booking.com",
      resultUrl: destination,
    });

    const affiliate = await createAffiliateClickCompat({
      supabase,
      bookingId: booking.id,
      alertId: alert.id ?? null,
      destination,
      provider: latestCheck?.source ?? "Booking.com",
    });

    const bookingUrl = `https://savemyholiday.com/go/${affiliate.token}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const locale = (booking.locale ?? "de") as "de" | "en";
    const subject = locale === "de"
      ? `💰 Günstigerer Preis für ${booking.hotel_name} — SaveMyHoliday`
      : `💰 Cheaper price found for ${booking.hotel_name} — SaveMyHoliday`;

    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: booking.email,
      subject,
      html: priceAlertEmail({
        hotelName: booking.hotel_name,
        city: booking.city,
        country: booking.country,
        checkin: booking.checkin_date,
        checkout: booking.checkout_date,
        originalPrice: booking.price,
        newPrice: booking.lowest_found_price,
        currency: booking.currency,
        source: latestCheck?.source ?? "Booking.com",
        bookingUrl,
        manageUrl,
        locale,
      }),
    });

    await supabase
      .from("bookings")
      .update({
        last_alert_sent_at: new Date().toISOString(),
        alert_count: 1,
      })
      .eq("id", booking.id);

    return NextResponse.json({
      ok: true,
      savings,
      bookingUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Manual alert failed" },
      { status: 500 }
    );
  }
}
