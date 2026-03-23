const steps = [
  {
    num: "01",
    icon: "✍️",
    title: "Add Your Booking",
    desc: "Enter your hotel name, check-in/out dates, and the price you paid. Takes under 60 seconds.",
    color: "var(--navy-light)",
    accent: "var(--navy)",
  },
  {
    num: "02",
    icon: "🔍",
    title: "We Scan Automatically",
    desc: "Trip-Guard checks Booking.com, Hotels.com, direct hotel rates, and 8+ more platforms every hour.",
    color: "#fff4ed",
    accent: "var(--orange)",
  },
  {
    num: "03",
    icon: "🔔",
    title: "Get Alerted Instantly",
    desc: "As soon as we find a cheaper rate for the exact same room and dates, you get an email alert.",
    color: "var(--green-soft)",
    accent: "var(--green)",
  },
  {
    num: "04",
    icon: "💸",
    title: "Rebook & Save",
    desc: "Cancel your old booking, rebook at the new price, or request a price match. The savings are yours.",
    color: "var(--navy-light)",
    accent: "var(--navy)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ background: "var(--white)", padding: "7rem 3rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{
            display: "inline-block",
            background: "var(--orange-soft)", border: "1px solid rgba(249,115,22,0.2)",
            padding: "0.3rem 1rem", borderRadius: 100,
            fontSize: "0.78rem", color: "var(--orange-dark)",
            fontWeight: 600, fontFamily: "var(--font-body)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: "1rem",
          }}>
            How It Works
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            color: "var(--navy)", lineHeight: 1.15,
            letterSpacing: "-0.02em", marginBottom: "1rem",
          }}>
            Set Up in{" "}
            <span style={{ color: "var(--orange)", fontStyle: "italic" }}>60 Seconds.</span>
            <br />Save Money Forever.
          </h2>
          <p style={{
            color: "var(--gray-600)", fontSize: "1.05rem",
            maxWidth: 500, margin: "0 auto",
            fontFamily: "var(--font-body)",
          }}>
            No downloads, no complicated setup. Just your booking details — and we handle the rest.
          </p>
        </div>

        {/* Steps grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          position: "relative",
        }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: 36, left: "12%", right: "12%",
            height: 2,
            background: "linear-gradient(90deg, var(--navy-light), var(--orange-soft), var(--green-soft), var(--navy-light))",
            zIndex: 0,
          }} />

          {steps.map((step) => (
            <div key={step.num} style={{
              background: step.color,
              borderRadius: 20,
              padding: "2rem 1.5rem",
              position: "relative", zIndex: 1,
              border: "1px solid rgba(0,0,0,0.05)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "var(--white)",
                border: `2px solid ${step.accent}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "1rem", color: step.accent,
                marginBottom: "1.25rem",
                boxShadow: "var(--shadow-sm)",
              }}>
                {step.num}
              </div>

              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{step.icon}</div>

              <h3 style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: "1.1rem",
                color: "var(--navy)", marginBottom: "0.6rem",
              }}>{step.title}</h3>

              <p style={{
                fontSize: "0.875rem", color: "var(--gray-600)",
                lineHeight: 1.65, fontFamily: "var(--font-body)",
              }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
