"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProblemBooking = {
  bookingId: string;
  hotel: string;
  value: string;
  meta: string;
  bookingUrl?: string | null;
};

type FailedCheck = {
  bookingId: string;
  hotel: string;
  name: string;
  detail: string;
  extra: string;
  bookingUrl?: string | null;
};

type Outlier = {
  hotel: string;
  name: string;
  detail: string;
  extra: string;
  bookingUrl?: string | null;
};

export default function AdminIssuesPanel({
  failureReasons,
  problemBookings,
  recentFailures,
  suspiciousPrices,
}: {
  failureReasons: Array<[string, number]>;
  problemBookings: ProblemBooking[];
  recentFailures: FailedCheck[];
  suspiciousPrices: Outlier[];
}) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [statusByBooking, setStatusByBooking] = useState<Record<string, string>>({});

  const filteredFailures = useMemo(() => {
    if (selectedReason === "all") return recentFailures;
    return recentFailures.filter((row) => row.detail === selectedReason);
  }, [recentFailures, selectedReason]);

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
    <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <IssueListCard
          title="Problem Bookings Without Price"
          empty="Aktuell keine offenen No-Price-Faelle"
          rows={problemBookings.map((row) => ({
            key: row.bookingId,
            hotel: row.hotel,
            detail: row.value,
            meta: row.meta,
            bookingUrl: row.bookingUrl,
            action: (
              <RetryButton
                busy={retryingId === row.bookingId}
                onClick={() => void retryBooking(row.bookingId)}
              />
            ),
            status: statusByBooking[row.bookingId] ?? null,
          }))}
        />

        <IssueListCard
          title="Suspicious Price Outliers"
          empty="Keine auffaelligen Preis-Ausreisser erkannt"
          rows={suspiciousPrices.map((row, index) => ({
            key: `${row.hotel}-${index}`,
            hotel: row.hotel,
            detail: row.name,
            meta: `${row.detail} · ${row.extra}`,
            bookingUrl: row.bookingUrl,
          }))}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>
              Recent Failed Checks
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Nach Fehlertyp filtern und Problem-Buchungen einzeln erneut pruefen.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <FilterChip
              active={selectedReason === "all"}
              onClick={() => setSelectedReason("all")}
              label={`All (${recentFailures.length})`}
            />
            {failureReasons.slice(0, 6).map(([reason, count]) => (
              <FilterChip
                key={reason}
                active={selectedReason === reason}
                onClick={() => setSelectedReason(reason)}
                label={`${reason} (${count})`}
              />
            ))}
          </div>
        </div>

        {filteredFailures.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Keine fehlgeschlagenen Checks fuer diesen Filter.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filteredFailures.map((row, index) => (
              <div key={`${row.bookingId}-${index}`} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2044" }}>{row.hotel}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{row.extra}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
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
                    <RetryButton
                      busy={retryingId === row.bookingId}
                      onClick={() => void retryBooking(row.bookingId)}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{row.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{row.detail}</div>
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
    </div>
  );
}

function RetryButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        border: "none",
        background: busy ? "#fdba74" : "#f97316",
        color: "#fff",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 700,
        cursor: busy ? "not-allowed" : "pointer",
      }}
    >
      {busy ? "Retrying..." : "Retry"}
    </button>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? "1px solid #f97316" : "1px solid #dbe3ef",
        background: active ? "#fff7ed" : "#fff",
        color: active ? "#c2410c" : "#475569",
        borderRadius: 999,
        padding: "7px 10px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function IssueListCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Array<{
    key: string;
    hotel: string;
    detail: string;
    meta: string;
    bookingUrl?: string | null;
    action?: ReactNode;
    status?: string | null;
  }>;
  empty: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 10px 30px rgba(15,32,68,0.05)" }}>
      <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7 }}>{title}</p>
      {rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{empty}</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={row.key} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2044" }}>{row.hotel}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{row.meta}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                  {row.action}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#334155" }}>{row.detail}</div>
              {row.status && (
                <div style={{ fontSize: 12, color: "#0f766e", fontWeight: 700 }}>
                  Last retry: {row.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
