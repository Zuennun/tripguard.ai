"use client";
import { useEffect, useState, useRef } from "react";

const platforms = ["Booking.com", "Expedia", "Hotels.com", "Agoda"];

const hotels = [
  { name: "Burj Al Arab", location: "Dubai, UAE", platform: "Booking.com", oldPrice: 1200, newPrice: 890, discount: 26, img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=64&q=80" },
  { name: "Hotel Arts", location: "Barcelona, Spain", platform: "Expedia", oldPrice: 310, newPrice: 229, discount: 26, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=64&q=80" },
  { name: "Rosewood Hotel", location: "Hong Kong", platform: "Hotels.com", oldPrice: 590, newPrice: 430, discount: 27, img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=64&q=80" },
  { name: "Raffles Hotel", location: "Singapore", platform: "Agoda", oldPrice: 650, newPrice: 479, discount: 26, img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=64&q=80" },
  { name: "Harborview Grand", location: "Amsterdam", platform: "Hotels.com", oldPrice: 278, newPrice: 247, discount: 11, img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=64&q=80" },
  { name: "Aman Tokyo", location: "Tokyo, Japan", platform: "Booking.com", oldPrice: 780, newPrice: 560, discount: 28, img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=64&q=80" },
  { name: "The Ritz", location: "Paris, France", platform: "Expedia", oldPrice: 920, newPrice: 740, discount: 20, img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=64&q=80" },
  { name: "Four Seasons", location: "Dubai, UAE", platform: "Hotels.com", oldPrice: 850, newPrice: 610, discount: 28, img: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=64&q=80" },
  { name: "Park Hyatt", location: "Milan, Italy", platform: "Agoda", oldPrice: 480, newPrice: 350, discount: 27, img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=64&q=80" },
  { name: "Mandarin Oriental", location: "Bangkok", platform: "Booking.com", oldPrice: 420, newPrice: 295, discount: 30, img: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=64&q=80" },
  { name: "W Hotel", location: "Bali, Indonesia", platform: "Expedia", oldPrice: 260, newPrice: 185, discount: 29, img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=64&q=80" },
  { name: "Sofitel Legend", location: "Amsterdam", platform: "Hotels.com", oldPrice: 390, newPrice: 290, discount: 26, img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=64&q=80" },
  { name: "Atlantis", location: "Dubai, UAE", platform: "Agoda", oldPrice: 740, newPrice: 530, discount: 28, img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=64&q=80" },
  { name: "Le Méridien", location: "Vienna, Austria", platform: "Booking.com", oldPrice: 320, newPrice: 228, discount: 29, img: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=64&q=80" },
  { name: "Belmond Hotel", location: "Venice, Italy", platform: "Expedia", oldPrice: 890, newPrice: 640, discount: 28, img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=64&q=80" },
  { name: "Six Senses", location: "Maldives", platform: "Hotels.com", oldPrice: 1100, newPrice: 798, discount: 27, img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=64&q=80" },
  { name: "Capella Hotel", location: "Singapore", platform: "Agoda", oldPrice: 680, newPrice: 490, discount: 28, img: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=64&q=80" },
  { name: "One&Only", location: "Cape Town, SA", platform: "Booking.com", oldPrice: 550, newPrice: 395, discount: 28, img: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=64&q=80" },
  { name: "Amangiri", location: "Utah, USA", platform: "Expedia", oldPrice: 1400, newPrice: 1020, discount: 27, img: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=64&q=80" },
  { name: "Cheval Blanc", location: "Paris, France", platform: "Hotels.com", oldPrice: 1600, newPrice: 1150, discount: 28, img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=64&q=80" },
];

const platformColors: Record<string, string> = {
  "Booking.com": "#3b82f6",
  "Expedia": "#60a5fa",
  "Hotels.com": "#f87171",
  "Agoda": "#a78bfa",
};

import { type Translations } from "@/lib/translations";

const ROW_HEIGHT = 60;
const VISIBLE = 7;

export default function LiveScanning({ t }: { t: Translations }) {
  const [activePlatform, setActivePlatform] = useState(0);
  const [offset, setOffset] = useState(0);
  const [sliding, setSliding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const platformInterval = setInterval(() => {
      setActivePlatform(p => (p + 1) % platforms.length);
    }, 2000);
    return () => clearInterval(platformInterval);
  }, []);

  useEffect(() => {
    function step() {
      setSliding(true);
      timerRef.current = setTimeout(() => {
        setOffset(o => (o + 1) % hotels.length);
        setSliding(false);
        timerRef.current = setTimeout(step, 2500);
      }, 500);
    }
    timerRef.current = setTimeout(step, 2500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const visibleHotels = Array.from({ length: VISIBLE + 1 }, (_, i) => {
    const idx = (offset + i) % hotels.length;
    return { ...hotels[idx], key: offset * 100 + i };
  });

  return (
    <section className="scanning-section" style={{ background: "#ffffff", padding: "6rem 3rem" }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "4rem", alignItems: "center",
      }} className="scanning-grid">

        {/* LEFT — Dark scanning panel */}
        <div style={{
          background: "#0f2044", borderRadius: 24,
          boxShadow: "0 20px 60px rgba(15,32,68,0.35)",
          padding: "1.5rem", overflow: "hidden",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "1.25rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
              }} />
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.8rem",
                color: "rgba(255,255,255,0.7)",
              }}>
                {t.live.scanning}{" "}
                <span style={{ color: "#f97316", fontWeight: 600 }}>
                  {platforms[activePlatform]}
                </span>
                ...
              </span>
            </div>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.72rem",
              color: "rgba(255,255,255,0.35)",
            }}>
              7,381 {t.live.scanned}
            </span>
          </div>

          <div style={{
            height: VISIBLE * ROW_HEIGHT,
            overflow: "hidden",
            position: "relative",
          }}>
            <div style={{
              transform: sliding ? `translateY(-${ROW_HEIGHT}px)` : "translateY(0)",
              transition: sliding ? "transform 0.45s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}>
              {visibleHotels.map((hotel, i) => {
                const isNew = i === VISIBLE;
                const isHighlighted = !sliding && i === VISIBLE - 1;
                return (
                  <div key={hotel.key} style={{
                    display: "flex", alignItems: "center",
                    gap: "0.85rem", padding: "0 0.75rem",
                    height: ROW_HEIGHT,
                    borderRadius: 12,
                    background: isHighlighted
                      ? "rgba(255,255,255,0.1)"
                      : isNew
                      ? "rgba(255,255,255,0.05)"
                      : "transparent",
                    transition: "background 0.4s ease",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      flexShrink: 0, overflow: "hidden",
                      background: "rgba(255,255,255,0.1)",
                    }}>
                      <img src={hotel.img} alt={hotel.name} style={{ width: 44, height: 44, objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-body)", fontWeight: 700,
                        fontSize: "0.82rem", color: "#ffffff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {hotel.name}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-body)", fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.4)", marginTop: 2,
                      }}>
                        {hotel.location} ·{" "}
                        <span style={{ color: platformColors[hotel.platform] ?? "#f97316" }}>
                          {hotel.platform}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                          fontFamily: "var(--font-body)", fontSize: "0.72rem",
                          color: "rgba(255,255,255,0.35)",
                          textDecoration: "line-through",
                        }}>€{hotel.oldPrice}</span>
                        <span style={{
                          fontFamily: "var(--font-head)", fontWeight: 700,
                          fontSize: "0.88rem", color: "#ffffff",
                        }}>€{hotel.newPrice}</span>
                        <span style={{
                          background: "#f97316", color: "#ffffff",
                          fontSize: "0.62rem", fontWeight: 700,
                          padding: "2px 5px", borderRadius: 5,
                          fontFamily: "var(--font-body)",
                        }}>-{hotel.discount}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="scanning-right">
          <div className="scanning-eyebrow" style={{
            fontFamily: "var(--font-body)", fontSize: "0.78rem",
            fontWeight: 700, color: "#f97316",
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "1rem",
          }}>
            {t.live.eyebrow}
          </div>
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 900,
            fontSize: "clamp(2rem, 3vw, 2.8rem)",
            color: "#0f2044", lineHeight: 1.15,
            letterSpacing: "-0.02em", marginBottom: "1.25rem",
          }}>
            {t.live.headline.split("10+")[0]}<span style={{ color: "#f97316", fontWeight: 900 }}>10+</span>{t.live.headline.split("10+")[1] ?? ""}<br />
            <span style={{ color: "#f97316" }}>{t.live.headlineSub}</span>
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "1rem",
            color: "#6b7280", lineHeight: 1.75,
            maxWidth: 440, marginBottom: "2rem",
          }}>
            {t.live.body}
          </p>
          <div className="scanning-chips" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {[
              { name: "Booking.com", bg: "#003580", color: "#ffffff" },
              { name: "Expedia", bg: "#FFC72C", color: "#00355F" },
              { name: "Hotels.com", bg: "#C8102E", color: "#ffffff" },
              { name: "Agoda", bg: "#0f2044", color: "#ffffff" },
              { name: t.live.morePlatforms, bg: "transparent", color: "#374151" },
            ].map(chip => (
              <div key={chip.name} style={{
                padding: "0.45rem 1rem",
                borderRadius: 100,
                border: chip.bg === "transparent" ? "1.5px solid #e5e7eb" : "none",
                background: chip.bg,
                color: chip.color,
                fontFamily: "var(--font-body)", fontSize: "0.85rem",
                fontWeight: chip.bg !== "transparent" ? 700 : 500,
                cursor: "default",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {chip.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .scanning-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .scanning-right .scanning-eyebrow, .scanning-right h2 { text-align: center; }
          .scanning-chips { justify-content: center; }
        }
        @media (max-width: 640px) {
          .scanning-section { padding: 4rem 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}
