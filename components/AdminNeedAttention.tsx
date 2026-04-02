"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AttentionRow = {
  bookingId: string;
  hotel: string;
  detail: string;
  meta: string;
  bookingUrl?: string | null;
};

export default function AdminNeedAttention({
  noPriceRows,
  failureRows,
  outlierRows,
}: {
  noPriceRows: AttentionRow[];
  failureRows: AttentionRow[];
  outlierRows: AttentionRow[];
}) {
  const router = useRouter();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [statusByBooking, setStatusByBooking] = useState<Record<string, string>>({});

  async function retryBooking(bookingId: string) {
    setRetryingId(bookingId);
    setStatusByBooking((prev) => ({ ...prev, [bookingId]: "Running..." }));
    try {
      const res = await fetch("/api/admin/test-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");

      const result = data.result?.found && data.result?.price != null
        ? `${data.result.price} ${data.result.currency ?? ""}`.trim()
        : (data.result?.error || "No price found");

      setStatusByBooking((prev) => ({ ...prev, [bookingId]: result }));
      router.refresh();
    } catch (err: any) {
      setStatusByBooking((prev) => ({ ...prev, [bookingId]: err?.message ?? "Retry failed" }));
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, marginBottom: 24 }}>
      <AttentionCard
        title="Needs Price Now"
        tone="#f97316"
        empty="Keine offenen No-Price-Faelle"
        rows={noPriceRows}
        retryingId={retryingId}
        statusByBooking={statusByBooking}
        onRetry={retryBooking}
      />
      <AttentionCard
        title="Recent Failures"
        tone="#dc2626"
        empty="Keine aktuellen Fehler"
        rows={failureRows}
        retryingId={retryingId}
        statusByBooking={statusByBooking}
        onRetry={retryBooking}
      />
      <AttentionCard
        title="Suspicious Prices"
        tone="#7c3aed"
        empty="Keine auffaelligen Ausreisser"
        rows={outlierRows}
        retryingId={retryingId}
        statusByBooking={statusByBooking}
        onRetry={retryBooking}
      />
    </div>
  );
}

function AttentionCard({
  title,
  tone,
  rows,
  empty,
  retryingId,
  statusByBooking,
  onRetry,
}: {
  title: string;
  tone: string;
  rows: AttentionRow[];
  empty: string;
  retryingId: string | null;
  statusByBooking: Record<string, string>;
  onRetry: (bookingId: string) => void;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px" }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: tone, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {title}
      </p>
      {rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{empty}</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={`${title}-${row.bookingId}`} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", display: "grid", gap: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2044" }}>{row.hotel}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{row.meta}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {row.bookingUrl && (
                    <a
                      href={row.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        border: "1px solid #dbe3ef",
                        background: "#fff",
                        color: "#0f2044",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Open
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onRetry(row.bookingId)}
                    disabled={retryingId === row.bookingId}
                    style={{
                      border: "none",
                      background: retryingId === row.bookingId ? "#fdba74" : "#f97316",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: retryingId === row.bookingId ? "not-allowed" : "pointer",
                    }}
                  >
                    {retryingId === row.bookingId ? "Retrying..." : "Retry"}
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#334155" }}>{row.detail}</div>
              {statusByBooking[row.bookingId] && (
                <div style={{ fontSize: 12, color: "#0f766e", fontWeight: 700 }}>
                  Last retry: {statusByBooking[row.bookingId]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
