"use client";
import { type Translations } from "@/lib/translations";

export default function Footer({ t }: { t: Translations }) {
  const cols = [
    { title: t.footer.company, links: [t.footer.aboutUs, t.footer.features, t.footer.pricing, t.footer.news, t.footer.faq] },
    { title: t.footer.resources, links: [t.footer.events, t.footer.blog, t.footer.contactUs, t.footer.feedback] },
    { title: t.footer.support, links: [t.footer.account, t.footer.supportCenter, t.footer.contactUs, t.footer.accessibility] },
  ];

  return (
    <footer id="contact" style={{ background: "var(--navy)", padding: "4rem 2rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", marginBottom: "3rem" }} className="footer-grid">
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "1.75rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <img src="/tripguard1.png" alt={t.brand} style={{ height: 70, width: "auto", display: "block" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.35rem", color: "#0f2044", marginLeft: -5 }}>
                <span style={{ color: "var(--orange)" }}>Trip</span>-Guard<span style={{ color: "var(--orange)" }}>.</span>
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.7, maxWidth: 240 }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: "1.25rem" }}>
              {["𝕏", "📸", "▶"].map((icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(15,32,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--orange)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(15,32,68,0.08)")}
                >{icon}</a>
              ))}
            </div>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem", color: "var(--white)", marginBottom: "1rem" }}>{col.title}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}>{t.footer.rights}</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[t.footer.privacy, t.footer.terms, t.footer.cookies].map(l => (
              <a key={l} href="#" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){.footer-grid{grid-template-columns:1fr 1fr !important}}
        @media(max-width:480px){.footer-grid{grid-template-columns:1fr !important}}
      `}</style>
    </footer>
  );
}
