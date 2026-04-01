import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllCities } from "@/lib/cities";

// ─── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Hotelpreise überwachen nach Stadt — SaveMyHoliday",
  description:
    "Wähle deine Reisestadt und überwache Hotelpreise automatisch. Kostenlos, kein Account nötig — SaveMyHoliday benachrichtigt dich bei Preissenkungen.",
  keywords:
    "hotelpreise überwachen städte, preisalarm hotel europa, hotel preis senken reise, günstig hotel buchen weltweit",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HotelsOverviewPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "de") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";

  const cities = getAllCities();

  // Country flag emoji helper
  const flagEmoji = (countryCode: string) => {
    return countryCode
      .toUpperCase()
      .split("")
      .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
      .join("");
  };

  return (
    <>
      <Navbar t={t} />
      <main style={{ background: "#f8f9fb", minHeight: "100vh", paddingTop: 84 }}>

        {/* ── Hero ── */}
        <div style={{ background: "#0f2044", padding: "4rem 2rem 3rem" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}>
              {isDe ? "Preisüberwachung nach Stadt" : "Price monitoring by city"}
            </div>
            <h1 style={{
              fontFamily: "var(--font-head)",
              fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 1rem",
            }}>
              {isDe
                ? "Hotelpreise überwachen — wähle deine Stadt"
                : "Monitor hotel prices — choose your city"}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.75)",
              margin: 0,
              maxWidth: 560,
              lineHeight: 1.6,
            }}>
              {isDe
                ? `SaveMyHoliday überwacht dein gebuchtes Hotel automatisch — egal in welcher Stadt. Aktuell verfügbar für ${cities.length} Destinationen weltweit.`
                : `SaveMyHoliday monitors your booked hotel automatically — no matter which city. Currently available for ${cities.length} destinations worldwide.`}
            </p>
          </div>
        </div>

        {/* ── City grid ── */}
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "3rem 2rem 5rem" }}>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}>
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/hotels/${city.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: "1.5rem",
                  boxShadow: "0 2px 12px rgba(15,32,68,0.07)",
                  border: "1px solid #e8ecf2",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}>

                  {/* Flag + country */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                      {flagEmoji(city.countryCode)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#8fa3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}>
                      {city.country}
                    </span>
                  </div>

                  {/* City name */}
                  <h2 style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: "#0f2044",
                    margin: 0,
                    lineHeight: 1.2,
                  }}>
                    {city.name}
                  </h2>

                  {/* Description */}
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    lineHeight: 1.55,
                    margin: 0,
                    flexGrow: 1,
                  }}>
                    {isDe ? city.description_de : city.description_en}
                  </p>

                  {/* CTA link */}
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#f97316",
                    marginTop: "0.25rem",
                  }}>
                    {isDe ? "Preise überwachen →" : "Monitor prices →"}
                  </div>

                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            background: "linear-gradient(135deg, #0f2044 0%, #1a3a6e 100%)",
            borderRadius: 20,
            padding: "2.5rem 2rem",
            textAlign: "center",
            marginTop: "3rem",
          }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.75rem",
            }}>
              {isDe ? "Noch kein Preisalarm?" : "No price alert yet?"}
            </div>
            <h2 style={{
              fontFamily: "var(--font-head)",
              fontWeight: 900,
              fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: "0 0 0.85rem",
            }}>
              {isDe
                ? "Dein Hotel könnte schon morgen günstiger sein."
                : "Your hotel could already be cheaper tomorrow."}
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.98rem",
              color: "rgba(255,255,255,0.72)",
              margin: "0 auto 1.75rem",
              maxWidth: 460,
              lineHeight: 1.6,
            }}>
              {isDe
                ? "Kein Account. Keine App. Einfach Buchungs-URL eingeben — wir überwachen kostenlos."
                : "No account. No app. Just enter your booking URL — we monitor it for free."}
            </p>
            <a
              href="/#buchen"
              style={{
                display: "inline-block",
                background: "#f97316",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "0.85rem 2.25rem",
                borderRadius: 50,
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              {isDe ? "Jetzt kostenlos starten →" : "Start for free now →"}
            </a>
          </div>

        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
