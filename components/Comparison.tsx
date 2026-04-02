"use client";
import { type Translations } from "@/lib/translations";

export default function Comparison({ t }: { t: Translations }) {
  return (
    <section className="comparison-section" style={{ background: "#ffffff", padding: "7rem 3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0f2044", lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
          {t.comparison.headline.split("|")[0]}<br /><span style={{ color: "#f97316" }}>{t.comparison.headline.split("|")[1]}</span>
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", color: "#6b7280", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          {t.comparison.sub}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: 1060, margin: "0 auto", alignItems: "stretch", padding: "1rem 0 2rem" }} className="comparison-grid">
        <div className="comparison-card-l" style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 8px 32px rgba(15,32,68,0.14)", transform: "rotate(-2deg)", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#0f2044", padding: "1.25rem 2rem", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1rem", color: "#ffffff", textAlign: "center" }}>
            {t.comparison.without}
          </div>
          <div style={{ background: "#ffffff", padding: "2rem", flex: 1 }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {t.comparison.withoutList.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, color: "#ef4444", fontSize: "0.8rem", fontWeight: 800 }}>✗</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.55 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="comparison-card-r" style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 8px 32px rgba(249,115,22,0.15)", transform: "rotate(2deg)", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#f97316", padding: "1.25rem 2rem", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1rem", color: "#ffffff", textAlign: "center" }}>
            {t.comparison.withTitle}
          </div>
          <div style={{ background: "#ffffff", padding: "2rem", flex: 1 }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {t.comparison.withList.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(15,32,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, color: "#0f2044", fontSize: "0.8rem", fontWeight: 800 }}>✓</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#374151", lineHeight: 1.55 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){.comparison-section{padding:4rem 1.5rem !important}.comparison-grid{grid-template-columns:1fr !important;gap:2rem !important;padding:0.5rem 0 !important}}
      `}</style>
    </section>
  );
}
