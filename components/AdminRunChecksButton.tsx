"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Summary = {
  checked: number;
  found: number;
  comparable: number;
  cheaper: number;
  alerts: number;
  errors: number;
};

export default function AdminRunChecksButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(mode: "all" | "failed_only") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/run-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Manual run failed");
      setSummary(data.summary ?? null);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Manual run failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0f2044" }}>Run Price Checks</p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Alles prüfen oder nur problematische Buchungen erneut versuchen.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void run("failed_only")}
            disabled={loading}
            style={{
              background: "#fff",
              color: "#0f2044",
              border: "1px solid #dbe3ef",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              fontFamily: "Arial,sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running..." : "Retry failed only"}
          </button>
          <button
            type="button"
            onClick={() => void run("all")}
            disabled={loading}
            style={{
              background: loading ? "#fdba74" : "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              fontFamily: "Arial,sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running..." : "Run all prices now"}
          </button>
        </div>
      </div>

      {(summary || error) && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
          {error ? (
            <p style={{ margin: 0, fontSize: 13, color: "#b91c1c", fontWeight: 700 }}>{error}</p>
          ) : (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {[
                ["Checked", summary?.checked ?? 0],
                ["Found", summary?.found ?? 0],
                ["Comparable", summary?.comparable ?? 0],
                ["Cheaper", summary?.cheaper ?? 0],
                ["Alerts", summary?.alerts ?? 0],
                ["Errors", summary?.errors ?? 0],
              ].map(([label, value]) => (
                <div key={label as string} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", minWidth: 100 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0f2044" }}>{value as number}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
