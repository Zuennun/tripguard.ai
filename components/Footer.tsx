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
              <img src="/tripguard1.png" alt={t.brand} style={{ height: 70, width: "auto", display: "block" }} />
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
              {/* X (Twitter) */}
              <a href="https://x.com/zuennunardal?s=21" target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(15,32,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--orange)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(15,32,68,0.08)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#0f2044" }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@savemyholiday.com?_r=1&_t=ZG-95Az1bbF3TM" target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(15,32,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--orange)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(15,32,68,0.08)")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#0f2044" }}>
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
              </a>
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
