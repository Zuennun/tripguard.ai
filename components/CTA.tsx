"use client";
import { useState } from "react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section id="cta" style={{
      background: "#0f2044",
      padding: "6rem 3rem",
      position: "relative", overflow: "hidden",
    }}>
      {/* Orange glow top-right */}
      <div style={{
        position: "absolute", top: -120, right: -120,
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Subtle glow bottom-left */}
      <div style={{
        position: "absolute", bottom: -100, left: -100,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 640, margin: "0 auto",
        textAlign: "center", position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <img
          src="/tripguard.png"
          height={52}
          alt="TripGuard"
          style={{ display: "inline-block", marginBottom: "1.5rem" }}
        />

        <h2 style={{
          fontFamily: "var(--font-head)", fontWeight: 800,
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          color: "#ffffff", lineHeight: 1.1,
          letterSpacing: "-0.02em", marginBottom: "1.25rem",
        }}>
          Start Saving on Your{" "}
          <span style={{ color: "#f97316", fontStyle: "italic" }}>Next Stay</span>
        </h2>

        <p style={{
          color: "rgba(255,255,255,0.65)", fontSize: "1.05rem",
          lineHeight: 1.7, fontFamily: "var(--font-body)",
          marginBottom: "2.5rem",
        }}>
          Join thousands of travelers who never overpay for hotels. Free forever — no credit card needed.
        </p>

        {done ? (
          <div style={{
            background: "rgba(5,150,105,0.15)",
            border: "1px solid rgba(5,150,105,0.3)",
            borderRadius: 16, padding: "1.5rem 2rem",
            color: "#34d399", fontWeight: 600,
            fontFamily: "var(--font-body)", fontSize: "1.05rem",
          }}>
            ✓ You&apos;re in! Check your inbox to get started.
          </div>
        ) : (
          <div style={{
            display: "flex", gap: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16, padding: 8,
            maxWidth: 460, margin: "0 auto",
          }}>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && email.includes("@") && setDone(true)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#ffffff", fontFamily: "var(--font-body)",
                fontSize: "0.95rem", padding: "0.5rem 0.75rem",
              }}
            />
            <button
              onClick={() => email.includes("@") && setDone(true)}
              style={{
                background: "#f97316", border: "none",
                color: "#ffffff", padding: "0.75rem 1.5rem",
                borderRadius: 10, cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#ea6c0a")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f97316")}
            >
              Get Started Free
            </button>
          </div>
        )}

        <p style={{
          marginTop: "1.25rem",
          fontSize: "0.8rem", color: "rgba(255,255,255,0.35)",
          fontFamily: "var(--font-body)",
        }}>
          No spam. No credit card. Unsubscribe anytime.
        </p>

        <div style={{
          display: "flex", gap: "2rem", justifyContent: "center",
          marginTop: "3rem", flexWrap: "wrap",
        }}>
          {["✓ 100% Free", "✓ GDPR Compliant", "✓ 50k+ Users", "✓ No Spam"].map(t => (
            <span key={t} style={{
              fontSize: "0.85rem", color: "rgba(255,255,255,0.45)",
              fontFamily: "var(--font-body)", fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
