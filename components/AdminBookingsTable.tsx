"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingRow = {
  id: string;
  hotel_name: string;
  email: string;
  city: string | null;
  country: string | null;
  origin_country: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  status: string;
  created_at: string;
  last_checked_at: string | null;
  lowest_found_price: number | null;
  price: number | null;
  currency: string;
  hasToken: boolean;
  booking_com_url?: string | null;
};

type TestResult = {
  bookingId: string;
  found: boolean;
  price: number | null;
  currency: string | null;
  error: string | null;
  checkedAt: string;
  usedUrl?: string | null;
  comparable?: boolean;
  cheaper?: boolean;
  savings?: number | null;
  comparisonReason?: string | null;
  comparisonCurrency?: string | null;
  converted?: boolean;
};

type LatestCheckStatus = {
  found: boolean;
  error: string | null;
};

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

export default function AdminBookingsTable({
  bookings,
  latestCheckByBooking,
}: {
  bookings: BookingRow[];
  latestCheckByBooking: Map<string, LatestCheckStatus>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(bookings);
  const [selectedId, setSelectedId] = useState(bookings[0]?.id ?? "");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alertingId, setAlertingId] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, TestResult>>({});
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);
  const selectedUrl = selected ? (selected.booking_com_url || tests[selected.id]?.usedUrl || null) : null;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);

  async function runTest(bookingId: string) {
    setLoadingId(bookingId);
    try {
      const res = await fetch("/api/admin/test-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Price test failed");
      }

      const checkedAt = data.persisted?.checkedAt ?? new Date().toISOString();
      const price = data.result?.price ?? null;
      const found = Boolean(data.result?.found);
      const currency = data.result?.currency ?? null;
      const error = data.result?.error || data.persisted?.priceCheckError || null;
      const comparison = data.comparison ?? null;

      setTests((prev) => ({
        ...prev,
        [bookingId]: {
          bookingId,
          found,
          price,
          currency,
          error,
          checkedAt,
          usedUrl: data.result?.bookingUrl || data.booking?.bookingComUrl || null,
          comparable: comparison?.comparable ?? false,
          cheaper: comparison?.cheaper ?? false,
          savings: comparison?.savings ?? null,
          comparisonReason: comparison?.reason ?? null,
          comparisonCurrency: comparison?.comparisonCurrency ?? currency ?? null,
          converted: comparison?.converted ?? false,
        },
      }));

      setRows((prev) =>
        prev.map((row) =>
          row.id === bookingId
            ? {
                ...row,
                last_checked_at: checkedAt,
                lowest_found_price: comparison?.comparable && comparison?.normalizedFoundPrice != null
                  ? comparison.normalizedFoundPrice
                  : row.lowest_found_price,
                booking_com_url: data.result?.bookingUrl || data.booking?.bookingComUrl || row.booking_com_url,
              }
            : row
        )
      );
      router.refresh();
    } catch (err: any) {
      setTests((prev) => ({
        ...prev,
        [bookingId]: {
          bookingId,
          found: false,
          price: null,
          currency: null,
          error: err?.message ?? "Price test failed",
          checkedAt: new Date().toISOString(),
          usedUrl: null,
          comparable: false,
          cheaper: false,
          savings: null,
          comparisonReason: null,
          comparisonCurrency: null,
          converted: false,
        },
      }));
    } finally {
      setLoadingId(null);
    }
  }

  async function sendManualAlert(bookingId: string) {
    const row = rows.find((entry) => entry.id === bookingId);
    const defaultUrl = row?.booking_com_url || tests[bookingId]?.usedUrl || "";
    const affiliateUrl = prompt(
      "Optional: finalen Affiliate-Link einfügen. Leer lassen = aktuell gefundener Link wird genutzt.",
      defaultUrl || ""
    );
    if (affiliateUrl === null) return;

    setAlertingId(bookingId);
    try {
      const res = await fetch("/api/admin/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, affiliateUrl: affiliateUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Alert send failed");
      alert(`Alert versendet. Ersparnis: ${data.savings}\nZiel: ${data.destination}`);
      router.refresh();
    } catch (err: any) {
      alert(err?.message ?? "Alert send failed");
    } finally {
      setAlertingId(null);
    }
  }

  async function deleteBooking(bookingId: string) {
    const booking = rows.find((row) => row.id === bookingId);
    if (!booking) return;
    if (!confirm(`Buchung "${booking.hotel_name}" wirklich löschen?`)) return;

    setDeletingId(bookingId);
    try {
      const res = await fetch("/api/admin/bookings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      const nextRows = rows.filter((row) => row.id !== bookingId);
      setRows(nextRows);
      if (selectedId === bookingId) {
        setSelectedId(nextRows[0]?.id ?? "");
      }
    } catch (err: any) {
      alert(err?.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const cell = "8px 12px";
  const headerStyle: React.CSSProperties = {
    padding: cell,
    background: "#f8fafc",
    fontFamily: "Arial,sans-serif",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#94a3b8",
    textAlign: "left",
    borderBottom: "2px solid #e2e8f0",
    whiteSpace: "nowrap",
  };
  const bodyStyle: React.CSSProperties = {
    padding: cell,
    borderBottom: "1px solid #e2e8f0",
    fontFamily: "Arial,sans-serif",
    fontSize: 12,
    whiteSpace: "nowrap",
    color: "#374151",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f2044", display: "block" }}>Latest Bookings</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            Günstige Treffer werden erst von dir freigegeben. Beim Senden kannst du deinen finalen Affiliate-Link selbst einsetzen.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {selected ? `Ausgewählt: ${selected.hotel_name}` : "Keine Buchung ausgewählt"}
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {selectedUrl && (
              <a
                href={selectedUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#fff",
                  color: "#0f2044",
                  border: "1px solid #dbe3ef",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontWeight: 700,
                  fontFamily: "Arial,sans-serif",
                  textDecoration: "none",
                }}
              >
                Open URL
              </a>
            )}
            <button
              type="button"
              onClick={() => selectedId && runTest(selectedId)}
              disabled={!selectedId || loadingId !== null}
              style={{
                background: loadingId ? "#fdba74" : "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 700,
                fontFamily: "Arial,sans-serif",
                cursor: !selectedId || loadingId ? "not-allowed" : "pointer",
              }}
            >
              {loadingId === selectedId ? "Testing..." : "Test price"}
            </button>
            <button
              type="button"
              onClick={() => selectedId && sendManualAlert(selectedId)}
              disabled={!selectedId || alertingId !== null}
              style={{
                background: alertingId ? "#86efac" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 700,
                fontFamily: "Arial,sans-serif",
                cursor: !selectedId || alertingId ? "not-allowed" : "pointer",
              }}
            >
              {alertingId === selectedId ? "Sending..." : "Send alert"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["", "Hotel", "Email", "Customer Country", "City", "Check-in", "Check-out", "Booked", "Status", "Last Checked", "Lowest Found", "Last Check", "Last Test", "URL", "Alert", "Delete"].map((h) => (
                <th key={h} style={headerStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={16} style={{ ...bodyStyle, color: "#94a3b8", textAlign: "center" }}>
                  No bookings
                </td>
              </tr>
            )}
            {pagedRows.map((b) => {
              const test = tests[b.id];
              const lastCheck = latestCheckByBooking.get(b.id);
              const selectedRow = selectedId === b.id;
              const canAlert = b.lowest_found_price != null && b.price != null && b.lowest_found_price < b.price;
              const lastCheckLabel = !lastCheck
                ? "Never"
                : lastCheck.found
                  ? "✓ Found"
                  : lastCheck.error
                    ? (lastCheck.error.length > 40 ? `${lastCheck.error.slice(0, 40)}…` : lastCheck.error)
                    : "No price";
              const lastCheckColor = !lastCheck
                ? "#94a3b8"
                : lastCheck.found
                  ? "#16a34a"
                  : lastCheck.error
                    ? "#dc2626"
                    : "#f59e0b";
              return (
                <tr
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  style={{
                    background: selectedRow ? "#fff7ed" : !b.hasToken && ["active", "paused"].includes(b.status) ? "#fef2f2" : b.status === "active" && !b.last_checked_at ? "#fffbeb" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <td style={bodyStyle}>
                    <input
                      type="radio"
                      name="selected-booking"
                      checked={selectedRow}
                      onChange={() => setSelectedId(b.id)}
                    />
                  </td>
                  <td style={{ ...bodyStyle, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.booking_com_url ? (
                      <a
                        href={b.booking_com_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#0f2044", fontWeight: 700, textDecoration: "underline" }}
                      >
                        {b.hotel_name}
                      </a>
                    ) : (
                      <strong>{b.hotel_name}</strong>
                    )}
                  </td>
                  <td style={bodyStyle}>{b.email}</td>
                  <td style={bodyStyle}>{b.origin_country || "—"}</td>
                  <td style={bodyStyle}>{[b.city, b.country].filter(Boolean).join(", ") || "—"}</td>
                  <td style={bodyStyle}>{fmtDate(b.checkin_date)}</td>
                  <td style={bodyStyle}>{fmtDate(b.checkout_date)}</td>
                  <td style={bodyStyle}>{b.price ? `${b.price} ${b.currency}` : "—"}</td>
                  <td style={bodyStyle}>{b.status}</td>
                  <td style={{ ...bodyStyle, color: !b.last_checked_at ? "#ef4444" : "#374151" }}>{b.last_checked_at ? ago(b.last_checked_at) : "⚠ never"}</td>
                  <td style={{ ...bodyStyle, color: b.lowest_found_price ? "#059669" : "#94a3b8", fontWeight: 700 }}>
                    {b.lowest_found_price ? `${b.lowest_found_price} ${b.currency}` : "—"}
                  </td>
                  <td style={bodyStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: 220 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: lastCheckColor, flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", color: lastCheckColor, fontWeight: lastCheck?.found ? 700 : 600 }}>
                        {lastCheckLabel}
                      </span>
                    </span>
                  </td>
                  <td style={{ ...bodyStyle, color: test?.error ? "#b91c1c" : test?.found ? "#059669" : "#94a3b8", fontWeight: 700 }}>
                    {loadingId === b.id
                      ? "Loading..."
                      : test?.found && test.price != null
                        ? `${test.price} ${test.currency ?? b.currency}`
                        : test?.error
                          ? "Error"
                          : "—"}
                  </td>
                  <td style={bodyStyle}>
                    {b.booking_com_url ? (
                      <a
                        href={b.booking_com_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}
                      >
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={bodyStyle}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void sendManualAlert(b.id);
                      }}
                      disabled={!canAlert || alertingId === b.id}
                      style={{
                        border: "none",
                        background: canAlert ? "#16a34a" : "#e5e7eb",
                        color: canAlert ? "#fff" : "#94a3b8",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontWeight: 700,
                        cursor: !canAlert || alertingId === b.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {alertingId === b.id ? "..." : "Send"}
                    </button>
                  </td>
                  <td style={bodyStyle}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteBooking(b.id);
                      }}
                      disabled={deletingId === b.id}
                      style={{
                        border: "1px solid #fecaca",
                        background: "#fff5f5",
                        color: "#dc2626",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontWeight: 700,
                        cursor: deletingId === b.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === b.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > pageSize && (
        <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Seite {page} von {totalPages}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                border: "1px solid #dbe3ef",
                background: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                border: "1px solid #dbe3ef",
                background: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      {selected && tests[selected.id] && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6 }}>
            Letztes Testergebnis
          </p>
          <p style={{ margin: "4px 0", fontSize: 13, color: "#0f2044" }}>
            <strong>Hotel:</strong> {selected.hotel_name}
          </p>
          <p style={{ margin: "4px 0", fontSize: 13, color: tests[selected.id].found ? "#059669" : "#0f2044" }}>
            <strong>Ergebnis:</strong>{" "}
            {tests[selected.id].found && tests[selected.id].price != null
              ? `${tests[selected.id].price} ${tests[selected.id].currency ?? selected.currency}`
              : "Kein Preis gefunden"}
          </p>
          {tests[selected.id].error && (
            <p style={{ margin: "4px 0", fontSize: 13, color: "#b91c1c" }}>
              <strong>Fehler:</strong> {tests[selected.id].error}
            </p>
          )}
          {tests[selected.id].usedUrl && (
            <p style={{ margin: "4px 0", fontSize: 13, color: "#0f2044", wordBreak: "break-all" }}>
              <strong>Genutzter Link:</strong> {tests[selected.id].usedUrl}
            </p>
          )}
          <p style={{ margin: "4px 0", fontSize: 13, color: "#0f2044" }}>
            <strong>Vergleich:</strong>{" "}
            {tests[selected.id].comparable
              ? tests[selected.id].cheaper
                ? `Guenstiger um ${tests[selected.id].savings} ${tests[selected.id].comparisonCurrency ?? selected.currency}${tests[selected.id].converted ? " (via ECB-FX)" : ""}`
                : `Preis gefunden, aber nicht guenstiger${tests[selected.id].converted ? " (via ECB-FX)" : ""}`
              : tests[selected.id].comparisonReason === "currency_mismatch" || tests[selected.id].comparisonReason === "unsupported_currency"
                ? "Preis gefunden, aber Waehrung passt nicht sauber zur Buchung"
                : tests[selected.id].comparisonReason === "fx_unavailable"
                  ? "Preis gefunden, aber FX-Daten waren gerade nicht verfuegbar"
                : "Noch kein sauber vergleichbarer Preis"}
          </p>
        </div>
      )}
    </div>
  );
}
