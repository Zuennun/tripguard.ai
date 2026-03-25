"use client";
import { type Translations } from "@/lib/translations";

export default function Features({ t }: { t: Translations }) {
  const cards = [
    { img: "/scanner.gif", title: t.features.card1Title, desc: t.features.card1Text },
    { img: "/urlaub.gif", title: t.features.card2Title, desc: t.features.card2Text },
    { img: "/sparen.gif", title: t.features.card3Title, desc: t.features.card3Text },
  ];

  return (
    <section id="how-it-works" className="features-section" style={{ background: "#ffffff", padding: "6rem 3rem", scrollMarginTop: "80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "40% 1fr", gap: "4rem", alignItems: "center" }} className="features-grid">
        <div>
          <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ marginBottom: "1.25rem" }}>
            <path d="M2,14 Q10,4 18,12 Q26,20 34,10 Q42,2 50,12 Q56,18 58,10" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(2rem, 3vw, 2.8rem)", color: "#0f2044", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
            {t.features.headline.split("|")[0]}<br />
            <span style={{ color: "#f97316" }}>{t.features.headline.split("|")[1]}</span>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "#6b7280", lineHeight: 1.75, maxWidth: 380 }}>
            {(() => {
              const sub = t.features.sub;
              const lastWord = sub.includes("kostenlos") ? "kostenlos." : "free.";
              return <>{sub.replace(lastWord, "")}<span style={{ color: "#f97316", fontWeight: 600 }}>{lastWord}</span></>;
            })()}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }} className="features-cards">
          {cards.map(card => (
            <div key={card.title} style={{ background: "#ffffff", boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)", borderRadius: 20, padding: "2rem 1.75rem", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)"; }}
            >
              <img src={card.img} alt={card.title} style={{ height: 108, objectFit: "contain" }} />
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.95rem", color: "#0f2044", textAlign: "center" }}>{card.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.65, textAlign: "center" }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media(max-width:1024px){.features-grid{grid-template-columns:1fr !important}.features-cards{grid-template-columns:repeat(3,1fr) !important}.features-grid>div:first-child{text-align:center}}
        @media(max-width:768px){.features-section{padding:4rem 1.5rem !important}.features-cards{grid-template-columns:1fr !important}}
      `}</style>
    </section>
  );
}
