"use client";
import { useState } from "react";
import { type Translations } from "@/lib/translations";

export default function Navbar({ t }: { t: Translations }) {
  const [open, setOpen] = useState(false);

  const links = [
    [t.nav.home, "/"],
    [t.nav.howItWorks, "#how-it-works"],
    [t.nav.priceGuide, "/hotel-price-tracker"],
    [t.nav.cities, "/hotels"],
    [t.nav.trackHotel, "#track-hotels"],
    [t.nav.faq, "#faq"],
    [t.nav.blog, "/blog"],
    [t.nav.contact, "#contact"],
  ];

  const dotColor = t.brandPart3 ? "#0f2044" : "#f97316"; // navy if 3 parts (EN), orange if 2 parts (DE)

  const brandEl = (
    <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.4rem" }}>
      <span style={{ color: "#f97316" }}>{t.brandPart1}</span>
      <span style={{ color: "#0f2044" }}>{t.brandPart2}</span>
      {t.brandPart3 && <span style={{ color: "#f97316" }}>{t.brandPart3}</span>}
      <span style={{ color: dotColor }}>.</span>
    </span>
  );

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "#ffffff", borderBottom: "1px solid #e5e7eb",
        height: 72, display: "flex", alignItems: "center",
        padding: "0 4%", justifyContent: "space-between",
      }}>

        {/* LEFT: logo + brand (desktop) / logo only (mobile) */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", zIndex: 1 }}>
          <img src="/tripguard1.png" alt={t.brand} className="nav-logo"
            style={{ display: "block", height: 80, width: "auto", marginTop: -10 }} />
          <span className="nav-brand-desktop" style={{ marginLeft: -18 }}>{brandEl}</span>
        </a>

        {/* CENTER: brand name on mobile only (absolute) */}
        <a href="/" className="nav-brand-mobile" style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          textDecoration: "none", display: "none",
        }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.15rem" }}>
            <span style={{ color: "#f97316" }}>{t.brandPart1}</span>
            <span style={{ color: "#0f2044" }}>{t.brandPart2}</span>
            {t.brandPart3 && <span style={{ color: "#f97316" }}>{t.brandPart3}</span>}
            <span style={{ color: dotColor }}>.</span>
          </span>
        </a>

        {/* Desktop center links */}
        <ul style={{ display: "flex", gap: "2rem", listStyle: "none", alignItems: "center" }} className="nav-desktop-links">
          {links.map(([label, href]) => (
            <li key={label}>
              <a href={href} style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, fontFamily: "var(--font-body)", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
              >{label}</a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="nav-desktop-links">
          <a href="#track-hotels" style={{
            background: "#f97316", color: "#ffffff", padding: "0.55rem 1.4rem",
            borderRadius: 10, fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 700,
            boxShadow: "0 2px 10px rgba(249,115,22,0.3)", animation: "navPulse 2.5s ease-in-out infinite",
            textDecoration: "none", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#ea6c0a"; (e.currentTarget as HTMLAnchorElement).style.animation = "none"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f97316"; (e.currentTarget as HTMLAnchorElement).style.animation = "navPulse 2.5s ease-in-out infinite"; }}
          >{t.nav.cta}</a>
          <style>{`@keyframes navPulse{0%,100%{box-shadow:0 2px 10px rgba(249,115,22,0.3)}50%{box-shadow:0 4px 20px rgba(249,115,22,0.6)}}`}</style>
        </div>

        {/* Hamburger — always right */}
        <button onClick={() => setOpen(!open)} className="nav-hamburger"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4, zIndex: 1 }}
          aria-label="Toggle menu">
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 24, height: 2.5, background: "#0f2044", borderRadius: 2, display: "block", transition: "all 0.3s",
              transform: open && i === 0 ? "rotate(45deg) translate(5px,5px)" : open && i === 1 ? "scaleX(0)" : open && i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "none",
              opacity: open && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div style={{
        position: "fixed", top: 72, left: 0, right: 0, zIndex: 199, background: "#ffffff",
        borderBottom: "1px solid #e5e7eb", padding: open ? "1.25rem 5%" : "0 5%",
        maxHeight: open ? 340 : 0, overflow: "hidden", transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
        boxShadow: open ? "0 8px 24px rgba(0,0,0,0.08)" : "none",
      }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
          {links.map(([label, href]) => (
            <li key={label}>
              <a href={href} onClick={() => setOpen(false)}
                style={{ color: "#374151", textDecoration: "none", fontSize: "1rem", fontWeight: 500, fontFamily: "var(--font-body)" }}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#track-hotels" onClick={() => setOpen(false)} style={{
          width: "100%", background: "#f97316", color: "#ffffff",
          padding: "0.75rem", borderRadius: 10,
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
          textDecoration: "none", display: "block", textAlign: "center",
        }}>{t.nav.ctaMobile}</a>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .nav-hamburger { display: none !important; }
          .nav-brand-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop-links { display: none !important; }
          .nav-brand-desktop { display: none !important; }
          .nav-brand-mobile { display: flex !important; }
          .nav-logo { height: 72px !important; margin-top: -8px !important; }
        }
      `}</style>
    </>
  );
}
