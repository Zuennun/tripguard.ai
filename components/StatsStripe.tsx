const stats = [
  { count: 50000, suffix: "+", label: "Bookings Tracked" },
  { count: 147,   prefix: "€", suffix: "", label: "Avg. Saving" },
  { count: 10,    suffix: "+", label: "Platforms Scanned" },
  { count: 98,    suffix: "%", label: "Alert Accuracy" },
];

export default function StatsStripe() {
  return (
    <section style={{
      background: "var(--navy)",
      padding: "2.5rem 2rem",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "1rem",
      }}
      className="stats-grid"
      >
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: "center",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none",
            padding: "0.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 900,
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              color: i % 2 === 0 ? "var(--white)" : "var(--orange)",
              letterSpacing: "-0.03em",
            }}>
              {s.prefix || ""}{s.count.toLocaleString()}{s.suffix}
            </div>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.82rem",
              color: "rgba(255,255,255,0.5)", marginTop: 4,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
      <style>{`
        @media(max-width:640px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem; }
        }
      `}</style>
    </section>
  );
}
