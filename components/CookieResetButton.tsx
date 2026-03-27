"use client";

export default function CookieResetButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => { localStorage.removeItem("rbs_cookie_consent"); window.location.reload(); }}
      style={{
        marginTop: "1rem",
        background: "#0f2044", color: "#ffffff",
        border: "none", borderRadius: 10, cursor: "pointer",
        fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.875rem",
        padding: "0.6rem 1.5rem",
        display: "inline-block",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f97316")}
      onMouseLeave={e => (e.currentTarget.style.background = "#0f2044")}
    >
      {label}
    </button>
  );
}
