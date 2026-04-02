"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Wrong secret.");
        setLoading(false);
      }
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0f2044",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 16, padding: "40px 48px",
        width: "100%", maxWidth: 380, boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <div style={{ fontFamily: "Arial,sans-serif", fontWeight: 900, fontSize: 20, color: "#0f2044" }}>
            <span style={{ color: "#f97316" }}>Save</span>My<span style={{ color: "#f97316" }}>Holiday</span>
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: "Arial,sans-serif", fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2 }}>
            Admin
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            autoFocus
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 10,
              border: "1.5px solid #e2e8f0", fontFamily: "Arial,sans-serif",
              fontSize: 15, outline: "none", boxSizing: "border-box",
              marginBottom: 12,
            }}
          />
          {error && (
            <p style={{ margin: "0 0 10px", color: "#ef4444", fontSize: 13, fontFamily: "Arial,sans-serif" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px", background: "#f97316",
              color: "#fff", border: "none", borderRadius: 10,
              fontFamily: "Arial,sans-serif", fontWeight: 700, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
