export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/tokens";
import { convertAmount } from "@/lib/priceComparison";
import AdminRunChecksButton from "@/components/AdminRunChecksButton";
import AdminIssuesPanel from "@/components/AdminIssuesPanel";

type Pair = [string, number];

function topCounts(items: Array<string | null | undefined>, limit = 10): Pair[] {
  const counts = items.reduce((acc: Record<string, number>, item) => {
    const key = (item ?? "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function barMax(items: Pair[]) {
  return Math.max(1, ...items.map(([, count]) => count));
}

function monthKey(date: string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
}

function dayKey(date: string | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function buildDailySeries(items: Array<string | null | undefined>, days: number) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const map = new Map<string, number>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    map.set(date.toISOString().slice(0, 10), 0);
  }

  for (const item of items) {
    const key = dayKey(item);
    if (!key || !map.has(key)) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries()).map(([date, value]) => ({
    date,
    label: new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    value,
  }));
}

function buildMatrix(rows: any[]) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const from = (row.origin_country ?? "Unknown").trim() || "Unknown";
    const to = (row.country ?? "Unknown").trim() || "Unknown";
    const key = `${from}__${to}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([key, count]) => {
      const [from, to] = key.split("__");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function normalizeFailure(error: string | null | undefined) {
  const text = (error ?? "").trim();
  if (!text) return "";
  if (/No price found/i.test(text)) return "No price found";
  if (/Hotel not found/i.test(text)) return "Hotel not found";
  if (/timeout|aborted/i.test(text)) return "Timeout / aborted";
  if (/Unauthorized/i.test(text)) return "Unauthorized";
  if (/Scraper returned/i.test(text)) return "Scraper response error";
  return text.length > 40 ? `${text.slice(0, 40)}...` : text;
}

export default async function AdminAnalyticsPage() {
  const cookieStore = cookies();
  if (cookieStore.get("admin_session")?.value !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const db = getSupabaseAdmin();
  const [
    { data: bookings },
    { data: priceChecks },
    { data: alerts },
    { data: visits, error: visitsError },
  ] = await Promise.all([
    db.from("bookings")
      .select("id,hotel_name,origin_country,city,country,checkin_date,price,currency,status,lowest_found_price,created_at,booking_com_url")
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(1000),
    db.from("price_checks")
      .select("booking_id,checked_at,found,source,error,price")
      .order("checked_at", { ascending: false })
      .limit(1000),
    db.from("alerts")
      .select("sent_at")
      .order("sent_at", { ascending: false })
      .limit(1000),
    db.from("page_visits")
      .select("path,referrer_host,origin_country,device_type,created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const rows = bookings ?? [];
  const checks = priceChecks ?? [];
  const alertRows = alerts ?? [];
  const visitRows = visits ?? [];
  const visitsAvailable = !visitsError;

  const totalBookingValueEur = (await Promise.all(
    rows.map(async (row: any) => {
      if (row.price == null || !row.currency) return 0;
      return await convertAmount(row.price, row.currency, "EUR") ?? 0;
    })
  )).reduce((sum, value) => sum + value, 0);

  const bookingMap = new Map(rows.map((row: any) => [row.id, row]));
  const topOrigins = topCounts(rows.map((b: any) => b.origin_country));
  const topCountries = topCounts(rows.map((b: any) => b.country));
  const topCities = topCounts(rows.map((b: any) => b.city));
  const arrivals = topCounts(rows.map((b: any) => monthKey(b.checkin_date)));
  const topVisitCountries = topCounts(visitRows.map((row: any) => row.origin_country));
  const topReferrers = topCounts(visitRows.map((row: any) => row.referrer_host || "Direct"));
  const topVisitedPages = topCounts(visitRows.map((row: any) => row.path));
  const devices = topCounts(visitRows.map((row: any) => row.device_type));
  const checksBySource = topCounts(checks.map((pc: any) => pc.source || "Unknown"));
  const failureReasons = topCounts(checks.filter((pc: any) => !pc.found).map((pc: any) => normalizeFailure(pc.error)), 8);
  const topFailureHotels = topCounts(
    checks
      .filter((pc: any) => !pc.found)
      .map((pc: any) => bookingMap.get(pc.booking_id)?.hotel_name || bookingMap.get(pc.booking_id)?.city || "Unknown"),
    8
  );
  const foundRate = checks.length
    ? Math.round((checks.filter((pc: any) => pc.found).length / checks.length) * 100)
    : 0;

  const bookingsSeries = buildDailySeries(rows.map((row: any) => row.created_at), 14);
  const checksSeries = buildDailySeries(checks.map((row: any) => row.checked_at), 14);
  const alertsSeries = buildDailySeries(alertRows.map((row: any) => row.sent_at), 14);
  const visitsSeries = buildDailySeries(visitRows.map((row: any) => row.created_at), 14);
  const foundSeries = buildDailySeries(checks.filter((row: any) => row.found).map((row: any) => row.checked_at), 14);
  const failedSeries = buildDailySeries(checks.filter((row: any) => !row.found).map((row: any) => row.checked_at), 14);
  const routeMatrix = buildMatrix(rows);
  const problemBookings = rows
    .filter((row: any) => row.status === "active" && !row.lowest_found_price)
    .slice(0, 10);
  const recentFailures = checks
    .filter((check: any) => !check.found)
    .slice(0, 10)
    .map((check: any) => ({
      ...check,
      booking: bookingMap.get(check.booking_id) ?? null,
    }));
  const suspiciousPrices = rows
    .filter((row: any) => row.price != null && row.lowest_found_price != null)
    .map((row: any) => ({
      ...row,
      ratio: row.lowest_found_price / row.price,
    }))
    .filter((row: any) => row.ratio > 2.2 || row.ratio < 0.35)
    .sort((a: any, b: any) => Math.abs(1 - b.ratio) - Math.abs(1 - a.ratio))
    .slice(0, 10);

  return (
    <div style={{ background: "linear-gradient(180deg, #eef4fb 0%, #f7fafc 100%)", minHeight: "100vh", fontFamily: "Arial,sans-serif" }}>
      <div style={{ background: "#0f2044", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
            <span style={{ color: "#f97316" }}>Save</span>My<span style={{ color: "#f97316" }}>Holiday</span>
          </span>
          <span style={{ background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/admin" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 16px", textDecoration: "none", fontSize: 13 }}>
            Overview
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 24px" }}>
        <AdminRunChecksButton />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Tracked bookings" value={rows.length} tone="#0f2044" />
          <MetricCard label="Booking value total" value={`€ ${totalBookingValueEur.toFixed(2)}`} tone="#2563eb" />
          <MetricCard label="Affiliate at 4%" value={`€ ${(totalBookingValueEur * 0.04).toFixed(2)}`} tone="#16a34a" />
          <MetricCard label="Found rate" value={`${foundRate}%`} tone="#f97316" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Visits tracked" value={visitsAvailable ? visitRows.length : "—"} tone="#1d4ed8" />
          <MetricCard label="Top traffic country" value={visitsAvailable ? (topVisitCountries[0]?.[0] ?? "—") : "—"} tone="#0f766e" />
          <MetricCard label="Top referrer" value={visitsAvailable ? (topReferrers[0]?.[0] ?? "Direct") : "—"} tone="#7c3aed" />
          <MetricCard label="Top page" value={visitsAvailable ? (topVisitedPages[0]?.[0] ?? "—") : "—"} tone="#be123c" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
          <LineCard
            title="Tracking Activity - Last 14 Days"
            subtitle="Bookings, price checks, found prices and alerts"
            series={[
              { label: "Bookings", color: "#2563eb", points: bookingsSeries },
              { label: "Checks", color: "#0f766e", points: checksSeries },
              { label: "Found", color: "#16a34a", points: foundSeries },
              { label: "Failed", color: "#ef4444", points: failedSeries },
              { label: "Alerts", color: "#dc2626", points: alertsSeries },
            ]}
          />
          <AnalyticsCard title="Checks by Provider" items={checksBySource} max={barMax(checksBySource)} empty="Noch keine Price Checks" accent="#0f766e" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
          <LineCard
            title="Audience Activity - Last 14 Days"
            subtitle="Visits alongside demand source signals"
            series={[
              { label: "Visits", color: "#2563eb", points: visitsSeries },
            ]}
          />
          <StackCard
            title="Audience snapshot"
            items={[
              { label: "Visits total", value: visitsAvailable ? visitRows.length : "Migration needed", tone: "#1d4ed8", isText: !visitsAvailable },
              { label: "Referrers tracked", value: visitsAvailable ? topReferrers.length : "—", tone: "#7c3aed" },
              { label: "Countries tracked", value: visitsAvailable ? topVisitCountries.length : "—", tone: "#0f766e" },
              { label: "Devices tracked", value: visitsAvailable ? devices.length : "—", tone: "#be123c" },
            ]}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16, marginBottom: 20 }}>
          <AnalyticsCard title="Top Customer Countries" items={topOrigins} max={barMax(topOrigins)} empty="Noch keine Herkunftsdaten" accent="#f97316" />
          <AnalyticsCard title="Top Destination Countries" items={topCountries} max={barMax(topCountries)} empty="Noch keine Ziel-Länder" accent="#2563eb" />
          <AnalyticsCard title="Top Destination Cities" items={topCities} max={barMax(topCities)} empty="Noch keine Ziel-Städte" accent="#16a34a" />
          <AnalyticsCard title="Arrival Months" items={arrivals} max={barMax(arrivals)} empty="Noch keine Anreise-Monate" accent="#7c3aed" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16, marginBottom: 20 }}>
          <AnalyticsCard
            title="Visit Countries"
            items={visitsAvailable ? topVisitCountries : []}
            max={barMax(visitsAvailable ? topVisitCountries : [])}
            empty={visitsAvailable ? "Noch keine Länder" : "Run the page_visits migration first"}
            accent="#1d4ed8"
          />
          <AnalyticsCard
            title="Top Referrers"
            items={visitsAvailable ? topReferrers : []}
            max={barMax(visitsAvailable ? topReferrers : [])}
            empty={visitsAvailable ? "Noch keine Referrer" : "Run the page_visits migration first"}
            accent="#7c3aed"
          />
          <AnalyticsCard
            title="Visited Pages"
            items={visitsAvailable ? topVisitedPages : []}
            max={barMax(visitsAvailable ? topVisitedPages : [])}
            empty={visitsAvailable ? "Noch keine Seitenaufrufe" : "Run the page_visits migration first"}
            accent="#be123c"
          />
          <AnalyticsCard
            title="Devices"
            items={visitsAvailable ? devices : []}
            max={barMax(visitsAvailable ? devices : [])}
            empty={visitsAvailable ? "Noch keine Devices" : "Run the page_visits migration first"}
            accent="#0f766e"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
          <HeatCard title="Top Travel Corridors" rows={routeMatrix} />
          <StackCard
            title="What Matters Right Now"
            items={[
              { label: "Price checks total", value: checks.length, tone: "#0f2044" },
              { label: "Found prices total", value: checks.filter((pc: any) => pc.found).length, tone: "#16a34a" },
              { label: "Alerts total", value: alertRows.length, tone: "#dc2626" },
              { label: "Open next focus", value: "Tracking quality", tone: "#f97316", isText: true },
            ]}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16, marginTop: 20 }}>
          <AnalyticsCard title="Top Failure Reasons" items={failureReasons} max={barMax(failureReasons)} empty="Noch keine Fehler" accent="#ef4444" />
          <AnalyticsCard title="Top Failure Hotels" items={topFailureHotels} max={barMax(topFailureHotels)} empty="Noch keine wiederkehrenden Problemhotels" accent="#b91c1c" />
        </div>

        <AdminIssuesPanel
          failureReasons={failureReasons}
          problemBookings={problemBookings.map((row: any) => ({
            bookingId: row.id,
            hotel: row.hotel_name || (row.city ? `${row.city} · ${row.country}` : row.country || "—"),
            value: row.checkin_date ? `Check-in ${new Date(row.checkin_date).toLocaleDateString("de-DE")}` : "Kein Check-in",
            meta: row.status,
            bookingUrl: row.booking_com_url ?? null,
          }))}
          recentFailures={recentFailures.map((row: any) => ({
            bookingId: row.booking?.id ?? row.booking_id,
            hotel: row.booking?.hotel_name || (row.booking?.city ? `${row.booking.city} · ${row.booking.country}` : row.booking?.country || "—"),
            name: row.booking?.id ? `${row.booking?.hotel_name ?? row.booking?.city ?? "Unknown"} / ${row.booking?.country ?? "—"}` : "Unknown booking",
            detail: normalizeFailure(row.error) || "Unknown error",
            extra: row.checked_at ? new Date(row.checked_at).toLocaleString("de-DE") : "—",
            bookingUrl: row.booking?.booking_com_url ?? null,
          }))}
          suspiciousPrices={suspiciousPrices.map((row: any) => ({
            hotel: row.city ? `${row.city} · ${row.country}` : row.country || "—",
            name: `${row.lowest_found_price} ${row.currency} vs ${row.price} ${row.currency}`,
            detail: `Ratio ${(row.ratio * 100).toFixed(0)}%`,
            extra: row.checkin_date ? new Date(row.checkin_date).toLocaleDateString("de-DE") : "—",
            bookingUrl: row.booking_com_url ?? null,
          }))}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "20px 22px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: tone }}>{value}</p>
    </div>
  );
}

function AnalyticsCard({
  title,
  items,
  max,
  empty,
  accent,
}: {
  title: string;
  items: Pair[];
  max: number;
  empty: string;
  accent: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
      <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>
        {title}
      </p>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{empty}</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map(([label, count]) => (
            <div key={label} style={{ display: "grid", gap: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f2044", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{count}</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "#eef2f7", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(8, (count / max) * 100)}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
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

function LineCard({
  title,
  subtitle,
  series,
}: {
  title: string;
  subtitle: string;
  series: Array<{ label: string; color: string; points: Array<{ label: string; value: number }> }>;
}) {
  const labels = series[0]?.points.map((point) => point.label) ?? [];
  const max = Math.max(1, ...series.flatMap((item) => item.points.map((point) => point.value)));
  const width = 760;
  const height = 260;
  const padding = 28;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
      <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>
        {title}
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>{subtitle}</p>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {[0, 1, 2, 3].map((step) => {
          const y = padding + (innerHeight / 3) * step;
          return <line key={step} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5edf6" strokeWidth="1" />;
        })}
        {series.map((item) => {
          const path = item.points.map((point, index) => {
            const x = padding + (index / Math.max(1, item.points.length - 1)) * innerWidth;
            const y = padding + innerHeight - (point.value / max) * innerHeight;
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ");
          return <path key={item.label} d={path} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
        })}
        {labels.map((label, index) => {
          const x = padding + (index / Math.max(1, labels.length - 1)) * innerWidth;
          return (
            <text key={label + index} x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {label}
            </text>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
        {series.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: item.color, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ from: string; to: string; count: number }>;
}) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
      <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>{title}</p>
      {rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Noch keine Muster sichtbar</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={`${row.from}-${row.to}`} style={{ display: "grid", gap: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f2044" }}>{row.from} {"->"} {row.to}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{row.count}</span>
              </div>
              <div style={{ height: 12, borderRadius: 999, background: "#eef2f7", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(8, (row.count / max) * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #0f766e, #14b8a6)",
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

function StackCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string | number; tone: string; isText?: boolean }>;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
      <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>{title}</p>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 14px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: item.isText ? 20 : 28, fontWeight: 900, color: item.tone }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
