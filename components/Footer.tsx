"use client";
import { type Translations } from "@/lib/translations";

export default function Footer({ t }: { t: Translations }) {
  return (
    <footer id="contact" style={{ background: "var(--navy)", padding: "3rem 2rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Logo + tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "1.5rem 2rem", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/tripguard1.png" alt={t.brand} style={{ height: 140, width: "auto", display: "block" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.35rem", color: "#0f2044", marginLeft: -5 }}>
                <span style={{ color: "var(--orange)" }}>{t.brandPart1}</span>
                <span style={{ color: "#0f2044" }}>{t.brandPart2}</span>
                {t.brandPart3 && <span style={{ color: "var(--orange)" }}>{t.brandPart3}</span>}
                <span style={{ color: t.brandPart3 ? "#0f2044" : "var(--orange)" }}>.</span>
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
              {t.footer.tagline}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "📸", "▶"].map((icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(15,32,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--orange)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(15,32,68,0.08)")}
                >{icon}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", textAlign: "center" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/impressum" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footer.imprint}</a>
            <a href="/datenschutz" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footer.privacy}</a>
            <a href="/agb" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footer.terms}</a>
            <a href="/cookies" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footer.cookies}</a>
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(255,255,255,0.2)" }}>{t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
