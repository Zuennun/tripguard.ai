export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, resolveToken, markTokenUsed } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(errorPage("Ungültiger Link", "Kein Token angegeben."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const resolved = await resolveToken(token, "confirm");
  if (!resolved) {
    return new NextResponse(errorPage("Link ungültig oder bereits verwendet", "Bitte prüfe deine E-Mail auf einen neuen Link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = getSupabaseAdmin();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, hotel_name, status")
    .eq("id", resolved.bookingId)
    .single();

  if (!booking) {
    return new NextResponse(errorPage("Buchung nicht gefunden", ""), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (booking.status !== "pending") {
    // Already confirmed — find manage token to redirect
    const { data: manageToken } = await supabase
      .from("booking_tokens")
      .select("token")
      .eq("booking_id", booking.id)
      .eq("purpose", "manage")
      .single();

    const manageUrl = manageToken ? `/manage/${manageToken.token}` : "/";
    return NextResponse.redirect(`https://savemyholiday.com${manageUrl}`);
  }

  // Activate booking
  await supabase.from("bookings").update({ status: "active" }).eq("id", booking.id);
  await markTokenUsed(resolved.tokenId);

  // Redirect to manage page
  const { data: manageToken } = await supabase
    .from("booking_tokens")
    .select("token")
    .eq("booking_id", booking.id)
    .eq("purpose", "manage")
    .single();

  const manageUrl = manageToken ? `https://savemyholiday.com/manage/${manageToken.token}` : "https://savemyholiday.com";

  return NextResponse.redirect(manageUrl);
}

function errorPage(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;
  min-height:100vh;margin:0;background:#f0f4f8;}
  .card{background:#fff;border-radius:16px;padding:40px;max-width:420px;text-align:center;
  box-shadow:0 4px 24px rgba(0,0,0,0.1);}
  h1{color:#0f2044;margin:0 0 12px;font-family:Arial,sans-serif;}
  p{color:#6b7280;line-height:1.6;font-family:Arial,sans-serif;}
  a{color:#f97316;font-weight:700;text-decoration:none;}</style></head>
  <body><div class="card">
    <div style="font-size:48px;margin-bottom:16px">⚠️</div>
    <h1>${title}</h1>
    <p>${body}</p>
    <p style="margin-top:20px"><a href="https://savemyholiday.com">← Zurück zur Startseite</a></p>
  </div></body></html>`;
}
