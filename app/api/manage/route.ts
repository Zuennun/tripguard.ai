export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, resolveToken } from "@/lib/tokens";

const ALLOWED_ACTIONS = ["pause", "resume", "cancel", "delete"] as const;
type Action = typeof ALLOWED_ACTIONS[number];

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();

    if (!token || !ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const resolved = await resolveToken(token, "manage");
    if (!resolved) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", resolved.bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (action === "pause") {
      if (booking.status !== "active") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });
      updates.status = "paused";
      updates.paused_at = new Date().toISOString();
    } else if (action === "resume") {
      if (booking.status !== "paused") return NextResponse.json({ error: "Booking is not paused" }, { status: 400 });
      updates.status = "active";
      updates.paused_at = null;
    } else if (action === "cancel") {
      if (["cancelled", "deleted"].includes(booking.status)) {
        return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
      }
      updates.status = "cancelled";
      updates.cancelled_at = new Date().toISOString();
    } else if (action === "delete") {
      await supabase.from("bookings").update({ status: "deleted" }).eq("id", booking.id);
      return NextResponse.json({ success: true, status: "deleted" });
    }

    await supabase.from("bookings").update(updates).eq("id", booking.id);
    return NextResponse.json({ success: true, status: updates.status });
  } catch (err: any) {
    console.error("Manage API error:", err?.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
