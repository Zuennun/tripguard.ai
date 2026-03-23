"use client";
import { useEffect, useRef } from "react";

const cards = [
  { icon:"🔍", title:"Smart Monitoring", desc:"We scan Booking.com, Hotels.com, Expedia, and 7+ other platforms every hour — automatically.", color:"#eef2ff" },
  { icon:"🔔", title:"Instant Alerts", desc:"The moment we find a cheaper price for your exact room and dates, you get an email with the new price and a rebook link.", color:"#fff4ed" },
  { icon:"💰", title:"Real Savings", desc:"Cancel & rebook, request a price match, or upgrade your room for the same price. The savings go straight to you.", color:"#f0fdf4" },
];

export default function Features() {
  const cardRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    cardRefs.forEach((ref, i) => {
      const el = ref.current; if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => { el.style.animation = "popIn 0.55s cubic-bezier(.34,1.56,.64,1) both"; }, i * 130);
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      obs.observe(el);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ padding:"6rem 5%", background:"white" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
          <div style={{ display:"inline-block", background:"#fff4ed", border:"1px solid rgba(249,115,22,0.2)",
            padding:"0.3rem 1rem", borderRadius:100, fontSize:"0.75rem", fontWeight:700, color:"#ea6c0a",
            fontFamily:"var(--font-body)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"1rem" }}>
            Why TripGuard
          </div>
          <h2 style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)",
            color:"#0f2044", letterSpacing:"-0.025em", lineHeight:1.15 }}>
            That&apos;s the Smart Way to{" "}
            <span style={{ color:"#f97316" }}>Save!</span>
          </h2>
          <p style={{ color:"#6b7280", fontSize:"1rem", maxWidth:480, margin:"0.75rem auto 0",
            fontFamily:"var(--font-body)", lineHeight:1.7 }}>
            TripGuard works silently in the background — while you enjoy your trip, we find you a better price.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }} className="feat-grid">
          {cards.map((c, i) => (
            <div key={c.title} ref={cardRefs[i]} style={{
              background:c.color, borderRadius:20, padding:"2rem 1.75rem",
              border:"1px solid rgba(0,0,0,0.05)", opacity:0, cursor:"default",
            }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"1.25rem" }}>{c.icon}</div>
              <h3 style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:"1.2rem",
                color:"#0f2044", marginBottom:"0.6rem" }}>{c.title}</h3>
              <p style={{ fontSize:"0.9rem", color:"#6b7280", lineHeight:1.7,
                fontFamily:"var(--font-body)" }}>{c.desc}</p>
              <div style={{ marginTop:"1.25rem", color:"#0f2044", fontSize:"0.85rem",
                fontWeight:600, fontFamily:"var(--font-body)" }}>
                Learn more <span style={{ color:"#f97316" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:767px){.feat-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
