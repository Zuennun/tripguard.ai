export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/tokens";
import { convertAmount } from "@/lib/priceComparison";
import AdminBookingsTable from "@/components/AdminBookingsTable";
import AdminRunChecksButton from "@/components/AdminRunChecksButton";
import AdminNeedAttention from "@/components/AdminNeedAttention";

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}
function ago(d: string | null | undefined) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function topCounts(items: Array<string | null | undefined>, limit = 5) {
  const counts = items.reduce((acc: Record<string, number>, item) => {
    const key = (item ?? "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default async function AdminPage({
}: {
  searchParams?: { test?: string };
}) {
  const cookieStore = cookies();
  if (cookieStore.get("admin_session")?.value !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const db = getSupabaseAdmin();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [
    { count: bookingsTotal },
    { data: bookings },
    { data: analyticsBookings },
    { count: pcTotal },
    { data: latestPc },
    { count: alertsTotal },
    { data: latestAlerts },
    { count: clicksTotal },
    { data: latestClicks },
    { count: tokensTotal },
    { data: jobRuns },
    { data: unchecked },
    { data: allTokenBookingIds },
    { data: latestChecks },
    { count: todayChecks },
    { count: todayFoundChecks },
    { count: todayAlerts },
    { count: visitsTotal, error: visitsTotalError },
    { count: todayVisits, error: todayVisitsError },
    { data: recentVisits, error: recentVisitsError },
  ] = await Promise.all([
    db.from("bookings").select("*", { count: "exact", head: true }),
    db.from("bookings")
      .select("id,hotel_name,email,origin_country,city,country,checkin_date,checkout_date,status,created_at,last_checked_at,lowest_found_price,price,currency,booking_com_url")
      .order("created_at", { ascending: false }).limit(20),
    db.from("bookings")
      .select("id,hotel_name,origin_country,city,country,checkin_date,price,currency,status,lowest_found_price,booking_com_url")
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(500),
    db.from("price_checks").select("*", { count: "exact", head: true }),
    db.from("price_checks")
      .select("id,booking_id,checked_at,found,price,provider,error,duration_ms")
      .order("checked_at", { ascending: false }).limit(8),
    db.from("alerts").select("*", { count: "exact", head: true }),
    db.from("alerts")
      .select("id,booking_id,new_price,old_price,savings,currency,sent_at,provider")
      .order("sent_at", { ascending: false }).limit(5),
    db.from("affiliate_clicks").select("*", { count: "exact", head: true }),
    db.from("affiliate_clicks")
      .select("id,booking_id,destination,clicked_at,click_count,created_at,provider")
      .order("created_at", { ascending: false }).limit(5),
    db.from("booking_tokens").select("*", { count: "exact", head: true }).eq("purpose", "manage"),
    db.from("job_runs").select("*").order("started_at", { ascending: false }).limit(6),
    db.from("bookings").select("id,hotel_name,email,created_at").eq("status", "active").is("last_checked_at", null),
    db.from("booking_tokens").select("booking_id").eq("purpose", "manage"),
    db.from("price_checks")
      .select("booking_id, found, error, checked_at")
      .order("checked_at", { ascending: false })
      .limit(200),
    db.from("price_checks").select("*", { count: "exact", head: true }).gte("checked_at", todayIso),
    db.from("price_checks").select("*", { count: "exact", head: true }).gte("checked_at", todayIso).eq("found", true),
    db.from("alerts").select("*", { count: "exact", head: true }).gte("sent_at", todayIso),
    db.from("page_visits").select("*", { count: "exact", head: true }),
    db.from("page_visits").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
    db.from("page_visits")
      .select("path,referrer_host,origin_country,device_type,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const latestCheckByBooking = new Map<string, { found: boolean; error: string | null }>();
  for (const c of latestChecks ?? []) {
    if (!latestCheckByBooking.has(c.booking_id)) {
      latestCheckByBooking.set(c.booking_id, { found: c.found, error: c.error });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const bs = (bookings ?? []).filter((b: any) => {
    if (["deleted", "cancelled"].includes(b.status)) return false;
    if (!b.checkout_date) return true;
    return b.checkout_date >= today;
  });
  const tokenedIds = new Set((allTokenBookingIds ?? []).map((t: any) => t.booking_id));
  const noToken = bs.filter(b => ["active", "paused"].includes(b.status) && !tokenedIds.has(b.id));
  const clickedCount = (latestClicks ?? []).filter((c: any) => c.click_count > 0).length;

  const byStatus = bs.reduce((acc: Record<string, number>, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const activeCount = byStatus["active"] ?? 0;
  const uncheckedCount = (unchecked ?? []).length;
  const noTokenCount = noToken.length;
  const scraperConfigured = Boolean(process.env.SCRAPER_URL);
  const scraperTokenConfigured = Boolean(process.env.SCRAPER_TOKEN);
  const savingsCandidates = bs.filter((b: any) => b.price != null && b.lowest_found_price != null && b.lowest_found_price < b.price);
  const potentialSavings = savingsCandidates.reduce((sum: number, b: any) => sum + (b.price - b.lowest_found_price), 0);
  const analytics = analyticsBookings ?? [];
  const totalBookingValueEurValues = await Promise.all(
    analytics.map(async (b: any) => {
      if (b.price == null || !b.currency) return 0;
      return await convertAmount(b.price, b.currency, "EUR") ?? 0;
    })
  );
  const totalTrackedBookingValueEur = totalBookingValueEurValues.reduce((sum, value) => sum + value, 0);
  const potentialAffiliate = totalTrackedBookingValueEur * 0.04;
  const visitsAvailable = !visitsTotalError && !todayVisitsError && !recentVisitsError;
  const visitRows = recentVisits ?? [];
  const visitsLast7d = visitRows.filter((row: any) => {
    const createdAt = new Date(row.created_at).getTime();
    return createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const visitRowsToday = visitRows.filter((row: any) => new Date(row.created_at).getTime() >= todayStart.getTime());
  const topVisitCountries = topCounts(visitRows.map((row: any) => row.origin_country), 4);
  const topReferrers = topCounts(visitRows.map((row: any) => row.referrer_host || "Direct"), 4);
  const topVisitedPages = topCounts(visitRows.map((row: any) => row.path), 4);
  const devices = topCounts(visitRows.map((row: any) => row.device_type), 3);
  const topVisitCountriesToday = topCounts(visitRowsToday.map((row: any) => row.origin_country), 3);
  const topReferrersToday = topCounts(visitRowsToday.map((row: any) => row.referrer_host || "Direct"), 3);
  const bookingMap = new Map(analytics.map((b: any) => [b.id, b]));
  const noPriceRows = analytics
    .filter((b: any) => b.status === "active" && !b.lowest_found_price)
    .slice(0, 4)
    .map((b: any) => ({
      bookingId: b.id,
      hotel: b.hotel_name || (b.city ? `${b.city} · ${b.country}` : b.country || "—"),
      detail: b.checkin_date ? `Check-in ${fmtDate(b.checkin_date)}` : "Kein Check-in",
      meta: "Noch kein gueltiger Preis",
      bookingUrl: b.booking_com_url ?? null,
    }));
  const failureRows = (latestPc ?? [])
    .filter((pc: any) => !pc.found)
    .slice(0, 4)
    .map((pc: any) => {
      const booking = bookingMap.get(pc.booking_id);
      return {
        bookingId: pc.booking_id,
        hotel: booking?.hotel_name || (booking?.city ? `${booking.city} · ${booking.country}` : booking?.country || "Unknown"),
        detail: pc.error || "Unknown error",
        meta: pc.checked_at ? ago(pc.checked_at) : "—",
        bookingUrl: booking?.booking_com_url ?? null,
      };
    });
  const outlierRows = analytics
    .filter((b: any) => b.price != null && b.lowest_found_price != null)
    .map((b: any) => ({ ...b, ratio: b.lowest_found_price / b.price }))
    .filter((b: any) => b.ratio > 2.2 || b.ratio < 0.35)
    .slice(0, 4)
    .map((b: any) => ({
      bookingId: b.id,
      hotel: b.hotel_name || (b.city ? `${b.city} · ${b.country}` : b.country || "—"),
      detail: `${b.lowest_found_price} ${b.currency} vs ${b.price} ${b.currency}`,
      meta: `Ratio ${(b.ratio * 100).toFixed(0)}%`,
      bookingUrl: b.booking_com_url ?? null,
    }));

  // Red flags
  const flags: string[] = [];
  if (!scraperConfigured) flags.push("SCRAPER_URL is not configured in this environment");
  if (!scraperTokenConfigured) flags.push("SCRAPER_TOKEN is not configured in this environment");
  if (uncheckedCount > 0) flags.push(`${uncheckedCount} active booking(s) never checked`);
  if (noTokenCount > 0) flags.push(`${noTokenCount} active/paused booking(s) have no manage token`);
  if (activeCount > 0 && (pcTotal ?? 0) === 0) flags.push("Active bookings exist but zero price checks recorded");
  if ((alertsTotal ?? 0) === 0) flags.push("Zero alerts ever sent");
  if ((clicksTotal ?? 0) === 0) flags.push("Zero affiliate clicks recorded");
  if (!jobRuns?.length) flags.push("No cron job runs recorded");
  else if (jobRuns[0]?.status === "error") flags.push(`Last cron job failed: ${jobRuns[0]?.error ?? "unknown"}`);
  if (!visitsAvailable) flags.push("Visit analytics table missing - run the latest Supabase migration");

  const cell = "padding:8px 12px;border-bottom:1px solid #e2e8f0;font-family:Arial,sans-serif;font-size:12px;white-space:nowrap;color:#374151";
  const th = "padding:8px 12px;background:#f8fafc;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;text-align:left;border-bottom:2px solid #e2e8f0;white-space:nowrap";

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh", fontFamily: "Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#0f2044", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
            <span style={{ color: "#f97316" }}>Save</span>My<span style={{ color: "#f97316" }}>Holiday</span>
          </span>
          <span style={{ background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href="/admin/analytics"
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontFamily: "Arial,sans-serif", textDecoration: "none" }}
          >
            Analytics
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontFamily: "Arial,sans-serif" }}>
              Logout
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 20, alignItems: "stretch" }}>
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #dbe3ef", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>Founder cockpit</p>
                <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, color: "#0f2044" }}>What matters right now</h1>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#64748b", maxWidth: 720 }}>
                  Der Bereich ist jetzt auf Entscheidungen statt auf Datenmasse ausgerichtet: Gesundheit des Trackings, Umsatzpotenzial und Audience-Signal zuerst, Details erst darunter.
                </p>
              </div>
              <a
                href="/admin/analytics"
                style={{ alignSelf: "center", background: "#f8fafc", color: "#0f2044", border: "1px solid #dbe3ef", borderRadius: 12, padding: "10px 14px", textDecoration: "none", fontSize: 13, fontWeight: 700 }}
              >
                Open deep analytics
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 12 }}>
              {[
                { label: "Active bookings", val: activeCount, color: "#059669", note: `${bookingsTotal ?? 0} total` },
                { label: "Checks today", val: todayChecks ?? 0, color: "#0f2044", note: `${todayFoundChecks ?? 0} found` },
                { label: "Cheaper now", val: savingsCandidates.length, color: "#f97316", note: `${alertsTotal ?? 0} alerts total` },
                { label: "Unchecked", val: uncheckedCount, color: uncheckedCount > 0 ? "#dc2626" : "#0f2044", note: uncheckedCount > 0 ? "needs action" : "healthy" },
                { label: "Visits today", val: visitsAvailable ? todayVisits ?? 0 : "—", color: "#2563eb", note: visitsAvailable ? `${visitsLast7d} last 7d` : "apply migration" },
                { label: "Affiliate 4%", val: `€ ${potentialAffiliate.toFixed(0)}`, color: "#16a34a", note: `on € ${totalTrackedBookingValueEur.toFixed(0)}` },
              ].map((item) => (
                <div key={item.label} style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 14px", minHeight: 106 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4 }}>{item.label}</p>
                  <p style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, color: item.color }}>{item.val}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #dbe3ef", padding: "18px 20px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>Revenue snapshot</p>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ background: "#fff7ed", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#c2410c", fontWeight: 700, textTransform: "uppercase" }}>Potential savings</div>
                  <div style={{ fontSize: 28, color: "#f97316", fontWeight: 900, marginTop: 4 }}>€ {potentialSavings.toFixed(0)}</div>
                </div>
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "#15803d", fontWeight: 700, textTransform: "uppercase" }}>Tracked booking value</div>
                  <div style={{ fontSize: 28, color: "#16a34a", fontWeight: 900, marginTop: 4 }}>€ {totalTrackedBookingValueEur.toFixed(0)}</div>
                  <div style={{ fontSize: 11, color: "#65a30d", marginTop: 4 }}>Affiliate forecast is 4% of full booking value</div>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #dbe3ef", padding: "18px 20px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>Audience snapshot</p>
              {!visitsAvailable ? (
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Visit analytics wird aktiv, sobald `page_visits` in Supabase angelegt ist.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <MiniList title="Top countries today" items={topVisitCountriesToday} />
                  <MiniList title="Referrers today" items={topReferrersToday} />
                  <MiniList title="Top countries recent" items={topVisitCountries} />
                  <MiniList title="Top referrers recent" items={topReferrers} />
                  <MiniList title="Top pages" items={topVisitedPages} />
                  <MiniList title="Devices" items={devices} />
                </div>
              )}
            </div>
          </div>
        </div>

        {flags.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "14px 18px", marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 13, color: "#0f2044" }}>Need attention</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {flags.slice(0, 4).map((f, i) => (
                <span key={i} style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <AdminNeedAttention
          noPriceRows={noPriceRows}
          failureRows={failureRows}
          outlierRows={outlierRows}
          latestCheckByBooking={latestCheckByBooking}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Unchecked", val: uncheckedCount, warn: uncheckedCount > 0 },
            { label: "Price checks", val: pcTotal ?? 0, warn: false },
            { label: "Affiliate clicks", val: clicksTotal ?? 0, sub: `${clickedCount} clicked`, warn: false },
            { label: "Manage tokens", val: tokensTotal ?? 0, warn: (tokensTotal ?? 0) < activeCount },
            { label: "Scraper URL", val: scraperConfigured ? "Yes" : "No", warn: !scraperConfigured },
            { label: "Scraper token", val: scraperTokenConfigured ? "Yes" : "No", warn: !scraperTokenConfigured },
          ].map(({ label, val, sub, warn }: any) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${warn ? "#fecaca" : "#e2e8f0"}`, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: warn ? "#dc2626" : "#0f2044" }}>{val}</p>
              {sub ? <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{sub}</p> : null}
            </div>
          ))}
        </div>

        <AdminBookingsTable
          bookings={bs.map((b: any) => ({
            ...b,
            hasToken: tokenedIds.has(b.id),
          }))}
          latestCheckByBooking={latestCheckByBooking}
        />

        <AdminRunChecksButton />

        {/* Price Checks */}
        <Section title="Latest Price Checks" count={pcTotal ?? 0}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Booking ID", "Checked", "Found", "Price", "Provider", "Duration", "Error"].map(h => (
                    <th key={h} style={parseStyle(th) as any}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!latestPc || latestPc.length === 0) && (
                  <tr><td colSpan={7} style={{ ...parseStyle(cell), color: "#94a3b8", textAlign: "center" } as any}>No price checks yet</td></tr>
                )}
                {(latestPc ?? []).map((pc: any) => (
                  <tr key={pc.id}>
                    <td style={{ ...parseStyle(cell), color: "#94a3b8", fontSize: 11 } as any}>{pc.booking_id?.slice(0, 8)}…</td>
                    <td style={parseStyle(cell) as any}>{fmt(pc.checked_at)}</td>
                    <td style={{ ...parseStyle(cell), color: pc.found ? "#059669" : "#94a3b8", fontWeight: 700 } as any}>{pc.found ? "Yes" : "No"}</td>
                    <td style={parseStyle(cell) as any}>{pc.price ?? "—"}</td>
                    <td style={parseStyle(cell) as any}>{pc.provider ?? "—"}</td>
                    <td style={parseStyle(cell) as any}>{pc.duration_ms ? `${pc.duration_ms}ms` : "—"}</td>
                    <td style={{ ...parseStyle(cell), color: pc.error ? "#ef4444" : "#94a3b8", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" } as any}>
                      {pc.error ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Alerts */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#0f2044" }}>Alerts</span>
              <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", fontSize: 12, color: "#64748b" }}>{alertsTotal ?? 0} total</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Booking", "Old", "New", "Savings", "Sent"].map(h => <th key={h} style={parseStyle(th) as any}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(!latestAlerts || latestAlerts.length === 0) && (
                  <tr><td colSpan={5} style={{ ...parseStyle(cell), color: "#94a3b8", textAlign: "center" } as any}>No alerts yet</td></tr>
                )}
                {(latestAlerts ?? []).map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ ...parseStyle(cell), color: "#94a3b8", fontSize: 11 } as any}>{a.booking_id?.slice(0, 8)}…</td>
                    <td style={parseStyle(cell) as any}>{a.old_price}</td>
                    <td style={{ ...parseStyle(cell), color: "#059669", fontWeight: 700 } as any}>{a.new_price}</td>
                    <td style={{ ...parseStyle(cell), color: "#f97316", fontWeight: 700 } as any}>{a.savings}</td>
                    <td style={parseStyle(cell) as any}>{ago(a.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Affiliate Clicks */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#0f2044" }}>Affiliate Clicks</span>
              <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", fontSize: 12, color: "#64748b" }}>{clicksTotal ?? 0} total</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Booking", "Clicks", "Clicked At", "Created"].map(h => <th key={h} style={parseStyle(th) as any}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(!latestClicks || latestClicks.length === 0) && (
                  <tr><td colSpan={4} style={{ ...parseStyle(cell), color: "#94a3b8", textAlign: "center" } as any}>No clicks yet</td></tr>
                )}
                {(latestClicks ?? []).map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ ...parseStyle(cell), color: "#94a3b8", fontSize: 11 } as any}>{c.booking_id?.slice(0, 8)}…</td>
                    <td style={{ ...parseStyle(cell), color: c.click_count > 0 ? "#059669" : "#94a3b8", fontWeight: 700 } as any}>{c.click_count}</td>
                    <td style={parseStyle(cell) as any}>{c.clicked_at ? ago(c.clicked_at) : "—"}</td>
                    <td style={parseStyle(cell) as any}>{ago(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Job Runs */}
        <Section title="Cron Job Runs" count={null}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Job", "Started", "Status", "Checked", "Alerts", "Duration", "Error"].map(h => <th key={h} style={parseStyle(th) as any}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(!jobRuns || jobRuns.length === 0) && (
                  <tr><td colSpan={7} style={{ ...parseStyle(cell), color: "#94a3b8", textAlign: "center" } as any}>No job runs recorded</td></tr>
                )}
                {(jobRuns ?? []).map((j: any) => (
                  <tr key={j.id} style={{ background: j.status === "error" ? "#fef2f2" : "#fff" }}>
                    <td style={{ ...parseStyle(cell), fontWeight: 600 } as any}>{j.job}</td>
                    <td style={parseStyle(cell) as any}>{fmt(j.started_at)}</td>
                    <td style={{ ...parseStyle(cell), color: j.status === "success" ? "#059669" : j.status === "error" ? "#ef4444" : "#f59e0b", fontWeight: 700 } as any}>{j.status ?? "—"}</td>
                    <td style={parseStyle(cell) as any}>{j.bookings_checked ?? "—"}</td>
                    <td style={parseStyle(cell) as any}>{j.alerts_sent ?? "—"}</td>
                    <td style={parseStyle(cell) as any}>{j.duration_ms ? `${j.duration_ms}ms` : "—"}</td>
                    <td style={{ ...parseStyle(cell), color: "#ef4444", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" } as any}>{j.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <p style={{ textAlign: "center", color: "#cbd5e1", fontSize: 11, marginTop: 24 }}>
          SaveMyHoliday Admin · data live from Supabase · {new Date().toLocaleString("de-DE")}
        </p>
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number | null; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f2044" }}>{title}</span>
        {count !== null && (
          <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", fontSize: 12, color: "#64748b" }}>{count} total</span>
        )}
      </div>
      {children}
    </div>
  );
}

function MiniList({
  title,
  items,
}: {
  title: string;
  items: Array<[string, number]>;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: "#94a3b8" }}>No signal yet</div>
      ) : (
        items.map(([label, count]) => (
          <div key={`${title}-${label}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#0f2044", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{count}</span>
          </div>
        ))
      )}
    </div>
  );
}

// Helper: convert CSS string to React style object
function parseStyle(css: string): Record<string, string> {
  return Object.fromEntries(
    css.split(";").filter(Boolean).map(rule => {
      const [k, ...v] = rule.split(":");
      const key = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return [key, v.join(":").trim()];
    })
  );
}
