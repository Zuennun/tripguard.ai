"use client";
import { useState } from "react";

const testimonials = [
  {
    quote: "Thanks to Trip-Guard I saved €180 on my Paris hotel. I booked in advance and forgot about it — then suddenly got an alert. Incredible!",
    name: "Sarah M.", flag: "🇩🇪", country: "Germany",
    initials: "SM", color: "#3b82f6", stars: 5,
  },
  {
    quote: "I think this is the smartest travel tool I've ever used. Set it up in 2 minutes and it found me a cheaper rate the same week.",
    name: "Thomas R.", flag: "🇺🇸", country: "USA",
    initials: "TR", color: "#f97316", stars: 5,
  },
  {
    quote: "Trip-Guard saved me €300 on a Dubai hotel. The alert came at 6am and I rebooked before work. Life changing for frequent travelers.",
    name: "Jana K.", flag: "🇦🇹", country: "Austria",
    initials: "JK", color: "#16a34a", stars: 5,
  },
  {
    quote: "Saved €250 on a Rome hotel. The alerts are spot on — exact same room, much cheaper.",
    name: "Marco B.", flag: "🇮🇹", country: "Italy",
    initials: "MB", color: "#8b5cf6", stars: 5,
  },
  {
    quote: "Best travel hack ever. Never checking prices manually again. Setup was super easy.",
    name: "Lisa H.", flag: "🇬🇧", country: "UK",
    initials: "LH", color: "#ec4899", stars: 5,
  },
  {
    quote: "Used it for business travel and saved my company over €800 in one month.",
    name: "Ahmed K.", flag: "🇦🇪", country: "UAE",
    initials: "AK", color: "#0ea5e9", stars: 5,
  },
];

export default function Testimonials() {
  const [page, setPage] = useState(0);

  // On mobile show 1 per page, on desktop 3
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section style={{ background: "#ffffff", padding: "6rem 2rem" }} className="testimonials-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header row */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: "3rem",
          flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
              <div style={{ width: 28, height: 4, background: "#f97316", borderRadius: 2 }} />
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                fontWeight: 700, color: "#f97316",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>TESTIMONIALS</span>
            </div>
            <h2 style={{
              fontFamily: "var(--font-head)", fontWeight: 900,
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              color: "#0f2044", lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}>
              Happy Travelers Are<br /><span style={{ color: "#f97316" }}>Our Best Ads.</span>
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: page === 0 ? "#ffffff" : "#0f2044",
                color: page === 0 ? "#9ca3af" : "#ffffff",
                border: "1px solid #e5e7eb",
                cursor: page === 0 ? "default" : "pointer",
                fontSize: "1rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              aria-label="Previous"
            >←</button>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.85rem",
              color: "#6b7280", fontWeight: 500,
              minWidth: 30, textAlign: "center",
            }}>
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: page === totalPages - 1 ? "#ffffff" : "#0f2044",
                color: page === totalPages - 1 ? "#9ca3af" : "#ffffff",
                border: "1px solid #e5e7eb",
                cursor: page === totalPages - 1 ? "default" : "pointer",
                fontSize: "1rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              aria-label="Next"
            >→</button>
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }} className="testimonials-grid">
          {visible.map(t => (
            <div key={t.name} style={{
              background: "#ffffff", borderRadius: 24,
              padding: "2rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{
                fontFamily: "var(--font-head)", fontWeight: 900,
                fontSize: "3.5rem", color: t.color,
                lineHeight: 1, marginBottom: "0.25rem",
                opacity: 0.4,
              }}>&ldquo;</div>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.9rem",
                color: "#4b5563", lineHeight: 1.75,
                marginBottom: "1.5rem", flex: 1,
              }}>
                {t.quote}
              </p>
              <div style={{ display: "flex", gap: 2, marginBottom: "1rem" }}>
                {[...Array(t.stars)].map((_, j) => (
                  <span key={j} style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: t.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-head)", fontWeight: 800,
                  fontSize: "0.85rem", color: "#ffffff",
                  flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{
                    fontFamily: "var(--font-head)", fontWeight: 700,
                    fontSize: "0.9rem", color: "#0f2044",
                  }}>
                    {t.name} {t.flag}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: "0.78rem",
                    color: "#9ca3af",
                  }}>
                    {t.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .testimonials-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 580px) {
          .testimonials-section { padding: 4rem 1.25rem !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
