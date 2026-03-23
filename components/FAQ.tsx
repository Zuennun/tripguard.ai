"use client";
import { useState } from "react";

const faqs = [
  { q: "What is Trip-Guard?", a: "Trip-Guard is a free service that monitors your hotel booking price after you've booked. When the price drops, we instantly alert you by email so you can rebook cheaper." },
  { q: "How does Trip-Guard make money?", a: "We earn a small affiliate commission when you rebook through our links — at no extra cost to you. The service is completely free for users.", orange: true },
  { q: "Which platforms do you scan?", a: "We scan 10+ platforms including Booking.com, Hotels.com, Expedia, Agoda, and more. We match your exact hotel, room type, and dates to make sure you always get the best available rate." },
  { q: "How quickly do I get alerted?", a: "It depends on the hotel and market — sometimes a price drop happens within a few days, other times it shows up 2–4 weeks before your trip begins. Our system scans hourly so you never miss a drop.", orange: true },
  { q: "When will I hear from Trip-Guard?", a: "We only contact you when we find a cheaper rate for your exact booking. You won't receive random emails — only real savings alerts. Depending on market conditions, this can happen after a few days or closer to your check-in date." },
  { q: "Is my data safe?", a: "Absolutely. We never share your data and only use your email to send price drop alerts. You can delete your booking anytime.", orange: true },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  type Faq = { q: string; a: string; orange?: boolean };

  return (
    <section id="faq" className="faq-section" style={{
      background: "#ffffff",
      padding: "6rem 2rem",
      borderTop: "1px solid #f3f4f6",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "5rem", alignItems: "start",
      }} className="faq-grid">

        {/* LEFT — Founder bio */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
            <div style={{ width: 28, height: 4, background: "#f97316", borderRadius: 2 }} />
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.82rem",
              fontWeight: 700, color: "#f97316",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>FAQ</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 900,
            fontSize: "clamp(1.8rem,3vw,2.5rem)",
            color: "#0f2044", lineHeight: 1.15,
            letterSpacing: "-0.02em", marginBottom: "0.75rem",
          }}>
            Got A Question<br />
            For <span style={{ color: "#f97316" }}>Trip-Guard?</span>
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", color: "#9ca3af",
            fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2rem",
          }}>
            If there are questions you want to ask, we will answer all your questions.
          </p>

          {/* Founder card */}
          <div style={{
            background: "#0f2044",
            borderRadius: 20, padding: "1.5rem",
            display: "flex", alignItems: "flex-start", gap: "1.25rem",
            flexWrap: "wrap",
          }}>
            <img
              src="/ich.jpg"
              alt="Founder"
              style={{
                width: 72, height: 72,
                borderRadius: 14,
                objectFit: "cover",
                objectPosition: "top",
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{
                fontFamily: "var(--font-head)", fontWeight: 800,
                fontSize: "1rem", color: "#ffffff",
                marginBottom: "0.35rem",
              }}>
                Zünnun
              </div>
              <div style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: "rgba(255,255,255,0.55)", lineHeight: 1.6,
                marginBottom: "0.5rem",
              }}>
                I&apos;m Zünnun, based in Berlin — solo founder of Trip-Guard. I love to travel but I can&apos;t stand overpaying for hotels. Everyone likes to save money, right? So I built Trip-Guard to scan 10+ platforms automatically so travelers like you always get the best rate.
              </div>
              <a href="mailto:hello@tripguard.ai" style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: "#f97316", fontWeight: 600, textDecoration: "none",
              }}>
                hello@tripguard.ai
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT — Accordion */}
        <div>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.9rem",
            color: "#9ca3af", marginBottom: "1.25rem",
          }}>
            Maybe your question has been answered, check this out.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {(faqs as Faq[]).map((faq, i) => (
              <div key={i} style={{
                border: "1px solid",
                borderRadius: 14, overflow: "hidden",
                borderColor: open === i ? "#f97316" : "#e5e7eb",
                transition: "border-color 0.2s",
              }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    padding: "1rem 1.25rem", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-head)", fontWeight: 700,
                    fontSize: "0.92rem", color: faq.orange ? "#f97316" : "#0f2044",
                  }}>{faq.q}</span>
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: open === i ? "#f97316" : "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: open === i ? "white" : "#9ca3af",
                    fontSize: "0.9rem", fontWeight: 700,
                    transition: "all 0.2s", marginLeft: 12,
                  }}>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div style={{
                    padding: "0 1.25rem 1rem",
                    fontFamily: "var(--font-body)", fontSize: "0.875rem",
                    color: "#4b5563", lineHeight: 1.7,
                  }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .faq-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .faq-section { padding: 4rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
