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

const S: Record<string, string> = {
  active: "#059669", paused: "#6b7280", expired: "#94a3b8",
  cancelled: "#ef4444", deleted: "#ef4444",
};

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

function monthLabel(date: string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
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
    { count: todayChecks },
    { count: todayFoundChecks },
    { count: todayAlerts },
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
    db.from("price_checks").select("*", { count: "exact", head: true }).gte("checked_at", todayIso),
    db.from("price_checks").select("*", { count: "exact", head: true }).gte("checked_at", todayIso).eq("found", true),
    db.from("alerts").select("*", { count: "exact", head: true }).gte("sent_at", todayIso),
  ]);

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
  const topOrigins = topCounts(analytics.map((b: any) => b.origin_country));
  const topDestinations = topCounts(analytics.map((b: any) => b.country));
  const topCities = topCounts(analytics.map((b: any) => b.city));
  const topMonths = topCounts(analytics.map((b: any) => monthLabel(b.checkin_date)));
  const maxOrigin = Math.max(1, ...topOrigins.map(([, count]) => count));
  const maxDestination = Math.max(1, ...topDestinations.map(([, count]) => count));
  const maxCity = Math.max(1, ...topCities.map(([, count]) => count));
  const maxMonth = Math.max(1, ...topMonths.map(([, count]) => count));
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

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "18px 20px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6 }}>Core metrics</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 14 }}>
              {[
                { label: "Active", val: activeCount, color: "#059669" },
                { label: "Checked Today", val: todayChecks ?? 0, color: "#0f2044" },
                { label: "Found Today", val: todayFoundChecks ?? 0, color: "#2563eb" },
                { label: "Cheaper Now", val: savingsCandidates.length, color: "#f97316" },
                { label: "Alerts Sent", val: alertsTotal ?? 0, color: "#dc2626" },
              ].map((item) => (
                <div key={item.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 14px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: item.color }}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "18px 20px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6 }}>Money</p>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ background: "#fff7ed", borderRadius: 12, padding: "14px 14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#c2410c", textTransform: "uppercase" }}>Potential savings</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#f97316" }}>{potentialSavings.toFixed(2)}</p>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>Affiliate 4% on all tracked bookings</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#16a34a" }}>€ {potentialAffiliate.toFixed(2)}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#65a30d" }}>Basis: € {totalTrackedBookingValueEur.toFixed(2)} Gesamtbuchungswert</p>
              </div>
            </div>
          </div>
        </div>

        {flags.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 18px", marginBottom: 20 }}>
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

        {/* Status breakdown */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 28, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>By status:</span>
          {Object.entries(byStatus).map(([status, count]) => (
            <span key={status} style={{ fontSize: 13, fontWeight: 700, color: S[status] ?? "#6b7280" }}>
              {status} ({count})
            </span>
          ))}
          {Object.keys(byStatus).length === 0 && <span style={{ fontSize: 13, color: "#94a3b8" }}>No bookings yet</span>}
        </div>

        <AdminBookingsTable
          bookings={bs.map((b: any) => ({
            ...b,
            hasToken: tokenedIds.has(b.id),
          }))}
        />

        <AdminRunChecksButton />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16, marginBottom: 20 }}>
          <AnalyticsCard
            title="Top Customer Countries"
            items={topOrigins}
            max={maxOrigin}
            empty="Noch keine Herkunftsdaten"
          />
          <AnalyticsCard
            title="Top Destination Countries"
            items={topDestinations}
            max={maxDestination}
            empty="Noch keine Ziel-Länder"
          />
          <AnalyticsCard
            title="Top Destination Cities"
            items={topCities}
            max={maxCity}
            empty="Noch keine Ziel-Städte"
          />
          <AnalyticsCard
            title="Arrival Months"
            items={topMonths}
            max={maxMonth}
            empty="Noch keine Reisedaten"
          />
        </div>

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

function AnalyticsCard({
  title,
  items,
  max,
  empty,
}: {
  title: string;
  items: Array<[string, number]>;
  max: number;
  empty: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 18px" }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6 }}>
        {title}
      </p>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{empty}</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map(([label, count]) => (
            <div key={label} style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f2044", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{count}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#eef2f7", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(8, (count / max) * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #f97316, #fb923c)",
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
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
