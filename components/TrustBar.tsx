const stats = [
  { icon: "📊", num: "50,000+", label: "Bookings tracked" },
  { icon: "💰", num: "$2.4M", label: "Saved for travelers" },
  { icon: "🔍", num: "10+", label: "Platforms scanned" },
  { icon: "⚡", num: "Daily", label: "Automated price scans" },
];

export default function TrustBar() {
  return (
    <section style={{
      background: "var(--navy)",
      padding: "3rem 3rem",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "2rem",
      }}>
        {stats.map((s) => (
          <div key={s.num} style={{
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            paddingRight: "1rem",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{s.icon}</div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: "1.9rem",
              color: "var(--white)", letterSpacing: "-0.02em",
            }}>{s.num}</div>
            <div style={{
              fontSize: "0.85rem", color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-body)", marginTop: 3,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
