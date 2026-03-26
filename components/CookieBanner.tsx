"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "rbs_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [isDe, setIsDe] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
    const lang = document.documentElement.lang || navigator.language || "";
    setIsDe(lang.toLowerCase().startsWith("de"));
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "all");
    setVisible(false);
  }

  function acceptNecessary() {
    localStorage.setItem(STORAGE_KEY, "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 998,
        background: "rgba(15,32,68,0.25)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }} onClick={acceptNecessary} />

      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 999,
        width: "min(680px, calc(100vw - 32px))",
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(15,32,68,0.18), 0 2px 8px rgba(15,32,68,0.08)",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        animation: "cookieSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>

        {/* Top accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #0f2044 0%, #f97316 100%)" }} />

        <div style={{ padding: "1.5rem 1.75rem" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "#0f2044",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "1.3rem",
            }}>🍪</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1rem",
                color: "#0f2044", marginBottom: "0.3rem",
              }}>
                {isDe ? "Wir nutzen Cookies" : "We use cookies"}
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.85rem",
                color: "#6b7280", lineHeight: 1.6, margin: 0,
              }}>
                {isDe
                  ? <>Wir setzen technisch notwendige Cookies ein und, mit deiner Zustimmung, auch Analyse-Cookies zur Verbesserung unseres Services. Mehr dazu in unserer{" "}
                    <a href="/datenschutz" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Datenschutzerklärung</a>.</>
                  : <>We use technically necessary cookies and, with your consent, analytics cookies to improve our service. Learn more in our{" "}
                    <a href="/datenschutz" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>.</>
                }
              </p>
            </div>
          </div>

          {/* Expandable details */}
          <div style={{ marginBottom: "1.25rem" }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: "0.8rem",
                color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, padding: 0,
              }}
            >
              <span style={{ transition: "transform 0.2s", display: "inline-block", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              {isDe ? "Details anzeigen" : "Show details"}
            </button>

            {expanded && (
              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <CookieRow
                  name={isDe ? "Notwendige Cookies" : "Necessary Cookies"}
                  desc={isDe ? "Für den Betrieb der Website zwingend erforderlich." : "Essential for the website to function."}
                  required
                />
                <CookieRow
                  name={isDe ? "Analyse-Cookies" : "Analytics Cookies"}
                  desc={isDe ? "Helfen uns zu verstehen, wie Besucher die Seite nutzen (z. B. Vercel Analytics)." : "Help us understand how visitors use the site (e.g. Vercel Analytics)."}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={accept}
              style={{
                flex: 1, minWidth: 140,
                background: "#f97316", color: "#ffffff",
                border: "none", borderRadius: 12, cursor: "pointer",
                fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.9rem",
                padding: "0.7rem 1.5rem",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                transition: "background 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ea6c0a"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f97316"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              {isDe ? "Alle akzeptieren" : "Accept all"}
            </button>
            <button
              onClick={acceptNecessary}
              style={{
                flex: 1, minWidth: 140,
                background: "#ffffff", color: "#0f2044",
                border: "1.5px solid #e5e7eb", borderRadius: 12, cursor: "pointer",
                fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.9rem",
                padding: "0.7rem 1.5rem",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0f2044"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; }}
            >
              {isDe ? "Nur notwendige" : "Necessary only"}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes cookieSlideUp {
          0% { opacity: 0; transform: translateX(-50%) translateY(24px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}

function CookieRow({ name, desc, required }: { name: string; desc: string; required?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      background: "#f8f9fb", borderRadius: 10, padding: "0.65rem 0.9rem", gap: "1rem",
    }}>
      <div>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.82rem", color: "#0f2044" }}>{name}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{
        flexShrink: 0,
        width: 36, height: 20, borderRadius: 10,
        background: required ? "#0f2044" : "#e5e7eb",
        position: "relative", cursor: required ? "default" : "pointer",
      }}>
        <div style={{
          position: "absolute", top: 3, left: required ? 19 : 3,
          width: 14, height: 14, borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }} />
      </div>
    </div>
  );
}
