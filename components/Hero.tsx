"use client";
import { type Translations } from "@/lib/translations";

export default function Hero({ t }: { t: Translations }) {
  return (
    <section className="hero-section" style={{ minHeight: "100vh", background: "linear-gradient(160deg, #ffffff 0%, #f9fafb 100%)", display: "flex", alignItems: "flex-start", padding: "150px 5% 4rem", overflow: "visible", position: "relative" }}>
      <img src="/map.svg" alt="" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6, pointerEvents: "none", userSelect: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center", position: "relative", zIndex: 1 }} className="hero-grid">

        <div className="hero-left">
          <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(2.4rem, 5vw, 4.2rem)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "#0f2044", marginBottom: "1.25rem" }}>
            <span style={{ position: "relative", display: "inline-block" }}>
              {t.hero.headline.split("|")[0]}
              <img src="/iconB (2).svg" alt="" aria-hidden="true" style={{ position: "absolute", top: -28, left: "calc(100% + 4px)", width: 54, height: 54, borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transform: "rotate(8deg)", animation: "iconPopB 0.5s cubic-bezier(0.34,1.56,0.64,1) 0s both, iconPulseB 3s ease-in-out 0.5s infinite" }} />
              <img src="/IconE.svg" alt="" aria-hidden="true" style={{ position: "absolute", top: -54, left: "calc(100% + 46px)", width: 44, height: 44, borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.15)", transform: "rotate(-10deg)", animation: "iconPopE 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both, iconPulseE 3s ease-in-out 0.65s infinite" }} />
            </span>
            <br />
            <span>{t.hero.headline.split("|")[1]}</span>
            <br />
            <span style={{ color: "#f97316", position: "relative", display: "inline-block", marginTop: -6 }}>
              {t.hero.headline.split("|")[2]}
              <svg style={{ position: "absolute", bottom: -8, left: 0, width: "100%", height: 8 }} viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,6 Q25,1 50,5 Q75,9 100,4 Q125,0 150,5 Q175,9 200,4" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#6b7280", maxWidth: 460, lineHeight: 1.75, fontFamily: "var(--font-body)", marginBottom: "2.5rem" }}>
            {t.hero.sub}
          </p>

          <div style={{ marginBottom: "0.75rem" }} className="hero-cta-wrap">
            <a href="#track-hotels" style={{ display: "inline-block", background: "#0f2044", color: "#ffffff", border: "none", padding: "1rem 2.25rem", borderRadius: 14, cursor: "pointer", fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 700, boxShadow: "0 4px 20px rgba(15,32,68,0.3)", transition: "transform 0.15s, box-shadow 0.15s", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(15,32,68,0.35)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(15,32,68,0.3)"; }}
            >
              {t.hero.cta}
            </a>
          </div>

          <div className="hero-benefits" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {[t.hero.trust1, t.hero.trust2].map(benefit => (
              <span key={benefit} style={{ fontSize: "0.875rem", fontFamily: "var(--font-body)", fontWeight: 700 }}>
                <span style={{ color: "#0f2044" }}>{benefit.slice(0, 1)}</span>
                <span style={{ color: "#f97316" }}>{benefit.slice(1)}</span>
              </span>
            ))}
          </div>

          <div className="hero-social" style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1.5rem" }}>
            <div style={{ display: "flex" }}>
              {["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&q=80","https://images.unsplash.com/photo-1580489944761-15a19d654956?w=48&q=80","https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=48&q=80","https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=48&q=80"].map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: "2.5px solid #ffffff", objectFit: "cover", marginLeft: i === 0 ? 0 : -10, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
              ))}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.4 }}>
              <span style={{ color: "#0f2044", fontWeight: 800 }}>1.385+</span> {t.hero.tracked.split("+")[1]?.trim() ?? t.hero.tracked}
            </div>
          </div>
        </div>

        <div className="hero-right" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src="/hero.gif" alt={t.hero.imgAlt} className="hero-gif" style={{ maxWidth: 520, width: "100%", display: "block" }} />
        </div>
      </div>

      <style>{`
        @keyframes heroPulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.6} }
        @keyframes iconPopB { 0%{transform:scale(0) rotate(12deg);opacity:0}100%{transform:scale(1) rotate(12deg);opacity:1} }
        @keyframes iconPulseB { 0%,100%{transform:scale(1) rotate(12deg)}50%{transform:scale(1.07) rotate(12deg)} }
        @keyframes iconPopE { 0%{transform:scale(0) rotate(-8deg);opacity:0}100%{transform:scale(1) rotate(-8deg);opacity:1} }
        @keyframes iconPulseE { 0%,100%{transform:scale(1) rotate(-8deg)}50%{transform:scale(1.07) rotate(-8deg)} }
        @keyframes iconPopA { 0%{transform:scale(0) rotate(-15deg);opacity:0}100%{transform:scale(1) rotate(-15deg);opacity:1} }
        @keyframes iconPulseA { 0%,100%{transform:scale(1) rotate(-15deg)}50%{transform:scale(1.07) rotate(-15deg)} }
        @media(max-width:900px){.hero-grid{grid-template-columns:1fr !important;gap:2rem !important}.hero-left{text-align:center}.hero-badge{justify-content:center !important}.hero-benefits{justify-content:center !important}.hero-social{justify-content:center !important}.hero-gif{max-width:380px !important}.hero-icons-row{justify-content:center}}
        @media(max-width:640px){.hero-section{padding:110px 5% 3rem !important;min-height:auto !important}.hero-badge{font-size:0.78rem !important;padding:0.4rem 1rem !important;white-space:nowrap !important}.hero-cta-wrap a{width:100% !important;display:block !important;text-align:center !important;box-sizing:border-box}.hero-gif{max-width:260px !important}.hero-right{display:none !important}}
      `}</style>
    </section>
  );
}
