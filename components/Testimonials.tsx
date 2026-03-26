"use client";
import { useState } from "react";
import { type Translations } from "@/lib/translations";

const META = [
  { flag: "🇩🇪", initials: "SM", color: "#3b82f6", stars: 5 },
  { flag: "🇺🇸", initials: "TR", color: "#f97316", stars: 5 },
  { flag: "🇦🇹", initials: "JK", color: "#16a34a", stars: 5 },
  { flag: "🇮🇹", initials: "MB", color: "#8b5cf6", stars: 5 },
  { flag: "🇬🇧", initials: "LH", color: "#ec4899", stars: 5 },
  { flag: "🇦🇪", initials: "AK", color: "#0ea5e9", stars: 5 },
];

export default function Testimonials({ t }: { t: Translations }) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(t.testimonials.items.length / perPage);
  const visible = t.testimonials.items.slice(page * perPage, page * perPage + perPage);

  return (
    <section style={{ background: "#ffffff", padding: "6rem 2rem" }} className="testimonials-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="testimonials-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div className="testimonials-titles">
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.75rem" }}>{t.testimonials.eyebrow}</span>
            <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", color: "#0f2044", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              {t.testimonials.headline.split("|")[0]}<br /><span style={{ color: "#f97316" }}>{t.testimonials.headline.split("|")[1]}</span>
            </h2>
          </div>
          <div className="testimonials-nav" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} style={{ width: 44, height: 44, borderRadius: "50%", background: page === 0 ? "#ffffff" : "#0f2044", color: page === 0 ? "#9ca3af" : "#ffffff", border: "1px solid #e5e7eb", cursor: page === 0 ? "default" : "pointer", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} aria-label="Previous">←</button>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#6b7280", fontWeight: 500, minWidth: 30, textAlign: "center" }}>{page + 1}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ width: 44, height: 44, borderRadius: "50%", background: page === totalPages - 1 ? "#ffffff" : "#0f2044", color: page === totalPages - 1 ? "#9ca3af" : "#ffffff", border: "1px solid #e5e7eb", cursor: page === totalPages - 1 ? "default" : "pointer", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} aria-label="Next">→</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }} className="testimonials-grid">
          {visible.map((item, i) => {
            const meta = META[(page * perPage + i) % META.length];
            return (
              <div key={i} style={{ background: "#ffffff", borderRadius: 24, padding: "2rem", boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "3.5rem", color: meta.color, lineHeight: 1, marginBottom: "0.25rem", opacity: 0.4 }}>&ldquo;</div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.75, marginBottom: "1.5rem", flex: 1 }}>{item.text}</p>
                <div style={{ display: "flex", gap: 2, marginBottom: "1rem" }}>
                  {[...Array(meta.stars)].map((_, j) => <span key={j} style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "0.85rem", color: "#ffffff", flexShrink: 0 }}>{meta.initials}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.9rem", color: "#0f2044" }}>{item.name} {meta.flag}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#9ca3af" }}>{item.country}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media(max-width:900px){.testimonials-grid{grid-template-columns:1fr 1fr !important}}
        @media(max-width:768px){.testimonials-titles{text-align:center;width:100%}.testimonials-nav{width:100%;justify-content:center}}
        @media(max-width:580px){.testimonials-section{padding:4rem 1.25rem !important}.testimonials-grid{grid-template-columns:1fr !important}}
      `}</style>
    </section>
  );
}
