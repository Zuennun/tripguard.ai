"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "rbs_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [isDe, setIsDe] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [analytics, setAnalytics] = useState(false);

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

  function acceptCustom() {
    localStorage.setItem(STORAGE_KEY, analytics ? "all" : "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
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
        position: "relative",
        animation: "cookieSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>

        <div style={{ height: 4, background: "linear-gradient(90deg, #0f2044 0%, #f97316 100%)" }} />

        <div style={{ padding: "1.5rem 1.75rem" }}>

          {/* X close button */}
          <button
            onClick={acceptNecessary}
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "none", border: "none", cursor: "pointer",
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#9ca3af", fontSize: "1.1rem", lineHeight: 1,
              transition: "background 0.15s, color 0.15s",
              zIndex: 10,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
            aria-label="Schließen"
          >✕</button>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "#0f2044",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "1.3rem",
            }}>🍪</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1rem", color: "#0f2044", marginBottom: "0.3rem" }}>
                {isDe ? "Wir nutzen Cookies" : "We use cookies"}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
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
                {/* Necessary — always on */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "#f8f9fb", borderRadius: 10, padding: "0.65rem 0.9rem", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.82rem", color: "#0f2044" }}>
                      {isDe ? "Notwendige Cookies" : "Necessary Cookies"}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#9ca3af", marginTop: 2, lineHeight: 1.5 }}>
                      {isDe ? "Speichern deine Cookie-Einstellungen und deinen Sprachpräferenz. Ohne diese funktioniert die Website nicht korrekt." : "Store your cookie preferences and language setting. Required for the website to work correctly."}
                    </div>
                  </div>
                  <Toggle on={true} disabled />
                </div>

                {/* Analytics — clickable */}
                <div
                  style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "#f8f9fb", borderRadius: 10, padding: "0.65rem 0.9rem", gap: "1rem", cursor: "pointer" }}
                  onClick={() => setAnalytics(v => !v)}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.82rem", color: "#0f2044" }}>
                      {isDe ? "Analyse-Cookies" : "Analytics Cookies"}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "#9ca3af", marginTop: 2, lineHeight: 1.5 }}>
                      {isDe ? "Wir nutzen Vercel Analytics, um anonyme Seitenaufrufe zu messen — keine persönlichen Daten, kein Tracking über andere Seiten." : "We use Vercel Analytics to measure anonymous page views — no personal data, no cross-site tracking."}
                    </div>
                  </div>
                  <Toggle on={analytics} onClick={() => setAnalytics(v => !v)} />
                </div>
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
            {expanded ? (
              <button
                onClick={acceptCustom}
                style={{
                  flex: 1, minWidth: 140,
                  background: "#ffffff", color: "#0f2044",
                  border: "1.5px solid #0f2044", borderRadius: 12, cursor: "pointer",
                  fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.9rem",
                  padding: "0.7rem 1.5rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f8f9fb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
              >
                {isDe ? "Auswahl speichern" : "Save selection"}
              </button>
            ) : (
              <button
                onClick={acceptNecessary}
                style={{
                  flex: 1, minWidth: 140,
                  background: "#ffffff", color: "#0f2044",
                  border: "1.5px solid #e5e7eb", borderRadius: 12, cursor: "pointer",
                  fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.9rem",
                  padding: "0.7rem 1.5rem",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0f2044"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; }}
              >
                {isDe ? "Nur notwendige" : "Necessary only"}
              </button>
            )}
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

function Toggle({ on, disabled, onClick }: { on: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        flexShrink: 0,
        width: 44, height: 24, borderRadius: 12,
        background: on ? "#0f2044" : "#d1d5db",
        position: "relative",
        cursor: disabled ? "default" : "pointer",
        transition: "background 0.2s",
      }}
    >
      <div style={{
        position: "absolute", top: 4,
        left: on ? 22 : 4,
        width: 16, height: 16, borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        transition: "left 0.2s",
      }} />
    </div>
  );
}
