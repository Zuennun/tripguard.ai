import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllCities } from "@/lib/cities";

export const metadata: Metadata = {
  title: "Hotelpreise überwachen nach Stadt — SaveMyHoliday",
  description:
    "Wähle deine Reisestadt und überwache Hotelpreise automatisch. Kostenlos, kein Account nötig — SaveMyHoliday benachrichtigt dich bei Preissenkungen.",
  keywords:
    "hotelpreise überwachen städte, preisalarm hotel europa, hotel preis senken reise, günstig hotel buchen weltweit",
};

export default function HotelsOverviewPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "de") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";
  const cities = getAllCities();

  const flagEmoji = (countryCode: string) =>
    countryCode
      .toUpperCase()
      .split("")
      .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
      .join("");

  return (
    <>
      <Navbar t={t} />
      <main style={{ background: "#f0f3f8", minHeight: "100vh", paddingTop: 84 }}>

        <style>{`
          @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          @keyframes heroPulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
          .ticker-track { animation: ticker 35s linear infinite; display: flex; align-items: center; width: max-content; }
          .city-card { transition: box-shadow 0.22s, transform 0.22s; height: 100%; }
          .city-card:hover { box-shadow: 0 10px 36px rgba(15,32,68,0.2) !important; transform: translateY(-4px); }
          .city-card:hover .city-img { transform: scale(1.06); }
          .city-img { transition: transform 0.45s ease; width: 100%; height: 100%; object-fit: cover; display: block; }
          .city-desc { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        `}</style>

        {/* ── Hero ── */}
        <div style={{
          background: "linear-gradient(150deg, #1b4080 0%, #0f2044 55%, #0a1a35 100%)",
          padding: "4.5rem 2rem 4rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow accent */}
          <div style={{
            position: "absolute", top: "-40%", left: "50%",
            transform: "translateX(-50%)",
            width: 700, height: 400,
            background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 50, padding: "0.32rem 1.1rem",
              marginBottom: "1.6rem",
            }}>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.73rem",
                fontWeight: 700, color: "#f97316",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                {isDe ? "Preisüberwachung nach Stadt" : "Price monitoring by city"}
              </span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-head)", fontWeight: 800,
              fontSize: "clamp(1.85rem, 4vw, 2.8rem)",
              color: "#ffffff", lineHeight: 1.15,
              letterSpacing: "-0.02em", margin: "0 0 1rem",
            }}>
              {isDe
                ? "Hotelpreise überwachen — wähle deine Stadt"
                : "Monitor hotel prices — choose your city"}
            </h1>

            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1rem",
              color: "rgba(255,255,255,0.62)",
              margin: "0 auto",
              maxWidth: 480, lineHeight: 1.65,
            }}>
              {isDe
                ? "SaveMyHoliday überwacht dein gebuchtes Hotel täglich und benachrichtigt dich kostenlos, wenn der Preis sinkt."
                : "SaveMyHoliday monitors your booked hotel daily and notifies you for free when the price drops."}
            </p>

            <div style={{
              display: "flex", justifyContent: "center",
              gap: "0", marginTop: "2.5rem",
              flexWrap: "wrap",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 16, padding: "1.25rem 0",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {[
                { num: cities.length.toString(), label: isDe ? "Destinationen" : "Destinations" },
                { num: "100%", label: isDe ? "Kostenlos" : "Free" },
                { num: "∅ 22%", label: isDe ? "Ersparnis" : "Savings" },
              ].map(({ num, label }, i) => (
                <div key={label} style={{
                  textAlign: "center", flex: 1, minWidth: 100,
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  padding: "0 1.5rem",
                }}>
                  <div style={{
                    fontFamily: "var(--font-head)", fontWeight: 900,
                    fontSize: "1.75rem", color: "#f97316", lineHeight: 1,
                  }}>{num}</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.45)", marginTop: "0.35rem",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── City grid ── */}
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "3rem 2rem 5rem" }}>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
            gridAutoRows: "390px",
            gap: "1.5rem",
          }}>
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/hotels/${city.slug}`}
                style={{ textDecoration: "none", display: "block", height: "390px" }}
              >
                <div className="city-card" style={{
                  background: "#ffffff",
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: "0 2px 14px rgba(15,32,68,0.08)",
                  border: "1px solid #dde3ee",
                  cursor: "pointer", display: "flex", flexDirection: "column",
                  width: "100%",
                }}>

                  {/* Photo */}
                  <div style={{ position: "relative", height: 178, overflow: "hidden", flexShrink: 0 }}>
                    <img src={city.image} alt={`Hotel ${city.name}`} className="city-img" loading="lazy" />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(10,26,53,0.85) 0%, rgba(10,26,53,0.25) 50%, transparent 100%)",
                    }} />
                    <div style={{
                      position: "absolute", bottom: "0.7rem", left: "0.8rem",
                      display: "flex", alignItems: "center", gap: "0.4rem",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-body)", fontSize: "0.7rem",
                        fontWeight: 800, color: "#f97316", letterSpacing: "0.05em",
                      }}>{city.countryCode}</span>
                      <span style={{
                        fontFamily: "var(--font-body)", fontSize: "0.7rem",
                        fontWeight: 600, color: "rgba(255,255,255,0.82)",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>{city.country}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{
                    padding: "1rem 1.2rem 1.2rem",
                    display: "flex", flexDirection: "column", gap: "0.45rem", flexGrow: 1,
                    overflow: "hidden",
                  }}>
                    <h2 style={{
                      fontFamily: "var(--font-head)", fontWeight: 800,
                      fontSize: "1.12rem", color: "#0f2044",
                      margin: 0, lineHeight: 1.2, flexShrink: 0,
                    }}>
                      {city.name}
                    </h2>
                    <p className="city-desc" style={{
                      fontFamily: "var(--font-body)", fontSize: "0.81rem",
                      color: "#64748b", lineHeight: 1.6,
                      margin: 0, flexGrow: 1,
                    }}>
                      {isDe ? city.description_de : city.description_en}
                    </p>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: "0.83rem",
                      fontWeight: 700, color: "#f97316", flexShrink: 0,
                    }}>
                      {isDe ? "Preise überwachen →" : "Monitor prices →"}
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            background: "linear-gradient(135deg, #0f2044 0%, #1a3a6e 100%)",
            borderRadius: 20, padding: "2.5rem 2rem",
            textAlign: "center", marginTop: "3rem",
          }}>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.76rem",
              fontWeight: 700, color: "#f97316",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "0.75rem",
            }}>
              {isDe ? "Noch kein Preisalarm?" : "No price alert yet?"}
            </div>
            <h2 style={{
              fontFamily: "var(--font-head)", fontWeight: 900,
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              color: "#ffffff", lineHeight: 1.15,
              letterSpacing: "-0.02em", margin: "0 0 0.85rem",
            }}>
              {isDe
                ? "Dein Hotel könnte schon morgen günstiger sein."
                : "Your hotel could already be cheaper tomorrow."}
            </h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.96rem",
              color: "rgba(255,255,255,0.68)",
              margin: "0 auto 1.75rem", maxWidth: 440, lineHeight: 1.6,
            }}>
              {isDe
                ? "Kein Account. Keine App. Einfach Buchungs-URL eingeben — wir überwachen kostenlos."
                : "No account. No app. Just enter your booking URL — we monitor it for free."}
            </p>
            <a href="/#buchen" style={{
              display: "inline-block", background: "#f97316",
              color: "#ffffff", fontFamily: "var(--font-body)",
              fontWeight: 700, fontSize: "1rem",
              padding: "0.85rem 2.25rem", borderRadius: 50,
              textDecoration: "none", letterSpacing: "0.01em",
            }}>
              {isDe ? "Jetzt kostenlos starten →" : "Start for free now →"}
            </a>
          </div>

        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
