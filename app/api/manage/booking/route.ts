export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, resolveToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const resolved = await resolveToken(token, "manage");
  if (!resolved) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, hotel_name, city, country, checkin_date, checkout_date, price, currency, status, lowest_found_price, last_checked_at, created_at")
    .eq("id", resolved.bookingId)
    .single();

  if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  return NextResponse.json({ booking });
}
