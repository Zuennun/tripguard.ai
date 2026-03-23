"use client";

const withoutItems = [
  "Overpay for your hotel",
  "Check prices manually — takes hours",
  "Miss price drops while you sleep",
  "Lose money on bookings you could rebook",
  "No idea if cheaper rates exist elsewhere",
];

const withItems = [
  { text: "Get alerted ", bold: "the moment the price drops" },
  { text: "We scan ", bold: "10+ platforms automatically 24/7" },
  { text: "Never miss a ", bold: "cheaper rate again" },
  { text: "Rebook and save — ", bold: "in just a few clicks" },
  { text: "Always know you got ", bold: "the best price" },
];

export default function Comparison() {
  return (
    <section className="comparison-section" style={{ background: "#ffffff", padding: "7rem 3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h2 style={{
          fontFamily: "var(--font-head)", fontWeight: 900,
          fontSize: "clamp(2rem, 4vw, 3rem)",
          color: "#0f2044", lineHeight: 1.12,
          letterSpacing: "-0.03em", marginBottom: "1rem",
        }}>
          Stop Overpaying. <span style={{ color: "#f97316" }}>Start Saving.</span>
        </h2>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "1.05rem",
          color: "#6b7280", lineHeight: 1.7,
          maxWidth: 560, margin: "0 auto",
        }}>
          Forget checking prices manually — Trip-Guard watches every platform for you and alerts you the instant rates drop.
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "2rem", maxWidth: 1060, margin: "0 auto",
        alignItems: "start", padding: "1rem 0 2rem",
      }} className="comparison-grid">

        {/* WITHOUT card */}
        <div className="comparison-card-l" style={{
          borderRadius: 22, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(15,32,68,0.14)",
          transform: "rotate(-2deg)",
          transformOrigin: "center center",
        }}>
          <div style={{
            background: "#0f2044",
            padding: "1.25rem 2rem",
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "1rem", color: "#ffffff",
            textAlign: "center",
          }}>
            Without Trip-Guard
          </div>
          <div style={{ background: "#ffffff", padding: "2rem" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {withoutItems.map(item => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: "rgba(239,68,68,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                    color: "#ef4444", fontSize: "0.8rem", fontWeight: 800,
                  }}>✗</span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.9rem",
                    color: "#6b7280", lineHeight: 1.55,
                  }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WITH card */}
        <div className="comparison-card-r" style={{
          borderRadius: 22, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(249,115,22,0.15)",
          transform: "rotate(2deg)",
          transformOrigin: "center center",
        }}>
          <div style={{
            background: "#f97316",
            padding: "1.25rem 2rem",
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "1rem", color: "#ffffff",
            textAlign: "center",
          }}>
            With Trip-Guard
          </div>
          <div style={{ background: "#ffffff", padding: "2rem" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {withItems.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: "rgba(15,32,68,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                    color: "#0f2044", fontSize: "0.8rem", fontWeight: 800,
                  }}>✓</span>
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.9rem",
                    color: "#374151", lineHeight: 1.55,
                  }}>
                    {item.text}<strong style={{ color: "#f97316", fontWeight: 700 }}>{item.bold}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .comparison-section { padding: 4rem 1.5rem !important; }
          .comparison-grid { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 0.5rem 0 !important; }
        }
      `}</style>
    </section>
  );
}
