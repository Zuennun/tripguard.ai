"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type BookingStatus = "active" | "paused" | "expired" | "cancelled" | "deleted";

type Booking = {
  id: string;
  hotel_name: string;
  city: string | null;
  country: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  price: number | null;
  currency: string;
  status: BookingStatus;
  lowest_found_price: number | null;
  last_checked_at: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<BookingStatus, { label: string; color: string }> = {
  active:    { label: "Aktiv",          color: "#10b981" },
  paused:    { label: "Pausiert",       color: "#6b7280" },
  expired:   { label: "Abgelaufen",    color: "#94a3b8" },
  cancelled: { label: "Storniert",     color: "#ef4444" },
  deleted:   { label: "Gelöscht",      color: "#ef4444" },
};

export default function ManagePage() {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/manage/booking?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setBooking(data.booking);
      })
      .catch(() => setError("Fehler beim Laden."))
      .finally(() => setLoading(false));
  }, [token]);

  async function doAction(action: string) {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setBooking(b => b ? { ...b, status: data.status } : b);
        const labels: Record<string, string> = {
          pause: "Überwachung pausiert.",
          resume: "Überwachung wieder aktiv.",
          cancel: "Buchung storniert.",
          delete: "Buchung gelöscht.",
        };
        setMessage(labels[action] ?? "Gespeichert.");
      }
    } catch {
      setMessage("Fehler. Bitte versuche es erneut.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Page><p style={{ color: "#6b7280", textAlign: "center" }}>Laden…</p></Page>;
  if (error || !booking) return <Page><p style={{ color: "#ef4444", textAlign: "center" }}>{error ?? "Nicht gefunden."}</p></Page>;

  const status = booking.status as BookingStatus;
  const { label: statusLabel, color: statusColor } = STATUS_LABELS[status] ?? { label: status, color: "#6b7280" };
  const savings = booking.lowest_found_price && booking.price
    ? (booking.price - booking.lowest_found_price).toFixed(2)
    : null;
  const isActionable = !["cancelled", "deleted", "expired"].includes(status);

  return (
    <Page>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <a href="https://savemyholiday.com" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "Arial,sans-serif" }}>
            <span style={{ color: "#f97316" }}>Save</span>
            <span style={{ color: "#0f2044" }}>My</span>
            <span style={{ color: "#f97316" }}>Holiday</span>
          </span>
        </a>
        <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Arial,sans-serif" }}>
          Buchungsverwaltung
        </p>
      </div>

      {/* Booking Card */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", borderLeft: "4px solid #f97316", padding: "24px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0f2044", fontFamily: "Arial,sans-serif" }}>
              {booking.hotel_name}
            </p>
            {(booking.city || booking.country) && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8", fontFamily: "Arial,sans-serif" }}>
                📍 {[booking.city, booking.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          <span style={{ background: statusColor + "18", color: statusColor, fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: 20, fontFamily: "Arial,sans-serif", whiteSpace: "nowrap" }}>
            {statusLabel}
          </span>
        </div>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
          {[
            ["Check-in",       booking.checkin_date  ?? "—"],
            ["Check-out",      booking.checkout_date ?? "—"],
            ["Gebuchter Preis", booking.price ? `${booking.price} ${booking.currency}` : "—"],
            ["Günstigster Preis", booking.lowest_found_price ? `${booking.lowest_found_price} ${booking.currency}` : "noch nicht gefunden"],
          ].map(([label, val]) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Arial,sans-serif" }}>{label}</p>
              <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 700, color: "#0f2044", fontFamily: "Arial,sans-serif" }}>{val}</p>
            </div>
          ))}
        </div>

        {savings && (
          <div style={{ marginTop: 16, background: "#f0fdf4", borderRadius: 10, padding: "12px 16px", border: "1px solid #bbf7d0" }}>
            <p style={{ margin: 0, color: "#059669", fontSize: 14, fontWeight: 700, fontFamily: "Arial,sans-serif" }}>
              💰 Wir haben bereits {savings} {booking.currency} günstigeren Preis gefunden!
            </p>
          </div>
        )}

        {booking.last_checked_at && (
          <p style={{ margin: "16px 0 0", fontSize: 12, color: "#cbd5e1", fontFamily: "Arial,sans-serif" }}>
            Zuletzt geprüft: {new Date(booking.last_checked_at).toLocaleString("de-DE")}
          </p>
        )}
      </div>

      {/* Actions */}
      {isActionable && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {status === "active" && (
            <ActionButton onClick={() => doAction("pause")} loading={actionLoading} color="#6b7280">
              ⏸ Überwachung pausieren
            </ActionButton>
          )}
          {status === "paused" && (
            <ActionButton onClick={() => doAction("resume")} loading={actionLoading} color="#10b981">
              ▶ Überwachung fortsetzen
            </ActionButton>
          )}
          <ActionButton onClick={() => doAction("cancel")} loading={actionLoading} color="#ef4444" outline>
            ✕ Überwachung stoppen
          </ActionButton>
          <ActionButton onClick={() => { if (confirm("Buchung wirklich löschen?")) doAction("delete"); }} loading={actionLoading} color="#94a3b8" outline>
            🗑 Buchung löschen
          </ActionButton>
        </div>
      )}

      {message && (
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "#0f2044", fontFamily: "Arial,sans-serif", fontWeight: 600 }}>
          {message}
        </p>
      )}
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {children}
      </div>
    </div>
  );
}

function ActionButton({ onClick, loading, color, outline, children }: {
  onClick: () => void;
  loading: boolean;
  color: string;
  outline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "13px 20px",
        borderRadius: 12,
        border: outline ? `2px solid ${color}` : "none",
        background: outline ? "transparent" : color,
        color: outline ? color : "#fff",
        fontWeight: 700,
        fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        fontFamily: "Arial,sans-serif",
        transition: "opacity 0.15s",
      }}
    >
      {loading ? "…" : children}
    </button>
  );
}
